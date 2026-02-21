import { useState, useEffect, useCallback } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle, XCircle, ExternalLink, Building2, MapPin, Eye, Trash2, Search } from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";

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

type TabKey = "draft" | "active" | "rejected" | "all";

export default function AdminJobModeration() {
  const { userRole } = useAuth();
  const [jobs, setJobs] = useState<ModerationJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabKey>("draft");
  const [acting, setActing] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [counts, setCounts] = useState({ draft: 0, active: 0, rejected: 0, all: 0 });

  const fetchCounts = useCallback(async () => {
    const [draftRes, activeRes, rejectedRes, allRes] = await Promise.all([
      supabase.from("jobs").select("id", { count: "exact", head: true })
        .or("status.eq.draft,moderation_status.eq.draft"),
      supabase.from("jobs").select("id", { count: "exact", head: true })
        .eq("status", "active").eq("moderation_status", "published"),
      supabase.from("jobs").select("id", { count: "exact", head: true })
        .eq("moderation_status", "rejected"),
      supabase.from("jobs").select("id", { count: "exact", head: true }),
    ]);
    setCounts({
      draft: draftRes.count ?? 0,
      active: activeRes.count ?? 0,
      rejected: rejectedRes.count ?? 0,
      all: allRes.count ?? 0,
    });
  }, []);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setSelected(new Set());

    let query = supabase
      .from("jobs")
      .select("id, title, description, city, country, external_url, external_source, status, moderation_status, created_at, companies(name, logo_url)")
      .order("created_at", { ascending: false })
      .limit(500);

    if (tab === "draft") {
      query = query.or("status.eq.draft,moderation_status.eq.draft");
    } else if (tab === "active") {
      query = query.eq("status", "active").eq("moderation_status", "published");
    } else if (tab === "rejected") {
      query = query.eq("moderation_status", "rejected");
    }

    if (search.trim()) {
      query = query.ilike("title", `%${search.trim()}%`);
    }

    const { data } = await query;

    if (data) {
      setJobs(data.map((j: any) => ({ ...j, company: j.companies })));
    }
    setLoading(false);
  }, [tab, search]);

  useEffect(() => {
    if (userRole === "admin") {
      fetchJobs();
      fetchCounts();
    }
  }, [userRole, tab, search, fetchJobs, fetchCounts]);

  if (userRole !== "admin") return <Navigate to="/" />;

  const publishJob = async (id: string) => {
    setActing(id);
    await supabase.from("jobs").update({ status: "active", moderation_status: "published" }).eq("id", id);
    toast.success("Вакансия опубликована");
    setActing(null);
    fetchJobs();
    fetchCounts();
  };

  const rejectJob = async (id: string) => {
    setActing(id);
    await supabase.from("jobs").update({ status: "closed", moderation_status: "rejected" }).eq("id", id);
    toast.success("Вакансия отклонена");
    setActing(null);
    fetchJobs();
    fetchCounts();
  };

  const deleteJob = async (id: string) => {
    if (!confirm("Удалить вакансию навсегда?")) return;
    setActing(id);
    // Delete related records first
    await Promise.all([
      supabase.from("job_skills").delete().eq("job_id", id),
      supabase.from("applications").delete().eq("job_id", id),
      supabase.from("favorite_jobs").delete().eq("job_id", id),
    ]);
    await supabase.from("jobs").delete().eq("id", id);
    toast.success("Вакансия удалена");
    setActing(null);
    fetchJobs();
    fetchCounts();
  };

  const publishAll = async () => {
    if (counts.draft === 0) return;
    if (!confirm(`Опубликовать все черновики (${counts.draft})?`)) return;

    // Fetch all draft IDs
    const { data } = await supabase.from("jobs").select("id").or("status.eq.draft,moderation_status.eq.draft");
    if (!data) return;
    const ids = data.map(j => j.id);

    // Batch update in chunks of 100
    for (let i = 0; i < ids.length; i += 100) {
      await supabase.from("jobs").update({ status: "active", moderation_status: "published" }).in("id", ids.slice(i, i + 100));
    }
    toast.success(`${ids.length} вакансий опубликовано`);
    setSelected(new Set());
    fetchJobs();
    fetchCounts();
  };

  const deleteSelected = async () => {
    if (selected.size === 0) return;
    if (!confirm(`Удалить ${selected.size} вакансий навсегда?`)) return;
    setActing("batch");
    const ids = Array.from(selected);
    await Promise.all([
      supabase.from("job_skills").delete().in("job_id", ids),
      supabase.from("applications").delete().in("job_id", ids),
      supabase.from("favorite_jobs").delete().in("job_id", ids),
    ]);
    for (let i = 0; i < ids.length; i += 100) {
      await supabase.from("jobs").delete().in("id", ids.slice(i, i + 100));
    }
    toast.success(`${ids.length} вакансий удалено`);
    setActing(null);
    setSelected(new Set());
    fetchJobs();
    fetchCounts();
  };

  const rejectSelected = async () => {
    if (selected.size === 0) return;
    if (!confirm(`Отклонить ${selected.size} вакансий?`)) return;
    setActing("batch");
    const ids = Array.from(selected);
    for (let i = 0; i < ids.length; i += 100) {
      await supabase.from("jobs").update({ status: "closed", moderation_status: "rejected" }).in("id", ids.slice(i, i + 100));
    }
    toast.success(`${ids.length} вакансий отклонено`);
    setActing(null);
    setSelected(new Set());
    fetchJobs();
    fetchCounts();
  };

  const deleteAllRejected = async () => {
    if (counts.rejected === 0) return;
    if (!confirm(`Удалить ВСЕ отклонённые вакансии навсегда (${counts.rejected})?`)) return;
    setActing("batch");

    const { data } = await supabase.from("jobs").select("id").eq("moderation_status", "rejected");
    if (!data) { setActing(null); return; }
    const ids = data.map(j => j.id);

    await Promise.all([
      supabase.from("job_skills").delete().in("job_id", ids),
      supabase.from("applications").delete().in("job_id", ids),
      supabase.from("favorite_jobs").delete().in("job_id", ids),
    ]);
    for (let i = 0; i < ids.length; i += 100) {
      await supabase.from("jobs").delete().in("id", ids.slice(i, i + 100));
    }
    toast.success(`${ids.length} отклонённых вакансий удалено навсегда`);
    setActing(null);
    fetchJobs();
    fetchCounts();
  };

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === jobs.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(jobs.map(j => j.id)));
    }
  };

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

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск по названию вакансии..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <TabsList>
                <TabsTrigger value="draft" className="gap-1">
                  Черновики {counts.draft > 0 && <Badge variant="destructive" className="ml-1 text-xs">{counts.draft}</Badge>}
                </TabsTrigger>
                <TabsTrigger value="active">Опубл. ({counts.active})</TabsTrigger>
                <TabsTrigger value="rejected">Откл. ({counts.rejected})</TabsTrigger>
                <TabsTrigger value="all">Все ({counts.all})</TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-2 flex-wrap">
                {selected.size > 0 && (
                  <Button variant="destructive" size="sm" onClick={deleteSelected} disabled={acting === "batch"} className="gap-1">
                    <Trash2 className="h-4 w-4" /> Удалить ({selected.size})
                  </Button>
                )}
                {tab === "draft" && selected.size > 0 && (
                  <Button variant="outline" size="sm" onClick={rejectSelected} disabled={acting === "batch"} className="gap-1">
                    <XCircle className="h-4 w-4" /> Отклонить ({selected.size})
                  </Button>
                )}
                {tab === "draft" && counts.draft > 0 && (
                  <Button size="sm" onClick={publishAll} className="gap-1">
                    <CheckCircle className="h-4 w-4" /> Опубликовать все ({counts.draft})
                  </Button>
                )}
                {tab === "rejected" && counts.rejected > 0 && (
                  <Button variant="destructive" size="sm" onClick={deleteAllRejected} disabled={acting === "batch"} className="gap-1">
                    <Trash2 className="h-4 w-4" /> Удалить все отклонённые
                  </Button>
                )}
              </div>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
              </div>
            ) : jobs.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  {search ? "Ничего не найдено" : tab === "draft" ? "Нет черновиков для модерации" : "Нет вакансий"}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {jobs.length > 1 && (
                  <div className="flex items-center gap-2 px-1">
                    <Checkbox
                      checked={selected.size === jobs.length && jobs.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                    <span className="text-xs text-muted-foreground">Выбрать все ({jobs.length})</span>
                  </div>
                )}
                {jobs.map(job => (
                  <Card key={job.id} className={selected.has(job.id) ? "ring-2 ring-accent/40" : ""}>
                    <CardContent className="py-4">
                      <div className="flex items-start gap-3">
                        <div className="pt-1 flex-shrink-0">
                          <Checkbox
                            checked={selected.has(job.id)}
                            onCheckedChange={() => toggleSelect(job.id)}
                          />
                        </div>
                        {job.company?.logo_url ? (
                          <img src={job.company.logo_url} alt="" className="w-10 h-10 rounded object-contain flex-shrink-0 hidden sm:block" />
                        ) : (
                          <div className="w-10 h-10 rounded bg-muted items-center justify-center flex-shrink-0 hidden sm:flex">
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
                              <Button size="sm" onClick={() => publishJob(job.id)} disabled={!!acting} className="gap-1">
                                <CheckCircle className="h-3.5 w-3.5" /> Да
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => rejectJob(job.id)} disabled={!!acting}>
                                <XCircle className="h-3.5 w-3.5" />
                              </Button>
                            </>
                          )}
                          <Button size="sm" variant="ghost" onClick={() => deleteJob(job.id)} disabled={!!acting} title="Удалить навсегда">
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                          </Button>
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
