import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Get auth token
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create client with user's token to get their identity
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Admin client for privileged operations
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    const { profileId } = await req.json();
    if (!profileId) {
      return new Response(JSON.stringify({ error: "profileId required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if user is admin
    const { data: adminRole } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (adminRole) {
      // Admins get full access without quota
      return new Response(JSON.stringify({ access: "full", unlimited: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if user is employer
    const { data: employerRole } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "employer")
      .maybeSingle();

    if (!employerRole) {
      return new Response(
        JSON.stringify({ error: "Only employers can unlock profiles", access: "denied" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if already viewed (don't double-count)
    const { data: existingView } = await adminClient
      .from("profile_views")
      .select("id")
      .eq("viewer_user_id", user.id)
      .eq("profile_id", profileId)
      .maybeSingle();

    if (existingView) {
      // Already viewed — grant access without decrementing
      return new Response(JSON.stringify({ access: "full", already_viewed: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get or create club_access
    let { data: access } = await adminClient
      .from("club_access")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!access) {
      // Create access record
      const { data: newAccess, error: createErr } = await adminClient
        .from("club_access")
        .insert({ user_id: user.id })
        .select()
        .single();
      if (createErr) throw createErr;
      access = newAccess;
    }

    // Check subscription
    if (access.is_subscribed) {
      // Subscriber — unlimited, just log view
      await adminClient.from("profile_views").insert({
        viewer_user_id: user.id,
        profile_id: profileId,
      });
      return new Response(JSON.stringify({ access: "full", subscribed: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check trial
    const now = new Date();
    const trialExpires = new Date(access.trial_expires_at);
    const inTrial = now < trialExpires;

    if (inTrial && access.free_views_remaining > 0) {
      // Decrement and grant
      await adminClient
        .from("club_access")
        .update({ free_views_remaining: access.free_views_remaining - 1 })
        .eq("id", access.id);

      await adminClient.from("profile_views").insert({
        viewer_user_id: user.id,
        profile_id: profileId,
      });

      return new Response(
        JSON.stringify({
          access: "full",
          views_remaining: access.free_views_remaining - 1,
          trial: true,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Trial expired or no views left
    if (!inTrial && access.free_views_per_week > 0) {
      // Post-trial weekly quota — check views this week
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const { count } = await adminClient
        .from("profile_views")
        .select("id", { count: "exact", head: true })
        .eq("viewer_user_id", user.id)
        .gte("viewed_at", weekAgo.toISOString());

      const weeklyUsed = count || 0;
      if (weeklyUsed < access.free_views_per_week) {
        await adminClient.from("profile_views").insert({
          viewer_user_id: user.id,
          profile_id: profileId,
        });

        return new Response(
          JSON.stringify({
            access: "full",
            weekly_remaining: access.free_views_per_week - weeklyUsed - 1,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // No quota left
    return new Response(
      JSON.stringify({
        access: "paywall",
        message: "Лимит просмотров исчерпан. Оформите подписку для неограниченного доступа.",
      }),
      { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("view-profile error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
