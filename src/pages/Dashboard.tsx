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

  return (
    <Layout>
      <div className="min-h-[80vh]">
        {/* Hero section — state-dependent */}
        <section className="border-b border-border/50">
          <div className="container py-10 md:py-14">
            <div className="max-w-3xl">
              <p className="text-sm font-medium text-primary mb-2 tracking-wide uppercase">
                Личный кабинет
              </p>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
                {state === "new"
                  ? `${profile?.first_name ? `${profile.first_name}, создайте` : "Создайте"} профессиональный профиль`
                  : state === "building"
                    ? `${profile?.first_name || ""}, давайте завершим профиль`
                    : `${profile?.first_name || ""}, ваш профиль готов!`
                }
              </h1>
              <p className="text-lg text-muted-foreground mt-3 max-w-xl">
                {state === "new"
                  ? "Заполненный профиль — ваша визитная карточка для клубов и организаций"
                  : state === "building"
                    ? "Осталось немного. Профили, заполненные на 80%+, получают в 3 раза больше просмотров"
                    : "Клубы видят ваш профиль и могут связаться с вами напрямую"
                }
              </p>
            </div>
          </div>
        </section>

        <div className="container py-8 md:py-10">
          {/* Profile completion card — shown when < 80% */}
          {state !== "ready" && (
            <div className="bg-card border border-border rounded-2xl p-6 md:p-8 mb-8 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-10">
                {/* Progress circle */}
                <div className="flex-shrink-0 flex items-center justify-center">
                  <div className="relative w-24 h-24">
                    <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
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
                    <span className="absolute inset-0 flex items-center justify-center text-xl font-bold text-foreground">
                      {pct}%
                    </span>
                  </div>
                </div>

                {/* Steps */}
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-semibold text-foreground mb-1">
                    {state === "new" ? "Начните с основного" : "Следующие шаги"}
                  </h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    {nextSteps.length > 0
                      ? `Выполните ${nextSteps.length} ${nextSteps.length === 1 ? "шаг" : "шага"}, чтобы улучшить профиль`
                      : "Профиль заполнен — отлично!"
                    }
                  </p>
                  <div className="space-y-2.5 mb-5">
                    {nextSteps.map((step) => (
                      <div key={step.key} className="flex items-center gap-3 text-[15px]">
                        <Circle className="h-4 w-4 text-muted-foreground/50 flex-shrink-0" />
                        <span className="text-muted-foreground">{step.label}</span>
                      </div>
                    ))}
                  </div>
                  <Link to="/profile/edit">
                    <Button size="lg" className="text-[15px] px-6">
                      {state === "new" ? "Начать заполнение" : "Продолжить заполнение"}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Full checklist — collapsed under divider */}
              <div className="border-t border-border/50 mt-6 pt-5">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                  Все разделы
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {progressSteps.map((step) => (
                    <div key={step.key} className="flex items-center gap-2 text-sm py-1">
                      {step.completed ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                      ) : (
                        <Circle className="h-4 w-4 text-muted-foreground/40 flex-shrink-0" />
                      )}
                      <span className={step.completed ? "text-foreground" : "text-muted-foreground"}>
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Ready state — compact progress */}
          {state === "ready" && (
            <div className="bg-card border border-border rounded-2xl p-6 mb-8 shadow-sm flex items-center gap-6">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Профиль заполнен на {pct}%</p>
                  <p className="text-sm text-muted-foreground">Ваш профиль виден работодателям</p>
                </div>
              </div>
              <Link to="/profile/edit">
                <Button variant="outline" size="sm">Редактировать</Button>
              </Link>
            </div>
          )}

          {/* Quick actions + Stats — only show stats when there's data */}
          <div className={`grid gap-8 ${state === "ready" ? "lg:grid-cols-3" : "lg:grid-cols-1"}`}>
            <div className={state === "ready" ? "lg:col-span-2" : ""}>
              <h2 className="text-lg font-semibold text-foreground mb-4">Быстрые действия</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

            {/* Stats — only in ready state */}
            {state === "ready" && (
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-4">Статистика</h2>
                <div className="space-y-3">
                  <StatRow icon={<Eye className="h-4 w-4" />} label="Просмотров профиля" value={viewsCount || 0} />
                  <StatRow icon={<Briefcase className="h-4 w-4" />} label="Откликов отправлено" value={applicationsCount || 0} />
                  <StatRow icon={<TrendingUp className="h-4 w-4" />} label="Специализация" value={roleName || "—"} />
                  <StatRow icon={<MapPin className="h-4 w-4" />} label="Город" value={profile?.city || "Не указан"} />
                </div>
              </div>
            )}
          </div>

          {/* Motivational block for new/building users */}
          {state !== "ready" && (
            <div className="mt-10">
              <h2 className="text-lg font-semibold text-foreground mb-4">Открытые вакансии</h2>
              <p className="text-muted-foreground mb-4">
                Заполните профиль, чтобы откликаться на вакансии и быть заметнее для работодателей
              </p>
              <Link to="/jobs">
                <Button variant="outline">
                  Смотреть вакансии <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          )}
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
