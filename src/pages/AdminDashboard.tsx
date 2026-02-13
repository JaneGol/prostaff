import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Users, Briefcase, Eye, MousePointer, TrendingUp,
  Monitor, Smartphone, Tablet, Globe, Clock, BarChart3,
  FileText, Send, Building2, ArrowUpRight, ArrowDownRight,
  Activity, UserPlus, Target, Lock, Unlock
} from "lucide-react";
import ArticleEditor from "@/components/admin/ArticleEditor";

type DateRange = "today" | "7d" | "30d" | "all";

function getDateFilter(range: DateRange): string | null {
  const now = new Date();
  switch (range) {
    case "today": return new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    case "7d": { const d = new Date(); d.setDate(d.getDate() - 7); return d.toISOString(); }
    case "30d": { const d = new Date(); d.setDate(d.getDate() - 30); return d.toISOString(); }
    default: return null;
  }
}

export default function AdminDashboard() {
  const { user, userRole, loading } = useAuth();
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState<DateRange>("30d");
  
  // Data states
  const [pageViews, setPageViews] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [profilesCount, setProfilesCount] = useState(0);
  const [companiesCount, setCompaniesCount] = useState(0);
  const [jobsCount, setJobsCount] = useState(0);
  const [applicationsCount, setApplicationsCount] = useState(0);
  const [userRoles, setUserRoles] = useState<any[]>([]);
  const [profilesWithRoles, setProfilesWithRoles] = useState<any[]>([]);
  const [profileViews, setProfileViews] = useState<any[]>([]);
  const [clubAccess, setClubAccess] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && userRole !== "admin") {
      navigate("/");
    }
  }, [loading, userRole, navigate]);

  useEffect(() => {
    if (userRole !== "admin") return;
    fetchData();
  }, [userRole, dateRange]);

  const fetchData = async () => {
    setLoadingData(true);
    const dateFilter = getDateFilter(dateRange);

    // Parallel fetches
    const [pvRes, evRes, prRes, coRes, joRes, apRes, urRes, prRolesRes, pvViewsRes, caRes] = await Promise.all([
      dateFilter
        ? supabase.from("page_views").select("*").gte("created_at", dateFilter).order("created_at", { ascending: false }).limit(1000)
        : supabase.from("page_views").select("*").order("created_at", { ascending: false }).limit(1000),
      dateFilter
        ? supabase.from("analytics_events").select("*").gte("created_at", dateFilter).order("created_at", { ascending: false }).limit(1000)
        : supabase.from("analytics_events").select("*").order("created_at", { ascending: false }).limit(1000),
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("companies").select("id", { count: "exact", head: true }),
      supabase.from("jobs").select("id", { count: "exact", head: true }),
      supabase.from("applications").select("id", { count: "exact", head: true }),
      supabase.from("user_roles").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("id, first_name, last_name, specialist_roles(name), created_at").order("created_at", { ascending: false }).limit(500),
      dateFilter
        ? supabase.from("profile_views").select("*").gte("viewed_at", dateFilter).order("viewed_at", { ascending: false }).limit(500)
        : supabase.from("profile_views").select("*").order("viewed_at", { ascending: false }).limit(500),
      supabase.from("club_access").select("*").order("updated_at", { ascending: false }),
    ]);

    setPageViews(pvRes.data || []);
    setEvents(evRes.data || []);
    setProfilesCount(prRes.count || 0);
    setCompaniesCount(coRes.count || 0);
    setJobsCount(joRes.count || 0);
    setApplicationsCount(apRes.count || 0);
    setUserRoles(urRes.data || []);
    setProfilesWithRoles(prRolesRes.data || []);
    setProfileViews(pvViewsRes.data || []);
    setClubAccess(caRes.data || []);
    setLoadingData(false);
  };

  // Computed analytics
  const analytics = useMemo(() => {
    const uniqueSessions = new Set(pageViews.map(pv => pv.session_id)).size;
    
    // Pages breakdown
    const pageMap: Record<string, number> = {};
    pageViews.forEach(pv => {
      pageMap[pv.page_path] = (pageMap[pv.page_path] || 0) + 1;
    });
    const topPages = Object.entries(pageMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15);

    // Device breakdown
    const deviceMap: Record<string, number> = {};
    pageViews.forEach(pv => {
      const d = pv.device_type || "unknown";
      deviceMap[d] = (deviceMap[d] || 0) + 1;
    });

    // Hourly distribution
    const hourMap: Record<number, number> = {};
    pageViews.forEach(pv => {
      const h = new Date(pv.created_at).getHours();
      hourMap[h] = (hourMap[h] || 0) + 1;
    });

    // Daily visits
    const dayMap: Record<string, number> = {};
    pageViews.forEach(pv => {
      const d = new Date(pv.created_at).toLocaleDateString("ru-RU");
      dayMap[d] = (dayMap[d] || 0) + 1;
    });
    const dailyVisits = Object.entries(dayMap).slice(-14);

    // Events breakdown
    const eventTypeMap: Record<string, number> = {};
    events.forEach(ev => {
      eventTypeMap[ev.event_type] = (eventTypeMap[ev.event_type] || 0) + 1;
    });
    const topEvents = Object.entries(eventTypeMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    // Event categories
    const categoryMap: Record<string, number> = {};
    events.forEach(ev => {
      const c = ev.event_category || "uncategorized";
      categoryMap[c] = (categoryMap[c] || 0) + 1;
    });

    // Pages per session
    const sessionPages: Record<string, number> = {};
    pageViews.forEach(pv => {
      sessionPages[pv.session_id] = (sessionPages[pv.session_id] || 0) + 1;
    });
    const avgPagesPerSession = uniqueSessions > 0
      ? (pageViews.length / uniqueSessions).toFixed(1)
      : "0";

    // Registration by role
    const roleCountMap: Record<string, number> = {};
    userRoles.forEach(ur => {
      roleCountMap[ur.role] = (roleCountMap[ur.role] || 0) + 1;
    });

    // Specialties breakdown
    const specialtyMap: Record<string, number> = {};
    profilesWithRoles.forEach((p: any) => {
      const roleName = p.specialist_roles?.name || "Не указана";
      specialtyMap[roleName] = (specialtyMap[roleName] || 0) + 1;
    });
    const topSpecialties = Object.entries(specialtyMap)
      .sort((a, b) => b[1] - a[1]);

    // Signup events from analytics
    const signupEvents = events.filter(e => e.event_type === "signup");
    const signupByRole: Record<string, number> = {};
    signupEvents.forEach(e => {
      const role = e.event_label || "unknown";
      signupByRole[role] = (signupByRole[role] || 0) + 1;
    });

    // CTA clicks
    const ctaEvents = events.filter(e => e.event_type === "cta_click");
    const ctaByLabel: Record<string, number> = {};
    ctaEvents.forEach(e => {
      const label = e.event_label || "unknown";
      ctaByLabel[label] = (ctaByLabel[label] || 0) + 1;
    });

    // Profile views
    const profileViewEvents = events.filter(e => e.event_type === "profile_view");
    
    // Applications
    const applicationEvents = events.filter(e => e.event_type === "application_submit");

    return {
      totalViews: pageViews.length,
      uniqueSessions,
      topPages,
      deviceMap,
      hourMap,
      dailyVisits,
      topEvents,
      categoryMap,
      avgPagesPerSession,
      totalEvents: events.length,
      roleCountMap,
      topSpecialties,
      signupByRole,
      ctaByLabel,
      profileViewCount: profileViewEvents.length,
      applicationEventCount: applicationEvents.length,
      ctaClickCount: ctaEvents.length,
    };
  }, [pageViews, events, userRoles, profilesWithRoles]);

  const pageNameMap: Record<string, string> = {
    "/": "Главная",
    "/specialists": "Банк специалистов",
    "/jobs": "Вакансии",
    "/content": "Контент",
    "/about": "О нас",
    "/auth": "Авторизация",
    "/profile/edit": "Редактирование профиля",
    "/company/edit": "Редактирование компании",
    "/jobs/new": "Новая вакансия",
    "/my-applications": "Мои отклики",
    "/employer/applications": "Отклики кандидатов",
    "/admin": "Админ панель",
  };

  const deviceIcons: Record<string, React.ReactNode> = {
    desktop: <Monitor className="h-4 w-4" />,
    mobile: <Smartphone className="h-4 w-4" />,
    tablet: <Tablet className="h-4 w-4" />,
  };

  if (loading || loadingData) {
    return (
      <Layout>
        <div className="container py-12 flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <Activity className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
            <p className="text-muted-foreground">Загрузка аналитики...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (userRole !== "admin") return null;

  return (
    <Layout>
      <section className="bg-gradient-to-b from-primary to-primary-dark text-white py-8 md:py-10">
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold font-display uppercase">
                Панель управления
              </h1>
              <p className="text-white/70 mt-1">Аналитика платформы ProStaff</p>
            </div>
            <Select value={dateRange} onValueChange={(v) => setDateRange(v as DateRange)}>
              <SelectTrigger className="w-[180px] bg-white/10 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Сегодня</SelectItem>
                <SelectItem value="7d">7 дней</SelectItem>
                <SelectItem value="30d">30 дней</SelectItem>
                <SelectItem value="all">Всё время</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="container space-y-8">
          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <SummaryCard icon={<Eye />} label="Просмотры" value={analytics.totalViews} />
            <SummaryCard icon={<Globe />} label="Сессии" value={analytics.uniqueSessions} />
            <SummaryCard icon={<BarChart3 />} label="Стр/сессия" value={analytics.avgPagesPerSession} />
            <SummaryCard icon={<Users />} label="Специалисты" value={profilesCount} accent />
            <SummaryCard icon={<Building2 />} label="Компании" value={companiesCount} accent />
            <SummaryCard icon={<Briefcase />} label="Вакансии" value={jobsCount} accent />
          </div>

          {/* Quick metrics row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <SummaryCard icon={<Target />} label="CTA клики" value={analytics.ctaClickCount} />
            <SummaryCard icon={<Eye />} label="Просмотры профилей" value={analytics.profileViewCount} />
            <SummaryCard icon={<Send />} label="Отклики (события)" value={analytics.applicationEventCount} accent />
            <SummaryCard icon={<UserPlus />} label="Регистрации (события)" value={Object.values(analytics.signupByRole).reduce((a, b) => a + b, 0)} accent />
          </div>

          <Tabs defaultValue="pages" className="w-full">
            <TabsList className="w-full justify-start overflow-x-auto">
              <TabsTrigger value="pages">Страницы</TabsTrigger>
              <TabsTrigger value="registrations">Регистрации</TabsTrigger>
              <TabsTrigger value="profile-views">Просмотры</TabsTrigger>
              <TabsTrigger value="devices">Устройства</TabsTrigger>
              <TabsTrigger value="activity">Активность</TabsTrigger>
              <TabsTrigger value="events">События</TabsTrigger>
              <TabsTrigger value="content">Контент</TabsTrigger>
              <TabsTrigger value="platform">Платформа</TabsTrigger>
            </TabsList>

            <TabsContent value="pages" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Топ страниц по просмотрам
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.topPages.map(([path, count], i) => {
                      const pct = analytics.totalViews > 0 ? ((count / analytics.totalViews) * 100) : 0;
                      return (
                        <div key={path} className="flex items-center gap-3">
                          <span className="text-sm font-medium text-muted-foreground w-6">{i + 1}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium truncate">
                                {pageNameMap[path] || path}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold">{count}</span>
                                <Badge variant="outline" className="text-xs">{pct.toFixed(1)}%</Badge>
                              </div>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                              <div
                                className="bg-primary rounded-full h-2 transition-all"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {analytics.topPages.length === 0 && (
                      <p className="text-muted-foreground text-sm text-center py-8">Нет данных за выбранный период</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="registrations" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Roles distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <UserPlus className="h-5 w-5 text-primary" />
                      Роли пользователей
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(analytics.roleCountMap).map(([role, count]) => {
                        const total = userRoles.length || 1;
                        const pct = (count / total) * 100;
                        const roleNames: Record<string, string> = {
                          specialist: "Специалисты",
                          employer: "Работодатели",
                          admin: "Админы",
                        };
                        return (
                          <div key={role}>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm font-medium">{roleNames[role] || role}</span>
                              <span className="text-sm font-semibold">{count} ({pct.toFixed(0)}%)</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2.5">
                              <div className="bg-primary rounded-full h-2.5" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                      {Object.keys(analytics.roleCountMap).length === 0 && (
                        <p className="text-muted-foreground text-sm text-center py-4">Нет данных</p>
                      )}
                      <div className="pt-2 border-t">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Всего пользователей</span>
                          <span className="font-bold">{userRoles.length}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* CTA clicks breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Target className="h-5 w-5 text-accent" />
                      Клики по CTA кнопкам
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(analytics.ctaByLabel)
                        .sort((a, b) => b[1] - a[1])
                        .map(([label, count]) => (
                          <div key={label} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                            <span className="text-sm font-medium">{label}</span>
                            <Badge variant="secondary">{count}</Badge>
                          </div>
                        ))}
                      {Object.keys(analytics.ctaByLabel).length === 0 && (
                        <p className="text-muted-foreground text-sm text-center py-4">Нет кликов</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Signup events by role */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <UserPlus className="h-5 w-5 text-accent" />
                      Регистрации (по событиям)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(analytics.signupByRole)
                        .sort((a, b) => b[1] - a[1])
                        .map(([role, count]) => {
                          const roleNames: Record<string, string> = {
                            specialist: "Специалист",
                            employer: "Работодатель",
                          };
                          return (
                            <div key={role} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                              <span className="text-sm font-medium">{roleNames[role] || role}</span>
                              <Badge>{count}</Badge>
                            </div>
                          );
                        })}
                      {Object.keys(analytics.signupByRole).length === 0 && (
                        <p className="text-muted-foreground text-sm text-center py-4">Нет событий регистрации</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Specialties breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-primary" />
                    Специалисты по специальностям
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {analytics.topSpecialties.map(([name, count]) => {
                      const total = profilesWithRoles.length || 1;
                      const pct = (count / total) * 100;
                      return (
                        <div key={name} className="flex items-center gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium truncate">{name}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold">{count}</span>
                                <Badge variant="outline" className="text-xs">{pct.toFixed(0)}%</Badge>
                              </div>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                              <div className="bg-accent rounded-full h-2 transition-all" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {analytics.topSpecialties.length === 0 && (
                      <p className="text-muted-foreground text-sm text-center py-4 col-span-2">Нет данных</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="profile-views" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <SummaryCard icon={<Eye />} label="Просмотров профилей" value={profileViews.length} />
                <SummaryCard icon={<Unlock />} label="Уникальных клубов" value={new Set(profileViews.map(v => v.viewer_user_id)).size} accent />
                <SummaryCard icon={<Users />} label="Просмотренных профилей" value={new Set(profileViews.map(v => v.profile_id)).size} />
              </div>

              {/* Club quotas */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Lock className="h-5 w-5 text-primary" />
                    Квоты клубов
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {clubAccess.length === 0 ? (
                    <p className="text-muted-foreground text-sm text-center py-8">Нет данных о квотах клубов</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Клуб (user_id)</th>
                            <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Остаток</th>
                            <th className="text-left py-2 pr-4 font-medium text-muted-foreground">В неделю</th>
                            <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Trial до</th>
                            <th className="text-left py-2 font-medium text-muted-foreground">Подписка</th>
                          </tr>
                        </thead>
                        <tbody>
                          {clubAccess.map(ca => (
                            <tr key={ca.id} className="border-b border-border/50">
                              <td className="py-2 pr-4 font-mono text-xs">{ca.user_id.substring(0, 8)}...</td>
                              <td className="py-2 pr-4">
                                <Badge variant={ca.free_views_remaining > 10 ? "secondary" : ca.free_views_remaining > 0 ? "outline" : "destructive"}>
                                  {ca.free_views_remaining}
                                </Badge>
                              </td>
                              <td className="py-2 pr-4">{ca.free_views_per_week}</td>
                              <td className="py-2 pr-4 text-muted-foreground">
                                {new Date(ca.trial_expires_at).toLocaleDateString("ru-RU")}
                              </td>
                              <td className="py-2">
                                <Badge variant={ca.is_subscribed ? "default" : "outline"}>
                                  {ca.is_subscribed ? "Да" : "Нет"}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent views log */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Eye className="h-5 w-5 text-accent" />
                    Последние просмотры профилей
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {profileViews.length === 0 ? (
                    <p className="text-muted-foreground text-sm text-center py-8">Нет просмотров за выбранный период</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Кто смотрел</th>
                            <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Профиль</th>
                            <th className="text-left py-2 font-medium text-muted-foreground">Когда</th>
                          </tr>
                        </thead>
                        <tbody>
                          {profileViews.slice(0, 30).map(pv => (
                            <tr key={pv.id} className="border-b border-border/50">
                              <td className="py-2 pr-4 font-mono text-xs">{pv.viewer_user_id.substring(0, 8)}...</td>
                              <td className="py-2 pr-4 font-mono text-xs">{pv.profile_id.substring(0, 8)}...</td>
                              <td className="py-2 text-muted-foreground">
                                {new Date(pv.viewed_at).toLocaleString("ru-RU")}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Top viewed profiles */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Самые просматриваемые профили
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const viewCounts: Record<string, number> = {};
                    profileViews.forEach(pv => {
                      viewCounts[pv.profile_id] = (viewCounts[pv.profile_id] || 0) + 1;
                    });
                    const sorted = Object.entries(viewCounts).sort((a, b) => b[1] - a[1]).slice(0, 10);
                    if (sorted.length === 0) return <p className="text-muted-foreground text-sm text-center py-8">Нет данных</p>;
                    return (
                      <div className="space-y-3">
                        {sorted.map(([profileId, count], i) => {
                          const pct = profileViews.length > 0 ? (count / profileViews.length) * 100 : 0;
                          return (
                            <div key={profileId} className="flex items-center gap-3">
                              <span className="text-sm font-medium text-muted-foreground w-6">{i + 1}</span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-sm font-mono">{profileId.substring(0, 12)}...</span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold">{count}</span>
                                    <Badge variant="outline" className="text-xs">{pct.toFixed(1)}%</Badge>
                                  </div>
                                </div>
                                <div className="w-full bg-muted rounded-full h-2">
                                  <div className="bg-accent rounded-full h-2 transition-all" style={{ width: `${pct}%` }} />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="devices" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Распределение по устройствам</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(analytics.deviceMap).map(([device, count]) => {
                        const pct = analytics.totalViews > 0 ? ((count / analytics.totalViews) * 100) : 0;
                        return (
                          <div key={device} className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                              {deviceIcons[device] || <Globe className="h-4 w-4" />}
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between mb-1">
                                <span className="capitalize font-medium text-sm">{device}</span>
                                <span className="text-sm font-semibold">{pct.toFixed(1)}%</span>
                              </div>
                              <div className="w-full bg-muted rounded-full h-2">
                                <div
                                  className="bg-accent rounded-full h-2 transition-all"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                            <span className="text-sm text-muted-foreground w-12 text-right">{count}</span>
                          </div>
                        );
                      })}
                      {Object.keys(analytics.deviceMap).length === 0 && (
                        <p className="text-muted-foreground text-sm text-center py-8">Нет данных</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Clock className="h-5 w-5 text-primary" />
                      Активность по часам
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-6 gap-1">
                      {Array.from({ length: 24 }, (_, h) => {
                        const count = analytics.hourMap[h] || 0;
                        const maxCount = Math.max(...Object.values(analytics.hourMap), 1);
                        const intensity = count / maxCount;
                        return (
                          <div
                            key={h}
                            className="flex flex-col items-center gap-1"
                            title={`${h}:00 — ${count} просмотров`}
                          >
                            <div
                              className="w-full aspect-square rounded-md transition-colors"
                              style={{
                                backgroundColor: count > 0
                                  ? `hsl(222 80% ${80 - intensity * 50}%)`
                                  : "hsl(var(--muted))"
                              }}
                            />
                            <span className="text-[10px] text-muted-foreground">{h}</span>
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-xs text-muted-foreground mt-3 text-center">
                      Чем темнее — тем больше активность
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="activity" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Посещения по дням</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {analytics.dailyVisits.map(([date, count]) => {
                      const maxDay = Math.max(...analytics.dailyVisits.map(d => d[1] as number), 1);
                      const pct = (count as number / maxDay) * 100;
                      return (
                        <div key={date} className="flex items-center gap-3">
                          <span className="text-sm text-muted-foreground w-24 shrink-0">{date}</span>
                          <div className="flex-1">
                            <div className="w-full bg-muted rounded-full h-3">
                              <div
                                className="bg-primary rounded-full h-3 transition-all"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                          <span className="text-sm font-semibold w-10 text-right">{count}</span>
                        </div>
                      );
                    })}
                    {analytics.dailyVisits.length === 0 && (
                      <p className="text-muted-foreground text-sm text-center py-8">Нет данных</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="events" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MousePointer className="h-5 w-5 text-accent" />
                      Топ событий ({analytics.totalEvents})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analytics.topEvents.map(([type, count]) => (
                        <div key={type} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                          <span className="text-sm font-medium">{type}</span>
                          <Badge variant="secondary">{count}</Badge>
                        </div>
                      ))}
                      {analytics.topEvents.length === 0 && (
                        <p className="text-muted-foreground text-sm text-center py-8">Нет событий</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Категории событий</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(analytics.categoryMap)
                        .sort((a, b) => b[1] - a[1])
                        .map(([cat, count]) => (
                          <div key={cat} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                            <span className="text-sm font-medium capitalize">{cat}</span>
                            <Badge variant="outline">{count}</Badge>
                          </div>
                        ))}
                      {Object.keys(analytics.categoryMap).length === 0 && (
                        <p className="text-muted-foreground text-sm text-center py-8">Нет данных</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="content" className="space-y-4 mt-4">
              <ArticleEditor />
            </TabsContent>

            <TabsContent value="platform" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  icon={<Users className="h-5 w-5" />}
                  label="Всего специалистов"
                  value={profilesCount}
                  description="Зарегистрированных профилей"
                />
                <StatCard
                  icon={<Building2 className="h-5 w-5" />}
                  label="Компании"
                  value={companiesCount}
                  description="Зарегистрированных компаний"
                />
                <StatCard
                  icon={<Briefcase className="h-5 w-5" />}
                  label="Вакансии"
                  value={jobsCount}
                  description="Размещённых позиций"
                />
                <StatCard
                  icon={<Send className="h-5 w-5" />}
                  label="Отклики"
                  value={applicationsCount}
                  description="Заявок от кандидатов"
                />
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Последние просмотры страниц
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Страница</th>
                          <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Устройство</th>
                          <th className="text-left py-2 font-medium text-muted-foreground">Время</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pageViews.slice(0, 20).map(pv => (
                          <tr key={pv.id} className="border-b border-border/50">
                            <td className="py-2 pr-4">{pageNameMap[pv.page_path] || pv.page_path}</td>
                            <td className="py-2 pr-4 capitalize">{pv.device_type || "—"}</td>
                            <td className="py-2 text-muted-foreground">
                              {new Date(pv.created_at).toLocaleString("ru-RU")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </Layout>
  );
}

function SummaryCard({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string | number; accent?: boolean }) {
  return (
    <Card>
      <CardContent className="p-4 flex flex-col items-center text-center">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 ${accent ? "bg-accent/10 text-accent" : "bg-primary/10 text-primary"}`}>
          {icon}
        </div>
        <span className="text-2xl font-bold">{value}</span>
        <span className="text-xs text-muted-foreground">{label}</span>
      </CardContent>
    </Card>
  );
}

function StatCard({ icon, label, value, description }: { icon: React.ReactNode; label: string; value: number; description: string }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            {icon}
          </div>
          <span className="font-medium text-sm">{label}</span>
        </div>
        <p className="text-3xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  );
}
