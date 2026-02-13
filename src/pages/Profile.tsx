import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
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
  Clock, Lock, Eye, AlertTriangle, Trophy, Handshake
} from "lucide-react";

interface ProfileData {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
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
  specialist_roles: { id: string; name: string } | null;
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
}

interface Skill {
  id: string;
  name: string;
  category: string | null;
}

interface SportExp {
  sport_id: string;
  years: number;
  level: string | null;
  sport: { id: string; name: string; icon: string | null } | null;
}

interface SportOpen {
  sport_id: string;
  sport: { id: string; name: string; icon: string | null } | null;
}

const levelLabels: Record<string, string> = {
  intern: "Стажёр", junior: "Junior", middle: "Middle", senior: "Senior", head: "Head"
};

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  actively_looking: { label: "Активно ищу работу", variant: "default" },
  open_to_offers: { label: "Открыт к предложениям", variant: "secondary" },
  not_looking: { label: "Не ищу работу", variant: "outline" }
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
  const [loading, setLoading] = useState(true);
  const [accessLevel, setAccessLevel] = useState<AccessLevel>("preview");
  const [viewsRemaining, setViewsRemaining] = useState<number | null>(null);
  const [unlocking, setUnlocking] = useState(false);

  const isOwner = user && profile && user.id === profile.user_id;

  useEffect(() => {
    if (id) fetchProfile();
  }, [id, user]);

  const fetchProfile = async () => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select(`*, specialist_roles (id, name)`)
        .eq("id", id)
        .maybeSingle();

      if (profileError) throw profileError;
      if (!profileData) { setLoading(false); return; }

      setProfile(profileData as any);

      // Determine access level
      if (user && user.id === profileData.user_id) {
        setAccessLevel("owner");
      } else if (userRole === "admin") {
        setAccessLevel("full");
      } else if (userRole === "employer" && user) {
        // Check if already viewed via edge function
        const { data: existingView } = await supabase
          .from("profile_views")
          .select("id")
          .eq("viewer_user_id", user.id)
          .eq("profile_id", id)
          .maybeSingle();

        if (existingView) {
          setAccessLevel("full");
        } else {
          setAccessLevel("preview");
        }
      } else if (user) {
        // Logged in but not employer (specialist viewing another)
        setAccessLevel("preview");
      } else {
        setAccessLevel("login_required");
      }

      // Track profile view
      trackEvent("profile_view", "specialist", profileData.first_name + " " + profileData.last_name, profileData.id, {
        role: profileData.specialist_roles?.name || "unknown",
        level: profileData.level || "unknown",
      });

      // Fetch experiences, skills, and sports in parallel
      const [expRes, skillsRes, sportsExpRes, sportsOpenRes] = await Promise.all([
        supabase.from("experiences").select("*").eq("profile_id", id!).order("start_date", { ascending: false }),
        supabase.from("profile_skills").select(`skill_id, skills (id, name, category)`).eq("profile_id", id!),
        supabase.from("profile_sports_experience").select("sport_id, years, level, sports:sport_id (id, name, icon)").eq("profile_id", id!),
        supabase.from("profile_sports_open_to").select("sport_id, sports:sport_id (id, name, icon)").eq("profile_id", id!),
      ]);

      if (expRes.data) setExperiences(expRes.data);
      if (skillsRes.data) setSkills(skillsRes.data.map((s: any) => s.skills).filter(Boolean));
      if (sportsExpRes.data) setSportsExp(sportsExpRes.data.map((s: any) => ({ ...s, sport: s.sports })));
      if (sportsOpenRes.data) setSportsOpen(sportsOpenRes.data.map((s: any) => ({ ...s, sport: s.sports })));
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
      const { data, error } = await supabase.functions.invoke("view-profile", {
        body: { profileId: profile.id },
      });

      if (error) throw error;

      if (data.access === "full") {
        setAccessLevel("full");
        setViewsRemaining(data.views_remaining ?? data.weekly_remaining ?? null);
        trackEvent("contact_unlock", "profile", `${profile.first_name} ${profile.last_name}`, profile.id);
      } else if (data.access === "paywall") {
        setAccessLevel("paywall");
        trackEvent("quota_exhausted", "profile", `${profile.first_name} ${profile.last_name}`, profile.id);
      }
    } catch (err: any) {
      console.error("Unlock error:", err);
      // Check if it's a 402 paywall response
      if (err?.context?.status === 402) {
        setAccessLevel("paywall");
        trackEvent("quota_exhausted", "profile", `${profile.first_name} ${profile.last_name}`, profile.id);
      }
    } finally {
      setUnlocking(false);
    }
  };

  // Helper: should we show private info?
  const canSeeName = accessLevel === "owner" || accessLevel === "full" || (profile?.show_name ?? true);
  const canSeeContacts = accessLevel === "owner" || accessLevel === "full";

  if (loading) {
    return (
      <Layout>
        <div className="container py-8 md:py-12">
          <div className="max-w-4xl mx-auto space-y-6">
            <Skeleton className="h-64 w-full rounded-2xl" />
            <Skeleton className="h-48 w-full rounded-2xl" />
            <Skeleton className="h-32 w-full rounded-2xl" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Профиль не найден</h1>
          <p className="text-muted-foreground mb-6">Возможно, профиль был удалён или скрыт</p>
          <Link to="/specialists"><Button>К банку специалистов</Button></Link>
        </div>
      </Layout>
    );
  }

  const displayName = canSeeName
    ? `${profile.first_name} ${profile.last_name}`
    : (profile.specialist_roles?.name || "Специалист");
  const initials = canSeeName
    ? `${profile.first_name[0]}${profile.last_name[0]}`
    : "??";
  const location = [profile.city, profile.country].filter(Boolean).join(", ");
  const statusInfo = profile.search_status ? statusLabels[profile.search_status] : null;

  return (
    <Layout>
      <div className="container py-8 md:py-12">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Views remaining banner */}
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
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-card bg-muted flex items-center justify-center overflow-hidden">
                  {canSeeName && profile.avatar_url ? (
                    <img src={profile.avatar_url} alt={displayName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl md:text-4xl font-display font-bold text-muted-foreground">
                      {initials}
                    </span>
                  )}
                </div>
              </div>

              {isOwner && (
                <div className="absolute top-4 right-4">
                  <Link to="/profile/edit">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />Редактировать
                    </Button>
                  </Link>
                </div>
              )}

              <div className="pt-14 md:pt-20 space-y-4">
                <div>
                  <h1 className="font-display text-2xl md:text-3xl font-bold uppercase">
                    {displayName}
                  </h1>
                  {profile.specialist_roles && canSeeName && (
                    <p className="text-lg text-muted-foreground mt-1">{profile.specialist_roles.name}</p>
                  )}
                  {!canSeeName && profile.specialist_roles && (
                    <p className="text-lg text-muted-foreground mt-1 flex items-center gap-2">
                      {profile.specialist_roles.name}
                      <Badge variant="outline" className="text-xs"><Lock className="h-3 w-3 mr-1" />Имя скрыто</Badge>
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {statusInfo && (
                    <Badge variant={statusInfo.variant} className="flex items-center gap-1">
                      {profile.search_status === "actively_looking" ? <CheckCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                      {statusInfo.label}
                    </Badge>
                  )}
                  {profile.level && (
                    <Badge variant="outline"><GraduationCap className="h-3 w-3 mr-1" />{levelLabels[profile.level] || profile.level}</Badge>
                  )}
                  {profile.is_relocatable && <Badge variant="outline">Готов к релокации</Badge>}
                  {profile.is_remote_available && <Badge variant="outline">Удалённая работа</Badge>}
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
                      {unlocking ? (
                        <><Lock className="h-4 w-4 mr-2 animate-pulse" />Открываем...</>
                      ) : (
                        <><Eye className="h-4 w-4 mr-2" />Открыть полный профиль</>
                      )}
                    </Button>
                  </div>
                )}

                {!isOwner && accessLevel === "login_required" && (
                  <div className="flex gap-3 pt-2">
                    <Link to="/auth">
                      <Button><Lock className="h-4 w-4 mr-2" />Войдите, чтобы увидеть контакты</Button>
                    </Link>
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

          {/* Paywall Card */}
          {accessLevel === "paywall" && (
            <Card className="border-accent/30 bg-accent/5">
              <CardContent className="py-6 text-center">
                <AlertTriangle className="h-10 w-10 text-accent mx-auto mb-3" />
                <h2 className="font-display text-lg font-bold uppercase mb-2">Лимит просмотров исчерпан</h2>
                <p className="text-muted-foreground mb-4">
                  Оформите подписку для неограниченного доступа к профилям специалистов
                </p>
                <Button disabled>Оформить подписку (скоро)</Button>
              </CardContent>
            </Card>
          )}

          {/* Bio */}
          {profile.bio && (
            <Card>
              <CardContent className="py-6">
                <h2 className="font-display text-lg font-bold uppercase mb-3">О себе</h2>
                <p className="text-foreground whitespace-pre-wrap">{profile.bio}</p>
              </CardContent>
            </Card>
          )}

          {/* Skills */}
          {skills.length > 0 && (
            <Card>
              <CardContent className="py-6">
                <h2 className="font-display text-lg font-bold uppercase mb-4">Навыки</h2>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <Badge key={skill.id} variant="secondary">{skill.name}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sports Experience */}
          {sportsExp.length > 0 && (
            <Card>
              <CardContent className="py-6">
                <h2 className="font-display text-lg font-bold uppercase mb-4 flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Опыт по видам спорта
                </h2>
                <div className="space-y-3">
                  {sportsExp.map((s) => {
                    const Icon = getSportIcon(s.sport?.icon);
                    return (
                      <div key={s.sport_id} className="flex items-center gap-3">
                        <Icon className="h-5 w-5 text-primary" />
                        <span className="font-medium">{s.sport?.name}</span>
                        <Badge variant="outline">{s.years} {s.years === 1 ? "год" : s.years < 5 ? "года" : "лет"}</Badge>
                        {s.level && (
                          <Badge variant="secondary" className="text-xs">
                            {s.level === "beginner" ? "Начинающий" : s.level === "intermediate" ? "Средний" : s.level === "advanced" ? "Продвинутый" : "Эксперт"}
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sports Open To */}
          {sportsOpen.length > 0 && (
            <Card>
              <CardContent className="py-6">
                <h2 className="font-display text-lg font-bold uppercase mb-4 flex items-center gap-2">
                  <Handshake className="h-5 w-5" />
                  Готов работать в
                </h2>
                <div className="flex flex-wrap gap-2">
                  {sportsOpen.map((s) => {
                    const Icon = getSportIcon(s.sport?.icon);
                    return (
                      <Badge key={s.sport_id} variant="outline" className="flex items-center gap-1.5 py-1.5 px-3">
                        <Icon className="h-3.5 w-3.5" />
                        {s.sport?.name}
                      </Badge>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Experience */}
          {experiences.length > 0 && (
            <Card>
              <CardContent className="py-6">
                <h2 className="font-display text-lg font-bold uppercase mb-4">Опыт работы</h2>
                <div className="space-y-6">
                  {experiences.map((exp, index) => (
                    <div key={exp.id} className="relative pl-6 pb-6 last:pb-0">
                      {index < experiences.length - 1 && (
                        <div className="absolute left-2 top-3 bottom-0 w-0.5 bg-border" />
                      )}
                      <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full bg-primary border-2 border-card" />
                      <div>
                        <h3 className="font-semibold text-foreground">{exp.position}</h3>
                        <p className="text-muted-foreground">{exp.company_name}</p>
                        {(exp.league || exp.team_level) && (
                          <p className="text-sm text-muted-foreground">
                            {[exp.league, exp.team_level].filter(Boolean).join(" • ")}
                          </p>
                        )}
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(exp.start_date).toLocaleDateString("ru-RU", { month: "long", year: "numeric" })}
                          {" — "}
                          {exp.is_current ? "настоящее время" : exp.end_date ? new Date(exp.end_date).toLocaleDateString("ru-RU", { month: "long", year: "numeric" }) : ""}
                        </div>
                        {exp.description && <p className="text-sm mt-2">{exp.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Contact Info — only for owner or full access */}
          {canSeeContacts && (profile.email || profile.phone || profile.telegram || profile.linkedin_url || profile.portfolio_url) && (
            <Card>
              <CardContent className="py-6">
                <h2 className="font-display text-lg font-bold uppercase mb-4">Контакты</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.email && (
                    <a href={`mailto:${profile.email}`} className="flex items-center gap-3 text-foreground hover:text-accent transition-colors">
                      <Mail className="h-5 w-5 text-muted-foreground" />{profile.email}
                    </a>
                  )}
                  {profile.phone && (
                    <a href={`tel:${profile.phone}`} className="flex items-center gap-3 text-foreground hover:text-accent transition-colors">
                      <Phone className="h-5 w-5 text-muted-foreground" />{profile.phone}
                    </a>
                  )}
                  {profile.telegram && (
                    <a href={`https://t.me/${profile.telegram.replace("@", "")}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-foreground hover:text-accent transition-colors">
                      <MessageCircle className="h-5 w-5 text-muted-foreground" />{profile.telegram}
                    </a>
                  )}
                  {profile.linkedin_url && (
                    <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-foreground hover:text-accent transition-colors">
                      <ExternalLink className="h-5 w-5 text-muted-foreground" />LinkedIn
                    </a>
                  )}
                  {profile.portfolio_url && (
                    <a href={profile.portfolio_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-foreground hover:text-accent transition-colors">
                      <Globe className="h-5 w-5 text-muted-foreground" />Портфолио
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Gated contacts hint */}
          {!canSeeContacts && !isOwner && (
            <Card className="border-dashed">
              <CardContent className="py-6 text-center">
                <Lock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground text-sm">
                  {accessLevel === "login_required"
                    ? "Войдите как работодатель, чтобы увидеть контактные данные"
                    : accessLevel === "paywall"
                    ? "Оформите подписку для доступа к контактам"
                    : "Откройте полный профиль, чтобы увидеть контактные данные"
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}
