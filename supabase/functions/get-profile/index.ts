import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ch = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const j = (d: any, s = 200) => new Response(JSON.stringify(d), { status: s, headers: { ...ch, "Content-Type": "application/json" } });

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: ch });
  try {
    const su = Deno.env.get("SUPABASE_URL")!;
    const sk = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ak = Deno.env.get("SUPABASE_ANON_KEY")!;
    const ac = createClient(su, sk);
    const ah = req.headers.get("Authorization");
    let uid: string | null = null;
    let urole: string | null = null;
    if (ah) {
      const uc = createClient(su, ak, { global: { headers: { Authorization: ah } } });
      const { data: ud } = await uc.auth.getUser();
      if (ud?.user) {
        uid = ud.user.id;
        const { data: rs } = await ac.from("user_roles").select("role").eq("user_id", uid);
        const ra = (rs || []).map((r: any) => r.role);
        urole = ra.includes("admin") ? "admin" : ra.includes("employer") ? "employer" : ra.includes("specialist") ? "specialist" : null;
      }
    }
    const url = new URL(req.url);
    const pid = url.searchParams.get("id");
    const mode = url.searchParams.get("mode") || (pid ? "single" : "list");

    if (mode === "single" && pid) {
      const { data: p, error: e } = await ac.from("profiles").select("*, specialist_roles!profiles_role_id_fkey (id, name)").eq("id", pid).maybeSingle();
      if (e) throw e;
      if (!p) return j({ error: "Not found" }, 404);
      let access = "preview";
      if (uid && uid === p.user_id) access = "owner";
      else if (urole === "admin") access = "full";
      else {
        const vis = p.visibility_level || "public_preview";
        if (vis === "hidden") return j({ error: "Not found" }, 404);
        if (vis === "clubs_only" && urole !== "employer") return j({ error: "Not found" }, 404);
        if (urole === "employer" && uid) {
          const { data: ev } = await ac.from("profile_views").select("id").eq("viewer_user_id", uid).eq("profile_id", p.id).maybeSingle();
          if (ev) access = "full";
        }
      }
      const full = access === "owner" || access === "full";
      const prof = {
        id: p.id, avatar_url: p.avatar_url, city: p.city, country: p.country, level: p.level,
        search_status: p.search_status, is_relocatable: p.is_relocatable, is_remote_available: p.is_remote_available,
        role_id: p.role_id, secondary_role_id: p.secondary_role_id, specialization_id: p.specialization_id,
        secondary_specialization_id: p.secondary_specialization_id, visibility_level: p.visibility_level,
        show_name: p.show_name, show_contacts: p.show_contacts, hide_current_org: p.hide_current_org,
        specialist_roles: p.specialist_roles, user_id: p.user_id,
        first_name: full || p.show_name ? p.first_name : null,
        last_name: full || p.show_name ? p.last_name : null,
        bio: p.bio, about_useful: p.about_useful, about_style: p.about_style, about_goals: p.about_goals,
        email: full ? p.email : null, phone: full ? p.phone : null, telegram: full ? p.telegram : null,
        linkedin_url: full ? p.linkedin_url : null, portfolio_url: full ? p.portfolio_url : null,
        desired_contract_type: p.desired_contract_type, desired_city: p.desired_city,
        desired_country: p.desired_country, desired_role_ids: p.desired_role_ids,
      };
      let sr = null;
      if (p.secondary_role_id) {
        const { data: srd } = await ac.from("specialist_roles").select("id, name").eq("id", p.secondary_role_id).maybeSingle();
        sr = srd;
      }
      const [r0, r1, r2, r3, r4, r5, r6] = await Promise.all([
        ac.from("experiences").select("*").eq("profile_id", pid).order("start_date", { ascending: false }),
        ac.from("profile_skills").select("skill_id, proficiency, is_top, is_custom, custom_name, skills (id, name, category)").eq("profile_id", pid),
        ac.from("profile_sports_experience").select("sport_id, years, level, context_level, sports:sport_id (id, name, icon)").eq("profile_id", pid),
        ac.from("profile_sports_open_to").select("sport_id, sport_group, sports:sport_id (id, name, icon)").eq("profile_id", pid),
        ac.from("candidate_education").select("*").eq("profile_id", pid).order("start_year", { ascending: false }),
        ac.from("candidate_certificates").select("*").eq("profile_id", pid).order("year", { ascending: false }),
        ac.from("candidate_portfolio").select("*").eq("profile_id", pid),
      ]);
      let exps = r0.data || [];
      if (access === "preview" && p.hide_current_org) {
        exps = exps.map((x: any) => ({ ...x, company_name: x.is_current ? "Hidden org" : x.company_name }));
      }
      let port = r6.data || [];
      if (!full) port = port.filter((x: any) => x.visibility === "public");
      return j({
        profile: { ...prof, secondary_role: sr },
        experiences: exps,
        skills: r1.data || [],
        sportsExp: (r2.data || []).map((s: any) => ({ ...s, sport: s.sports })),
        sportsOpen: (r3.data || []).map((s: any) => ({ sport_id: s.sport_id, sport_group: s.sport_group, sport: s.sports })),
        education: r4.data || [],
        certificates: r5.data || [],
        portfolio: port.map((x: any) => ({ ...x, tags: Array.isArray(x.tags) ? x.tags : [] })),
        access,
      });
    }

    if (mode === "list") {
      const { data: ps, error: e } = await ac.from("profiles")
        .select("id, avatar_url, city, country, level, search_status, is_relocatable, is_remote_available, show_name, secondary_role_id, visibility_level, specialist_roles!profiles_role_id_fkey (id, name)")
        .eq("is_public", true).in("visibility_level", ["public_preview", "clubs_only"]).order("updated_at", { ascending: false });
      if (e) throw e;
      let res = ps || [];
      if (urole !== "employer" && urole !== "admin") res = res.filter((x: any) => x.visibility_level !== "clubs_only");
      const san = res.map((x: any) => ({
        id: x.id, avatar_url: x.avatar_url, city: x.city, country: x.country, level: x.level,
        search_status: x.search_status, is_relocatable: x.is_relocatable, is_remote_available: x.is_remote_available,
        show_name: x.show_name, specialist_roles: x.specialist_roles, secondary_role_id: x.secondary_role_id,
        first_name: null, last_name: null,
      }));
      const ids = res.map((x: any) => x.id);
      const psp: any = {};
      const psk: any = {};
      if (ids.length > 0) {
        const [sd, kd] = await Promise.all([
          ac.from("profile_sports_experience").select("profile_id, sport_id, years, sports:sport_id (name, icon)").in("profile_id", ids).order("years", { ascending: false }),
          ac.from("profile_skills").select("profile_id, skill_id, is_top, custom_name, is_custom").in("profile_id", ids).eq("is_top", true),
        ]);
        for (const s of sd.data || []) { if (!psp[s.profile_id]) psp[s.profile_id] = []; psp[s.profile_id].push(s); }
        for (const s of kd.data || []) { if (!psk[s.profile_id]) psk[s.profile_id] = []; psk[s.profile_id].push(s); }
      }
      return j({ profiles: san, profileSports: psp, profileSkills: psk });
    }
    return j({ error: "Invalid request" }, 400);
  } catch (err) {
    console.error("get-profile error:", err);
    return j({ error: "Internal error" }, 500);
  }
});
