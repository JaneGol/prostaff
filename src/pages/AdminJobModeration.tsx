import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle, XCircle, ExternalLink, Building2, MapPin, Eye } from "lucide-react";
import { Link, Navigate } from "react-router-dom";

interface ModerationJob {
  id: string;
  title: string;
  description: string;
  city: string | null;
  country: string | null;
  external_url: string | null;
  external_source: string | null;
  status: string;
  moderation_status: string | null;
  created_at: string;
  company: { name: string; logo_url: string | null } | null;
}

export default function AdminJobModeration() {
  const { userRole } = useAuth();
  const [jobs, setJobs] = useState<ModerationJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("draft");
  const [acting, setActing] = useState<string | null>(null);

  const fetchJobs = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("jobs")
      .select("id, title, description, city, country, external_url, external_source, status, moderation_status, created_at, companies(name, logo_url)")
      .order("created_at", { ascending: false })
      .limit(200);

    if (data) {
      setJobs(data.map((j: any) => ({ ...j, company: j.companies })));
    }
    setLoading(false);
  };

  useEffect(() => {
    if (userRole === "admin") fetchJobs();
  }, [userRole]);

  if (userRole !== "admin") return <Navigate to="/" />;

  const filtered = jobs.filter(j => {
    if (tab === "draft") return j.status === "draft" || j.moderation_status === "draft";
    if (tab === "active") return j.status === "active" && j.moderation_status === "published";
    if (tab === "rejected") return j.moderation_status === "rejected";
    return true;
  });

  const publishJob = async (id: string) => {
    setActing(id);
    await supabase.from("jobs").update({ status: "active", moderation_status: "published" }).eq("id", id);
    toast.success("Вакансия опубликована");
    setActing(null);
    fetchJobs();
  };

  const rejectJob = async (id: string) => {
    setActing(id);
    await supabase.from("jobs").update({ status: "closed", moderation_status: "rejected" }).eq("id", id);
    toast.success("Вакансия отклонена");
    setActing(null);
    fetchJobs();
  };

  const publishAll = async () => {
    const drafts = jobs.filter(j => j.status === "draft" || j.moderation_status === "draft");
    if (drafts.length === 0) return;
    if (!confirm(`Опубликовать ${drafts.length} вакансий?`)) return;

    const ids = drafts.map(j => j.id);
    await supabase.from("jobs").update({ status: "active", moderation_status: "published" }).in("id", ids);
    toast.success(`${drafts.length} вакансий опубликовано`);
    fetchJobs();
  };

  const draftCount = jobs.filter(j => j.status === "draft" || j.moderation_status === "draft").length;

  return (
    <Layout>
      <section className="py-8">
        <div className="container">
          <div className="flex items-center gap-4 mb-6">
            <Link to="/admin">
              <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
            </Link>
            <h1 className="font-display text-2xl font-bold uppercase">Модерация вакансий</h1>
          </div>

          <Tabs value={tab} onValueChange={setTab}>
            <div className="flex items-center justify-between mb-4">
              <TabsList>
                <TabsTrigger value="draft" className="gap-1">
                  Черновики {draftCount > 0 && <Badge variant="destructive" className="ml-1 text-xs">{draftCount}</Badge>}
                </TabsTrigger>
                <TabsTrigger value="active">Опубликованные</TabsTrigger>
                <TabsTrigger value="rejected">Отклонённые</TabsTrigger>
                <TabsTrigger value="all">Все</TabsTrigger>
              </TabsList>
              {tab === "draft" && draftCount > 0 && (
                <Button onClick={publishAll} className="gap-1">
                  <CheckCircle className="h-4 w-4" /> Опубликовать все ({draftCount})
                </Button>
              )}
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
              </div>
            ) : filtered.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  {tab === "draft" ? "Нет черновиков для модерации" : "Нет вакансий"}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {filtered.map(job => (
                  <Card key={job.id}>
                    <CardContent className="py-4">
                      <div className="flex items-start gap-4">
                        {job.company?.logo_url ? (
                          <img src={job.company.logo_url} alt="" className="w-10 h-10 rounded object-contain flex-shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded bg-muted flex items-center justify-center flex-shrink-0">
                            <Building2 className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-sm">{job.title}</span>
                            {job.external_source && <Badge variant="outline" className="text-xs">HH</Badge>}
                            <Badge variant={job.status === "active" ? "default" : "secondary"} className="text-xs">
                              {job.status === "draft" ? "Черновик" : job.status === "active" ? "Активна" : "Закрыта"}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            <span>{job.company?.name || "—"}</span>
                            {job.city && <span className="flex items-center gap-0.5"><MapPin className="h-3 w-3" />{job.city}</span>}
                            <span>{new Date(job.created_at).toLocaleDateString("ru-RU")}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{job.description?.replace(/<[^>]*>/g, "").slice(0, 200)}</p>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {job.external_url && (
                            <a href={job.external_url} target="_blank" rel="noopener noreferrer">
                              <Button variant="ghost" size="icon" title="Открыть на HH"><ExternalLink className="h-4 w-4" /></Button>
                            </a>
                          )}
                          <Link to={`/jobs/${job.id}`}>
                            <Button variant="ghost" size="icon" title="Просмотр"><Eye className="h-4 w-4" /></Button>
                          </Link>
                          {(job.status === "draft" || job.moderation_status === "draft") && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => publishJob(job.id)}
                                disabled={acting === job.id}
                                className="gap-1"
                              >
                                <CheckCircle className="h-3.5 w-3.5" /> Да
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => rejectJob(job.id)}
                                disabled={acting === job.id}
                              >
                                <XCircle className="h-3.5 w-3.5" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </Tabs>
        </div>
      </section>
    </Layout>
  );
}
