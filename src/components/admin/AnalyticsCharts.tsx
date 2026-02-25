import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
} from "recharts";
import { TrendingUp, Users, Building2, Eye } from "lucide-react";

const COLORS = {
  primary: "hsl(231, 72%, 43%)",
  accent: "hsl(0, 97%, 44%)",
  gold: "hsl(44, 70%, 47%)",
  muted: "hsl(220, 14%, 46%)",
  success: "hsl(142, 72%, 37%)",
};

interface AnalyticsChartsProps {
  pageViews: any[];
  events: any[];
  profileViews: any[];
  userRoles: any[];
}

export function DailyVisitsChart({ pageViews }: { pageViews: any[] }) {
  const data = useMemo(() => {
    const dayMap: Record<string, { sessions: Set<string>; views: number }> = {};
    pageViews.forEach((pv) => {
      const d = new Date(pv.created_at).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" });
      if (!dayMap[d]) dayMap[d] = { sessions: new Set(), views: 0 };
      dayMap[d].views++;
      dayMap[d].sessions.add(pv.session_id);
    });
    return Object.entries(dayMap)
      .map(([date, { sessions, views }]) => ({
        date,
        views,
        sessions: sessions.size,
      }))
      .slice(-14);
  }, [pageViews]);

  if (data.length === 0) return <EmptyState label="Нет данных о посещениях" />;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Посещаемость по дням
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="gradViews" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3} />
                <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradSessions" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.accent} stopOpacity={0.3} />
                <stop offset="95%" stopColor={COLORS.accent} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
            <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: 13,
              }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="views"
              name="Просмотры"
              stroke={COLORS.primary}
              fill="url(#gradViews)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="sessions"
              name="Сессии"
              stroke={COLORS.accent}
              fill="url(#gradSessions)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function RegistrationsChart({ userRoles }: { userRoles: any[] }) {
  const data = useMemo(() => {
    const dayMap: Record<string, Record<string, number>> = {};
    userRoles.forEach((ur) => {
      if (!ur.created_at) return;
      const d = new Date(ur.created_at).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" });
      if (!dayMap[d]) dayMap[d] = {};
      dayMap[d][ur.role] = (dayMap[d][ur.role] || 0) + 1;
    });
    return Object.entries(dayMap)
      .map(([date, roles]) => ({
        date,
        specialist: roles.specialist || 0,
        employer: roles.employer || 0,
      }))
      .slice(-30);
  }, [userRoles]);

  if (data.length === 0) return <EmptyState label="Нет данных о регистрациях" />;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Регистрации по дням
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: 13,
              }}
            />
            <Legend />
            <Bar dataKey="specialist" name="Специалисты" fill={COLORS.primary} radius={[4, 4, 0, 0]} />
            <Bar dataKey="employer" name="Работодатели" fill={COLORS.accent} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function EmployerActivityChart({ profileViews }: { profileViews: any[] }) {
  const data = useMemo(() => {
    const dayMap: Record<string, { views: number; employers: Set<string> }> = {};
    profileViews.forEach((pv) => {
      const d = new Date(pv.viewed_at).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" });
      if (!dayMap[d]) dayMap[d] = { views: 0, employers: new Set() };
      dayMap[d].views++;
      dayMap[d].employers.add(pv.viewer_user_id);
    });
    return Object.entries(dayMap)
      .map(([date, { views, employers }]) => ({
        date,
        views,
        employers: employers.size,
      }))
      .slice(-14);
  }, [profileViews]);

  if (data.length === 0) return <EmptyState label="Нет данных об активности работодателей" />;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          Активность работодателей (просмотры профилей)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: 13,
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="views"
              name="Просмотры профилей"
              stroke={COLORS.primary}
              strokeWidth={2}
              dot={{ fill: COLORS.primary, r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="employers"
              name="Уникальные работодатели"
              stroke={COLORS.gold}
              strokeWidth={2}
              dot={{ fill: COLORS.gold, r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function DevicePieChart({ pageViews }: { pageViews: any[] }) {
  const data = useMemo(() => {
    const map: Record<string, number> = {};
    pageViews.forEach((pv) => {
      const d = pv.device_type || "unknown";
      map[d] = (map[d] || 0) + 1;
    });
    const labels: Record<string, string> = { desktop: "ПК", mobile: "Мобильные", tablet: "Планшеты", unknown: "Другое" };
    return Object.entries(map).map(([name, value]) => ({ name: labels[name] || name, value }));
  }, [pageViews]);

  const PIE_COLORS = [COLORS.primary, COLORS.accent, COLORS.gold, COLORS.muted];

  if (data.length === 0) return <EmptyState label="Нет данных по устройствам" />;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Eye className="h-5 w-5 text-primary" />
          Устройства
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={4}
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function HourlyHeatChart({ pageViews }: { pageViews: any[] }) {
  const data = useMemo(() => {
    const hourMap: Record<number, number> = {};
    pageViews.forEach((pv) => {
      const h = new Date(pv.created_at).getHours();
      hourMap[h] = (hourMap[h] || 0) + 1;
    });
    return Array.from({ length: 24 }, (_, h) => ({
      hour: `${h}:00`,
      count: hourMap[h] || 0,
    }));
  }, [pageViews]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Активность по часам</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="hour" tick={{ fontSize: 10 }} interval={2} stroke="hsl(var(--muted-foreground))" />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: 13,
              }}
            />
            <Bar dataKey="count" name="Просмотры" fill={COLORS.primary} radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <Card>
      <CardContent className="py-12">
        <p className="text-muted-foreground text-sm text-center">{label}</p>
      </CardContent>
    </Card>
  );
}
