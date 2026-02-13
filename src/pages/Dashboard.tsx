import { useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Progress } from "@/components/ui/progress";
import {
  User, FileText, Briefcase, Settings, Search, PlusCircle,
  Users, Eye, ChevronRight, Loader2, ArrowRight,
  CheckCircle2, Circle, Sparkles, TrendingUp, MapPin
} from "lucide-react";

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
          <div className="container py-8 md:py-10">
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

        <div className="container py-6 md:py-8">
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
                <div className="bg-card rounded-2xl p-5 shadow-card flex items-center gap-4">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-medium text-foreground">Профиль заполнен на {pct}%</p>
                    <p className="text-[13px] text-muted-foreground">Ваш профиль виден работодателям</p>
                  </div>
                  <Link to="/profile/edit">
                    <Button variant="outline" size="sm" className="text-[13px]">Редактировать</Button>
                  </Link>
                </div>
              )}

              {/* Quick actions */}
              <div>
                <h2 className="text-[16px] font-medium text-foreground mb-3">Быстрые действия</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  <QuickAction
                    icon={<User className="h-5 w-5" />}
                    title="Мой профиль"
                    description="Просмотр и редактирование"
                    to={profile?.id ? `/profile/${profile.id}` : "/profile/edit"}
                  />
                  <QuickAction
                    icon={<Briefcase className="h-5 w-5" />}
                    title="Вакансии"
                    description="Открытые позиции в спорте"
                    to="/jobs"
                  />
                  <QuickAction
                    icon={<FileText className="h-5 w-5" />}
                    title="PDF резюме"
                    description="Скачать профиль"
                    to={profile?.id ? `/profile/${profile.id}` : "/profile/edit"}
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
                <div className="bg-card rounded-2xl p-5 shadow-card">
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-4">
                    Как вас видят клубы
                  </p>
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center overflow-hidden mb-3">
                      {profile?.avatar_url ? (
                        <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-lg font-medium text-muted-foreground">
                          {profile?.first_name?.[0] || "?"}{profile?.last_name?.[0] || "?"}
                        </span>
                      )}
                    </div>
                    <p className="text-[15px] font-medium text-foreground">
                      {profile?.first_name || "Имя"} {profile?.last_name || "Фамилия"}
                    </p>
                    {roleName && (
                      <p className="text-[13px] text-muted-foreground mt-0.5">{roleName}</p>
                    )}
                    {profile?.level && (
                      <span className="inline-block text-[11px] font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full mt-2">
                        {levels[profile.level] || profile.level}
                      </span>
                    )}
                    {(profile?.city || profile?.country) && (
                      <p className="text-[12px] text-muted-foreground mt-2 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {[profile.city, profile.country].filter(Boolean).join(", ")}
                      </p>
                    )}
                    {profile?.search_status && (
                      <p className="text-[11px] text-muted-foreground mt-2">
                        {searchStatusLabel[profile.search_status] || profile.search_status}
                      </p>
                    )}
                  </div>
                </div>

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
          <div className="container py-10 md:py-14">
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

        <div className="container py-8 md:py-10">
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
                  />
                  <QuickAction
                    icon={<Settings className="h-5 w-5" />}
                    title="Профиль компании"
                    description="Редактировать информацию"
                    to="/company/edit"
                  />
                </div>
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
                <h3 className="font-semibold text-foreground mb-4">Быстрый поиск по роли</h3>
                <div className="space-y-1">
                  {["Видеоаналитик", "Аналитик данных", "S&C тренер", "Тренер", "Спортивный врач", "Скаут"].map(role => (
                    <Link
                      key={role}
                      to={`/specialists?search=${encodeURIComponent(role)}`}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary transition-colors text-[15px]"
                    >
                      <span className="text-foreground">{role}</span>
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

function QuickAction({ icon, title, description, to, highlight }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  to: string;
  highlight?: boolean;
}) {
  return (
    <Link
      to={to}
      className={`group flex items-start gap-4 p-5 rounded-2xl border transition-all hover:shadow-md ${
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
        <h4 className="font-medium text-foreground text-[15px]">{title}</h4>
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
