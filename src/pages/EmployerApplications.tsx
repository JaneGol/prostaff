import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  Users,
  Briefcase,
  Mail,
  Phone,
  Calendar,
  FileText,
  Eye,
  MessageSquare,
  ChevronDown,
  Loader2,
  ArrowLeft,
  Printer
} from "lucide-react";

import type { Database } from "@/integrations/supabase/types";

type ApplicationStatus = Database["public"]["Enums"]["application_status"];

interface Application {
  id: string;
  cover_letter: string | null;
  status: ApplicationStatus;
  employer_notes: string | null;
  created_at: string;
  profiles: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url: string | null;
    email: string | null;
    phone: string | null;
    city: string | null;
    country: string | null;
    level: string | null;
    specialist_roles: {
      name: string;
    } | null;
  };
  jobs: {
    id: string;
    title: string;
  };
}

interface Job {
  id: string;
  title: string;
  applications_count: number;
}

const statusLabels: Record<ApplicationStatus, string> = {
  pending: "На рассмотрении",
  reviewed: "Просмотрено",
  shortlisted: "В шорт-листе",
  interview: "Интервью",
  rejected: "Отклонён",
  hired: "Принят"
};

const statusColors: Record<ApplicationStatus, string> = {
  pending: "bg-muted text-muted-foreground",
  reviewed: "bg-blue-100 text-blue-800",
  shortlisted: "bg-yellow-100 text-yellow-800",
  interview: "bg-purple-100 text-purple-800",
  rejected: "bg-red-100 text-red-800",
  hired: "bg-green-100 text-green-800"
};

const levelLabels: Record<string, string> = {
  intern: "Стажёр",
  junior: "Junior",
  middle: "Middle",
  senior: "Senior",
  head: "Head"
};

export default function EmployerApplications() {
  const navigate = useNavigate();
  const { user, userRole, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [applications, setApplications] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  
  // Notes modal
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [notes, setNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);

  // Interview message modal
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [interviewAppId, setInterviewAppId] = useState<string | null>(null);
  const [interviewMessage, setInterviewMessage] = useState("");
  const [savingInterview, setSavingInterview] = useState(false);

  // PDF generation
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || userRole !== "employer")) {
      navigate("/auth");
    }
  }, [user, userRole, authLoading, navigate]);

  useEffect(() => {
    if (user && userRole === "employer") {
      fetchData();
    }
  }, [user, userRole]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Get company
      const { data: company } = await supabase
        .from("companies")
        .select("id, name")
        .eq("user_id", user!.id)
        .maybeSingle();

      if (!company) {
        setLoading(false);
        return;
      }
      setCompanyName(company.name || "");

      // Get jobs
      const { data: jobsData } = await supabase
        .from("jobs")
        .select("id, title, applications_count")
        .eq("company_id", company.id)
        .order("created_at", { ascending: false });

      setJobs(jobsData || []);

      const jobIds = (jobsData || []).map(j => j.id);
      if (jobIds.length === 0) {
        setApplications([]);
        setLoading(false);
        return;
      }

      // Get all applications for company's jobs
      const { data: applicationsData, error } = await supabase
        .from("applications")
        .select(`
          id,
          cover_letter,
          status,
          employer_notes,
          created_at,
          profiles!inner (
            id,
            first_name,
            last_name,
            avatar_url,
            email,
            phone,
            city,
            country,
            level,
            specialist_roles!profiles_role_id_fkey (name)
          ),
          jobs!inner (id, title)
        `)
        .in("job_id", jobIds)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setApplications(applicationsData as unknown as Application[] || []);
    } catch (err) {
      console.error("Error fetching applications:", err);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить отклики",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (applicationId: string, newStatus: ApplicationStatus) => {
    // If switching to interview, show message modal instead of updating directly
    if (newStatus === "interview") {
      const app = applications.find(a => a.id === applicationId);
      const jobTitle = app?.jobs?.title || "";
      const template = `Здравствуйте!

Приглашаем вас на интервью по вакансии «${jobTitle}».

Дата и время: 
Формат: онлайн / офлайн
Место / ссылка: 

Контактное лицо:


Пожалуйста, дайте знать, если время вам не подходит.

С уважением,
${companyName}`;
      setInterviewAppId(applicationId);
      setInterviewMessage(template);
      setShowInterviewModal(true);
      return;
    }

    try {
      const { error } = await supabase
        .from("applications")
        .update({ status: newStatus })
        .eq("id", applicationId);

      if (error) throw error;

      setApplications(prev =>
        prev.map(app =>
          app.id === applicationId ? { ...app, status: newStatus } : app
        )
      );

      toast({
        title: "Статус обновлён",
        description: `Статус изменён на "${statusLabels[newStatus]}"`
      });
    } catch (err) {
      console.error("Error updating status:", err);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить статус",
        variant: "destructive"
      });
    }
  };

  const confirmInterview = async () => {
    if (!interviewAppId) return;
    setSavingInterview(true);
    try {
      const updateData: Record<string, unknown> = { status: "interview" as ApplicationStatus };
      if (interviewMessage.trim()) {
        updateData.employer_notes = interviewMessage.trim();
      }

      const { error } = await supabase
        .from("applications")
        .update(updateData)
        .eq("id", interviewAppId);

      if (error) throw error;

      setApplications(prev =>
        prev.map(app =>
          app.id === interviewAppId
            ? { ...app, status: "interview" as ApplicationStatus, employer_notes: interviewMessage.trim() || app.employer_notes }
            : app
        )
      );

      setShowInterviewModal(false);

      // Send email notification
      const { data: emailData, error: emailError } = await supabase.functions.invoke("send-interview-email", {
        body: { applicationId: interviewAppId, message: interviewMessage.trim() },
      });

      if (emailError || emailData?.error) {
        console.error("Email send error:", emailError || emailData?.error);
        toast({
          title: "Приглашение на интервью",
          description: "Статус изменён, но email не удалось отправить",
        });
      } else {
        toast({
          title: "Приглашение на интервью",
          description: "Статус изменён и email-уведомление отправлено"
        });
      }
    } catch (err) {
      console.error("Error updating to interview:", err);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить статус",
        variant: "destructive"
      });
    } finally {
      setSavingInterview(false);
    }
  };

  const openNotesModal = (application: Application) => {
    setSelectedApplication(application);
    setNotes(application.employer_notes || "");
    setShowNotesModal(true);
  };

  const saveNotes = async () => {
    if (!selectedApplication) return;
    
    setSavingNotes(true);
    try {
      const { error } = await supabase
        .from("applications")
        .update({ employer_notes: notes.trim() || null })
        .eq("id", selectedApplication.id);

      if (error) throw error;

      setApplications(prev =>
        prev.map(app =>
          app.id === selectedApplication.id 
            ? { ...app, employer_notes: notes.trim() || null } 
            : app
        )
      );

      setShowNotesModal(false);
      toast({ title: "Заметки сохранены" });
    } catch (err) {
      console.error("Error saving notes:", err);
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить заметки",
        variant: "destructive"
      });
    } finally {
      setSavingNotes(false);
    }
  };

  const filteredApplications = applications.filter(app => {
    if (selectedJob !== "all" && app.jobs.id !== selectedJob) return false;
    if (selectedStatus !== "all" && app.status !== selectedStatus) return false;
    return true;
  });

  const generatePdf = async (profileId: string) => {
    setPdfLoading(true);
    try {
      const [profileRes, expRes, skillsRes, sportsRes, eduRes, certsRes, portRes] = await Promise.all([
        supabase.from("profiles").select("*, specialist_roles!profiles_role_id_fkey(id, name), secondary_role:specialist_roles!profiles_secondary_role_id_fkey(id, name)").eq("id", profileId).maybeSingle(),
        supabase.from("experiences").select("*").eq("profile_id", profileId).order("start_date", { ascending: false }),
        supabase.from("profile_skills").select("*, skills(name)").eq("profile_id", profileId),
        supabase.from("profile_sports_experience").select("*, sport:sports(name)").eq("profile_id", profileId),
        supabase.from("candidate_education").select("*").eq("profile_id", profileId),
        supabase.from("candidate_certificates").select("*").eq("profile_id", profileId),
        supabase.from("candidate_portfolio").select("*").eq("profile_id", profileId),
      ]);

      if (!profileRes.data) {
        toast({ title: "Ошибка", description: "Не удалось загрузить профиль", variant: "destructive" });
        return;
      }

      const profile = profileRes.data;
      const experiences = (expRes.data || []).map(e => ({
        ...e,
        achievements: Array.isArray(e.achievements) ? e.achievements : [],
        hide_org: false,
        is_current: e.is_current || false,
        is_remote: e.is_remote || false,
      }));
      const skills = (skillsRes.data || []).map(s => ({
        name: s.custom_name || (s.skills as any)?.name || "—",
        proficiency: s.proficiency || 2,
        is_top: s.is_top || false,
      }));
      const sportsExp = (sportsRes.data || []).map(s => ({
        years: s.years || 1,
        level: s.level,
        sport: s.sport,
      }));
      const education = eduRes.data || [];
      const certificates = certsRes.data || [];
      const portfolio = portRes.data || [];

      // Generate PDF directly (no modal for employers)
      const profLabels: Record<number, string> = { 1: "Базовый", 2: "Уверенный", 3: "Эксперт" };
      const empLabels: Record<string, string> = { full_time: "Полная", part_time: "Частичная", contract: "Контракт", internship: "Стажировка", freelance: "Фриланс" };
      const degLabels: Record<string, string> = { bachelor: "Бакалавр", master: "Магистр", phd: "К.н./Д.н.", specialist: "Специалист", courses: "Курсы", other: "Другое" };

      const location = [profile.city, profile.country].filter(Boolean).join(", ");
      const roleName = profile.specialist_roles?.name || "";
      const secondaryRoleName = (profile as any).secondary_role?.name || "";
      const lvl = profile.level ? (levelLabels[profile.level] || profile.level) : "";
      const topSkills = skills.filter(s => s.is_top);
      const otherSkills = skills.filter(s => !s.is_top);

      let html = `<!DOCTYPE html><html lang="ru"><head><meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 11pt; line-height: 1.5; color: #1a1a2e; }
  .page { max-width: 800px; margin: 0 auto; padding: 10px 24px; }
  .header { border-bottom: 3px solid #4355C5; padding-bottom: 16px; margin-bottom: 20px; }
  .name { font-size: 24pt; font-weight: 700; color: #4355C5; text-transform: uppercase; }
  .role { font-size: 13pt; color: #555; margin-top: 4px; }
  .meta { font-size: 10pt; color: #777; margin-top: 6px; display: flex; flex-wrap: wrap; gap: 12px; }
  .section { margin-top: 20px; }
  .section-title { font-size: 12pt; font-weight: 700; text-transform: uppercase; color: #4355C5; border-bottom: 1px solid #ddd; padding-bottom: 4px; margin-bottom: 10px; }
  .exp-item { margin-bottom: 14px; }
  .exp-org { font-weight: 600; }
  .exp-pos { color: #555; }
  .exp-dates { font-size: 9.5pt; color: #888; }
  .ach { margin-left: 16px; position: relative; padding-left: 14px; font-size: 10pt; }
  .ach::before { content: "✓"; position: absolute; left: 0; color: #4355C5; font-weight: bold; }
  .edu-item { margin-bottom: 10px; }
  .skill-line { font-size: 10pt; margin-bottom: 3px; padding-left: 14px; position: relative; }
  .skill-dot { width: 6px; height: 6px; border-radius: 50%; background: #c8cde8; display: inline-block; position: absolute; left: 0; top: 6px; }
  .skill-dot.top-dot { background: #4355C5; }
  .sport-row { font-size: 10pt; margin-bottom: 3px; }
  .port-item { font-size: 10pt; margin-bottom: 4px; }
  .footer { margin-top: 30px; border-top: 1px solid #ddd; padding-top: 8px; text-align: center; font-size: 8pt; color: #aaa; }
  a { color: #4355C5; text-decoration: none; }
</style></head><body><div class="page">`;

      html += `<div class="header">`;
      html += `<div class="name">${profile.first_name} ${profile.last_name}</div>`;
      html += `<div class="role">${roleName}${secondaryRoleName ? ` • ${secondaryRoleName}` : ""}${lvl ? ` • ${lvl}` : ""}</div>`;
      html += `<div class="meta">`;
      if (location) html += `<span>📍 ${location}</span>`;
      if (profile.is_relocatable) html += `<span>🔄 Релокация</span>`;
      if (profile.is_remote_available) html += `<span>💻 Удалённо</span>`;
      html += `</div>`;
      html += `<div class="meta" style="margin-top:6px">`;
      if (profile.email) html += `<span>✉ ${profile.email}</span>`;
      if (profile.phone) html += `<span>📱 ${profile.phone}</span>`;
      if (profile.telegram) html += `<span>💬 ${profile.telegram}</span>`;
      if (profile.linkedin_url) html += `<span><a href="${profile.linkedin_url}">LinkedIn</a></span>`;
      html += `</div></div>`;

      if (profile.bio || profile.about_useful || profile.about_goals) {
        html += `<div class="section"><div class="section-title">О себе</div>`;
        if (profile.bio) html += `<p style="margin-bottom:6px">${profile.bio}</p>`;
        if (profile.about_useful) html += `<p style="font-size:10pt;color:#555"><strong>Полезен команде:</strong> ${profile.about_useful}</p>`;
        if (profile.about_goals) html += `<p style="font-size:10pt;color:#555"><strong>Цели:</strong> ${profile.about_goals}</p>`;
        html += `</div>`;
      }

      if (skills.length > 0) {
        html += `<div class="section"><div class="section-title">Навыки</div>`;
        if (topSkills.length > 0) {
          html += `<div style="margin-bottom:6px"><strong style="font-size:10pt;color:#4355C5">Ключевые навыки</strong></div>`;
          topSkills.forEach(s => { html += `<div class="skill-line"><span class="skill-dot top-dot"></span><strong>${s.name}</strong> <span style="color:#777">— ${profLabels[s.proficiency]}</span></div>`; });
        }
        if (otherSkills.length > 0) {
          html += `<div style="margin-top:8px;margin-bottom:6px"><strong style="font-size:10pt;color:#555">Дополнительные</strong></div>`;
          otherSkills.forEach(s => { html += `<div class="skill-line"><span class="skill-dot"></span>${s.name} <span style="color:#777">— ${profLabels[s.proficiency]}</span></div>`; });
        }
        html += `</div>`;
      }

      if (experiences.length > 0) {
        html += `<div class="section"><div class="section-title">Опыт работы</div>`;
        experiences.slice(0, 4).forEach(exp => {
          const start = new Date(exp.start_date).toLocaleDateString("ru-RU", { month: "short", year: "numeric" });
          const end = exp.is_current ? "настоящее время" : exp.end_date ? new Date(exp.end_date).toLocaleDateString("ru-RU", { month: "short", year: "numeric" }) : "";
          html += `<div class="exp-item">`;
          html += `<div class="exp-org">${exp.company_name}</div>`;
          html += `<div class="exp-pos">${exp.position}${exp.employment_type ? ` • ${empLabels[exp.employment_type] || exp.employment_type}` : ""}</div>`;
          html += `<div class="exp-dates">${start} — ${end}</div>`;
          if (exp.description) html += `<p style="font-size:10pt;margin-top:4px">${exp.description}</p>`;
          if (exp.achievements && exp.achievements.length > 0) exp.achievements.forEach((a: string) => { html += `<div class="ach">${a}</div>`; });
          html += `</div>`;
        });
        html += `</div>`;
      }

      if (education.length > 0 || certificates.length > 0) {
        html += `<div class="section"><div class="section-title">Образование и сертификаты</div>`;
        education.forEach((e: any) => {
          html += `<div class="edu-item"><strong>${e.institution}</strong>`;
          const deg = e.degree ? (degLabels[e.degree] || e.degree) : "";
          if (deg || e.field_of_study) html += ` — ${deg}${e.field_of_study ? `, ${e.field_of_study}` : ""}`;
          if (e.start_year) html += ` <span style="color:#888;font-size:9.5pt">(${e.start_year}${e.end_year ? `–${e.end_year}` : e.is_current ? "–н.в." : ""})</span>`;
          html += `</div>`;
        });
        certificates.forEach((c: any) => {
          html += `<div class="edu-item" style="font-size:10pt">🏅 ${c.name}${c.issuer ? ` — ${c.issuer}` : ""}${c.year ? ` (${c.year})` : ""}</div>`;
        });
        html += `</div>`;
      }

      if (sportsExp.length > 0) {
        html += `<div class="section"><div class="section-title">Виды спорта</div>`;
        sportsExp.forEach(s => {
          html += `<div class="sport-row">⚽ ${s.sport?.name || "—"} — ${s.years} ${s.years === 1 ? "год" : s.years < 5 ? "года" : "лет"}${s.level ? ` (${s.level})` : ""}</div>`;
        });
        html += `</div>`;
      }

      if (portfolio.length > 0) {
        html += `<div class="section"><div class="section-title">Портфолио</div>`;
        portfolio.slice(0, 5).forEach((p: any) => {
          html += `<div class="port-item">📎 <a href="${p.url}">${p.title}</a> <span style="color:#888">(${p.type})</span></div>`;
        });
        html += `</div>`;
      }

      html += `<div class="footer">Сгенерировано на ProStaff • ${new Date().toLocaleDateString("ru-RU")}</div>`;
      html += `</div></body></html>`;

      const { default: html2pdf } = await import("html2pdf.js");
      const container = document.createElement("div");
      container.style.position = "absolute";
      container.style.left = "-9999px";
      container.innerHTML = html;
      document.body.appendChild(container);
      const el = container.querySelector(".page") as HTMLElement;
      const pdfBlob = await html2pdf().set({
        margin: [2, 5, 2, 5],
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      }).from(el).outputPdf("blob");
      document.body.removeChild(container);
      const blobUrl = URL.createObjectURL(new Blob([pdfBlob], { type: "application/pdf" }));
      window.open(blobUrl, "_blank");
    } catch (err) {
      console.error("Error generating PDF:", err);
      toast({ title: "Ошибка", description: "Не удалось сгенерировать PDF", variant: "destructive" });
    } finally {
      setPdfLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="container max-w-6xl py-8">
          <Skeleton className="h-8 w-64 mb-6" />
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-2xl" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-6xl py-8 md:py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <Link to="/jobs" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4">
              <ArrowLeft className="h-4 w-4" />
              К вакансиям
            </Link>
            <h1 className="font-display text-3xl md:text-4xl font-bold uppercase">
              Отклики кандидатов
            </h1>
            <p className="text-muted-foreground mt-2">
              Управляйте откликами на ваши вакансии
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-2xl font-bold">{applications.length}</p>
              <p className="text-sm text-muted-foreground">всего откликов</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Select value={selectedJob} onValueChange={setSelectedJob}>
            <SelectTrigger className="w-[250px]">
              <Briefcase className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Все вакансии" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все вакансии</SelectItem>
              {jobs.map(job => (
                <SelectItem key={job.id} value={job.id}>
                  {job.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Все статусы" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все статусы</SelectItem>
              {Object.entries(statusLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="ml-auto text-muted-foreground">
            Показано: {filteredApplications.length}
          </div>
        </div>

        {/* Applications List */}
        {filteredApplications.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Откликов пока нет</h3>
              <p className="text-muted-foreground">
                {jobs.length === 0 
                  ? "Создайте вакансию, чтобы получать отклики"
                  : "Когда кандидаты откликнутся на ваши вакансии, они появятся здесь"
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map(application => (
              <Card key={application.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                    {/* Avatar */}
                    <Avatar className="h-14 w-14">
                      <AvatarImage src={application.profiles.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary text-lg">
                        {application.profiles.first_name[0]}
                        {application.profiles.last_name[0]}
                      </AvatarFallback>
                    </Avatar>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 mb-3">
                        <div>
                          <Link 
                            to={`/profile/${application.profiles.id}`}
                            className="font-semibold text-lg hover:text-accent transition-colors"
                          >
                            {application.profiles.first_name} {application.profiles.last_name}
                          </Link>
                          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                            {application.profiles.specialist_roles && (
                              <span>{application.profiles.specialist_roles.name}</span>
                            )}
                            {application.profiles.level && (
                              <>
                                <span>•</span>
                                <span>{levelLabels[application.profiles.level] || application.profiles.level}</span>
                              </>
                            )}
                            {application.profiles.city && (
                              <>
                                <span>•</span>
                                <span>{application.profiles.city}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <Badge className={statusColors[application.status]}>
                          {statusLabels[application.status]}
                        </Badge>
                      </div>

                      {/* Job */}
                      <div className="text-sm text-muted-foreground mb-3">
                        <Briefcase className="h-4 w-4 inline mr-1" />
                        На вакансию: <Link to={`/jobs/${application.jobs.id}`} className="text-accent hover:underline">{application.jobs.title}</Link>
                      </div>

                      {/* Cover Letter Preview */}
                      {application.cover_letter && (
                        <div className="bg-muted/50 rounded-lg p-3 mb-3">
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            <FileText className="h-4 w-4 inline mr-1" />
                            {application.cover_letter}
                          </p>
                        </div>
                      )}

                      {/* Contact & Date */}
                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        {application.profiles.email && (
                          <a href={`mailto:${application.profiles.email}`} className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
                            <Mail className="h-4 w-4" />
                            {application.profiles.email}
                          </a>
                        )}
                        {application.profiles.phone && (
                          <a href={`tel:${application.profiles.phone}`} className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
                            <Phone className="h-4 w-4" />
                            {application.profiles.phone}
                          </a>
                        )}
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {new Date(application.created_at).toLocaleDateString("ru-RU")}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-row lg:flex-col gap-2">
                      <Link to={`/profile/${application.profiles.id}`}>
                        <Button variant="outline" size="sm" className="w-full">
                          <Eye className="h-4 w-4 mr-1" />
                          Профиль
                        </Button>
                      </Link>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => generatePdf(application.profiles.id)}
                        disabled={pdfLoading}
                        className="w-full"
                      >
                        {pdfLoading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Printer className="h-4 w-4 mr-1" />}
                        Резюме
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => openNotesModal(application)}
                        className="w-full"
                      >
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Заметки
                      </Button>
                      <Select 
                        value={application.status} 
                        onValueChange={(value) => updateStatus(application.id, value as ApplicationStatus)}
                      >
                        <SelectTrigger className="w-full">
                          <ChevronDown className="h-4 w-4 mr-1" />
                          Статус
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(statusLabels).map(([key, label]) => (
                            <SelectItem key={key} value={key}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Notes Modal */}
      <Dialog open={showNotesModal} onOpenChange={setShowNotesModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Заметки о кандидате</DialogTitle>
            <DialogDescription>
              {selectedApplication && (
                <>
                  {selectedApplication.profiles.first_name} {selectedApplication.profiles.last_name}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Добавьте заметки о кандидате..."
            rows={5}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNotesModal(false)}>
              Отмена
            </Button>
            <Button onClick={saveNotes} disabled={savingNotes}>
              {savingNotes && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Interview Message Modal */}
      <Dialog open={showInterviewModal} onOpenChange={setShowInterviewModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Приглашение на интервью</DialogTitle>
            <DialogDescription>
              Отредактируйте шаблон письма — заполните дату, время, формат и контактное лицо.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={interviewMessage}
            onChange={(e) => setInterviewMessage(e.target.value)}
            rows={14}
            className="font-mono text-sm leading-relaxed"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInterviewModal(false)}>
              Отмена
            </Button>
            <Button onClick={confirmInterview} disabled={savingInterview}>
              {savingInterview && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Отправить и подтвердить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
