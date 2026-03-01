import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
  role_id: string | null;
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
  items_skipped: number;
  skip_reasons: { archived?: number; too_old?: number; blacklisted?: number; no_match?: number } | null;
  error_message: string | null;
}

interface RoleGroup {
  id: string;
  key: string;
  title: string;
  sort_order: number;
}

interface SpecialistRole {
  id: string;
  name: string;
  group_id: string | null;
}

type CategoryFilter = "all" | string; // group id or "all"

export default function AdminHHSources() {
  const { userRole } = useAuth();
  const [sources, setSources] = useState<HHSource[]>([]);
  const [runs, setRuns] = useState<ImportRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [roleGroups, setRoleGroups] = useState<RoleGroup[]>([]);
  const [roles, setRoles] = useState<SpecialistRole[]>([]);

  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("search");
  const [newEmployerId, setNewEmployerId] = useState("");
  const [newSearchQuery, setNewSearchQuery] = useState("");
  const [newModeration, setNewModeration] = useState("draft_review");
  const [newSearchField, setNewSearchField] = useState("name");
  const [newRoleId, setNewRoleId] = useState<string>("");

  const fetchData = async () => {
    setLoading(true);
    const [{ data: srcData }, { data: runData }, { data: groupData }, { data: roleData }] = await Promise.all([
      supabase.from("hh_sources").select("*").order("created_at", { ascending: false }),
      supabase.from("import_runs").select("*").order("started_at", { ascending: false }).limit(20),
      supabase.from("role_groups").select("*").order("sort_order"),
      supabase.from("specialist_roles").select("id, name, group_id").eq("is_active", true).order("sort_order"),
    ]);
    if (srcData) setSources(srcData as HHSource[]);
    if (runData) setRuns(runData as ImportRun[]);
    if (groupData) setRoleGroups(groupData);
    if (roleData) setRoles(roleData);
    setLoading(false);
  };

  const getLastRun = (sourceId: string): ImportRun | undefined => {
    return runs.find(r => r.source_id === sourceId);
  };

  // Filter sources by group: match source.role_id -> role -> group_id
  const filteredSources = sources.filter(s => {
    if (categoryFilter === "all") return true;
    if (!s.role_id) return false;
    const role = roles.find(r => r.id === s.role_id);
    return role?.group_id === categoryFilter;
  });

  // Get roles for the selected group
  const rolesForSelectedGroup = categoryFilter !== "all" 
    ? roles.filter(r => r.group_id === categoryFilter)
    : [];

  const selectedGroupName = categoryFilter !== "all"
    ? roleGroups.find(g => g.id === categoryFilter)?.title || ""
    : "";

  const [batchImporting, setBatchImporting] = useState(false);

  useEffect(() => {
    if (userRole === "admin") fetchData();
  }, [userRole]);

  // When category changes, reset the new role selection
  useEffect(() => {
    if (categoryFilter !== "all" && rolesForSelectedGroup.length > 0) {
      setNewRoleId(rolesForSelectedGroup[0].id);
    } else {
      setNewRoleId("");
    }
  }, [categoryFilter]);

  if (userRole !== "admin") return <Navigate to="/" />;

  const isAddDisabled = categoryFilter === "all";

  const createSource = async () => {
    if (!newName.trim()) return toast.error("Введите название");
    if (!newRoleId) return toast.error("Выберите роль");

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
      role_id: newRoleId,
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
      const r = data?.results?.[0];
      toast.success(`Импорт: +${r?.items_created || 0} новых, ↻${r?.items_updated || 0} обновлено, ⊘${r?.items_skipped || 0} пропущено`);
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
    let totalCreated = 0, totalUpdated = 0, totalSkipped = 0, failed = 0;
    for (const src of enabledSources) {
      setImporting(src.id);
      try {
        const { data, error } = await supabase.functions.invoke("hh-import", {
          body: { source_id: src.id },
        });
        if (error) throw error;
        const r = data?.results?.[0];
        totalCreated += r?.items_created || 0;
        totalUpdated += r?.items_updated || 0;
        totalSkipped += r?.items_skipped || 0;
      } catch {
        failed++;
      }
      setImporting(null);
    }
    setBatchImporting(false);
    toast.success(`Импорт ${enabledSources.length} источников: +${totalCreated} создано, ↻${totalUpdated} обновлено, ⊘${totalSkipped} пропущено${failed ? `, ${failed} ошибок` : ""}`);
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

  const getRoleName = (roleId: string | null) => {
    if (!roleId) return null;
    return roles.find(r => r.id === roleId)?.name || null;
  };

  const getGroupForRole = (roleId: string | null) => {
    if (!roleId) return null;
    const role = roles.find(r => r.id === roleId);
    if (!role?.group_id) return null;
    return roleGroups.find(g => g.id === role.group_id)?.title || null;
  };

  return (
    <Layout>
      <TooltipProvider>
        <section className="py-8">
          <div className="container">
            <div className="flex items-center gap-4 mb-6">
              <Link to="/admin">
                <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
              </Link>
              <h1 className="font-display text-2xl font-bold uppercase">Источники HH.ru</h1>
            </div>

            {/* Category Filter by role_groups */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <Button
                variant={categoryFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setCategoryFilter("all")}
              >
                Все
                <span className="ml-1.5 text-xs opacity-70">({sources.length})</span>
              </Button>
              {roleGroups.map(group => {
                const count = sources.filter(s => {
                  if (!s.role_id) return false;
                  const role = roles.find(r => r.id === s.role_id);
                  return role?.group_id === group.id;
                }).length;
                return (
                  <Button
                    key={group.id}
                    variant={categoryFilter === group.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCategoryFilter(group.id)}
                  >
                    {group.title}
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
                  Импорт «{categoryFilter === "all" ? "Все" : selectedGroupName}»
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
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>
                      <DialogTrigger asChild>
                        <Button className="gap-2" disabled={isAddDisabled}>
                          <Plus className="h-4 w-4" /> Добавить источник
                        </Button>
                      </DialogTrigger>
                    </span>
                  </TooltipTrigger>
                  {isAddDisabled && (
                    <TooltipContent>
                      <p>Выберите группу для добавления источника</p>
                    </TooltipContent>
                  )}
                </Tooltip>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Новый источник HH</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    {/* Group (read-only) */}
                    <div>
                      <Label>Группа</Label>
                      <Input value={selectedGroupName} disabled className="bg-muted" />
                    </div>
                    {/* Role selection within group */}
                    <div>
                      <Label>Роль (специализация)</Label>
                      <Select value={newRoleId} onValueChange={setNewRoleId}>
                        <SelectTrigger><SelectValue placeholder="Выберите роль" /></SelectTrigger>
                        <SelectContent>
                          {rolesForSelectedGroup.map(r => (
                            <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground mt-1">Импортированные вакансии получат эту роль</p>
                    </div>
                    <div>
                      <Label>Название источника</Label>
                      <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Любое имя, например: Тренеры по теннису" />
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
                    </div>
                    {newType === "employer" ? (
                      <div>
                        <Label>ID работодателя на HH.ru</Label>
                        <Input value={newEmployerId} onChange={e => setNewEmployerId(e.target.value)} placeholder="Например: 1455" />
                      </div>
                    ) : (
                      <>
                        <div>
                          <Label>Поисковый запрос</Label>
                          <Input value={newSearchQuery} onChange={e => setNewSearchQuery(e.target.value)} placeholder="Например: тренер по теннису" />
                        </div>
                        <div>
                          <Label>Где искать</Label>
                          <Select value={newSearchField} onValueChange={setNewSearchField}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="name">Только в названии вакансии</SelectItem>
                              <SelectItem value="company_name">В названии компании</SelectItem>
                              <SelectItem value="description">В описании</SelectItem>
                              <SelectItem value="all">Везде</SelectItem>
                            </SelectContent>
                          </Select>
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
                  const roleName = getRoleName(src.role_id);
                  const groupName = getGroupForRole(src.role_id);
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
                            {roleName && (
                              <Badge variant="outline" className="text-xs">
                                {groupName ? `${groupName} → ` : ""}{roleName}
                              </Badge>
                            )}
                          </div>
                          {/* Extended stats badge */}
                          {lastRun?.status === "success" && (
                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                              <span className="text-xs font-medium text-green-700 bg-green-50 px-1.5 py-0.5 rounded">
                                +{lastRun.items_created} новых
                              </span>
                              <span className="text-xs font-medium text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                                ↻{lastRun.items_updated} обновлено
                              </span>
                              <span className="text-xs font-medium text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">
                                ✕{lastRun.items_closed} закрыто
                              </span>
                              {(lastRun.items_skipped > 0) && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="text-xs font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded cursor-help">
                                      ⊘{lastRun.items_skipped} пропущено
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <div className="text-xs space-y-0.5">
                                      {lastRun.skip_reasons?.archived ? <div>Архивные: {lastRun.skip_reasons.archived}</div> : null}
                                      {lastRun.skip_reasons?.too_old ? <div>Старые (&gt;1 мес): {lastRun.skip_reasons.too_old}</div> : null}
                                      {lastRun.skip_reasons?.blacklisted ? <div>Чёрный список: {lastRun.skip_reasons.blacklisted}</div> : null}
                                      {lastRun.skip_reasons?.no_match ? <div>Не совпал запрос: {lastRun.skip_reasons.no_match}</div> : null}
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                            </div>
                          )}
                          {lastRun?.status === "failed" && (
                            <Badge variant="destructive" className="gap-1 mt-1.5">
                              <XCircle className="h-3 w-3" /> Ошибка
                            </Badge>
                          )}
                          <p className="text-sm text-muted-foreground mt-1">
                            {src.type === "employer" ? `ID: ${src.employer_id}` : `Запрос: ${src.search_query}`}
                            {lastRun?.status === "success" && (
                              <span className="ml-2 text-xs">
                                · Последний импорт: {new Date(lastRun.started_at).toLocaleString("ru-RU")} · Найдено: {lastRun.items_found}
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
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Логи импорта <span className="text-muted-foreground font-normal text-sm ml-1">(последние 20)</span></h2>
              {runs.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-destructive hover:text-destructive"
                  onClick={async () => {
                    if (!confirm("Удалить все логи импорта?")) return;
                    const { error } = await supabase.from("import_runs").delete().neq("id", "00000000-0000-0000-0000-000000000000");
                    if (error) toast.error("Ошибка: " + error.message);
                    else { toast.success("Логи очищены"); fetchData(); }
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" /> Очистить логи
                </Button>
              )}
            </div>
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
                      <TableHead>Пропущено</TableHead>
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
                          <TableCell className="text-green-700">{run.items_created}</TableCell>
                          <TableCell className="text-blue-700">{run.items_updated}</TableCell>
                          <TableCell>{run.items_closed}</TableCell>
                          <TableCell className="text-muted-foreground">{run.items_skipped}</TableCell>
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
      </TooltipProvider>
    </Layout>
  );
}
