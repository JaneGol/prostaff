import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { JOB_SECTIONS, getJobSectionForRole } from "@/lib/jobSections";
import { JobCardItem, type JobCardData, levelLabels, contractLabels } from "@/components/jobs/JobCardItem";
import {
  Search,
  Briefcase,
  Plus,
  X,
  SlidersHorizontal,
} from "lucide-react";

interface SpecialistRole {
  id: string;
  name: string;
}

/** Priority cities shown first in the region filter */
const PRIORITY_CITIES = ["Москва", "Санкт-Петербург", "Казань", "Краснодар", "Екатеринбург", "Новосибирск"];

export default function Jobs() {
  const { userRole } = useAuth();
  const [jobs, setJobs] = useState<JobCardData[]>([]);
  const [roles, setRoles] = useState<SpecialistRole[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedContract, setSelectedContract] = useState("");
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

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
          .order("created_at", { ascending: false }),
      ]);
      if (rolesData) setRoles(rolesData);
      setJobs(jobsData || []);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Cities for filter, priority cities first
  const cities = useMemo(() => {
    const set = new Set<string>();
    jobs.forEach((j) => { if (j.city) set.add(j.city); });
    const all = Array.from(set);
    const priority = PRIORITY_CITIES.filter((c) => all.includes(c));
    const rest = all.filter((c) => !PRIORITY_CITIES.includes(c)).sort();
    return [...priority, ...rest];
  }, [jobs]);

  // Roles that actually have jobs (for specialization filter)
  const rolesWithJobs = useMemo(() => {
    const jobRoleIds = new Set(jobs.map((j) => j.specialist_roles?.id).filter(Boolean));
    return roles.filter((r) => jobRoleIds.has(r.id));
  }, [roles, jobs]);

  // Tab counts
  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = { all: jobs.length };
    JOB_SECTIONS.forEach((s) => { counts[s.key] = 0; });
    jobs.forEach((job) => {
      const section = getJobSectionForRole(job.specialist_roles?.id || null);
      counts[section] = (counts[section] || 0) + 1;
    });
    return counts;
  }, [jobs]);

  // Filter jobs
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      // Tab filter
      if (activeTab !== "all") {
        const jobSection = getJobSectionForRole(job.specialist_roles?.id || null);
        if (jobSection !== activeTab) return false;
      }
      // Role filter
      if (selectedRole && selectedRole !== "all" && job.specialist_roles?.id !== selectedRole) return false;
      // City filter
      if (selectedCity && selectedCity !== "all" && job.city !== selectedCity) return false;
      // Level filter
      if (selectedLevel && selectedLevel !== "all" && job.level !== selectedLevel) return false;
      // Contract filter
      if (selectedContract && selectedContract !== "all" && job.contract_type !== selectedContract) return false;
      // Remote
      if (remoteOnly && !job.is_remote) return false;
      // Search
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
  }, [jobs, activeTab, selectedRole, selectedCity, selectedLevel, selectedContract, searchQuery, remoteOnly]);

  const hasActiveFilters = !!(selectedRole || selectedCity || selectedContract || selectedLevel || searchQuery || remoteOnly);

  const clearFilters = () => {
    setSelectedRole("");
    setSelectedCity("");
    setSelectedContract("");
    setSelectedLevel("");
    setSearchQuery("");
    setRemoteOnly(false);
  };

  // Tabs data
  const tabs = [
    { key: "all", title: "Все" },
    ...JOB_SECTIONS.map((s) => ({ key: s.key, title: s.title })),
  ];

  const FilterSidebar = () => (
    <div className="space-y-5">
      {/* Search */}
      <div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск..."
            className="pl-9 h-10"
          />
        </div>
      </div>

      {/* Specialization */}
      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
          Специализация
        </label>
        <Select value={selectedRole} onValueChange={setSelectedRole}>
          <SelectTrigger className="h-9 text-sm">
            <SelectValue placeholder="Все специальности" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все специальности</SelectItem>
            {rolesWithJobs.map((role) => (
              <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Region */}
      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
          Регион
        </label>
        <Select value={selectedCity} onValueChange={setSelectedCity}>
          <SelectTrigger className="h-9 text-sm">
            <SelectValue placeholder="Все города" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все города</SelectItem>
            {cities.map((city, i) => (
              <SelectItem key={city} value={city}>
                {city}
                {i === PRIORITY_CITIES.filter((c) => cities.includes(c)).length - 1 && (
                  <span className="sr-only">---</span>
                )}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Level */}
      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
          Уровень
        </label>
        <Select value={selectedLevel} onValueChange={setSelectedLevel}>
          <SelectTrigger className="h-9 text-sm">
            <SelectValue placeholder="Любой уровень" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Любой уровень</SelectItem>
            {Object.entries(levelLabels).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Contract */}
      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
          Занятость
        </label>
        <Select value={selectedContract} onValueChange={setSelectedContract}>
          <SelectTrigger className="h-9 text-sm">
            <SelectValue placeholder="Любая занятость" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Любая занятость</SelectItem>
            {Object.entries(contractLabels).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Remote */}
      <div className="flex items-center gap-2">
        <Checkbox
          id="remote-filter"
          checked={remoteOnly}
          onCheckedChange={(checked) => setRemoteOnly(checked === true)}
        />
        <label htmlFor="remote-filter" className="text-sm cursor-pointer select-none">
          Только удалённая работа
        </label>
      </div>

      {/* Clear */}
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1.5 w-full text-muted-foreground">
          <X className="h-3.5 w-3.5" />
          Сбросить фильтры
        </Button>
      )}
    </div>
  );

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-gradient-to-b from-primary to-primary-dark text-white py-8 md:py-12">
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
            <div>
              <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold uppercase">
                Вакансии
              </h1>
              <p className="text-white/80 text-base mt-1">
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

          {/* Category tabs */}
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const count = tabCounts[tab.key] || 0;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`
                    px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap
                    ${isActive
                      ? "bg-white text-primary shadow-md"
                      : "bg-white/15 text-white/90 hover:bg-white/25"
                    }
                  `}
                >
                  {tab.title}
                  <span className={`ml-1.5 text-xs ${isActive ? "text-primary/60" : "text-white/50"}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-6 md:py-8">
        <div className="container">
          {/* Mobile filter toggle */}
          <div className="md:hidden mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="gap-2 w-full"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Фильтры
              {hasActiveFilters && (
                <Badge variant="default" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs rounded-full">!</Badge>
              )}
            </Button>
            {showMobileFilters && (
              <div className="mt-3 p-4 border rounded-xl bg-card">
                <FilterSidebar />
              </div>
            )}
          </div>

          <div className="flex gap-6">
            {/* Desktop sidebar */}
            <aside className="hidden md:block w-[240px] flex-shrink-0">
              <div className="sticky top-20">
                <FilterSidebar />
              </div>
            </aside>

            {/* Results */}
            <div className="flex-1 min-w-0">
              {/* Summary bar */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Briefcase className="h-4 w-4" />
                  <span>
                    Найдено: <strong className="text-foreground">{filteredJobs.length}</strong>
                  </span>
                </div>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1.5 text-muted-foreground hidden md:flex">
                    <X className="h-3.5 w-3.5" />
                    Сбросить
                  </Button>
                )}
              </div>

              {/* Job list */}
              {loading ? (
                <div className="space-y-3">
                  {[...Array(8)].map((_, i) => (
                    <Skeleton key={i} className="h-24 rounded-xl" />
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
                <div className="space-y-2">
                  {filteredJobs.map((job) => (
                    <JobCardItem key={job.id} job={job} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
