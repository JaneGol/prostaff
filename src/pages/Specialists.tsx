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
  Trophy,
  Monitor,
  ArrowUpDown,
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

// Mock data for demo when no real profiles exist
const MOCK_PROFILES: ProfileCard[] = [
  { id: "mock-1", first_name: "", last_name: "", avatar_url: null, city: "Москва", country: "Россия", level: "senior", search_status: "actively_looking", is_relocatable: true, is_remote_available: false, show_name: false, specialist_roles: { id: "1", name: "Аналитик данных" }, secondary_role_id: null },
  { id: "mock-2", first_name: "", last_name: "", avatar_url: null, city: "Санкт-Петербург", country: "Россия", level: "middle", search_status: "open_to_offers", is_relocatable: false, is_remote_available: true, show_name: false, specialist_roles: { id: "2", name: "Видеоаналитик" }, secondary_role_id: null },
  { id: "mock-3", first_name: "", last_name: "", avatar_url: null, city: "Алматы", country: "Казахстан", level: "junior", search_status: "actively_looking", is_relocatable: true, is_remote_available: true, show_name: false, specialist_roles: { id: "3", name: "Скаут" }, secondary_role_id: null },
  { id: "mock-4", first_name: "", last_name: "", avatar_url: null, city: "Минск", country: "Беларусь", level: "head", search_status: "open_to_offers", is_relocatable: false, is_remote_available: false, show_name: false, specialist_roles: { id: "4", name: "Главный тренер" }, secondary_role_id: null },
  { id: "mock-5", first_name: "", last_name: "", avatar_url: null, city: "Казань", country: "Россия", level: "middle", search_status: "actively_looking", is_relocatable: false, is_remote_available: true, show_name: false, specialist_roles: { id: "5", name: "S&C специалист" }, secondary_role_id: null },
  { id: "mock-6", first_name: "", last_name: "", avatar_url: null, city: "Краснодар", country: "Россия", level: "senior", search_status: "not_looking", is_relocatable: false, is_remote_available: false, show_name: false, specialist_roles: { id: "6", name: "Спортивный врач" }, secondary_role_id: null },
  { id: "mock-7", first_name: "", last_name: "", avatar_url: null, city: "Астана", country: "Казахстан", level: "middle", search_status: "actively_looking", is_relocatable: true, is_remote_available: false, show_name: false, specialist_roles: { id: "7", name: "Тренер вратарей" }, secondary_role_id: null },
  { id: "mock-8", first_name: "", last_name: "", avatar_url: null, city: "Екатеринбург", country: "Россия", level: "junior", search_status: "open_to_offers", is_relocatable: true, is_remote_available: true, show_name: false, specialist_roles: { id: "8", name: "Нутрициолог" }, secondary_role_id: null },
  { id: "mock-9", first_name: "", last_name: "", avatar_url: null, city: "Сочи", country: "Россия", level: "senior", search_status: "open_to_offers", is_relocatable: false, is_remote_available: false, show_name: false, specialist_roles: { id: "9", name: "Реабилитолог" }, secondary_role_id: null },
  { id: "mock-10", first_name: "", last_name: "", avatar_url: null, city: "Гомель", country: "Беларусь", level: "middle", search_status: "actively_looking", is_relocatable: true, is_remote_available: true, show_name: false, specialist_roles: { id: "10", name: "Аналитик GPS/отслеживания" }, secondary_role_id: null },
];

const MOCK_SKILLS: Record<string, ProfileSkillRow[]> = {
  "mock-1": [
    { profile_id: "mock-1", skill_id: "s1", is_top: true, custom_name: "Python", is_custom: true },
    { profile_id: "mock-1", skill_id: "s2", is_top: true, custom_name: "Tableau", is_custom: true },
    { profile_id: "mock-1", skill_id: "s3", is_top: true, custom_name: "SQL", is_custom: true },
  ],
  "mock-2": [
    { profile_id: "mock-2", skill_id: "s1", is_top: true, custom_name: "Hudl", is_custom: true },
    { profile_id: "mock-2", skill_id: "s2", is_top: true, custom_name: "Sportscode", is_custom: true },
  ],
  "mock-3": [
    { profile_id: "mock-3", skill_id: "s1", is_top: true, custom_name: "Wyscout", is_custom: true },
    { profile_id: "mock-3", skill_id: "s2", is_top: true, custom_name: "InStat", is_custom: true },
  ],
  "mock-5": [
    { profile_id: "mock-5", skill_id: "s1", is_top: true, custom_name: "Catapult", is_custom: true },
    { profile_id: "mock-5", skill_id: "s2", is_top: true, custom_name: "Polar", is_custom: true },
    { profile_id: "mock-5", skill_id: "s3", is_top: true, custom_name: "STATSports", is_custom: true },
  ],
  "mock-8": [
    { profile_id: "mock-8", skill_id: "s1", is_top: true, custom_name: "Спортивное питание", is_custom: true },
  ],
  "mock-10": [
    { profile_id: "mock-10", skill_id: "s1", is_top: true, custom_name: "Catapult", is_custom: true },
    { profile_id: "mock-10", skill_id: "s2", is_top: true, custom_name: "Kinexon", is_custom: true },
    { profile_id: "mock-10", skill_id: "s3", is_top: true, custom_name: "Python", is_custom: true },
    { profile_id: "mock-10", skill_id: "s4", is_top: true, custom_name: "R", is_custom: true },
  ],
};

const MOCK_SPORTS: Record<string, ProfileSportExp[]> = {
  "mock-1": [{ sport_id: "s1", years: 5, sports: { name: "Футбол", icon: "circle-dot" } }],
  "mock-2": [{ sport_id: "s1", years: 3, sports: { name: "Футбол", icon: "circle-dot" } }, { sport_id: "s2", years: 1, sports: { name: "Хоккей", icon: "snowflake" } }],
  "mock-3": [{ sport_id: "s1", years: 2, sports: { name: "Футбол", icon: "circle-dot" } }],
  "mock-4": [{ sport_id: "s1", years: 15, sports: { name: "Футбол", icon: "circle-dot" } }],
  "mock-5": [{ sport_id: "s1", years: 4, sports: { name: "Футбол", icon: "circle-dot" } }, { sport_id: "s3", years: 2, sports: { name: "Баскетбол", icon: "target" } }],
  "mock-7": [{ sport_id: "s1", years: 8, sports: { name: "Футбол", icon: "circle-dot" } }],
  "mock-9": [{ sport_id: "s1", years: 7, sports: { name: "Футбол", icon: "circle-dot" } }, { sport_id: "s4", years: 3, sports: { name: "Волейбол", icon: "activity" } }],
  "mock-10": [{ sport_id: "s1", years: 3, sports: { name: "Футбол", icon: "circle-dot" } }, { sport_id: "s2", years: 2, sports: { name: "Хоккей", icon: "snowflake" } }],
};

type SortOption = "relevance" | "level_desc" | "level_asc";
const SORT_LABELS: Record<SortOption, string> = {
  relevance: "По релевантности",
  level_desc: "Уровень ↓",
  level_asc: "Уровень ↑",
};
const LEVEL_ORDER: Record<string, number> = { intern: 0, junior: 1, middle: 2, senior: 3, head: 4 };

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
  const [sortBy, setSortBy] = useState<SortOption>("relevance");

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

      // Always include mock profiles for demo
      const mergedProfiles = [...profilesList, ...MOCK_PROFILES];
      setProfiles(mergedProfiles);

      // Fetch sports & top skills for real profiles
      const realIds = profilesList.map(p => p.id);
      if (realIds.length > 0) {
        const [sportsData, skillsData] = await Promise.all([
          supabase
            .from("profile_sports_experience")
            .select("profile_id, sport_id, years, sports:sport_id (name, icon)")
            .in("profile_id", realIds)
            .order("years", { ascending: false }),
          supabase
            .from("profile_skills")
            .select("profile_id, skill_id, is_top, custom_name, is_custom")
            .in("profile_id", realIds)
            .eq("is_top", true),
        ]);

        const groupedSports: Record<string, ProfileSportExp[]> = {};
        for (const s of (sportsData.data || []) as any[]) {
          if (!groupedSports[s.profile_id]) groupedSports[s.profile_id] = [];
          groupedSports[s.profile_id].push({ sport_id: s.sport_id, years: s.years, sports: s.sports });
        }

        const groupedSkills: Record<string, ProfileSkillRow[]> = {};
        for (const s of (skillsData.data || []) as any[]) {
          if (!groupedSkills[s.profile_id]) groupedSkills[s.profile_id] = [];
          groupedSkills[s.profile_id].push(s);
        }

        setProfileSports({ ...MOCK_SPORTS, ...groupedSports });
        setProfileSkills({ ...MOCK_SKILLS, ...groupedSkills });
      } else {
        setProfileSports(MOCK_SPORTS);
        setProfileSkills(MOCK_SKILLS);
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

  // Merge real + mock skills/sports for display
  const displaySkills = { ...MOCK_SKILLS, ...profileSkills };
  const displaySports = { ...MOCK_SPORTS, ...profileSports };

  const filteredProfiles = profiles.filter(profile => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const fullName = `${profile.first_name} ${profile.last_name}`.toLowerCase();
    const role = profile.specialist_roles?.name.toLowerCase() || "";
    const location = `${profile.city || ""} ${profile.country || ""}`.toLowerCase();
    return fullName.includes(q) || role.includes(q) || location.includes(q);
  });

  const sortedProfiles = [...filteredProfiles].sort((a, b) => {
    if (sortBy === "level_desc") return (LEVEL_ORDER[b.level || ""] ?? -1) - (LEVEL_ORDER[a.level || ""] ?? -1);
    if (sortBy === "level_asc") return (LEVEL_ORDER[a.level || ""] ?? -1) - (LEVEL_ORDER[b.level || ""] ?? -1);
    return 0;
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

            <div className="ml-auto flex items-center gap-3">
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                <SelectTrigger className="w-[180px] h-9 text-sm">
                  <ArrowUpDown className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(SORT_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Users className="h-4 w-4" />
                <span>Найдено: {sortedProfiles.length}</span>
              </div>
            </div>
          </div>

          {/* Results Grid */}
          {loading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-56 rounded-lg" />
              ))}
            </div>
          ) : sortedProfiles.length === 0 ? (
            <div className="text-center py-16">
              <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Специалисты не найдены</h3>
              <p className="text-muted-foreground mb-6">Попробуйте изменить параметры поиска</p>
              {hasActiveFilters && (
                <Button variant="outline" onClick={clearFilters}>Сбросить фильтры</Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedProfiles.map(profile => {
                const isActive = profile.search_status === "actively_looking";
                const isOpen = profile.search_status === "open_to_offers";
                const statusLabel = isActive ? "Ищет работу" : isOpen ? "Открыт к предложениям" : null;

                return (
                  <Link key={profile.id} to={`/profile/${profile.id}`}>
                    <Card className="h-full rounded-lg border border-border hover:border-primary/40 hover:shadow-card-hover transition-all group overflow-hidden">
                      {/* Thin status strip — brand colors only */}
                      <div className={`h-1 ${isActive ? "bg-primary" : isOpen ? "bg-primary/40" : "bg-border"}`} />

                      <CardContent className="p-4">
                        {/* Header: role + level inline */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="font-display font-semibold text-base leading-snug group-hover:text-primary transition-colors">
                            {profile.specialist_roles?.name || "Специалист"}
                          </h3>
                          {profile.level && (
                            <span className="text-xs font-medium text-primary bg-primary/8 px-2 py-0.5 rounded-sm whitespace-nowrap">
                              {levelLabels[profile.level] || profile.level}
                            </span>
                          )}
                        </div>

                        {/* Location line */}
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
                          {(profile.city || profile.country) && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" />
                              {[profile.city, profile.country].filter(Boolean).join(", ")}
                            </span>
                          )}
                          {profile.is_relocatable && (
                            <span className="flex items-center gap-0.5 text-xs">
                              <Trophy className="h-3 w-3" />Релок.
                            </span>
                          )}
                          {profile.is_remote_available && (
                            <span className="flex items-center gap-0.5 text-xs">
                              <Monitor className="h-3 w-3" />Удал.
                            </span>
                          )}
                        </div>

                        {/* Status — subtle text, not a loud badge */}
                        {statusLabel && (
                          <div className="flex items-center gap-1.5 mb-3">
                            <span className={`h-2 w-2 rounded-full ${isActive ? "bg-primary" : "bg-primary/40"}`} />
                            <span className="text-xs text-muted-foreground">{statusLabel}</span>
                          </div>
                        )}

                        {/* Skills — inline text, no heavy badges */}
                        {displaySkills[profile.id]?.length > 0 && (
                          <div className="text-xs text-foreground/80 mb-2">
                            {displaySkills[profile.id].slice(0, 3).map((s, i) => (
                              <span key={i}>
                                {i > 0 && <span className="text-border mx-1">·</span>}
                                {getSkillName(s)}
                              </span>
                            ))}
                            {displaySkills[profile.id].length > 3 && (
                              <span className="text-muted-foreground ml-1">+{displaySkills[profile.id].length - 3}</span>
                            )}
                          </div>
                        )}

                        {/* Sports — compact inline */}
                        {displaySports[profile.id]?.length > 0 && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {displaySports[profile.id].slice(0, 3).map((s) => {
                              const Icon = getSportIcon(s.sports?.icon || null);
                              return (
                                <span key={s.sport_id} className="flex items-center gap-1">
                                  <Icon className="h-3 w-3" />
                                  {s.sports?.name}
                                  <span className="opacity-60">{s.years}г</span>
                                </span>
                              );
                            })}
                          </div>
                        )}

                        {/* Subtle arrow */}
                        <div className="flex justify-end mt-2">
                          <ChevronRight className="h-4 w-4 text-border group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
