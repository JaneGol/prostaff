import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { trackEvent } from "@/hooks/useAnalytics";
import { getSportIcon } from "@/lib/sportIcons";
import {
  MapPin, Mail, Phone, Globe, Briefcase, GraduationCap,
  Calendar, ExternalLink, Edit, MessageCircle, CheckCircle,
  Clock, Lock, Eye, AlertTriangle, Trophy, Handshake, FolderOpen,
  Star, Award, FileText, Wrench, User
} from "lucide-react";
import { isBankAvatar, decodeBankAvatar, getDefaultAvatar, isSilhouetteAvatar } from "@/lib/defaultAvatars";
import { PdfResumeModal } from "@/components/profile/PdfResumeModal";

interface ProfileData {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  city: string | null;
  country: string | null;
  level: string | null;
  is_relocatable: boolean;
  is_remote_available: boolean;
  search_status: string | null;
  email: string | null;
  phone: string | null;
  telegram: string | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  show_name: boolean;
  show_contacts: boolean;
  hide_current_org: boolean;
  visibility_level: string;
  about_useful: string | null;
  about_style: string | null;
  about_goals: string | null;
  specialist_roles: { id: string; name: string } | null;
  secondary_role: { id: string; name: string } | null;
}

interface Experience {
  id: string;
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
  id: string;
  name: string;
  category: string | null;
  proficiency: number;
  is_top: boolean;
  custom_name: string | null;
  is_custom: boolean;
}

interface SportExp {
  sport_id: string;
  years: number;
  level: string | null;
  context_level: string | null;
  sport: { id: string; name: string; icon: string | null } | null;
}

interface SportOpen {
  sport_id: string | null;
  sport_group: string | null;
  sport: { id: string; name: string; icon: string | null } | null;
}

interface EducationItem {
  id: string;
  institution: string;
  degree: string | null;
  field_of_study: string | null;
  start_year: number | null;
  end_year: number | null;
  is_current: boolean;
}

interface CertificateItem {
  id: string;
  name: string;
  issuer: string | null;
  year: number | null;
  url: string | null;
}

interface PortfolioItemData {
  id: string;
  type: string;
  title: string;
  url: string;
  description: string | null;
  tags: string[];
  visibility: string;
}

const levelLabels: Record<string, string> = {
  intern: "Стажёр", junior: "Junior", middle: "Middle", senior: "Senior", head: "Head"
};

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  actively_looking: { label: "Активно ищу работу", variant: "default" },
  open_to_offers: { label: "Открыт к предложениям", variant: "secondary" },
  not_looking_but_open: { label: "Готов рассмотреть топ-роль", variant: "secondary" },
  not_looking: { label: "Не ищу работу", variant: "outline" }
};

const proficiencyLabels: Record<number, string> = { 1: "Базовый", 2: "Уверенный", 3: "Эксперт" };
const degreeLabels: Record<string, string> = {
  bachelor: "Бакалавр", master: "Магистр", phd: "Кандидат/Доктор наук",
  specialist: "Специалист", courses: "Курсы", other: "Другое"
};
const employmentLabels: Record<string, string> = {
  full_time: "Полная занятость", part_time: "Частичная", contract: "Контракт",
  internship: "Стажировка", freelance: "Фриланс"
};

type AccessLevel = "owner" | "full" | "preview" | "paywall" | "login_required";

export default function Profile() {
  const { id } = useParams<{ id: string }>();
  const { user, userRole } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [sportsExp, setSportsExp] = useState<SportExp[]>([]);
  const [sportsOpen, setSportsOpen] = useState<SportOpen[]>([]);
  const [educationItems, setEducationItems] = useState<EducationItem[]>([]);
  const [certificateItems, setCertificateItems] = useState<CertificateItem[]>([]);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [accessLevel, setAccessLevel] = useState<AccessLevel>("preview");
  const [viewsRemaining, setViewsRemaining] = useState<number | null>(null);
  const [unlocking, setUnlocking] = useState(false);
  const [pdfOpen, setPdfOpen] = useState(false);

  // Dynamic meta tags for specialist profile
  const profileMetaTitle = profile
    ? `${profile.show_name && profile.first_name ? `${profile.first_name} ${profile.last_name}` : profile.specialist_roles?.name || "Специалист"} — профиль`
    : "Профиль специалиста";
  const profileMetaDesc = profile
    ? `${profile.specialist_roles?.name || "Специалист"}${sportsExp.length > 0 ? ` · ${sportsExp.map(s => s.sport?.name).filter(Boolean).join(", ")}` : ""}${profile.city ? ` · ${profile.city}` : ""}. Профиль на ProStaff.`
    : "Профиль спортивного специалиста на платформе ProStaff.";

  usePageMeta({
    title: profileMetaTitle,
    description: profileMetaDesc,
    ogTitle: profileMetaTitle,
    ogDescription: profileMetaDesc,
  });

  const isOwner = user && profile && user.id === profile.user_id;

  useEffect(() => {
    if (id) fetchProfile();
  }, [id, user]);

  const fetchProfile = async () => {
    try {
      // Use edge function for secure, field-filtered profile data
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/profile-api?id=${id}&mode=single`,
        { headers }
      );

      if (!res.ok) {
        if (res.status === 404) {
          setProfile(null);
          setLoading(false);
          return;
        }
        throw new Error(`HTTP ${res.status}`);
      }

      const result = await res.json();

      const profileData = result.profile;
      setProfile(profileData as ProfileData);

      // Set access level from server
      const serverAccess = result.access as string;
      if (serverAccess === "owner") {
        setAccessLevel("owner");
      } else if (serverAccess === "full") {
        setAccessLevel("full");
      } else if (!user) {
        setAccessLevel("login_required");
      } else if (userRole === "employer") {
        setAccessLevel("preview");
      } else {
        setAccessLevel("preview");
      }

      trackEvent("profile_view", "specialist",
        profileData.first_name ? `${profileData.first_name} ${profileData.last_name}` : "Anon",
        profileData.id, {
          role: profileData.specialist_roles?.name || "unknown",
          level: profileData.level || "unknown",
        });

      // Set related data from edge function response
      if (result.experiences) setExperiences(result.experiences as any);
      if (result.skills) {
        setSkills(result.skills.map((s: any) => ({
          id: s.skill_id || s.custom_name,
          name: s.is_custom ? s.custom_name : s.skills?.name || "—",
          category: s.skills?.category || null,
          proficiency: s.proficiency || 2,
          is_top: s.is_top || false,
          custom_name: s.custom_name,
          is_custom: s.is_custom || false,
        })));
      }
      if (result.sportsExp) setSportsExp(result.sportsExp);
      if (result.sportsOpen) setSportsOpen(result.sportsOpen);
      if (result.education) setEducationItems(result.education as any);
      if (result.certificates) setCertificateItems(result.certificates as any);
      if (result.portfolio) setPortfolioItems(result.portfolio);
    } catch (err) {
      console.error("Error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnlockProfile = async () => {
    if (!user || !profile) return;
    setUnlocking(true);
    try {
      const { data, error } = await supabase.functions.invoke("view-profile", { body: { profileId: profile.id } });
      if (error) throw error;
      if (data.access === "full") {
        setAccessLevel("full");
        setViewsRemaining(data.views_remaining ?? data.weekly_remaining ?? null);
        trackEvent("contact_unlock", "profile", `${profile.first_name} ${profile.last_name}`, profile.id);
        // Re-fetch to get full data
        fetchProfile();
      } else if (data.access === "paywall") {
        setAccessLevel("paywall");
      }
    } catch (err: any) {
      if (err?.context?.status === 402) setAccessLevel("paywall");
    } finally {
      setUnlocking(false);
    }
  };

  const canSeeName = accessLevel === "owner" || accessLevel === "full" || (profile?.show_name ?? true);
  const canSeeContacts = accessLevel === "owner" || accessLevel === "full";
  const canSeeDetails = accessLevel === "owner" || accessLevel === "full";

  if (loading) {
    return (
      <Layout>
        <div className="container max-w-6xl py-8 md:py-12">
          <div className="max-w-4xl mx-auto space-y-6">
            <Skeleton className="h-64 w-full rounded-2xl" />
            <Skeleton className="h-48 w-full rounded-2xl" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className="container max-w-6xl py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Профиль не найден</h1>
          <p className="text-muted-foreground mb-6">Возможно, профиль был удалён или скрыт</p>
          <Link to="/specialists"><Button>К банку специалистов</Button></Link>
        </div>
      </Layout>
    );
  }

  const roleName = profile.specialist_roles?.name || "Без специализации";
  const displayName = canSeeName && profile.first_name ? `${profile.first_name} ${profile.last_name}` : roleName;
  const location = [profile.city, profile.country].filter(Boolean).join(", ");
  const statusInfo = profile.search_status ? statusLabels[profile.search_status] : null;

  const toolCategories = new Set(["tools", "Инструменты", "Видео", "GPS", "Аналитика", "Данные"]);
  const isToolSkill = (s: Skill) => s.category && toolCategories.has(s.category);
  const topSkills = skills.filter(s => s.is_top && !isToolSkill(s));
  const toolSkills = skills.filter(s => isToolSkill(s));
  const otherSkills = skills.filter(s => !s.is_top && !isToolSkill(s));

  return (
    <Layout>
      <div className="container max-w-6xl py-8 md:py-12">
        <div className="max-w-4xl mx-auto space-y-6">
          {viewsRemaining !== null && viewsRemaining >= 0 && (
            <div className="bg-accent/10 border border-accent/20 rounded-lg px-4 py-3 flex items-center gap-2 text-sm">
              <Eye className="h-4 w-4 text-accent" />
              <span>Осталось бесплатных просмотров: <strong>{viewsRemaining}</strong></span>
            </div>
          )}

          {/* Header Card */}
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-primary to-primary-dark h-24 md:h-32" />
            <CardContent className="relative pt-0 pb-6">
              <div className="absolute -top-12 left-6 md:left-8">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-card bg-card flex items-center justify-center overflow-hidden">
                  {(() => {
                    const url = profile.avatar_url;
                    if (url && isBankAvatar(url)) {
                      const ba = decodeBankAvatar(url);
                      return ba ? <img src={ba.src} alt={displayName} className={`w-full h-full object-cover ${isSilhouetteAvatar(ba) ? "scale-125" : ""}`} /> : <User className="w-10 h-10 md:w-14 md:h-14 text-primary/40" />;
                    }
                    if (url) return <img src={url} alt={displayName} className="w-full h-full object-cover" />;
                    const def = getDefaultAvatar(profile.id);
                    return <img src={def.src} alt={def.label} className={`w-full h-full object-cover ${isSilhouetteAvatar(def) ? "scale-125" : ""}`} />;
                  })()}
                </div>
              </div>

              {isOwner && (
                <div className="absolute top-4 right-4 flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setPdfOpen(true)}>
                    <FileText className="h-4 w-4 mr-2" />PDF
                  </Button>
                  <Link to="/profile/edit"><Button variant="outline" size="sm"><Edit className="h-4 w-4 mr-2" />Редактировать</Button></Link>
                </div>
              )}

              <div className="pt-20 md:pt-24 space-y-4">
                <div>
                  <h1 className="font-display text-2xl md:text-3xl font-bold uppercase">{displayName}</h1>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    {profile.specialist_roles && canSeeName && (
                      <p className="text-xl font-semibold text-primary">{profile.specialist_roles.name}</p>
                    )}
                    {profile.secondary_role && (
                      <Badge variant="outline" className="px-4 py-1.5 text-sm font-medium">+ {profile.secondary_role.name}</Badge>
                    )}
                    {!canSeeName && (
                      <Badge variant="outline" className="px-4 py-1.5 text-sm font-medium"><Lock className="h-3.5 w-3.5 mr-1" />Имя скрыто</Badge>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  {statusInfo && (
                    <Badge variant={statusInfo.variant} className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium">
                      {profile.search_status === "actively_looking" ? <CheckCircle className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                      {statusInfo.label}
                    </Badge>
                  )}
                  {profile.level && <Badge variant="outline" className="px-4 py-1.5 text-sm font-medium"><GraduationCap className="h-3.5 w-3.5 mr-1" />{levelLabels[profile.level] || profile.level}</Badge>}
                  {profile.is_relocatable && <Badge variant="outline" className="px-4 py-1.5 text-sm font-medium">Готов к релокации</Badge>}
                  {profile.is_remote_available && <Badge variant="outline" className="px-4 py-1.5 text-sm font-medium">Удалённая работа</Badge>}
                </div>

                {location && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />{location}
                  </div>
                )}

                {/* Action buttons */}
                {!isOwner && accessLevel === "preview" && userRole === "employer" && (
                  <div className="flex gap-3 pt-2">
                    <Button onClick={handleUnlockProfile} disabled={unlocking}>
                      {unlocking ? <><Lock className="h-4 w-4 mr-2 animate-pulse" />Открываем...</> : <><Eye className="h-4 w-4 mr-2" />Открыть полный профиль</>}
                    </Button>
                  </div>
                )}
                {!isOwner && accessLevel === "login_required" && (
                  <div className="flex gap-3 pt-2">
                    <Link to="/auth"><Button><Lock className="h-4 w-4 mr-2" />Зарегистрируйтесь как работодатель, чтобы увидеть полную информацию о кандидате</Button></Link>
                  </div>
                )}
                {!isOwner && accessLevel === "full" && (
                  <div className="flex gap-3 pt-2">
                    <Button onClick={() => trackEvent("contact_click", "profile", displayName, profile.id)}>
                      <MessageCircle className="h-4 w-4 mr-2" />Связаться
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {accessLevel === "paywall" && (
            <Card className="border-accent/30 bg-accent/5">
              <CardContent className="py-6 text-center">
                <AlertTriangle className="h-10 w-10 text-accent mx-auto mb-3" />
                <h2 className="font-display text-lg font-bold uppercase mb-2">Лимит просмотров исчерпан</h2>
                <p className="text-muted-foreground mb-4">Оформите подписку для неограниченного доступа</p>
                <Button disabled>Оформить подписку (скоро)</Button>
              </CardContent>
            </Card>
          )}

          {/* About */}
          {(profile.bio || profile.about_useful || profile.about_style || profile.about_goals) && (
            <Card>
              <CardContent className="py-6 space-y-4">
                <h2 className="text-base font-semibold flex items-center gap-2 mb-4">
                  <User className="h-5 w-5 text-muted-foreground" />
                  О себе
                </h2>
                {profile.bio && <p className="text-foreground whitespace-pre-wrap">{profile.bio}</p>}
                {profile.about_useful && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Чем полезен команде</h4>
                    <p className="text-foreground">{profile.about_useful}</p>
                  </div>
                )}
                {profile.about_style && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Стиль работы</h4>
                    <p className="text-foreground">{profile.about_style}</p>
                  </div>
                )}
                {profile.about_goals && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Цели</h4>
                    <p className="text-foreground">{profile.about_goals}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Skills */}
          {skills.length > 0 && (
            <Card>
              <CardContent className="py-6">
                <h2 className="text-base font-semibold flex items-center gap-2 mb-4"><Wrench className="h-5 w-5 text-muted-foreground" />Навыки</h2>
                {topSkills.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 text-amber-500" />Ключевые навыки
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {topSkills.map(skill => (
                        <Badge key={skill.id} variant="default" className="flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium">
                          <Star className="h-3 w-3 fill-current" />
                          {skill.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {otherSkills.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Дополнительные</h4>
                    <div className="flex flex-wrap gap-2">
                      {otherSkills.map(skill => (
                        <Badge key={skill.id} variant="secondary" className="px-3.5 py-1.5 text-sm font-medium">
                          {skill.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {toolSkills.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                      <Wrench className="h-3.5 w-3.5" />Инструменты
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {toolSkills.map(skill => (
                        <Badge key={skill.id} variant="outline" className="px-3.5 py-1.5 text-sm font-medium">
                          {skill.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Sports */}
          {sportsExp.length > 0 && (
            <Card>
              <CardContent className="py-6">
                <h2 className="text-base font-semibold flex items-center gap-2 mb-4">
                  <Trophy className="h-5 w-5 text-muted-foreground" />Опыт по видам спорта
                </h2>
                <div className="space-y-3">
                  {sportsExp.map(s => {
                    const Icon = getSportIcon(s.sport?.icon);
                    return (
                      <div key={s.sport_id} className="flex items-center gap-3">
                        <Icon className="h-5 w-5 text-primary" />
                        <span className="font-medium">{s.sport?.name}</span>
                        <Badge variant="outline" className="px-4 py-1.5 text-sm font-medium">{s.years} {s.years === 1 ? "год" : s.years < 5 ? "года" : "лет"}</Badge>
                        {s.level && <Badge variant="secondary" className="px-4 py-1.5 text-sm font-medium">{s.level === "beginner" ? "Начинающий" : s.level === "intermediate" ? "Средний" : s.level === "advanced" ? "Продвинутый" : "Эксперт"}</Badge>}
                        {s.context_level && <Badge variant="outline" className="px-4 py-1.5 text-sm font-medium">{s.context_level}</Badge>}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {sportsOpen.length > 0 && (
            <Card>
              <CardContent className="py-6">
                <h2 className="text-base font-semibold flex items-center gap-2 mb-4">
                  <Handshake className="h-5 w-5 text-muted-foreground" />Готов работать в
                </h2>
                <div className="flex flex-wrap gap-2">
                  {sportsOpen.map((s, i) => {
                    if (s.sport_group) {
                      const groupLabels: Record<string, string> = {
                        any: "Любой вид спорта", team: "Командные", individual: "Индивидуальные",
                        game: "Игровые", cyclic: "Циклические", combat: "Единоборства",
                        power: "Силовые", coordination: "Координационные", technical: "Технические", mixed: "Смешанные",
                      };
                      return (
                        <Badge key={`group-${s.sport_group}`} variant="default" className="px-4 py-1.5 text-sm font-medium">
                          {groupLabels[s.sport_group] || s.sport_group}
                        </Badge>
                      );
                    }
                    if (s.sport_id && s.sport) {
                      const Icon = getSportIcon(s.sport.icon);
                      return (
                        <Badge key={s.sport_id} variant="outline" className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium">
                          <Icon className="h-3.5 w-3.5" />{s.sport.name}
                        </Badge>
                      );
                    }
                    return null;
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Experience */}
          {experiences.length > 0 && (
            <Card>
              <CardContent className="py-6">
                <h2 className="text-base font-semibold flex items-center gap-2 mb-4">
                  <Briefcase className="h-5 w-5 text-muted-foreground" />Опыт работы
                </h2>
                <div className="space-y-6">
                  {experiences.map((exp, index) => (
                    <div key={exp.id} className="relative pl-6 pb-6 last:pb-0">
                      {index < experiences.length - 1 && <div className="absolute left-2 top-3 bottom-0 w-0.5 bg-border" />}
                      <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full bg-primary border-2 border-card" />
                      <div>
                        <h3 className="font-semibold text-foreground">{exp.position}</h3>
                        <p className="text-muted-foreground">{exp.company_name}</p>
                        {(exp.league || exp.team_level) && (
                          <p className="text-sm text-muted-foreground">{[exp.league, exp.team_level].filter(Boolean).join(" • ")}</p>
                        )}
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {new Date(exp.start_date).toLocaleDateString("ru-RU", { month: "long", year: "numeric" })}
                            {" — "}
                            {exp.is_current ? "настоящее время" : exp.end_date ? new Date(exp.end_date).toLocaleDateString("ru-RU", { month: "long", year: "numeric" }) : ""}
                          </div>
                          {exp.employment_type && <Badge variant="outline" className="px-4 py-1.5 text-sm font-medium">{employmentLabels[exp.employment_type] || exp.employment_type}</Badge>}
                          {exp.is_remote && <Badge variant="outline" className="px-4 py-1.5 text-sm font-medium">Удалённо</Badge>}
                        </div>
                        {exp.description && <p className="text-sm mt-2">{exp.description}</p>}
                        {exp.achievements && exp.achievements.length > 0 && (
                          <ul className="mt-2 space-y-1">
                            {exp.achievements.map((ach, i) => (
                              <li key={i} className="text-sm flex items-start gap-2">
                                <CheckCircle className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
                                {ach}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Education */}
          {(educationItems.length > 0 || certificateItems.length > 0) && (
            <Card>
              <CardContent className="py-6">
                <h2 className="text-base font-semibold flex items-center gap-2 mb-4">
                  <GraduationCap className="h-5 w-5 text-muted-foreground" />Образование и сертификаты
                </h2>
                {educationItems.length > 0 && (
                  <div className="space-y-4 mb-4">
                    {educationItems.map(edu => (
                      <div key={edu.id} className="border-l-2 border-primary pl-4">
                        <h3 className="font-semibold">{edu.institution}</h3>
                        <p className="text-sm text-muted-foreground">
                          {edu.degree && degreeLabels[edu.degree] ? degreeLabels[edu.degree] : edu.degree}
                          {edu.field_of_study && ` — ${edu.field_of_study}`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {edu.start_year && `${edu.start_year}`}{edu.end_year && ` — ${edu.end_year}`}{edu.is_current && " — настоящее время"}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
                {certificateItems.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <Award className="h-4 w-4" />Сертификаты
                    </h4>
                    {certificateItems.map(cert => (
                      <div key={cert.id} className="flex items-center gap-3 text-sm">
                        <span className="font-medium">{cert.name}</span>
                        {cert.issuer && <span className="text-muted-foreground">— {cert.issuer}</span>}
                        {cert.year && <span className="text-muted-foreground">({cert.year})</span>}
                        {cert.url && canSeeDetails && (
                          <a href={cert.url} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                        {cert.url && !canSeeDetails && (
                          <span className="text-muted-foreground/50 text-xs flex items-center gap-1"><Lock className="h-3 w-3" />ссылка скрыта</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Portfolio */}
          {portfolioItems.length > 0 && (
            <Card>
              <CardContent className="py-6">
                <h2 className="text-base font-semibold flex items-center gap-2 mb-4">
                  <FolderOpen className="h-5 w-5 text-muted-foreground" />Портфолио
                </h2>
                <div className="space-y-4">
                  {portfolioItems.map(item => (
                    <div key={item.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{item.title}</h3>
                          <Badge variant="outline" className="px-4 py-1.5 text-sm font-medium mt-1">{item.type}</Badge>
                        </div>
                        {canSeeDetails ? (
                          <a href={item.url} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="sm"><ExternalLink className="h-3 w-3 mr-1" />Открыть</Button>
                          </a>
                        ) : (
                          <span className="text-muted-foreground/50 text-xs flex items-center gap-1"><Lock className="h-3 w-3" />Доступно после регистрации</span>
                        )}
                      </div>
                      {item.description && <p className="text-sm text-muted-foreground mt-2">{item.description}</p>}
                      {item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {item.tags.map((tag, i) => <Badge key={i} variant="secondary" className="px-4 py-1.5 text-sm font-medium">{tag}</Badge>)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Contacts */}
          {canSeeContacts && (profile.email || profile.phone || profile.telegram || profile.linkedin_url || profile.portfolio_url) && (
            <Card>
              <CardContent className="py-6">
                <h2 className="text-base font-semibold flex items-center gap-2 mb-4">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  Контакты
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.email && <a href={`mailto:${profile.email}`} className="flex items-center gap-3 hover:text-accent transition-colors"><Mail className="h-5 w-5 text-muted-foreground" />{profile.email}</a>}
                  {profile.phone && <a href={`tel:${profile.phone}`} className="flex items-center gap-3 hover:text-accent transition-colors"><Phone className="h-5 w-5 text-muted-foreground" />{profile.phone}</a>}
                  {profile.telegram && <a href={`https://t.me/${profile.telegram.replace("@", "")}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-accent transition-colors"><MessageCircle className="h-5 w-5 text-muted-foreground" />{profile.telegram}</a>}
                  {profile.linkedin_url && <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-accent transition-colors"><ExternalLink className="h-5 w-5 text-muted-foreground" />LinkedIn</a>}
                  {profile.portfolio_url && <a href={profile.portfolio_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-accent transition-colors"><Globe className="h-5 w-5 text-muted-foreground" />Портфолио</a>}
                </div>
              </CardContent>
            </Card>
          )}

          {!canSeeContacts && !isOwner && (
            <Card className="border-dashed">
              <CardContent className="py-6 text-center">
                <Lock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground text-sm">
                  {accessLevel === "login_required" ? "Зарегистрируйтесь как работодатель, чтобы увидеть полную информацию о кандидате" :
                   accessLevel === "paywall" ? "Оформите подписку для доступа к контактам" :
                   "Откройте полный профиль, чтобы увидеть контакты"}
                </p>
              </CardContent>
            </Card>
          )}
          {isOwner && (
            <PdfResumeModal
              open={pdfOpen}
              onClose={() => setPdfOpen(false)}
              profile={profile as any}
              experiences={experiences}
              skills={skills}
              sportsExp={sportsExp}
              education={educationItems}
              certificates={certificateItems}
              portfolio={portfolioItems}
            />
          )}
        </div>
      </div>
    </Layout>
  );
}
