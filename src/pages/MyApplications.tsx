import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  FileText,
  Briefcase,
  Building2,
  MapPin,
  Calendar,
  Clock,
  ChevronRight,
  Send,
  ArrowLeft,
  MessageSquare
} from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type ApplicationStatus = Database["public"]["Enums"]["application_status"];

interface MyApplication {
  id: string;
  cover_letter: string | null;
  employer_notes: string | null;
  status: ApplicationStatus;
  created_at: string;
  updated_at: string;
  jobs: {
    id: string;
    title: string;
    city: string | null;
    country: string | null;
    level: string | null;
    contract_type: string | null;
    companies: {
      id: string;
      name: string;
      logo_url: string | null;
    } | null;
  };
}

const statusLabels: Record<ApplicationStatus, string> = {
  pending: "На рассмотрении",
  reviewed: "Просмотрено",
  shortlisted: "В шорт-листе",
  interview: "Приглашение на интервью",
  rejected: "Отклонён",
  hired: "Принят на работу"
};

const statusColors: Record<ApplicationStatus, string> = {
  pending: "bg-muted text-muted-foreground",
  reviewed: "bg-blue-100 text-blue-800",
  shortlisted: "bg-yellow-100 text-yellow-800",
  interview: "bg-purple-100 text-purple-800",
  rejected: "bg-red-100 text-red-800",
  hired: "bg-green-100 text-green-800"
};

const statusIcons: Record<ApplicationStatus, string> = {
  pending: "⏳",
  reviewed: "👀",
  shortlisted: "⭐",
  interview: "📞",
  rejected: "❌",
  hired: "🎉"
};

const levelLabels: Record<string, string> = {
  intern: "Стажёр",
  junior: "Junior",
  middle: "Middle",
  senior: "Senior",
  head: "Head"
};

export default function MyApplications() {
  const navigate = useNavigate();
  const { user, userRole, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [applications, setApplications] = useState<MyApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || userRole !== "specialist")) {
      navigate("/auth");
    }
  }, [user, userRole, authLoading, navigate]);

  useEffect(() => {
    if (user && userRole === "specialist") {
      fetchApplications();
    }
  }, [user, userRole]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      // Get user's profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user!.id)
        .maybeSingle();

      if (!profile) {
        setLoading(false);
        return;
      }

      // Get applications
      const { data, error } = await supabase
        .from("applications")
        .select(`
          id,
          cover_letter,
          employer_notes,
          status,
          created_at,
          updated_at,
          jobs (
            id,
            title,
            city,
            country,
            level,
            contract_type,
            companies (id, name, logo_url)
          )
        `)
        .eq("profile_id", profile.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setApplications(data as unknown as MyApplication[] || []);
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

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

  const getTimeSinceUpdate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Сегодня";
    if (diffDays === 1) return "Вчера";
    if (diffDays < 7) return `${diffDays} дн. назад`;
    return formatDate(dateStr);
  };

  // Group by status
  const grouped = {
    active: applications.filter(a => ["pending", "reviewed", "shortlisted", "interview"].includes(a.status)),
    completed: applications.filter(a => ["rejected", "hired"].includes(a.status))
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
              Мои отклики
            </h1>
            <p className="text-muted-foreground mt-2">
              Отслеживайте статус ваших заявок
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-2xl font-bold">{applications.length}</p>
              <p className="text-sm text-muted-foreground">всего откликов</p>
            </div>
          </div>
        </div>

        {applications.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Откликов пока нет</h3>
              <p className="text-muted-foreground mb-6">
                Найдите интересующую вакансию и отправьте отклик
              </p>
              <Link to="/jobs">
                <Button>
                  <Briefcase className="h-4 w-4 mr-2" />
                  Смотреть вакансии
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Active Applications */}
            {grouped.active.length > 0 && (
              <div>
                <h2 className="font-display text-xl font-bold uppercase mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-accent" />
                  Активные ({grouped.active.length})
                </h2>
                <div className="space-y-4">
                  {grouped.active.map(application => (
                    <ApplicationCard key={application.id} application={application} />
                  ))}
                </div>
              </div>
            )}

            {/* Completed Applications */}
            {grouped.completed.length > 0 && (
              <div>
                <h2 className="font-display text-xl font-bold uppercase mb-4 flex items-center gap-2">
                  Завершённые ({grouped.completed.length})
                </h2>
                <div className="space-y-4">
                  {grouped.completed.map(application => (
                    <ApplicationCard key={application.id} application={application} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}

function ApplicationCard({ application }: { application: MyApplication }) {
  return (
    <Link to={`/jobs/${application.jobs.id}`}>
      <Card className="hover:shadow-md transition-shadow group">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-start gap-4">
            {/* Company Logo */}
            <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
              {application.jobs.companies?.logo_url ? (
                <img 
                  src={application.jobs.companies.logo_url} 
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <Building2 className="h-6 w-6 text-muted-foreground" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 mb-2">
                <div>
                  <h3 className="font-semibold text-lg group-hover:text-accent transition-colors">
                    {application.jobs.title}
                  </h3>
                  {application.jobs.companies && (
                    <p className="text-muted-foreground">
                      {application.jobs.companies.name}
                    </p>
                  )}
                </div>
                <Badge className={`${statusColors[application.status]} flex items-center gap-1`}>
                  <span>{statusIcons[application.status]}</span>
                  {statusLabels[application.status]}
                </Badge>
              </div>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                {(application.jobs.city || application.jobs.country) && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {[application.jobs.city, application.jobs.country].filter(Boolean).join(", ")}
                  </span>
                )}
                {application.jobs.level && (
                  <span>
                    {levelLabels[application.jobs.level] || application.jobs.level}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Отклик: {new Date(application.created_at).toLocaleDateString("ru-RU")}
                </span>
              </div>

              {/* Cover letter preview */}
              {application.cover_letter && (
                <div className="mt-3 bg-muted/50 rounded-lg p-3">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    <FileText className="h-4 w-4 inline mr-1" />
                    {application.cover_letter}
                  </p>
                </div>
              )}

              {/* Employer message (e.g. interview invitation) */}
              {application.employer_notes && application.status === "interview" && (
                <div className="mt-3 bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-purple-800 mb-1 flex items-center gap-1.5">
                    <MessageSquare className="h-4 w-4" />
                    Сообщение от работодателя
                  </p>
                  <p className="text-sm text-purple-700">
                    {application.employer_notes}
                  </p>
                </div>
              )}
            </div>

            {/* Arrow */}
            <ChevronRight className="h-6 w-6 text-muted-foreground group-hover:text-accent transition-colors hidden md:block" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
