import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { 
  Search, 
  MapPin, 
  Filter,
  ChevronRight,
  Briefcase,
  Building2,
  Clock,
  DollarSign,
  Plus,
  ExternalLink
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

export default function Jobs() {
  const { userRole } = useAuth();
  const [jobs, setJobs] = useState<JobCard[]>([]);
  const [roles, setRoles] = useState<SpecialistRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [selectedRole]);

  const fetchData = async () => {
    try {
      const { data: rolesData } = await supabase
        .from("specialist_roles")
        .select("id, name")
        .order("name");

      if (rolesData) setRoles(rolesData);
      await fetchJobs();
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  const fetchJobs = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("jobs")
        .select(`
          id,
          title,
          description,
          city,
          country,
          level,
          contract_type,
          salary_min,
          salary_max,
          salary_currency,
          is_remote,
          created_at,
          external_source,
          external_url,
          companies (id, name, logo_url),
          specialist_roles (id, name)
        `)
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (selectedRole && selectedRole !== "all") {
        query = query.eq("role_id", selectedRole);
      }

      const { data, error } = await query;

      if (error) throw error;
      setJobs(data || []);
    } catch (err) {
      console.error("Error fetching jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter(job => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const title = job.title.toLowerCase();
    const company = job.companies?.name.toLowerCase() || "";
    const role = job.specialist_roles?.name.toLowerCase() || "";
    const location = `${job.city || ""} ${job.country || ""}`.toLowerCase();
    return title.includes(query) || company.includes(query) || role.includes(query) || location.includes(query);
  });

  const clearFilters = () => {
    setSelectedRole("");
    setSearchQuery("");
  };

  const hasActiveFilters = selectedRole || searchQuery;

  const formatSalary = (min: number | null, max: number | null, currency: string | null) => {
    if (!min && !max) return null;
    const curr = currency || "RUB";
    if (min && max) {
      return `${min.toLocaleString()} – ${max.toLocaleString()} ${curr}`;
    }
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

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-gradient-to-b from-primary to-primary-dark text-white py-12 md:py-16">
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold uppercase">
                Вакансии
              </h1>
              <p className="text-white/80 text-lg mt-2">
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
      <section className="py-8 md:py-12">
        <div className="container">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4 mb-8">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              Фильтры
            </Button>

            {showFilters && (
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Специализация" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все специализации</SelectItem>
                  {roles.map(role => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {hasActiveFilters && (
              <Button variant="ghost" onClick={clearFilters} size="sm">
                Сбросить фильтры
              </Button>
            )}

            <div className="ml-auto flex items-center gap-2 text-muted-foreground">
              <Briefcase className="h-4 w-4" />
              <span>Найдено: {filteredJobs.length}</span>
            </div>
          </div>

          {/* Results */}
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-40 rounded-2xl" />
              ))}
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-16">
              <Briefcase className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Вакансии не найдены</h3>
              <p className="text-muted-foreground mb-6">
                {hasActiveFilters 
                  ? "Попробуйте изменить параметры поиска" 
                  : "Пока нет активных вакансий"
                }
              </p>
              {hasActiveFilters && (
                <Button variant="outline" onClick={clearFilters}>
                  Сбросить фильтры
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredJobs.map(job => (
                <Link key={job.id} to={`/jobs/${job.id}`}>
                  <Card className="hover:shadow-lg transition-shadow group">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-start gap-4">
                        {/* Company Logo */}
                        <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {job.companies?.logo_url ? (
                            <img 
                              src={job.companies.logo_url} 
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Building2 className="h-6 w-6 text-muted-foreground" />
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                            <div>
                              <h3 className="font-semibold text-lg group-hover:text-accent transition-colors">
                                {job.title}
                              </h3>
                              {job.companies && (
                                <p className="text-muted-foreground">
                                  {job.companies.name}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              {formatDate(job.created_at)}
                            </div>
                          </div>

                          {/* Tags */}
                          <div className="flex flex-wrap gap-2 mt-3">
                            {job.specialist_roles && (
                              <Badge variant="secondary">
                                {job.specialist_roles.name}
                              </Badge>
                            )}
                            {job.level && (
                              <Badge variant="outline">
                                {levelLabels[job.level] || job.level}
                              </Badge>
                            )}
                            {job.contract_type && (
                              <Badge variant="outline">
                                {contractLabels[job.contract_type] || job.contract_type}
                              </Badge>
                            )}
                            {job.is_remote && (
                              <Badge variant="outline">Удалённо</Badge>
                            )}
                            {job.external_source === "hh" && (
                              <Badge className="bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20">
                                HH
                              </Badge>
                            )}
                          </div>

                          {/* Location & Salary */}
                          <div className="flex flex-wrap items-center gap-4 mt-3 text-sm">
                            {(job.city || job.country) && (
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <MapPin className="h-4 w-4" />
                                {[job.city, job.country].filter(Boolean).join(", ")}
                              </div>
                            )}
                            {formatSalary(job.salary_min, job.salary_max, job.salary_currency) && (
                              <div className="flex items-center gap-1 text-foreground font-medium">
                                <DollarSign className="h-4 w-4" />
                                {formatSalary(job.salary_min, job.salary_max, job.salary_currency)}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Arrow */}
                        <ChevronRight className="h-6 w-6 text-muted-foreground group-hover:text-accent transition-colors hidden md:block" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
