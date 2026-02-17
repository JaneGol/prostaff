import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { 
  Search, 
  MapPin, 
  ChevronRight,
  Briefcase,
  Building2,
  Clock,
  DollarSign,
  Plus,
  X
} from "lucide-react";

interface JobCard {
  id: string;
  title: string;
  description: string;
  city: string | null;
  country: string | null;
  level: string | null;
  contract_type: string | null;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string | null;
  is_remote: boolean;
  created_at: string;
  external_source: string | null;
  external_url: string | null;
  companies: {
    id: string;
    name: string;
    logo_url: string | null;
  } | null;
  specialist_roles: {
    id: string;
    name: string;
  } | null;
}

interface SpecialistRole {
  id: string;
  name: string;
}

const levelLabels: Record<string, string> = {
  intern: "Стажёр",
  junior: "Junior",
  middle: "Middle",
  senior: "Senior",
  head: "Head"
};

const contractLabels: Record<string, string> = {
  full_time: "Полная занятость",
  part_time: "Частичная занятость",
  contract: "Контракт",
  internship: "Стажировка",
  freelance: "Фриланс"
};

const formatSalary = (min: number | null, max: number | null, currency: string | null) => {
  if (!min && !max) return null;
  const curr = currency || "RUB";
  if (min && max) return `${min.toLocaleString()} – ${max.toLocaleString()} ${curr}`;
  if (min) return `от ${min.toLocaleString()} ${curr}`;
  if (max) return `до ${max.toLocaleString()} ${curr}`;
  return null;
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Сегодня";
  if (diffDays === 1) return "Вчера";
  if (diffDays < 7) return `${diffDays} дн. назад`;
  return date.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
};

function JobCardItem({ job }: { job: JobCard }) {
  return (
    <Link to={`/jobs/${job.id}`}>
      <Card className="hover:shadow-lg transition-shadow group">
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-start gap-3 md:gap-4">
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
              {job.companies?.logo_url ? (
                <img src={job.companies.logo_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <Building2 className="h-5 w-5 text-muted-foreground" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-1 md:gap-2">
                <div>
                  <h3 className="font-semibold text-base group-hover:text-accent transition-colors line-clamp-1">
                    {job.title}
                  </h3>
                  {job.companies && (
                    <p className="text-sm text-muted-foreground">{job.companies.name}</p>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground flex-shrink-0">
                  <Clock className="h-3.5 w-3.5" />
                  {formatDate(job.created_at)}
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 mt-2">
                {job.level && (
                  <Badge variant="outline" className="text-xs">
                    {levelLabels[job.level] || job.level}
                  </Badge>
                )}
                {job.contract_type && (
                  <Badge variant="outline" className="text-xs">
                    {contractLabels[job.contract_type] || job.contract_type}
                  </Badge>
                )}
                {job.is_remote && (
                  <Badge variant="outline" className="text-xs">Удалённо</Badge>
                )}
                {job.external_source === "hh" && (
                  <Badge className="text-xs bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20">
                    HH
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 mt-2 text-sm">
                {(job.city || job.country) && (
                  <span className="flex items-center gap-1 text-muted-foreground text-xs">
                    <MapPin className="h-3.5 w-3.5" />
                    {[job.city, job.country].filter(Boolean).join(", ")}
                  </span>
                )}
                {formatSalary(job.salary_min, job.salary_max, job.salary_currency) && (
                  <span className="flex items-center gap-1 text-foreground font-medium text-xs">
                    <DollarSign className="h-3.5 w-3.5" />
                    {formatSalary(job.salary_min, job.salary_max, job.salary_currency)}
                  </span>
                )}
              </div>
            </div>

            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-accent transition-colors hidden md:block flex-shrink-0" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function Jobs() {
  const { userRole } = useAuth();
  const [jobs, setJobs] = useState<JobCard[]>([]);
  const [roles, setRoles] = useState<SpecialistRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedContract, setSelectedContract] = useState<string>("");
  const [selectedLevel, setSelectedLevel] = useState<string>("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [{ data: rolesData }, { data: jobsData }] = await Promise.all([
        supabase.from("specialist_roles").select("id, name").order("name"),
        supabase
          .from("jobs")
          .select(`
            id, title, description, city, country, level, contract_type,
            salary_min, salary_max, salary_currency, is_remote, created_at,
            external_source, external_url,
            companies (id, name, logo_url),
            specialist_roles (id, name)
          `)
          .eq("status", "active")
          .order("created_at", { ascending: false })
      ]);

      if (rolesData) setRoles(rolesData);
      setJobs(jobsData || []);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Unique cities for filter
  const cities = useMemo(() => {
    const set = new Set<string>();
    jobs.forEach(j => { if (j.city) set.add(j.city); });
    return Array.from(set).sort();
  }, [jobs]);

  // Filter jobs
  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      if (selectedRole && selectedRole !== "all" && job.specialist_roles?.id !== selectedRole) return false;
      if (selectedCity && selectedCity !== "all" && job.city !== selectedCity) return false;
      if (selectedContract && selectedContract !== "all" && job.contract_type !== selectedContract) return false;
      if (selectedLevel && selectedLevel !== "all" && job.level !== selectedLevel) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          job.title.toLowerCase().includes(q) ||
          (job.companies?.name.toLowerCase() || "").includes(q) ||
          (job.specialist_roles?.name.toLowerCase() || "").includes(q) ||
          `${job.city || ""} ${job.country || ""}`.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [jobs, selectedRole, selectedCity, selectedContract, selectedLevel, searchQuery]);

  // Group by role
  const grouped = useMemo(() => {
    const map = new Map<string, { roleName: string; roleId: string; jobs: JobCard[] }>();
    const noRole: JobCard[] = [];

    filteredJobs.forEach(job => {
      if (job.specialist_roles) {
        const key = job.specialist_roles.id;
        if (!map.has(key)) {
          map.set(key, { roleName: job.specialist_roles.name, roleId: key, jobs: [] });
        }
        map.get(key)!.jobs.push(job);
      } else {
        noRole.push(job);
      }
    });

    const sorted = Array.from(map.values()).sort((a, b) => b.jobs.length - a.jobs.length);
    if (noRole.length > 0) {
      sorted.push({ roleName: "Другое", roleId: "other", jobs: noRole });
    }
    return sorted;
  }, [filteredJobs]);

  const hasActiveFilters = selectedRole || selectedCity || selectedContract || selectedLevel || searchQuery;

  const clearFilters = () => {
    setSelectedRole("");
    setSelectedCity("");
    setSelectedContract("");
    setSelectedLevel("");
    setSearchQuery("");
  };

  // All group keys for default-open accordion
  const allGroupKeys = useMemo(() => grouped.map(g => g.roleId), [grouped]);

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-gradient-to-b from-primary to-primary-dark text-white py-10 md:py-14">
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold uppercase">
                Вакансии
              </h1>
              <p className="text-white/80 text-lg mt-1">
                Лучшие предложения работы в спорте
              </p>
            </div>
            {userRole === "employer" && (
              <Link to="/jobs/new">
                <Button size="lg" className="gap-2">
                  <Plus className="h-5 w-5" />
                  Разместить вакансию
                </Button>
              </Link>
            )}
          </div>

          {/* Search */}
          <div className="max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск по названию, компании или городу..."
                className="pl-12 h-14 text-lg bg-white border-0"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Filters & Results */}
      <section className="py-6 md:py-10">
        <div className="container">
          {/* Filters - always visible */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger>
                <SelectValue placeholder="Специализация" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все специализации</SelectItem>
                {roles.map(role => (
                  <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger>
                <SelectValue placeholder="Город" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все города</SelectItem>
                {cities.map(city => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedContract} onValueChange={setSelectedContract}>
              <SelectTrigger>
                <SelectValue placeholder="Занятость" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Любая занятость</SelectItem>
                {Object.entries(contractLabels).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger>
                <SelectValue placeholder="Уровень" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Любой уровень</SelectItem>
                {Object.entries(levelLabels).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Active filters summary */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Briefcase className="h-4 w-4" />
              <span>Найдено: {filteredJobs.length}</span>
              {grouped.length > 0 && (
                <span className="text-muted-foreground/60">
                  · {grouped.length} {grouped.length === 1 ? "направление" : "направлений"}
                </span>
              )}
            </div>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1.5 text-muted-foreground">
                <X className="h-3.5 w-3.5" />
                Сбросить
              </Button>
            )}
          </div>

          {/* Results */}
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-2xl" />
              ))}
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-16">
              <Briefcase className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Вакансии не найдены</h3>
              <p className="text-muted-foreground mb-6">
                {hasActiveFilters
                  ? "Попробуйте изменить параметры поиска"
                  : "Пока нет активных вакансий"}
              </p>
              {hasActiveFilters && (
                <Button variant="outline" onClick={clearFilters}>Сбросить фильтры</Button>
              )}
            </div>
          ) : (
            <Accordion type="multiple" defaultValue={allGroupKeys} className="space-y-3">
              {grouped.map(group => (
                <AccordionItem key={group.roleId} value={group.roleId} className="border rounded-xl overflow-hidden bg-card">
                  <AccordionTrigger className="px-5 py-4 hover:no-underline">
                    <div className="flex items-center gap-3">
                      <span className="font-display font-bold text-base uppercase">{group.roleName}</span>
                      <Badge variant="secondary" className="text-xs">{group.jobs.length}</Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-3 pb-3">
                    <div className="space-y-2">
                      {group.jobs.map(job => (
                        <JobCardItem key={job.id} job={job} />
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>
      </section>
    </Layout>
  );
}
