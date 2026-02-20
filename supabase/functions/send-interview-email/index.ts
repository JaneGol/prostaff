import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { applicationId, message } = await req.json();

    if (!applicationId) {
      return new Response(JSON.stringify({ error: "applicationId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get application with profile email and job/company info
    const { data: app, error: appError } = await supabase
      .from("applications")
      .select(`
        id, status, employer_notes,
        profiles!inner(email, first_name, last_name),
        jobs!inner(title, companies!inner(name))
      `)
      .eq("id", applicationId)
      .single();

    if (appError || !app) {
      console.error("Application fetch error:", appError);
      return new Response(JSON.stringify({ error: "Application not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const candidateEmail = (app as any).profiles?.email;
    const candidateName = `${(app as any).profiles?.first_name || ""} ${(app as any).profiles?.last_name || ""}`.trim();
    const jobTitle = (app as any).jobs?.title || "вакансию";
    const companyName = (app as any).jobs?.companies?.name || "компания";
    const employerMessage = message || (app as any).employer_notes || "";

    if (!candidateEmail) {
      return new Response(JSON.stringify({ error: "Candidate email not found" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Send email via Resend
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #1E2DBE, #182A8A); padding: 24px; border-radius: 12px 12px 0 0;">
          <h1 style="color: #fff; margin: 0; font-size: 22px;">ProStaff</h1>
        </div>
        <div style="background: #fff; padding: 24px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 12px 12px;">
          <p style="font-size: 16px; color: #0B1A2B;">Здравствуйте${candidateName ? `, ${candidateName}` : ""}!</p>
          <p style="font-size: 15px; color: #0B1A2B;">
            Компания <strong>${companyName}</strong> приглашает вас на интервью по вакансии <strong>«${jobTitle}»</strong>.
          </p>
          ${employerMessage ? `
          <div style="background: #F3F0FF; border-left: 4px solid #7C3AED; padding: 16px; margin: 16px 0; border-radius: 4px;">
            <p style="margin: 0 0 4px 0; font-size: 13px; color: #6B7280; font-weight: 600;">Сообщение от работодателя:</p>
            <p style="margin: 0; font-size: 15px; color: #0B1A2B;">${employerMessage}</p>
          </div>
          ` : ""}
          <a href="https://prostaff.icu/my-applications" 
             style="display: inline-block; background: #E10600; color: #fff; padding: 12px 24px; border-radius: 999px; text-decoration: none; font-weight: 600; margin-top: 12px;">
            Посмотреть отклик
          </a>
          <p style="font-size: 13px; color: #6B7280; margin-top: 24px;">
            Это автоматическое уведомление от платформы ProStaff.
          </p>
        </div>
      </div>
    `;

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "ProStaff <onboarding@resend.dev>",
        to: [candidateEmail],
        subject: `Приглашение на интервью — ${jobTitle} (${companyName})`,
        html: emailHtml,
      }),
    });

    const resendData = await resendRes.json();

    if (!resendRes.ok) {
      console.error("Resend error:", resendData);
      return new Response(JSON.stringify({ error: "Failed to send email", details: resendData }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, emailId: resendData.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
