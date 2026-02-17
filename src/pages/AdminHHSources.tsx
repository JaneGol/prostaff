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
import { Plus, Play, Trash2, RefreshCw, CheckCircle, XCircle, Clock, ArrowLeft } from "lucide-react";
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

export default function AdminHHSources() {
  const { userRole } = useAuth();
  const [sources, setSources] = useState<HHSource[]>([]);
  const [runs, setRuns] = useState<ImportRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  // New source form
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("search");
  const [newEmployerId, setNewEmployerId] = useState("");
  const [newSearchQuery, setNewSearchQuery] = useState("");
  const [newModeration, setNewModeration] = useState("draft_review");

  const fetchData = async () => {
    setLoading(true);
    const [{ data: srcData }, { data: runData }] = await Promise.all([
      supabase.from("hh_sources").select("*").order("created_at", { ascending: false }),
      supabase.from("import_runs").select("*").order("started_at", { ascending: false }).limit(50),
    ]);
    if (srcData) setSources(srcData as HHSource[]);
    if (runData) setRuns(runData as ImportRun[]);
    setLoading(false);
  };

  useEffect(() => {
    if (userRole === "admin") fetchData();
  }, [userRole]);

  if (userRole !== "admin") return <Navigate to="/" />;

  const createSource = async () => {
    if (!newName.trim()) return toast.error("Введите название");

    const { error } = await supabase.from("hh_sources").insert({
      name: newName,
      type: newType,
      employer_id: newType === "employer" ? newEmployerId : null,
      search_query: newType === "search" ? newSearchQuery : null,
      moderation_mode: newModeration,
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

          {/* Sources */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Источники импорта</h2>
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
                    <Label>Название</Label>
                    <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Например: ФК Зенит" />
                  </div>
                  <div>
                    <Label>Тип</Label>
                    <Select value={newType} onValueChange={setNewType}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="employer">По работодателю (employer_id)</SelectItem>
                        <SelectItem value="search">По поисковому запросу</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {newType === "employer" ? (
                    <div>
                      <Label>Employer ID на HH</Label>
                      <Input value={newEmployerId} onChange={e => setNewEmployerId(e.target.value)} placeholder="Например: 1455" />
                    </div>
                  ) : (
                    <div>
                      <Label>Поисковый запрос</Label>
                      <Input value={newSearchQuery} onChange={e => setNewSearchQuery(e.target.value)} placeholder="Например: спортивный аналитик" />
                    </div>
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
          ) : sources.length === 0 ? (
            <Card><CardContent className="py-8 text-center text-muted-foreground">Нет источников. Добавьте первый.</CardContent></Card>
          ) : (
            <div className="space-y-3 mb-8">
              {sources.map(src => (
                <Card key={src.id}>
                  <CardContent className="py-4 flex items-center gap-4">
                    <Switch checked={src.is_enabled} onCheckedChange={v => toggleSource(src.id, v)} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{src.name}</span>
                        <Badge variant="outline">{src.type === "employer" ? "Работодатель" : "Поиск"}</Badge>
                        <Badge variant={src.moderation_mode === "auto_publish" ? "default" : "secondary"}>
                          {src.moderation_mode === "auto_publish" ? "Авто" : "Черновик"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {src.type === "employer" ? `ID: ${src.employer_id}` : `Запрос: ${src.search_query}`}
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
              ))}
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
