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
import { 
  Search, 
  MapPin, 
  Filter,
  ChevronRight,
  Users,
  CheckCircle,
  Clock
} from "lucide-react";

interface ProfileCard {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  city: string | null;
  country: string | null;
  level: string | null;
  search_status: string | null;
  is_relocatable: boolean;
  is_remote_available: boolean;
  show_name: boolean;
  specialist_roles: { id: string; name: string } | null;
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

export default function Specialists() {
  const [profiles, setProfiles] = useState<ProfileCard[]>([]);
  const [roles, setRoles] = useState<SpecialistRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [selectedLevel, setSelectedLevel] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchProfiles();
  }, [selectedRole, selectedLevel]);

  const fetchData = async () => {
    try {
      const { data: rolesData } = await supabase
        .from("specialist_roles")
        .select("id, name")
        .order("name");

      if (rolesData) setRoles(rolesData);
      await fetchProfiles();
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("profiles")
        .select(`
          id,
          first_name,
          last_name,
          avatar_url,
          city,
          country,
          level,
          search_status,
          is_relocatable,
          is_remote_available,
          show_name,
          specialist_roles (id, name)
        `)
        .eq("is_public", true)
        .order("updated_at", { ascending: false });

      if (selectedRole) {
        query = query.eq("role_id", selectedRole);
      }

      if (selectedLevel && selectedLevel !== "all") {
        query = query.eq("level", selectedLevel as "intern" | "junior" | "middle" | "senior" | "head");
      }

      const { data, error } = await query;

      if (error) throw error;
      setProfiles(data || []);
    } catch (err) {
      console.error("Error fetching profiles:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProfiles = profiles.filter(profile => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const fullName = `${profile.first_name} ${profile.last_name}`.toLowerCase();
    const role = profile.specialist_roles?.name.toLowerCase() || "";
    const location = `${profile.city || ""} ${profile.country || ""}`.toLowerCase();
    return fullName.includes(query) || role.includes(query) || location.includes(query);
  });

  const clearFilters = () => {
    setSelectedRole("");
    setSelectedLevel("");
    setSearchQuery("");
  };

  const hasActiveFilters = selectedRole || selectedLevel || searchQuery;

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-gradient-to-b from-primary to-primary-dark text-white py-12 md:py-16">
        <div className="container">
          <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold uppercase text-center mb-4">
            Банк специалистов
          </h1>
          <p className="text-white/80 text-center text-lg max-w-2xl mx-auto mb-8">
            Найдите лучших профессионалов для вашей команды
          </p>

          {/* Search */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск по имени, роли или городу..."
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
              <>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Специализация" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Все специализации</SelectItem>
                    {roles.map(role => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Уровень" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все уровни</SelectItem>
                    {Object.entries(levelLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            )}

            {hasActiveFilters && (
              <Button variant="ghost" onClick={clearFilters} size="sm">
                Сбросить фильтры
              </Button>
            )}

            <div className="ml-auto flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>Найдено: {filteredProfiles.length}</span>
            </div>
          </div>

          {/* Results Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-2xl" />
              ))}
            </div>
          ) : filteredProfiles.length === 0 ? (
            <div className="text-center py-16">
              <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Специалисты не найдены</h3>
              <p className="text-muted-foreground mb-6">
                Попробуйте изменить параметры поиска
              </p>
              {hasActiveFilters && (
                <Button variant="outline" onClick={clearFilters}>
                  Сбросить фильтры
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProfiles.map(profile => (
                <Link key={profile.id} to={`/profile/${profile.id}`}>
                  <Card className="h-full hover:shadow-lg transition-shadow group">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {profile.show_name !== false && profile.avatar_url ? (
                            <img 
                              src={profile.avatar_url} 
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-xl font-display font-bold text-muted-foreground">
                              {profile.show_name !== false ? `${profile.first_name[0]}${profile.last_name[0]}` : "??"}
                            </span>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg truncate group-hover:text-accent transition-colors">
                            {profile.show_name !== false
                              ? `${profile.first_name} ${profile.last_name}`
                              : (profile.specialist_roles?.name || "Специалист")}
                          </h3>
                          {profile.specialist_roles && profile.show_name !== false && (
                            <p className="text-muted-foreground truncate">
                              {profile.specialist_roles.name}
                            </p>
                          )}
                          {(profile.city || profile.country) && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                              <MapPin className="h-3 w-3" />
                              {[profile.city, profile.country].filter(Boolean).join(", ")}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Badges */}
                      <div className="flex flex-wrap gap-2 mt-4">
                        {profile.search_status === "actively_looking" && (
                          <Badge variant="default" className="text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Ищет работу
                          </Badge>
                        )}
                        {profile.search_status === "open_to_offers" && (
                          <Badge variant="secondary" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            Открыт
                          </Badge>
                        )}
                        {profile.level && (
                          <Badge variant="outline" className="text-xs">
                            {levelLabels[profile.level] || profile.level}
                          </Badge>
                        )}
                        {profile.is_relocatable && (
                          <Badge variant="outline" className="text-xs">
                            Релокация
                          </Badge>
                        )}
                        {profile.is_remote_available && (
                          <Badge variant="outline" className="text-xs">
                            Удалённо
                          </Badge>
                        )}
                      </div>

                      {/* Arrow */}
                      <div className="flex justify-end mt-4">
                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-accent transition-colors" />
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
