import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

/** Determine viewer context */
async function getViewerContext(
  adminClient: ReturnType<typeof createClient>,
  authHeader: string | null,
  supabaseUrl: string,
  anonKey: string,
) {
  if (!authHeader) return { userId: null, role: null as string | null };

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data } = await userClient.auth.getUser();
  if (!data?.user) return { userId: null, role: null as string | null };

  const userId = data.user.id;

  // Get app role
  const { data: roles } = await adminClient
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);

  const roleSet = new Set((roles || []).map((r: any) => r.role));
  const role = roleSet.has("admin")
    ? "admin"
    : roleSet.has("employer")
    ? "employer"
    : roleSet.has("specialist")
    ? "specialist"
    : null;

  return { userId, role };
}

/** Determine access level for a profile */
async function getAccessLevel(
  adminClient: ReturnType<typeof createClient>,
  profile: any,
  viewer: { userId: string | null; role: string | null },
): Promise<"owner" | "full" | "preview" | "hidden"> {
  if (!profile) return "hidden";

  // Owner always gets full
  if (viewer.userId && viewer.userId === profile.user_id) return "owner";

  // Admin gets full
  if (viewer.role === "admin") return "full";

  // Enforce visibility_level
  const visibility = profile.visibility_level || "public_preview";

  if (visibility === "hidden") {
    // Only owner and admin can see hidden profiles
    return "hidden";
  }

  if (visibility === "clubs_only") {
    // Only employer with unlocked view gets full
    if (viewer.role !== "employer" || !viewer.userId) return "hidden";

    const { data: existingView } = await adminClient
      .from("profile_views")
      .select("id")
      .eq("viewer_user_id", viewer.userId)
      .eq("profile_id", profile.id)
      .maybeSingle();

    return existingView ? "full" : "preview";
  }

  // public_preview
  if (viewer.role === "employer" && viewer.userId) {
    const { data: existingView } = await adminClient
      .from("profile_views")
      .select("id")
      .eq("viewer_user_id", viewer.userId)
      .eq("profile_id", profile.id)
      .maybeSingle();

    return existingView ? "full" : "preview";
  }

  return "preview";
}

/** Strip sensitive fields based on access level */
function sanitizeProfile(profile: any, access: string) {
  const base = {
    id: profile.id,
    avatar_url: profile.avatar_url,
    city: profile.city,
    country: profile.country,
    level: profile.level,
    search_status: profile.search_status,
    is_relocatable: profile.is_relocatable,
    is_remote_available: profile.is_remote_available,
    role_id: profile.role_id,
    secondary_role_id: profile.secondary_role_id,
    specialization_id: profile.specialization_id,
    secondary_specialization_id: profile.secondary_specialization_id,
    visibility_level: profile.visibility_level,
    show_name: profile.show_name,
    show_contacts: profile.show_contacts,
    hide_current_org: profile.hide_current_org,
    // Joined role names
    specialist_roles: profile.specialist_roles,
    secondary_role: profile.secondary_role,
  };

  if (access === "owner" || access === "full") {
    return {
      ...base,
      user_id: profile.user_id,
      first_name: profile.first_name,
      last_name: profile.last_name,
      bio: profile.bio,
      about_useful: profile.about_useful,
      about_style: profile.about_style,
      about_goals: profile.about_goals,
      email: access === "owner" || access === "full" ? profile.email : null,
      phone: access === "owner" || access === "full" ? profile.phone : null,
      telegram: access === "owner" || access === "full" ? profile.telegram : null,
      linkedin_url: profile.linkedin_url,
      portfolio_url: profile.portfolio_url,
      desired_contract_type: profile.desired_contract_type,
      desired_city: profile.desired_city,
      desired_country: profile.desired_country,
      desired_role_ids: profile.desired_role_ids,
    };
  }

  // Preview mode — show name only if allowed
  return {
    ...base,
    user_id: profile.user_id,
    first_name: profile.show_name ? profile.first_name : null,
    last_name: profile.show_name ? profile.last_name : null,
    bio: profile.bio,
    about_useful: profile.about_useful,
    about_style: profile.about_style,
    about_goals: profile.about_goals,
    // No contacts in preview
    email: null,
    phone: null,
    telegram: null,
    linkedin_url: null,
    portfolio_url: null,
    desired_contract_type: profile.desired_contract_type,
    desired_city: profile.desired_city,
    desired_country: profile.desired_country,
    desired_role_ids: profile.desired_role_ids,
  };
}

/** Sanitize profile for listing (minimal data) */
function sanitizeProfileForList(profile: any) {
  return {
    id: profile.id,
    avatar_url: profile.avatar_url,
    city: profile.city,
    country: profile.country,
    level: profile.level,
    search_status: profile.search_status,
    is_relocatable: profile.is_relocatable,
    is_remote_available: profile.is_remote_available,
    show_name: profile.show_name,
    specialist_roles: profile.specialist_roles,
    secondary_role_id: profile.secondary_role_id,
    // Never expose name/contacts in listing
    first_name: null,
    last_name: null,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    const authHeader = req.headers.get("Authorization");

    const viewer = await getViewerContext(
      adminClient,
      authHeader,
      supabaseUrl,
      supabaseAnonKey,
    );

    const url = new URL(req.url);
    const profileId = url.searchParams.get("id");
    const mode = url.searchParams.get("mode") || (profileId ? "single" : "list");

    // ── SINGLE PROFILE ──
    if (mode === "single" && profileId) {
      const { data: profile, error } = await adminClient
        .from("profiles")
        .select(`*, specialist_roles!profiles_role_id_fkey (id, name)`)
        .eq("id", profileId)
        .maybeSingle();

      if (error) throw error;
      if (!profile) return json({ error: "Not found" }, 404);

      const access = await getAccessLevel(adminClient, profile, viewer);

      if (access === "hidden") {
        return json({ error: "Not found" }, 404);
      }

      const sanitized = sanitizeProfile(profile, access);

      // Fetch secondary role
      let secondaryRole = null;
      if (profile.secondary_role_id) {
        const { data } = await adminClient
          .from("specialist_roles")
          .select("id, name")
          .eq("id", profile.secondary_role_id)
          .maybeSingle();
        secondaryRole = data;
      }

      // Fetch related data
      const [expRes, skillsRes, sportsExpRes, sportsOpenRes, eduRes, certRes, portRes] =
        await Promise.all([
          adminClient
            .from("experiences")
            .select("*")
            .eq("profile_id", profileId)
            .order("start_date", { ascending: false }),
          adminClient
            .from("profile_skills")
            .select(
              "skill_id, proficiency, is_top, is_custom, custom_name, skills (id, name, category)",
            )
            .eq("profile_id", profileId),
          adminClient
            .from("profile_sports_experience")
            .select(
              "sport_id, years, level, context_level, sports:sport_id (id, name, icon)",
            )
            .eq("profile_id", profileId),
          adminClient
            .from("profile_sports_open_to")
            .select("sport_id, sport_group, sports:sport_id (id, name, icon)")
            .eq("profile_id", profileId),
          adminClient
            .from("candidate_education")
            .select("*")
            .eq("profile_id", profileId)
            .order("start_year", { ascending: false }),
          adminClient
            .from("candidate_certificates")
            .select("*")
            .eq("profile_id", profileId)
            .order("year", { ascending: false }),
          adminClient
            .from("candidate_portfolio")
            .select("*")
            .eq("profile_id", profileId),
        ]);

      // For preview, filter experiences to hide org names if hide_current_org
      let experiences = (expRes.data || []) as any[];
      if (access === "preview" && profile.hide_current_org) {
        experiences = experiences.map((exp: any) => ({
          ...exp,
          company_name: exp.is_current ? "Организация скрыта" : exp.company_name,
        }));
      }

      // Portfolio: filter by visibility for non-owners
      let portfolio = (portRes.data || []) as any[];
      if (access !== "owner" && access !== "full") {
        portfolio = portfolio.filter((p: any) => p.visibility === "public");
      }

      return json({
        profile: { ...sanitized, secondary_role: secondaryRole },
        experiences,
        skills: skillsRes.data || [],
        sportsExp: (sportsExpRes.data || []).map((s: any) => ({
          ...s,
          sport: s.sports,
        })),
        sportsOpen: (sportsOpenRes.data || []).map((s: any) => ({
          sport_id: s.sport_id,
          sport_group: s.sport_group,
          sport: s.sports,
        })),
        education: eduRes.data || [],
        certificates: certRes.data || [],
        portfolio: portfolio.map((p: any) => ({
          ...p,
          tags: Array.isArray(p.tags) ? p.tags : [],
        })),
        access,
      });
    }

    // ── LIST PROFILES ──
    if (mode === "list") {
      // Fetch public profiles, respecting visibility_level
      const { data: profiles, error } = await adminClient
        .from("profiles")
        .select(
          `id, avatar_url, city, country, level, search_status, 
           is_relocatable, is_remote_available, show_name,
           secondary_role_id, visibility_level,
           specialist_roles!profiles_role_id_fkey (id, name)`,
        )
        .eq("is_public", true)
        .in("visibility_level", ["public_preview", "clubs_only"])
        .order("updated_at", { ascending: false });

      if (error) throw error;

      let result = (profiles || []) as any[];

      // For non-employers, filter out clubs_only profiles
      if (viewer.role !== "employer" && viewer.role !== "admin") {
        result = result.filter(
          (p: any) => p.visibility_level !== "clubs_only",
        );
      }

      const sanitized = result.map(sanitizeProfileForList);

      // Fetch sports and skills for all profiles
      const ids = result.map((p: any) => p.id);
      let profileSports: Record<string, any[]> = {};
      let profileSkills: Record<string, any[]> = {};

      if (ids.length > 0) {
        const [sportsData, skillsData] = await Promise.all([
          adminClient
            .from("profile_sports_experience")
            .select(
              "profile_id, sport_id, years, sports:sport_id (name, icon)",
            )
            .in("profile_id", ids)
            .order("years", { ascending: false }),
          adminClient
            .from("profile_skills")
            .select("profile_id, skill_id, is_top, custom_name, is_custom")
            .in("profile_id", ids)
            .eq("is_top", true),
        ]);

        for (const s of (sportsData.data || []) as any[]) {
          if (!profileSports[s.profile_id]) profileSports[s.profile_id] = [];
          profileSports[s.profile_id].push(s);
        }
        for (const s of (skillsData.data || []) as any[]) {
          if (!profileSkills[s.profile_id]) profileSkills[s.profile_id] = [];
          profileSkills[s.profile_id].push(s);
        }
      }

      return json({
        profiles: sanitized,
        profileSports,
        profileSkills,
      });
    }

    return json({ error: "Invalid request" }, 400);
  } catch (err) {
    console.error("get-profile error:", err);
    return json({ error: "Internal error" }, 500);
  }
});
