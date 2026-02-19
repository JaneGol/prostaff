import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Plus, Play, Trash2, RefreshCw, CheckCircle, XCircle, Clock, ArrowLeft, FileCheck } from "lucide-react";
import { Link, Navigate } from "react-router-dom";

interface HHSource {
  id: string;
  name: string;
  type: string;
  employer_id: string | null;
  search_query: string | null;
  filters_json: Record<string, string>;
  is_enabled: boolean;
  import_interval_minutes: number;
  moderation_mode: string;
  company_id: string | null;
  created_at: string;
}

interface ImportRun {
  id: string;
  source_id: string;
  started_at: string;
  finished_at: string | null;
  status: string;
  items_found: number;
  items_created: number;
  items_updated: number;
  items_closed: number;
  error_message: string | null;
}

type CategoryFilter = "all" | "coaching" | "performance" | "analytics" | "medical" | "other";

const categoryLabels: Record<CategoryFilter, string> = {
  all: "Все",
  coaching: "Тренеры",
  performance: "Тренеры по физической подготовке",
  analytics: "Аналитика и данные",
  medical: "Медицина и восстановление",
  other: "Другое",
};

const PERFORMANCE_KEYWORDS = ["физподготовк", "физической подготовк", "офп", "s&c", "strength", "conditioning", "инструктор-методист"];
const COACHING_KEYWORDS = ["тренер"];
const ANALYTICS_KEYWORDS = ["аналитик", "видеоаналитик", "скаут", "селекционер"];
const MEDICAL_KEYWORDS = ["врач", "массажист", "физиотерапевт", "реабилитолог", "диетолог", "нутрициолог", "лфк", "психолог"];

const matchesCategory = (name: string, cat: CategoryFilter): boolean => {
  const lower = name.toLowerCase();
  if (cat === "all") return true;
  if (cat === "performance") return PERFORMANCE_KEYWORDS.some(k => lower.includes(k));
  if (cat === "coaching") return COACHING_KEYWORDS.some(k => lower.includes(k)) && !PERFORMANCE_KEYWORDS.some(k => lower.includes(k));
  if (cat === "analytics") return ANALYTICS_KEYWORDS.some(k => lower.includes(k));
  if (cat === "medical") return MEDICAL_KEYWORDS.some(k => lower.includes(k));
  return !matchesCategory(name, "coaching") && !matchesCategory(name, "performance") && !matchesCategory(name, "analytics") && !matchesCategory(name, "medical");
};

export default function AdminHHSources() {
  const { userRole } = useAuth();
  const [sources, setSources] = useState<HHSource[]>([]);
  const [runs, setRuns] = useState<ImportRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");

  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("search");
  const [newEmployerId, setNewEmployerId] = useState("");
  const [newSearchQuery, setNewSearchQuery] = useState("");
  const [newModeration, setNewModeration] = useState("draft_review");
  const [newSearchField, setNewSearchField] = useState("name");

  const fetchData = async () => {
    setLoading(true);
    const [{ data: srcData }, { data: runData }] = await Promise.all([
      supabase.from("hh_sources").select("*").order("created_at", { ascending: false }),
      supabase.from("import_runs").select("*").order("started_at", { ascending: false }).limit(200),
    ]);
    if (srcData) setSources(srcData as HHSource[]);
    if (runData) setRuns(runData as ImportRun[]);
    setLoading(false);
  };

  const getLastRun = (sourceId: string): ImportRun | undefined => {
    return runs.find(r => r.source_id === sourceId);
  };

  const filteredSources = sources.filter(s => matchesCategory(s.name, categoryFilter));

  const [batchImporting, setBatchImporting] = useState(false);

  useEffect(() => {
    if (userRole === "admin") fetchData();
  }, [userRole]);

  if (userRole !== "admin") return <Navigate to="/" />;

  const createSource = async () => {
    if (!newName.trim()) return toast.error("Введите название");

    const filtersJson: Record<string, string> = {};
    if (newType === "search" && newSearchField) {
      filtersJson.search_field = newSearchField;
    }

    const { error } = await supabase.from("hh_sources").insert({
      name: newName,
      type: newType,
      employer_id: newType === "employer" ? newEmployerId : null,
      search_query: newType === "search" ? newSearchQuery : null,
      moderation_mode: newModeration,
      filters_json: filtersJson,
    });

    if (error) {
      toast.error("Ошибка: " + error.message);
    } else {
      toast.success("Источник создан");
      setShowCreate(false);
      setNewName("");
      setNewEmployerId("");
      setNewSearchQuery("");
      fetchData();
    }
  };

  const toggleSource = async (id: string, enabled: boolean) => {
    await supabase.from("hh_sources").update({ is_enabled: enabled }).eq("id", id);
    fetchData();
  };

  const deleteSource = async (id: string) => {
    if (!confirm("Удалить источник?")) return;
    await supabase.from("hh_sources").delete().eq("id", id);
    toast.success("Удалено");
    fetchData();
  };


  const runImport = async (sourceId: string) => {
    setImporting(sourceId);
    try {
      const { data, error } = await supabase.functions.invoke("hh-import", {
        body: { source_id: sourceId },
      });
      if (error) throw error;
      toast.success(`Импорт завершён: создано ${data?.results?.[0]?.items_created || 0}, обновлено ${data?.results?.[0]?.items_updated || 0}`);
      fetchData();
    } catch (err) {
      toast.error("Ошибка импорта: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setImporting(null);
    }
  };

  const runBatchImport = async () => {
    const enabledSources = filteredSources.filter(s => s.is_enabled);
    if (enabledSources.length === 0) return toast.error("Нет включённых источников в этой категории");
    setBatchImporting(true);
    let totalCreated = 0, totalUpdated = 0, failed = 0;
    for (const src of enabledSources) {
      setImporting(src.id);
      try {
        const { data, error } = await supabase.functions.invoke("hh-import", {
          body: { source_id: src.id },
        });
        if (error) throw error;
        totalCreated += data?.results?.[0]?.items_created || 0;
        totalUpdated += data?.results?.[0]?.items_updated || 0;
      } catch {
        failed++;
      }
      setImporting(null);
    }
    setBatchImporting(false);
    toast.success(`Импорт ${enabledSources.length} источников: +${totalCreated} создано, ↻${totalUpdated} обновлено${failed ? `, ${failed} ошибок` : ""}`);
    fetchData();
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case "success": return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "failed": return <XCircle className="h-4 w-4 text-destructive" />;
      case "running": return <RefreshCw className="h-4 w-4 text-primary animate-spin" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
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
            <h1 className="font-display text-2xl font-bold uppercase">Источники HH.ru</h1>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {(Object.keys(categoryLabels) as CategoryFilter[]).map(cat => {
              const count = sources.filter(s => matchesCategory(s.name, cat)).length;
              return (
                <Button
                  key={cat}
                  variant={categoryFilter === cat ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCategoryFilter(cat)}
                >
                  {categoryLabels[cat]}
                  <span className="ml-1.5 text-xs opacity-70">({count})</span>
                </Button>
              );
            })}
            <div className="ml-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={runBatchImport}
                disabled={batchImporting || importing !== null}
                className="gap-1.5"
              >
                {batchImporting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                Импорт «{categoryLabels[categoryFilter]}»
              </Button>
            </div>
          </div>

          {/* Sources */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              Источники импорта
              <span className="text-muted-foreground font-normal text-sm ml-2">({filteredSources.length})</span>
            </h2>
            <Dialog open={showCreate} onOpenChange={setShowCreate}>
              <DialogTrigger asChild>
                <Button className="gap-2"><Plus className="h-4 w-4" /> Добавить источник</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Новый источник HH</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label>Название источника</Label>
                    <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Любое имя, например: Тренеры по теннису" />
                    <p className="text-xs text-muted-foreground mt-1">Просто название для вас, чтобы различать источники</p>
                  </div>
                  <div>
                    <Label>Тип поиска</Label>
                    <Select value={newType} onValueChange={setNewType}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="employer">По ID работодателя на HH.ru</SelectItem>
                        <SelectItem value="search">По ключевым словам</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      {newType === "search"
                        ? "Введите запрос как в поиске HH.ru — система найдёт вакансии по этим словам"
                        : "Укажите числовой ID работодателя с HH.ru (из URL страницы компании)"}
                    </p>
                  </div>
                  {newType === "employer" ? (
                    <div>
                      <Label>ID работодателя на HH.ru</Label>
                      <Input value={newEmployerId} onChange={e => setNewEmployerId(e.target.value)} placeholder="Например: 1455 (число из URL)" />
                      <p className="text-xs text-muted-foreground mt-1">Найдите на hh.ru/employer/ЧИСЛО — это число и есть ID</p>
                    </div>
                  ) : (
                    <>
                      <div>
                        <Label>Поисковый запрос</Label>
                        <Input value={newSearchQuery} onChange={e => setNewSearchQuery(e.target.value)} placeholder="Например: тренер по теннису" />
                        <p className="text-xs text-muted-foreground mt-1">Пишите как искали бы на HH.ru: «тренер по теннису», «спортивный аналитик», «врач ФК»</p>
                      </div>
                      <div>
                        <Label>Где искать</Label>
                        <Select value={newSearchField} onValueChange={setNewSearchField}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="name">Только в названии вакансии</SelectItem>
                            <SelectItem value="company_name">В названии компании</SelectItem>
                            <SelectItem value="description">В описании</SelectItem>
                            <SelectItem value="all">Везде (по умолчанию HH)</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground mt-1">«Только в названии» — самый точный режим, отсекает нерелевантные вакансии</p>
                      </div>
                    </>
                  )}
                  <div>
                    <Label>Модерация</Label>
                    <Select value={newModeration} onValueChange={setNewModeration}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft_review">Черновик (ручная проверка)</SelectItem>
                        <SelectItem value="auto_publish">Автопубликация</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={createSource} className="w-full">Создать</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}
            </div>
          ) : filteredSources.length === 0 ? (
            <Card><CardContent className="py-8 text-center text-muted-foreground">
              {sources.length === 0 ? "Нет источников. Добавьте первый." : "Нет источников в этой категории."}
            </CardContent></Card>
          ) : (
            <div className="space-y-3 mb-8">
              {filteredSources.map(src => {
                const lastRun = getLastRun(src.id);
                return (
                  <Card key={src.id}>
                    <CardContent className="py-4 flex items-center gap-4">
                      <Switch checked={src.is_enabled} onCheckedChange={v => toggleSource(src.id, v)} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium">{src.name}</span>
                          <Badge variant="outline">{src.type === "employer" ? "Работодатель" : "Поиск"}</Badge>
                          <Badge variant={src.moderation_mode === "auto_publish" ? "default" : "secondary"}>
                            {src.moderation_mode === "auto_publish" ? "Авто" : "Черновик"}
                          </Badge>
                          {lastRun?.status === "success" && (
                            <Badge variant="outline" className="gap-1 text-green-700 border-green-300 bg-green-50">
                              <FileCheck className="h-3 w-3" />
                              +{lastRun.items_created} / ↻{lastRun.items_updated}
                            </Badge>
                          )}
                          {lastRun?.status === "failed" && (
                            <Badge variant="destructive" className="gap-1">
                              <XCircle className="h-3 w-3" /> Ошибка
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {src.type === "employer" ? `ID: ${src.employer_id}` : `Запрос: ${src.search_query}`}
                          {lastRun?.status === "success" && (
                            <span className="ml-2 text-xs">
                              · {new Date(lastRun.started_at).toLocaleDateString("ru-RU")}
                            </span>
                          )}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => runImport(src.id)}
                        disabled={importing === src.id}
                        className="gap-1"
                      >
                        {importing === src.id ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                        Импорт
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteSource(src.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Import Logs */}
          <h2 className="text-lg font-semibold mb-4">Логи импорта</h2>
          {runs.length === 0 ? (
            <Card><CardContent className="py-8 text-center text-muted-foreground">Нет логов</CardContent></Card>
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Статус</TableHead>
                    <TableHead>Источник</TableHead>
                    <TableHead>Дата</TableHead>
                    <TableHead>Найдено</TableHead>
                    <TableHead>Создано</TableHead>
                    <TableHead>Обновлено</TableHead>
                    <TableHead>Закрыто</TableHead>
                    <TableHead>Ошибка</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {runs.map(run => {
                    const src = sources.find(s => s.id === run.source_id);
                    return (
                      <TableRow key={run.id}>
                        <TableCell>{statusIcon(run.status)}</TableCell>
                        <TableCell className="font-medium">{src?.name || "—"}</TableCell>
                        <TableCell className="text-sm">{new Date(run.started_at).toLocaleString("ru-RU")}</TableCell>
                        <TableCell>{run.items_found}</TableCell>
                        <TableCell>{run.items_created}</TableCell>
                        <TableCell>{run.items_updated}</TableCell>
                        <TableCell>{run.items_closed}</TableCell>
                        <TableCell className="text-sm text-destructive max-w-[200px] truncate">{run.error_message || "—"}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>
          )}
        </div>
      </section>
    </Layout>
  );
}
