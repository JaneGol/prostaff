import { useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  User, FileText, Briefcase, Settings, Search, PlusCircle,
  Users, Eye, ChevronRight, Loader2, ArrowRight,
  CheckCircle2, Circle, Sparkles, TrendingUp, MapPin, Heart
} from "lucide-react";
import { isBankAvatar, decodeBankAvatar, getDefaultAvatar, isSilhouetteAvatar } from "@/lib/defaultAvatars";
import { GROUPS } from "@/lib/specialistSections";

export default function Dashboard() {
  const { user, userRole, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!user) return null;
  if (userRole === "specialist") return <SpecialistDashboard userId={user.id} />;
  if (userRole === "employer") return <EmployerDashboard userId={user.id} />;
  if (userRole === "admin") { navigate("/admin"); return null; }

  return (
    <Layout>
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    </Layout>
  );
}

/* ─────────────── SPECIALIST DASHBOARD ─────────────── */

function SpecialistDashboard({ userId }: { userId: string }) {
  const { data: profile, isLoading } = useQuery({
    queryKey: ["dashboard-profile", userId],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*, specialist_roles!profiles_role_id_fkey(name)")
        .eq("user_id", userId)
        .maybeSingle();
      return data;
    },
  });

  const { data: experiences } = useQuery({
    queryKey: ["dashboard-exp", userId],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data } = await supabase.from("experiences").select("id").eq("profile_id", profile.id);
      return data || [];
    },
    enabled: !!profile?.id,
  });

  const { data: skills } = useQuery({
    queryKey: ["dashboard-skills", userId],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data } = await supabase.from("profile_skills").select("id").eq("profile_id", profile.id);
      return data || [];
    },
    enabled: !!profile?.id,
  });

  const { data: sportsExp } = useQuery({
    queryKey: ["dashboard-sports", userId],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data } = await supabase.from("profile_sports_experience").select("id").eq("profile_id", profile.id);
      return data || [];
    },
    enabled: !!profile?.id,
  });

  const { data: viewsCount } = useQuery({
    queryKey: ["dashboard-views", userId],
    queryFn: async () => {
      if (!profile?.id) return 0;
      const { count } = await supabase
        .from("profile_views")
        .select("id", { count: "exact", head: true })
        .eq("profile_id", profile.id);
      return count || 0;
    },
    enabled: !!profile?.id,
  });

  const { data: applicationsCount } = useQuery({
    queryKey: ["dashboard-applications", userId],
    queryFn: async () => {
      if (!profile?.id) return 0;
      const { count } = await supabase
        .from("applications")
        .select("id", { count: "exact", head: true })
        .eq("profile_id", profile.id);
      return count || 0;
    },
    enabled: !!profile?.id,
  });

  const { data: recentApplications } = useQuery({
    queryKey: ["dashboard-recent-applications", userId],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data } = await supabase
        .from("applications")
        .select(`
          id, status, created_at, employer_notes,
          jobs!inner (
            id, title,
            companies!inner (name, logo_url, city)
          )
        `)
        .eq("profile_id", profile.id)
        .order("created_at", { ascending: false })
        .limit(5);
      return data || [];
    },
    enabled: !!profile?.id,
  });

  const progressSteps = useMemo(() => [
    { key: "role", label: "Выбрать специализацию", completed: !!profile?.role_id, weight: 15 },
    { key: "about", label: "Рассказать о себе", completed: !!(profile?.about_useful || profile?.bio), weight: 10 },
    { key: "experience", label: "Добавить опыт работы", completed: (experiences?.length || 0) > 0, weight: 20 },
    { key: "skills", label: "Указать навыки (мин. 5)", completed: (skills?.length || 0) >= 5, weight: 15 },
    { key: "sports", label: "Выбрать виды спорта", completed: (sportsExp?.length || 0) > 0, weight: 10 },
    { key: "avatar", label: "Загрузить фото", completed: !!profile?.avatar_url, weight: 10 },
    { key: "city", label: "Указать город", completed: !!profile?.city, weight: 5 },
    { key: "contacts", label: "Добавить контакты", completed: !!(profile?.telegram || profile?.phone), weight: 10 },
    { key: "level", label: "Выбрать уровень", completed: !!profile?.level, weight: 5 },
  ], [profile, experiences, skills, sportsExp]);

  const totalWeight = progressSteps.reduce((s, f) => s + f.weight, 0);
  const doneWeight = progressSteps.filter(f => f.completed).reduce((s, f) => s + f.weight, 0);
  const pct = Math.round((doneWeight / totalWeight) * 100);

  const roleName = (profile as any)?.specialist_roles?.name;

  // State-based rendering
  const state: "new" | "building" | "ready" =
    pct < 30 ? "new" : pct < 80 ? "building" : "ready";

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  const nextSteps = progressSteps.filter(s => !s.completed).slice(0, 3);
  const hasStats = (viewsCount || 0) > 0 || (applicationsCount || 0) > 0;

  const searchStatusLabel: Record<string, string> = {
    actively_looking: "Активно ищу работу",
    open_to_offers: "Открыт к предложениям",
    not_looking_but_open: "Готов рассмотреть",
    not_looking: "Не ищу работу",
  };

  const levels: Record<string, string> = {
    intern: "Стажёр", junior: "Junior", middle: "Middle", senior: "Senior", head: "Head",
  };

  return (
    <Layout>
      <div className="min-h-[80vh] bg-secondary/30">
        {/* Hero */}
        <section className="bg-background border-b border-border/50">
          <div className="container max-w-6xl py-8 md:py-10">
            <p className="text-[13px] font-medium text-primary mb-1.5 tracking-wide uppercase">
              Личный кабинет
            </p>
            <h1 className="text-2xl md:text-[28px] font-medium text-foreground leading-tight">
              {state === "new"
                ? `${profile?.first_name ? `${profile.first_name}, создайте` : "Создайте"} профессиональный профиль`
                : state === "building"
                  ? `${profile?.first_name || ""}, давайте завершим профиль`
                  : `${profile?.first_name || ""}, ваш профиль готов`
              }
            </h1>
            <p className="text-[15px] text-muted-foreground mt-2 max-w-xl">
              {state === "new"
                ? "Заполненный профиль — ваша визитная карточка для клубов и организаций"
                : state === "building"
                  ? "Профили, заполненные на 80%+, получают в 3 раза больше просмотров"
                  : "Клубы видят ваш профиль и могут связаться с вами напрямую"
              }
            </p>
          </div>
        </section>

        <div className="container max-w-6xl py-6 md:py-8">
          <div className="flex gap-6 lg:gap-8">
            {/* ── LEFT COLUMN (60-65%) ── */}
            <div className="flex-1 min-w-0 space-y-6">
              {/* Profile completion — shown when < 80% */}
              {state !== "ready" && (
                <div className="bg-card rounded-2xl p-5 md:p-6 shadow-card">
                  <div className="flex flex-col md:flex-row md:items-start gap-5">
                    {/* Left: Progress + Steps */}
                    <div className="flex items-start gap-5 flex-1 min-w-0">
                      {/* Progress circle */}
                      <div className="flex-shrink-0">
                        <div className="relative w-20 h-20">
                          <svg className="w-20 h-20 -rotate-90" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--secondary))" strokeWidth="8" />
                            <circle
                              cx="50" cy="50" r="42" fill="none"
                              stroke="hsl(var(--primary))"
                              strokeWidth="8"
                              strokeLinecap="round"
                              strokeDasharray={`${pct * 2.64} ${264 - pct * 2.64}`}
                              className="transition-all duration-1000 ease-out"
                            />
                          </svg>
                          <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-foreground">
                            {pct}%
                          </span>
                        </div>
                      </div>

                      {/* Steps */}
                      <div className="flex-1 min-w-0">
                        <h2 className="text-[16px] font-medium text-foreground mb-1">
                          {state === "new" ? "Начните с основного" : "Следующие шаги"}
                        </h2>
                        <p className="text-[13px] text-muted-foreground mb-3">
                          {nextSteps.length > 0
                            ? `Выполните ${nextSteps.length} ${nextSteps.length === 1 ? "шаг" : "шага"}, чтобы улучшить профиль`
                            : "Профиль заполнен — отлично!"
                          }
                        </p>
                        <div className="space-y-2 mb-4">
                          {nextSteps.map((step) => (
                            <div key={step.key} className="flex items-center gap-2.5 text-[14px]">
                              <Circle className="h-3.5 w-3.5 text-muted-foreground/50 flex-shrink-0" />
                              <span className="text-muted-foreground">{step.label}</span>
                            </div>
                          ))}
                        </div>
                        <Link to="/profile/edit">
                          <Button className="text-[14px] px-5">
                            {state === "new" ? "Начать заполнение" : "Продолжить"}
                            <ArrowRight className="h-4 w-4 ml-1.5" />
                          </Button>
                        </Link>
                      </div>
                    </div>

                    {/* Right: Stats integrated */}
                    <div className="md:w-44 shrink-0 md:border-l md:border-border md:pl-5 border-t md:border-t-0 pt-4 md:pt-0 space-y-3">
                      <div className="flex items-center justify-between md:flex-col md:items-start gap-1">
                        <span className="text-[12px] text-muted-foreground flex items-center gap-1.5">
                          <Eye className="h-3.5 w-3.5" /> Просмотров
                        </span>
                        <span className="text-xl font-bold text-foreground">{viewsCount || 0}</span>
                      </div>
                      <div className="flex items-center justify-between md:flex-col md:items-start gap-1">
                        <span className="text-[12px] text-muted-foreground flex items-center gap-1.5">
                          <Briefcase className="h-3.5 w-3.5" /> Откликов
                        </span>
                        <span className="text-xl font-bold text-foreground">{applicationsCount || 0}</span>
                      </div>
                      {!hasStats && (
                        <p className="text-[11px] text-muted-foreground leading-snug">
                          Заполните профиль — и клубы начнут вас находить
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Ready state — compact */}
              {state === "ready" && (
                <div className="bg-card rounded-2xl p-5 shadow-card">
                  <div className="flex items-center gap-4">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-medium text-foreground">Профиль заполнен на {pct}%</p>
                      <p className="text-[13px] text-muted-foreground">Ваш профиль виден работодателям</p>
                    </div>
                    <Link to="/profile/edit" className="hidden md:block">
                      <Button variant="outline" size="sm" className="text-[13px]">Редактировать</Button>
                    </Link>
                  </div>
                  <div className="flex justify-end mt-3 md:hidden">
                    <Link to="/profile/edit">
                      <Button variant="outline" size="sm" className="text-[13px]">Редактировать</Button>
                    </Link>
                  </div>
                </div>
              )}

              {/* My Resume card */}
              {profile && (
                <Link to={profile.id ? `/profile/${profile.id}` : "/profile/edit"} className="block">
                  <div className="bg-card rounded-2xl p-5 shadow-card hover:shadow-md transition-shadow flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                      {(() => {
                        const url = profile.avatar_url;
                        if (url && isBankAvatar(url)) {
                          const ba = decodeBankAvatar(url);
                          return ba ? <img src={ba.src} alt={ba.label} className={`w-full h-full object-cover ${isSilhouetteAvatar(ba) ? "scale-125" : ""}`} /> : <FileText className="h-5 w-5 text-muted-foreground" />;
                        }
                        if (url) return <img src={url} alt="" className="w-full h-full object-cover" />;
                        const def = getDefaultAvatar(profile.id);
                        return <img src={def.src} alt={def.label} className={`w-full h-full object-cover ${isSilhouetteAvatar(def) ? "scale-125" : ""}`} />;
                      })()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-medium text-foreground">Моё резюме</p>
                      <p className="text-[13px] text-muted-foreground truncate">
                        {[
                          roleName,
                          profile.level ? levels[profile.level] : null,
                          profile.city
                        ].filter(Boolean).join(" · ") || "Заполните профиль"}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  </div>
                </Link>
              )}

              {/* My Applications */}
              {recentApplications && recentApplications.length > 0 && (
                <div className="bg-card rounded-2xl p-5 shadow-card">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-[16px] font-medium text-foreground">Мои отклики</h2>
                    <Link to="/my-applications" className="text-[13px] text-primary hover:underline flex items-center gap-1">
                      Все <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                  <div className="space-y-3">
                    {recentApplications.map((app: any) => {
                      const statusLabel: Record<string, string> = {
                        pending: "На рассмотрении",
                        reviewed: "Просмотрено",
                        shortlisted: "Шорт-лист",
                        interview: "Интервью",
                        rejected: "Отклонён",
                        hired: "Принят",
                      };
                      const statusColor: Record<string, string> = {
                        pending: "bg-muted text-muted-foreground",
                        reviewed: "bg-blue-100 text-blue-800",
                        shortlisted: "bg-yellow-100 text-yellow-800",
                        interview: "bg-purple-100 text-purple-800",
                        rejected: "bg-red-100 text-red-800",
                        hired: "bg-green-100 text-green-800",
                      };
                      return (
                        <Link key={app.id} to={`/jobs/${app.jobs?.id}`} className="block">
                          <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/50 transition-colors">
                            <div className="w-9 h-9 rounded-lg bg-primary/10 hidden md:flex items-center justify-center flex-shrink-0 overflow-hidden">
                              {app.jobs?.companies?.logo_url ? (
                                <img src={app.jobs.companies.logo_url} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <Briefcase className="h-4 w-4 text-primary" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] font-medium text-foreground truncate">{app.jobs?.title}</p>
                              <p className="text-[12px] text-muted-foreground truncate">
                                {app.jobs?.companies?.name}{app.jobs?.companies?.city ? ` · ${app.jobs.companies.city}` : ""}
                              </p>
                              {app.status === "interview" && app.employer_notes && (
                                <p className="text-[11px] text-purple-700 mt-0.5 truncate">
                                  💬 {app.employer_notes}
                                </p>
                              )}
                            </div>
                            <Badge className={`text-[11px] px-2 py-0.5 ${statusColor[app.status] || statusColor.pending}`}>
                              {statusLabel[app.status] || app.status}
                            </Badge>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quick actions */}
              <div>
                <h2 className="text-[16px] font-medium text-foreground mb-3">Быстрые действия</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  <QuickAction
                    icon={<Eye className="h-5 w-5" />}
                    title="Посмотреть как рекрутер"
                    description="Как видят ваш профиль"
                    to={profile?.id ? `/profile/${profile.id}` : "/profile/edit"}
                  />
                  <QuickAction
                    icon={<User className="h-5 w-5" />}
                    title="Редактировать профиль"
                    description="Обновить информацию"
                    to="/profile/edit"
                  />
                  <QuickAction
                    icon={<Heart className="h-5 w-5" />}
                    title="Избранные вакансии"
                    description="Сохранённые предложения"
                    to="/favorites"
                  />
                  <QuickAction
                    icon={<Settings className="h-5 w-5" />}
                    title="Настройки"
                    description="Приватность и видимость"
                    to="/profile/edit"
                  />
                </div>
              </div>

              {/* Motivational block for incomplete profiles */}
              {state !== "ready" && (
                <div className="bg-card rounded-2xl p-5 shadow-card">
                  <h2 className="text-[16px] font-medium text-foreground mb-2">Открытые вакансии</h2>
                  <p className="text-[13px] text-muted-foreground mb-3">
                    Заполните профиль, чтобы откликаться на вакансии и быть заметнее
                  </p>
                  <Link to="/jobs">
                    <Button variant="outline" size="sm" className="text-[13px]">
                      Смотреть вакансии <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* ── RIGHT COLUMN (35-40%) ── */}
            <div className="hidden lg:block w-72 xl:w-80 shrink-0">
              <div className="sticky top-24 space-y-5">
                {/* Mini preview card */}

                {/* All sections checklist */}
                <div className="bg-card rounded-2xl p-5 shadow-card">
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-3">
                    Все разделы
                  </p>
                  <div className="space-y-1.5">
                    {progressSteps.map((step) => (
                      <div key={step.key} className="flex items-center gap-2.5 text-[13px] py-1">
                        {step.completed ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-[hsl(var(--success))] flex-shrink-0" />
                        ) : (
                          <Circle className="h-3.5 w-3.5 text-muted-foreground/40 flex-shrink-0" />
                        )}
                        <span className={step.completed ? "text-foreground" : "text-muted-foreground"}>
                          {step.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

/* ─────────────── EMPLOYER DASHBOARD ─────────────── */

function EmployerDashboard({ userId }: { userId: string }) {
  const { data: company, isLoading } = useQuery({
    queryKey: ["dashboard-company", userId],
    queryFn: async () => {
      const { data } = await supabase
        .from("companies")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();
      return data;
    },
  });

  const { data: jobsCount } = useQuery({
    queryKey: ["dashboard-jobs-count", userId],
    queryFn: async () => {
      if (!company?.id) return 0;
      const { count } = await supabase
        .from("jobs")
        .select("id", { count: "exact", head: true })
        .eq("company_id", company.id);
      return count || 0;
    },
    enabled: !!company?.id,
  });

  const { data: jobs } = useQuery({
    queryKey: ["dashboard-employer-jobs", userId],
    queryFn: async () => {
      if (!company?.id) return [];
      const { data } = await supabase
        .from("jobs")
        .select("id, title, status, city, level, contract_type, created_at, applications_count, views_count")
        .eq("company_id", company.id)
        .order("created_at", { ascending: false })
        .limit(5);
      return data || [];
    },
    enabled: !!company?.id,
  });

  const { data: applicationsCount } = useQuery({
    queryKey: ["dashboard-applications-count", company?.id],
    queryFn: async () => {
      if (!company?.id) return 0;
      const { data: companyJobs } = await supabase
        .from("jobs")
        .select("id")
        .eq("company_id", company.id);
      const jobIds = (companyJobs || []).map(j => j.id);
      if (jobIds.length === 0) return 0;
      const { count } = await supabase
        .from("applications")
        .select("id", { count: "exact", head: true })
        .in("job_id", jobIds);
      return count || 0;
    },
    enabled: !!company?.id,
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-[80vh]">
        <section className="border-b border-border/50">
          <div className="container max-w-6xl py-10 md:py-14">
            <div className="max-w-3xl">
              <p className="text-sm font-medium text-primary mb-2 tracking-wide uppercase">
                Панель работодателя
              </p>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
                {company?.name ? `${company.name}` : "Добро пожаловать!"}
              </h1>
              <p className="text-lg text-muted-foreground mt-3">
                Найдите подходящего специалиста за 10 минут
              </p>
            </div>
          </div>
        </section>

        <div className="container max-w-6xl py-8 md:py-10">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-4">Быстрые действия</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <QuickAction
                    icon={<Search className="h-5 w-5" />}
                    title="Найти специалиста"
                    description="Поиск по базе кандидатов"
                    to="/specialists"
                    highlight
                  />
                  <QuickAction
                    icon={<PlusCircle className="h-5 w-5" />}
                    title="Опубликовать вакансию"
                    description="Создайте новое предложение"
                    to="/jobs/new"
                  />
                  <QuickAction
                    icon={<Users className="h-5 w-5" />}
                    title="Отклики кандидатов"
                    description="Просмотр заявок на вакансии"
                    to="/employer/applications"
                    badge={applicationsCount && applicationsCount > 0 ? applicationsCount : undefined}
                  />
                  <QuickAction
                    icon={<Settings className="h-5 w-5" />}
                    title="Профиль компании"
                    description="Редактировать информацию"
                    to="/company/edit"
                  />
              </div>

              {/* My Jobs */}
              {(jobs && jobs.length > 0) && (
                <div className="mt-10">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-foreground">Мои вакансии</h2>
                    <Link to="/jobs/new">
                      <Button variant="outline" size="sm" className="text-[13px]">
                        <PlusCircle className="h-3.5 w-3.5 mr-1.5" />
                        Новая
                      </Button>
                    </Link>
                  </div>
                  <div className="space-y-3">
                    {jobs.map(job => {
                      const statusLabel: Record<string, string> = {
                        draft: "Черновик", active: "Активна", paused: "На паузе", closed: "Закрыта"
                      };
                      const statusColor: Record<string, string> = {
                        draft: "bg-muted text-muted-foreground",
                        active: "bg-primary/10 text-primary",
                        paused: "bg-yellow-100 text-yellow-700",
                        closed: "bg-destructive/10 text-destructive",
                      };
                      const levelLabels: Record<string, string> = {
                        intern: "Стажёр", junior: "Junior", middle: "Middle", senior: "Senior", head: "Head",
                      };
                      const contractLabels: Record<string, string> = {
                        full_time: "Полная", part_time: "Частичная", contract: "Контракт", internship: "Стажировка", freelance: "Фриланс",
                      };
                      return (
                        <Link key={job.id} to={`/jobs/${job.id}`} className="block">
                          <div className="bg-card border border-border rounded-xl p-4 hover:shadow-md hover:border-primary/20 transition-all group">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="text-[15px] font-medium text-foreground group-hover:text-primary transition-colors truncate">
                                    {job.title}
                                  </h4>
                                  <span className={`text-[11px] px-2 py-0.5 rounded-full flex-shrink-0 ${statusColor[job.status || "draft"]}`}>
                                    {statusLabel[job.status || "draft"]}
                                  </span>
                                </div>
                                <p className="text-[13px] text-muted-foreground truncate">
                                  {[
                                    job.level ? levelLabels[job.level] : null,
                                    job.contract_type ? contractLabels[job.contract_type] : null,
                                    job.city,
                                  ].filter(Boolean).join(" · ") || "Без деталей"}
                                </p>
                              </div>
                              <div className="flex items-center gap-4 flex-shrink-0 text-[12px] text-muted-foreground">
                                <span className="flex items-center gap-1" title="Откликов">
                                  <Users className="h-3.5 w-3.5" />
                                  {job.applications_count || 0}
                                </span>
                                <span className="flex items-center gap-1" title="Просмотров">
                                  <Eye className="h-3.5 w-3.5" />
                                  {job.views_count || 0}
                                </span>
                                <ChevronRight className="h-4 w-4" />
                              </div>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
              </div>

              <div>
                <h2 className="text-lg font-semibold text-foreground mb-4">Статистика</h2>
                <div className="grid grid-cols-3 gap-4">
                  <StatCard icon={<Briefcase className="h-5 w-5" />} value={jobsCount || 0} label="Вакансий" />
                  <StatCard icon={<Eye className="h-5 w-5" />} value={0} label="Просмотрено профилей" />
                  <StatCard icon={<Users className="h-5 w-5" />} value={0} label="Сохранено" />
                </div>
              </div>
            </div>

            <div>
              <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="font-semibold text-foreground mb-4">Быстрый поиск по специализации</h3>
                <div className="space-y-1">
                  {GROUPS.map(group => (
                    <Link
                      key={group.key}
                      to={`/specialists?section=${group.key}`}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary transition-colors text-[15px]"
                    >
                      <span className="text-foreground">{group.shortTitle}</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

/* ─────────────── SHARED COMPONENTS ─────────────── */

function QuickAction({ icon, title, description, to, highlight, badge }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  to: string;
  highlight?: boolean;
  badge?: number;
}) {
  return (
    <Link
      to={to}
      className={`group flex items-start gap-4 p-5 rounded-2xl border transition-all hover:shadow-md relative ${
        highlight
          ? "bg-primary/[0.03] border-primary/20 hover:border-primary/40"
          : "bg-card border-border hover:border-primary/20"
      }`}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
        highlight
          ? "bg-primary/10 text-primary group-hover:bg-primary/15"
          : "bg-secondary text-muted-foreground group-hover:text-primary group-hover:bg-primary/10"
      }`}>
        {icon}
      </div>
      <div>
        <h4 className="font-medium text-foreground text-[15px] flex items-center gap-2">
          {title}
          {badge !== undefined && badge > 0 && (
            <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
              {badge}
            </span>
          )}
        </h4>
        <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
      </div>
    </Link>
  );
}

function StatCard({ icon, value, label }: {
  icon: React.ReactNode;
  value: number | string;
  label: string;
}) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 text-center">
      <div className="flex justify-center text-muted-foreground mb-2">{icon}</div>
      <div className="text-2xl font-bold text-foreground">{value}</div>
      <div className="text-sm text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

function StatRow({ icon, label, value }: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
}) {
  return (
    <div className="flex items-center justify-between p-3 bg-card border border-border rounded-xl">
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <span className="font-semibold text-foreground">{value}</span>
    </div>
  );
}
