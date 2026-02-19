import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader2, Download, FileText, EyeOff } from "lucide-react";

interface ProfileForPdf {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  city: string | null;
  country: string | null;
  level: string | null;
  search_status: string | null;
  is_relocatable: boolean;
  is_remote_available: boolean;
  bio: string | null;
  about_useful: string | null;
  about_style: string | null;
  about_goals: string | null;
  email: string | null;
  phone: string | null;
  telegram: string | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  hide_current_org: boolean;
  specialist_roles: { id: string; name: string } | null;
  secondary_role: { id: string; name: string } | null;
}

interface Experience {
  company_name: string;
  position: string;
  league: string | null;
  team_level: string | null;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  description: string | null;
  employment_type: string | null;
  achievements: string[] | null;
  is_remote: boolean;
  hide_org: boolean;
}

interface Skill {
  name: string;
  proficiency: number;
  is_top: boolean;
}

interface EducationItem {
  institution: string;
  degree: string | null;
  field_of_study: string | null;
  start_year: number | null;
  end_year: number | null;
  is_current: boolean;
}

interface CertificateItem {
  name: string;
  issuer: string | null;
  year: number | null;
}

interface SportExp {
  years: number;
  level: string | null;
  sport: { name: string } | null;
}

interface PortfolioItemData {
  title: string;
  url: string;
  type: string;
}

interface PdfResumeModalProps {
  open: boolean;
  onClose: () => void;
  profile: ProfileForPdf;
  experiences: Experience[];
  skills: Skill[];
  sportsExp: SportExp[];
  education: EducationItem[];
  certificates: CertificateItem[];
  portfolio: PortfolioItemData[];
}

const levelLabels: Record<string, string> = {
  intern: "Стажёр", junior: "Junior", middle: "Middle", senior: "Senior", head: "Head"
};
const profLabels: Record<number, string> = { 1: "Базовый", 2: "Уверенный", 3: "Эксперт" };
const employmentLabels: Record<string, string> = {
  full_time: "Полная", part_time: "Частичная", contract: "Контракт",
  internship: "Стажировка", freelance: "Фриланс"
};
const degreeLabels: Record<string, string> = {
  bachelor: "Бакалавр", master: "Магистр", phd: "К.н./Д.н.",
  specialist: "Специалист", courses: "Курсы", other: "Другое"
};

export function PdfResumeModal({ open, onClose, profile, experiences, skills, sportsExp, education, certificates, portfolio }: PdfResumeModalProps) {
  const [includeContacts, setIncludeContacts] = useState(true);
  const [includeOrg, setIncludeOrg] = useState(true);
  const [anonymous, setAnonymous] = useState(false);
  const [generating, setGenerating] = useState(false);

  const generate = async () => {
    setGenerating(true);
    try {
      await new Promise(r => setTimeout(r, 100));

      const showName = !anonymous;
      const showOrg = includeOrg;
      const showContacts = includeContacts && !anonymous;

      const location = [profile.city, profile.country].filter(Boolean).join(", ");
      const roleName = profile.specialist_roles?.name || "";
      const secondaryRoleName = profile.secondary_role?.name || "";
      const levelStr = profile.level ? levelLabels[profile.level] || profile.level : "";

      const topSkills = skills.filter(s => s.is_top);
      const otherSkills = skills.filter(s => !s.is_top);

      // Build HTML
      let html = `<!DOCTYPE html><html lang="ru"><head><meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 11pt; line-height: 1.5; color: #1a1a2e; }
  .page { max-width: 800px; margin: 0 auto; padding: 40px; }
  .header { border-bottom: 3px solid #4355C5; padding-bottom: 16px; margin-bottom: 20px; }
  .name { font-size: 24pt; font-weight: 700; color: #4355C5; text-transform: uppercase; letter-spacing: 0.5px; }
  .role { font-size: 13pt; color: #555; margin-top: 4px; }
  .meta { font-size: 10pt; color: #777; margin-top: 6px; display: flex; flex-wrap: wrap; gap: 12px; }
  .section { margin-top: 20px; }
  .section-title { font-size: 12pt; font-weight: 700; text-transform: uppercase; color: #4355C5; border-bottom: 1px solid #ddd; padding-bottom: 4px; margin-bottom: 10px; letter-spacing: 0.5px; }
  .skill-tag { display: inline-block; background: #eceefb; border: 1px solid #c8cde8; border-radius: 6px; padding: 6px 14px; margin: 3px 6px 3px 0; font-size: 10.5pt; font-weight: 500; color: #2a2a4a; }
  .skill-top { background: #4355C5; color: #fff; border-color: #4355C5; }
  .exp-item { margin-bottom: 14px; }
  .exp-org { font-weight: 600; font-size: 11pt; }
  .exp-pos { color: #555; }
  .exp-dates { font-size: 9.5pt; color: #888; }
  .ach { margin-left: 16px; position: relative; padding-left: 14px; font-size: 10pt; }
  .ach::before { content: "✓"; position: absolute; left: 0; color: #4355C5; font-weight: bold; }
  .edu-item { margin-bottom: 10px; }
  .contact-row { display: flex; flex-wrap: wrap; gap: 16px; font-size: 10pt; }
  .port-item { font-size: 10pt; margin-bottom: 4px; }
  .sport-row { font-size: 10pt; margin-bottom: 3px; }
  .footer { margin-top: 30px; border-top: 1px solid #ddd; padding-top: 8px; text-align: center; font-size: 8pt; color: #aaa; }
  a { color: #4355C5; text-decoration: none; }
</style></head><body><div class="page">`;

      // Header
      html += `<div class="header">`;
      html += `<div class="name">${showName ? `${profile.first_name} ${profile.last_name}` : "Кандидат ProStaff"}</div>`;
      html += `<div class="role">${roleName}${secondaryRoleName ? ` • ${secondaryRoleName}` : ""}${levelStr ? ` • ${levelStr}` : ""}</div>`;
      html += `<div class="meta">`;
      if (location) html += `<span>📍 ${location}</span>`;
      if (profile.is_relocatable) html += `<span>🔄 Релокация</span>`;
      if (profile.is_remote_available) html += `<span>💻 Удалённо</span>`;
      html += `</div>`;
      if (showContacts) {
        html += `<div class="meta" style="margin-top:6px">`;
        if (profile.email) html += `<span>✉ ${profile.email}</span>`;
        if (profile.phone) html += `<span>📱 ${profile.phone}</span>`;
        if (profile.telegram) html += `<span>💬 ${profile.telegram}</span>`;
        if (profile.linkedin_url) html += `<span><a href="${profile.linkedin_url}">LinkedIn</a></span>`;
        html += `</div>`;
      }
      html += `</div>`;

      // About
      if (profile.bio || profile.about_useful || profile.about_goals) {
        html += `<div class="section"><div class="section-title">О себе</div>`;
        if (profile.bio) html += `<p style="margin-bottom:6px">${profile.bio}</p>`;
        if (profile.about_useful) html += `<p style="font-size:10pt;color:#555"><strong>Полезен команде:</strong> ${profile.about_useful}</p>`;
        if (profile.about_goals) html += `<p style="font-size:10pt;color:#555"><strong>Цели:</strong> ${profile.about_goals}</p>`;
        html += `</div>`;
      }

      // Skills
      if (skills.length > 0) {
        html += `<div class="section"><div class="section-title">Навыки</div>`;
        if (topSkills.length > 0) {
          topSkills.forEach(s => { html += `<span class="skill-tag skill-top">★ ${s.name} • ${profLabels[s.proficiency]}</span>`; });
        }
        if (otherSkills.length > 0) {
          otherSkills.forEach(s => { html += `<span class="skill-tag">${s.name} • ${profLabels[s.proficiency]}</span>`; });
        }
        html += `</div>`;
      }

      // Experience
      if (experiences.length > 0) {
        html += `<div class="section"><div class="section-title">Опыт работы</div>`;
        experiences.slice(0, 4).forEach(exp => {
          const orgVisible = showOrg && !exp.hide_org;
          const start = new Date(exp.start_date).toLocaleDateString("ru-RU", { month: "short", year: "numeric" });
          const end = exp.is_current ? "настоящее время" : exp.end_date ? new Date(exp.end_date).toLocaleDateString("ru-RU", { month: "short", year: "numeric" }) : "";
          html += `<div class="exp-item">`;
          html += `<div class="exp-org">${orgVisible ? exp.company_name : "Организация скрыта"}</div>`;
          html += `<div class="exp-pos">${exp.position}${exp.employment_type ? ` • ${employmentLabels[exp.employment_type] || exp.employment_type}` : ""}</div>`;
          html += `<div class="exp-dates">${start} — ${end}</div>`;
          if (exp.description) html += `<p style="font-size:10pt;margin-top:4px">${exp.description}</p>`;
          if (exp.achievements && exp.achievements.length > 0) {
            exp.achievements.forEach(a => { html += `<div class="ach">${a}</div>`; });
          }
          html += `</div>`;
        });
        html += `</div>`;
      }

      // Education
      if (education.length > 0 || certificates.length > 0) {
        html += `<div class="section"><div class="section-title">Образование и сертификаты</div>`;
        education.forEach(e => {
          html += `<div class="edu-item"><strong>${e.institution}</strong>`;
          const deg = e.degree ? (degreeLabels[e.degree] || e.degree) : "";
          if (deg || e.field_of_study) html += ` — ${deg}${e.field_of_study ? `, ${e.field_of_study}` : ""}`;
          if (e.start_year) html += ` <span style="color:#888;font-size:9.5pt">(${e.start_year}${e.end_year ? `–${e.end_year}` : e.is_current ? "–н.в." : ""})</span>`;
          html += `</div>`;
        });
        certificates.forEach(c => {
          html += `<div class="edu-item" style="font-size:10pt">🏅 ${c.name}${c.issuer ? ` — ${c.issuer}` : ""}${c.year ? ` (${c.year})` : ""}</div>`;
        });
        html += `</div>`;
      }

      // Sports
      if (sportsExp.length > 0) {
        html += `<div class="section"><div class="section-title">Виды спорта</div>`;
        sportsExp.forEach(s => {
          html += `<div class="sport-row">⚽ ${s.sport?.name || "—"} — ${s.years} ${s.years === 1 ? "год" : s.years < 5 ? "года" : "лет"}${s.level ? ` (${s.level})` : ""}</div>`;
        });
        html += `</div>`;
      }

      // Portfolio
      if (portfolio.length > 0) {
        html += `<div class="section"><div class="section-title">Портфолио</div>`;
        portfolio.slice(0, 5).forEach(p => {
          html += `<div class="port-item">📎 <a href="${p.url}">${p.title}</a> <span style="color:#888">(${p.type})</span></div>`;
        });
        html += `</div>`;
      }

      html += `<div class="footer">Сгенерировано на ProStaff • ${new Date().toLocaleDateString("ru-RU")}</div>`;
      html += `</div></body></html>`;

      // Generate PDF using html2pdf.js
      const { default: html2pdf } = await import("html2pdf.js");
      const container = document.createElement("div");
      container.innerHTML = html;
      document.body.appendChild(container);
      const el = container.querySelector(".page") as HTMLElement;
      const fileName = showName
        ? `${profile.first_name}_${profile.last_name}_CV.pdf`
        : "ProStaff_CV.pdf";
      await html2pdf().set({
        margin: 0,
        filename: fileName,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      }).from(el).save();
      document.body.removeChild(container);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display uppercase">Скачать PDF-резюме</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="font-medium">Анонимный режим</Label>
              <p className="text-xs text-muted-foreground">Имя и контакты будут скрыты</p>
            </div>
            <Switch checked={anonymous} onCheckedChange={setAnonymous} />
          </div>

          {!anonymous && (
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="font-medium">Контакты</Label>
                <p className="text-xs text-muted-foreground">Email, телефон, Telegram, LinkedIn</p>
              </div>
              <Switch checked={includeContacts} onCheckedChange={setIncludeContacts} />
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="font-medium">Текущая организация</Label>
              <p className="text-xs text-muted-foreground">Показать названия организаций</p>
            </div>
            <Switch checked={includeOrg} onCheckedChange={setIncludeOrg} />
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:gap-2">
          <Button variant="outline" onClick={onClose}>Отмена</Button>
          <Button onClick={generate} disabled={generating} className="gap-2">
            {generating ? (
              <><Loader2 className="h-4 w-4 animate-spin" />Генерация...</>
            ) : anonymous ? (
              <><EyeOff className="h-4 w-4" />Анонимный PDF</>
            ) : (
              <><Download className="h-4 w-4" />Скачать PDF</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
