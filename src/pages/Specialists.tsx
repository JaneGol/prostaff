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
import { getSportIcon } from "@/lib/sportIcons";
import { 
  Search, 
  MapPin, 
  Filter,
  ChevronRight,
  Users,
  CheckCircle,
  Clock,
  Trophy,
  Star,
  X
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
  secondary_role_id: string | null;
}

interface SpecialistRole {
  id: string;
  name: string;
}

interface Sport {
  id: string;
  name: string;
  icon: string | null;
}

interface SkillRef {
  id: string;
  name: string;
  category: string | null;
}

interface ProfileSportExp {
  sport_id: string;
  years: number;
  sports: { name: string; icon: string | null } | null;
}

interface ProfileSkillRow {
  profile_id: string;
  skill_id: string | null;
  is_top: boolean;
  custom_name: string | null;
  is_custom: boolean;
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
  const [sports, setSports] = useState<Sport[]>([]);
  const [skills, setSkills] = useState<SkillRef[]>([]);
  const [profileSports, setProfileSports] = useState<Record<string, ProfileSportExp[]>>({});
  const [profileSkills, setProfileSkills] = useState<Record<string, ProfileSkillRow[]>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [selectedLevel, setSelectedLevel] = useState<string>("");
  const [selectedSport, setSelectedSport] = useState<string>("");
  const [selectedSkill, setSelectedSkill] = useState<string>("");
  const [includeSecondaryRole, setIncludeSecondaryRole] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchProfiles();
  }, [selectedRole, selectedLevel, selectedSport, selectedSkill, includeSecondaryRole]);

  const fetchData = async () => {
    try {
      const [rolesRes, sportsRes, skillsRes] = await Promise.all([
        supabase.from("specialist_roles").select("id, name").order("name"),
        supabase.from("sports").select("id, name, icon").eq("is_active", true).order("sort_order"),
        supabase.from("skills").select("id, name, category").order("name"),
      ]);

      if (rolesRes.data) setRoles(rolesRes.data);
      if (sportsRes.data) setSports(sportsRes.data);
      if (skillsRes.data) setSkills(skillsRes.data);
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
          secondary_role_id,
          specialist_roles!profiles_role_id_fkey (id, name)
        `)
        .eq("is_public", true)
        .order("updated_at", { ascending: false });

      // Role filter: match primary OR secondary
      if (selectedRole && selectedRole !== "all") {
        if (includeSecondaryRole) {
          query = query.or(`role_id.eq.${selectedRole},secondary_role_id.eq.${selectedRole}`);
        } else {
          query = query.eq("role_id", selectedRole);
        }
      }

      if (selectedLevel && selectedLevel !== "all") {
        query = query.eq("level", selectedLevel as "intern" | "junior" | "middle" | "senior" | "head");
      }

      const { data, error } = await query;
      if (error) throw error;
      let profilesList = (data || []) as ProfileCard[];

      // Sport filter
      if (selectedSport && selectedSport !== "all") {
        const profileIds = profilesList.map(p => p.id);
        if (profileIds.length > 0) {
          const [expRes, openRes] = await Promise.all([
            supabase.from("profile_sports_experience").select("profile_id").eq("sport_id", selectedSport).in("profile_id", profileIds),
            supabase.from("profile_sports_open_to").select("profile_id").eq("sport_id", selectedSport).in("profile_id", profileIds),
          ]);
          const matchIds = new Set([
            ...(expRes.data || []).map(r => r.profile_id),
            ...(openRes.data || []).map(r => r.profile_id),
          ]);
          profilesList = profilesList.filter(p => matchIds.has(p.id));
        }
      }

      // Skill filter
      if (selectedSkill && selectedSkill !== "all") {
        const profileIds = profilesList.map(p => p.id);
        if (profileIds.length > 0) {
          const { data: skillMatches } = await supabase
            .from("profile_skills")
            .select("profile_id")
            .eq("skill_id", selectedSkill)
            .in("profile_id", profileIds);
          const matchIds = new Set((skillMatches || []).map(r => r.profile_id));
          profilesList = profilesList.filter(p => matchIds.has(p.id));
        }
      }

      setProfiles(profilesList);

      // Fetch sports & top skills for displayed profiles
      const allIds = profilesList.map(p => p.id);
      if (allIds.length > 0) {
        const [sportsData, skillsData] = await Promise.all([
          supabase
            .from("profile_sports_experience")
            .select("profile_id, sport_id, years, sports:sport_id (name, icon)")
            .in("profile_id", allIds)
            .order("years", { ascending: false }),
          supabase
            .from("profile_skills")
            .select("profile_id, skill_id, is_top, custom_name, is_custom")
            .in("profile_id", allIds)
            .eq("is_top", true),
        ]);

        if (sportsData.data) {
          const grouped: Record<string, ProfileSportExp[]> = {};
          for (const s of sportsData.data as any[]) {
            if (!grouped[s.profile_id]) grouped[s.profile_id] = [];
            grouped[s.profile_id].push({ sport_id: s.sport_id, years: s.years, sports: s.sports });
          }
          setProfileSports(grouped);
        }

        if (skillsData.data) {
          const grouped: Record<string, ProfileSkillRow[]> = {};
          for (const s of skillsData.data as any[]) {
            if (!grouped[s.profile_id]) grouped[s.profile_id] = [];
            grouped[s.profile_id].push(s);
          }
          setProfileSkills(grouped);
        }
      } else {
        setProfileSports({});
        setProfileSkills({});
      }
    } catch (err) {
      console.error("Error fetching profiles:", err);
    } finally {
      setLoading(false);
    }
  };

  const getSkillName = (row: ProfileSkillRow) => {
    if (row.is_custom && row.custom_name) return row.custom_name;
    const skill = skills.find(s => s.id === row.skill_id);
    return skill?.name || "—";
  };

  const filteredProfiles = profiles.filter(profile => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const fullName = `${profile.first_name} ${profile.last_name}`.toLowerCase();
    const role = profile.specialist_roles?.name.toLowerCase() || "";
    const location = `${profile.city || ""} ${profile.country || ""}`.toLowerCase();
    return fullName.includes(q) || role.includes(q) || location.includes(q);
  });

  const clearFilters = () => {
    setSelectedRole("all");
    setSelectedLevel("all");
    setSelectedSport("all");
    setSelectedSkill("all");
    setSearchQuery("");
  };

  const hasActiveFilters = (selectedRole && selectedRole !== "all") || (selectedLevel && selectedLevel !== "all") || (selectedSport && selectedSport !== "all") || (selectedSkill && selectedSkill !== "all") || searchQuery;

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
          <div className="flex flex-wrap items-center gap-4 mb-8">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              Фильтры
              {hasActiveFilters && <Badge variant="default" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs rounded-full">!</Badge>}
            </Button>

            {showFilters && (
              <div className="w-full flex flex-wrap items-center gap-3">
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Специализация" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все специализации</SelectItem>
                    {roles.map(role => (
                      <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedRole && selectedRole !== "all" && (
                  <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeSecondaryRole}
                      onChange={(e) => setIncludeSecondaryRole(e.target.checked)}
                      className="rounded border-border"
                    />
                    Включая смежную роль
                  </label>
                )}

                <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Уровень" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все уровни</SelectItem>
                    {Object.entries(levelLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedSport} onValueChange={setSelectedSport}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Вид спорта" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все виды спорта</SelectItem>
                    {sports.map(sport => {
                      const Icon = getSportIcon(sport.icon);
                      return (
                        <SelectItem key={sport.id} value={sport.id}>
                          <span className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            {sport.name}
                          </span>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>

                <Select value={selectedSkill} onValueChange={setSelectedSkill}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Навык" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все навыки</SelectItem>
                    {skills.map(skill => (
                      <SelectItem key={skill.id} value={skill.id}>
                        {skill.name}
                        {skill.category && <span className="text-muted-foreground ml-1 text-xs">({skill.category})</span>}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {hasActiveFilters && (
                  <Button variant="ghost" onClick={clearFilters} size="sm" className="gap-1">
                    <X className="h-3 w-3" />
                    Сбросить
                  </Button>
                )}
              </div>
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
              <p className="text-muted-foreground mb-6">Попробуйте изменить параметры поиска</p>
              {hasActiveFilters && (
                <Button variant="outline" onClick={clearFilters}>Сбросить фильтры</Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProfiles.map(profile => (
                <Link key={profile.id} to={`/profile/${profile.id}`}>
                  <Card className="h-full hover:shadow-lg transition-shadow group">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {profile.show_name !== false && profile.avatar_url ? (
                            <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xl font-display font-bold text-muted-foreground">
                              {profile.show_name !== false ? `${profile.first_name[0]}${profile.last_name[0]}` : "??"}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg truncate group-hover:text-accent transition-colors">
                            {profile.show_name !== false
                              ? `${profile.first_name} ${profile.last_name}`
                              : (profile.specialist_roles?.name || "Специалист")}
                          </h3>
                          {profile.specialist_roles && profile.show_name !== false && (
                            <p className="text-muted-foreground truncate">{profile.specialist_roles.name}</p>
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
                            <CheckCircle className="h-3 w-3 mr-1" />Ищет работу
                          </Badge>
                        )}
                        {profile.search_status === "open_to_offers" && (
                          <Badge variant="secondary" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />Открыт
                          </Badge>
                        )}
                        {profile.level && (
                          <Badge variant="outline" className="text-xs">
                            {levelLabels[profile.level] || profile.level}
                          </Badge>
                        )}
                        {profile.is_relocatable && <Badge variant="outline" className="text-xs">Релокация</Badge>}
                        {profile.is_remote_available && <Badge variant="outline" className="text-xs">Удалённо</Badge>}
                      </div>

                      {/* Top Skills */}
                      {profileSkills[profile.id]?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {profileSkills[profile.id].slice(0, 4).map((s, i) => (
                            <Badge key={i} variant="secondary" className="text-xs flex items-center gap-1 py-0.5">
                              <Star className="h-2.5 w-2.5 text-gold" />
                              {getSkillName(s)}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Sports */}
                      {profileSports[profile.id]?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {profileSports[profile.id].slice(0, 3).map((s) => {
                            const Icon = getSportIcon(s.sports?.icon || null);
                            return (
                              <Badge key={s.sport_id} variant="outline" className="text-xs flex items-center gap-1 py-0.5">
                                <Icon className="h-3 w-3" />
                                {s.sports?.name}
                                <span className="text-muted-foreground">({s.years}г)</span>
                              </Badge>
                            );
                          })}
                          {profileSports[profile.id].length > 3 && (
                            <Badge variant="outline" className="text-xs py-0.5">
                              +{profileSports[profile.id].length - 3}
                            </Badge>
                          )}
                        </div>
                      )}

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
