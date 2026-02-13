import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/hooks/useAuth";
import { ProfileProgress } from "@/components/shared/ProfileProgress";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import {
  User, FileText, Briefcase, Settings, Search, PlusCircle,
  Users, Eye, ChevronRight, Loader2, TrendingUp, Clock
} from "lucide-react";

export default function Dashboard() {
  const { user, userRole, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
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

  if (userRole === "specialist") {
    return <SpecialistDashboard userId={user.id} />;
  }

  if (userRole === "employer") {
    return <EmployerDashboard userId={user.id} />;
  }

  if (userRole === "admin") {
    navigate("/admin");
    return null;
  }

  return (
    <Layout>
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    </Layout>
  );
}

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
      const { data } = await supabase
        .from("experiences")
        .select("id")
        .eq("profile_id", profile.id);
      return data || [];
    },
    enabled: !!profile?.id,
  });

  const { data: skills } = useQuery({
    queryKey: ["dashboard-skills", userId],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data } = await supabase
        .from("profile_skills")
        .select("id")
        .eq("profile_id", profile.id);
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

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  const progressFields = [
    { key: "role", label: "Специализация", completed: !!profile?.role_id, weight: 15 },
    { key: "about", label: "О себе", completed: !!(profile?.about_useful || profile?.bio), weight: 10 },
    { key: "experience", label: "Опыт работы", completed: (experiences?.length || 0) > 0, weight: 20 },
    { key: "skills", label: "Навыки", completed: (skills?.length || 0) > 0, weight: 15 },
    { key: "city", label: "Город", completed: !!profile?.city, weight: 5 },
    { key: "avatar", label: "Фото", completed: !!profile?.avatar_url, weight: 10 },
    { key: "contacts", label: "Контакты (telegram/phone)", completed: !!(profile?.telegram || profile?.phone), weight: 10 },
    { key: "search_status", label: "Статус поиска", completed: !!profile?.search_status, weight: 5 },
    { key: "level", label: "Уровень опыта", completed: !!profile?.level, weight: 5 },
    { key: "sport", label: "Виды спорта", completed: false, weight: 5 },
  ];

  const totalWeight = progressFields.reduce((s, f) => s + f.weight, 0);
  const doneWeight = progressFields.filter(f => f.completed).reduce((s, f) => s + f.weight, 0);
  const pct = Math.round((doneWeight / totalWeight) * 100);

  const roleName = (profile as any)?.specialist_roles?.name;

  return (
    <Layout>
      <div className="bg-gradient-to-b from-primary/5 to-background min-h-[80vh]">
        <div className="container py-8 md:py-12">
          {/* Welcome */}
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              {profile?.first_name ? `${profile.first_name}, добро пожаловать!` : "Добро пожаловать!"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {pct < 60
                ? "Давайте завершим ваш профиль, чтобы клубы могли вас найти"
                : pct < 100
                  ? "Ваш профиль почти готов — осталось совсем немного"
                  : "Отличный профиль! Клубы уже могут вас найти"
              }
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Profile completion CTA */}
              {pct < 80 && (
                <div className="bg-accent/10 border border-accent/20 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-foreground">Заполните профиль</h3>
                    <span className="text-lg font-bold text-accent">{pct}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2 mb-4">
                    <div
                      className="bg-accent h-2 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Профили, заполненные на 80%+, получают в 3 раза больше просмотров от работодателей
                  </p>
                  <Link to="/profile/edit">
                    <Button>
                      Продолжить заполнение
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              )}

              {/* Quick actions */}
              <div>
                <h3 className="font-semibold text-foreground mb-4">Быстрые действия</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <QuickAction
                    icon={<User className="h-5 w-5" />}
                    title="Редактировать профиль"
                    description="Обновите информацию о себе"
                    to="/profile/edit"
                  />
                  <QuickAction
                    icon={<Briefcase className="h-5 w-5" />}
                    title="Смотреть вакансии"
                    description="Найдите работу в спорте"
                    to="/jobs"
                  />
                  <QuickAction
                    icon={<FileText className="h-5 w-5" />}
                    title="Скачать PDF резюме"
                    description="Экспортируйте профиль"
                    to={profile?.id ? `/profile/${profile.id}` : "/profile/edit"}
                  />
                  <QuickAction
                    icon={<Settings className="h-5 w-5" />}
                    title="Настройки приватности"
                    description="Управляйте видимостью"
                    to="/profile/edit"
                  />
                </div>
              </div>

              {/* Stats */}
              <div>
                <h3 className="font-semibold text-foreground mb-4">Статистика</h3>
                <div className="grid grid-cols-3 gap-4">
                  <StatCard icon={<Eye className="h-5 w-5" />} value={viewsCount || 0} label="Просмотров профиля" />
                  <StatCard
                    icon={<TrendingUp className="h-5 w-5" />}
                    value={roleName || "—"}
                    label="Специализация"
                  />
                  <StatCard
                    icon={<Clock className="h-5 w-5" />}
                    value={profile?.search_status === "actively_looking" ? "Активен" : profile?.search_status === "open_to_offers" ? "Открыт" : "Не ищу"}
                    label="Статус поиска"
                  />
                </div>
              </div>
            </div>

            {/* Right column — progress */}
            <div>
              <ProfileProgress fields={progressFields} />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

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
      <div className="bg-gradient-to-b from-primary/5 to-background min-h-[80vh]">
        <div className="container py-8 md:py-12">
          {/* Welcome */}
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              {company?.name ? `${company.name}, добро пожаловать!` : "Добро пожаловать!"}
            </h1>
            <p className="text-muted-foreground mt-1">
              Найдите подходящего специалиста за 10 минут
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Quick actions */}
              <div>
                <h3 className="font-semibold text-foreground mb-4">Быстрые действия</h3>
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

              {/* Stats */}
              <div>
                <h3 className="font-semibold text-foreground mb-4">Статистика</h3>
                <div className="grid grid-cols-3 gap-4">
                  <StatCard icon={<Briefcase className="h-5 w-5" />} value={jobsCount || 0} label="Опубликовано вакансий" />
                  <StatCard icon={<Eye className="h-5 w-5" />} value={0} label="Просмотрено профилей" />
                  <StatCard icon={<Users className="h-5 w-5" />} value={0} label="Сохранено кандидатов" />
                </div>
              </div>
            </div>

            {/* Quick role filters */}
            <div>
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-semibold text-foreground mb-4">Быстрый поиск по роли</h3>
                <div className="space-y-2">
                  {["Видеоаналитик", "Аналитик данных", "S&C тренер", "Тренер", "Спортивный врач", "Скаут"].map(role => (
                    <Link
                      key={role}
                      to={`/specialists?search=${encodeURIComponent(role)}`}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary transition-colors text-sm"
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
      className={`flex items-start gap-4 p-4 rounded-xl border transition-all hover:shadow-card-hover ${
        highlight
          ? "bg-accent/5 border-accent/20 hover:border-accent/40"
          : "bg-card border-border hover:border-primary/30"
      }`}
    >
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
        highlight ? "bg-accent/10 text-accent" : "bg-primary/10 text-primary"
      }`}>
        {icon}
      </div>
      <div>
        <h4 className="font-medium text-foreground text-sm">{title}</h4>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
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
    <div className="bg-card border border-border rounded-xl p-4 text-center">
      <div className="flex justify-center text-muted-foreground mb-2">{icon}</div>
      <div className="text-xl font-bold text-foreground">{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
    </div>
  );
}
