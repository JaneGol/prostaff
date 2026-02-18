import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { getSportIcon } from "@/lib/sportIcons";
import { SECTIONS, getSectionForRole } from "@/lib/specialistSections";
import { SpecialistCard } from "@/components/specialists/SpecialistCard";
import {
  Search,
  Users,
  X,
  SlidersHorizontal,
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
  head: "Head",
};

// Mock data for demo
const MOCK_PROFILES: ProfileCard[] = [
  { id: "mock-1", first_name: "", last_name: "", avatar_url: null, city: "Москва", country: "Россия", level: "senior", search_status: "actively_looking", is_relocatable: true, is_remote_available: false, show_name: false, specialist_roles: { id: "b79fbfc7-3c12-44aa-8606-fcba449c9373", name: "Аналитик данных" }, secondary_role_id: null },
  { id: "mock-2", first_name: "", last_name: "", avatar_url: null, city: "Санкт-Петербург", country: "Россия", level: "middle", search_status: "open_to_offers", is_relocatable: false, is_remote_available: true, show_name: false, specialist_roles: { id: "c19b18bc-4521-45b4-8ed7-54aa647cb17f", name: "Видеоаналитик" }, secondary_role_id: null },
  { id: "mock-3", first_name: "", last_name: "", avatar_url: null, city: "Алматы", country: "Казахстан", level: "junior", search_status: "actively_looking", is_relocatable: true, is_remote_available: true, show_name: false, specialist_roles: { id: "362ad39d-e65d-4f79-ab97-0710ff4b40e7", name: "Скаут" }, secondary_role_id: null },
  { id: "mock-4", first_name: "", last_name: "", avatar_url: null, city: "Минск", country: "Беларусь", level: "head", search_status: "open_to_offers", is_relocatable: false, is_remote_available: false, show_name: false, specialist_roles: { id: "e74c6476-9b5f-4ccd-a3b8-03faa2988d46", name: "Главный тренер" }, secondary_role_id: null },
  { id: "mock-5", first_name: "", last_name: "", avatar_url: null, city: "Казань", country: "Россия", level: "middle", search_status: "actively_looking", is_relocatable: false, is_remote_available: true, show_name: false, specialist_roles: { id: "a9620db1-3cf0-4d57-a6bf-28c2961c43e1", name: "S&C специалист" }, secondary_role_id: null },
  { id: "mock-6", first_name: "", last_name: "", avatar_url: null, city: "Краснодар", country: "Россия", level: "senior", search_status: "not_looking", is_relocatable: false, is_remote_available: false, show_name: false, specialist_roles: { id: "98271286-d569-4074-8d96-16dcf258fdcf", name: "Спортивный врач" }, secondary_role_id: null },
  { id: "mock-7", first_name: "", last_name: "", avatar_url: null, city: "Астана", country: "Казахстан", level: "middle", search_status: "actively_looking", is_relocatable: true, is_remote_available: false, show_name: false, specialist_roles: { id: "c7c42a56-6bd1-4080-949a-f7f80e5c5651", name: "Тренер вратарей" }, secondary_role_id: null },
  { id: "mock-8", first_name: "", last_name: "", avatar_url: null, city: "Екатеринбург", country: "Россия", level: "junior", search_status: "open_to_offers", is_relocatable: true, is_remote_available: true, show_name: false, specialist_roles: { id: "2056f7c5-6c00-491f-a298-bec303ff15cf", name: "Нутрициолог" }, secondary_role_id: null },
  { id: "mock-9", first_name: "", last_name: "", avatar_url: null, city: "Сочи", country: "Россия", level: "senior", search_status: "open_to_offers", is_relocatable: false, is_remote_available: false, show_name: false, specialist_roles: { id: "0bd7deb6-adca-4ff7-b83f-ca8ad11758ad", name: "Реабилитолог" }, secondary_role_id: null },
  { id: "mock-10", first_name: "", last_name: "", avatar_url: null, city: "Гомель", country: "Беларусь", level: "middle", search_status: "actively_looking", is_relocatable: true, is_remote_available: true, show_name: false, specialist_roles: { id: "96069546-82b6-4337-9079-a5473e238b3f", name: "Аналитик GPS/отслеживания" }, secondary_role_id: null },
];

const MOCK_SKILLS: Record<string, ProfileSkillRow[]> = {
  "mock-1": [
    { profile_id: "mock-1", skill_id: "s1", is_top: true, custom_name: "Python", is_custom: true },
    { profile_id: "mock-1", skill_id: "s2", is_top: true, custom_name: "Tableau", is_custom: true },
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
  ],
  "mock-10": [
    { profile_id: "mock-10", skill_id: "s1", is_top: true, custom_name: "Catapult", is_custom: true },
    { profile_id: "mock-10", skill_id: "s2", is_top: true, custom_name: "Python", is_custom: true },
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

const STATUS_ORDER: Record<string, number> = { actively_looking: 0, open_to_offers: 1, not_looking_but_open: 2, not_looking: 3 };
const LEVEL_ORDER: Record<string, number> = { intern: 0, junior: 1, middle: 2, senior: 3, head: 4 };

const PRIORITY_CITIES = ["Москва", "Санкт-Петербург", "Казань", "Краснодар", "Екатеринбург", "Новосибирск"];

export default function Specialists() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [profiles, setProfiles] = useState<ProfileCard[]>([]);
  const [roles, setRoles] = useState<SpecialistRole[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [skills, setSkills] = useState<SkillRef[]>([]);
  const [profileSports, setProfileSports] = useState<Record<string, ProfileSportExp[]>>({});
  const [profileSkills, setProfileSkills] = useState<Record<string, ProfileSkillRow[]>>({});
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedSport, setSelectedSport] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  // Sync section param to tab
  useEffect(() => {
    const section = searchParams.get("section");
    if (section && SECTIONS.some((s) => s.key === section)) {
      setActiveTab(section);
    }
  }, [searchParams]);

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
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          id, first_name, last_name, avatar_url, city, country, level,
          search_status, is_relocatable, is_remote_available, show_name,
          secondary_role_id,
          specialist_roles!profiles_role_id_fkey (id, name)
        `)
        .eq("is_public", true)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      const profilesList = (data || []) as ProfileCard[];
      const mergedProfiles = [...profilesList, ...MOCK_PROFILES];
      setProfiles(mergedProfiles);

      // Fetch sports & skills for real profiles
      const realIds = profilesList.map((p) => p.id);
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
          groupedSports[s.profile_id].push(s);
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
    const skill = skills.find((s) => s.id === row.skill_id);
    return skill?.name || "—";
  };

  const displaySkills = { ...MOCK_SKILLS, ...profileSkills };
  const displaySports = { ...MOCK_SPORTS, ...profileSports };

  // Cities for filter
  const cities = useMemo(() => {
    const set = new Set<string>();
    profiles.forEach((p) => { if (p.city) set.add(p.city); });
    const all = Array.from(set);
    const priority = PRIORITY_CITIES.filter((c) => all.includes(c));
    const rest = all.filter((c) => !PRIORITY_CITIES.includes(c)).sort();
    return [...priority, ...rest];
  }, [profiles]);

  // Roles that actually have profiles
  const rolesWithProfiles = useMemo(() => {
    const profileRoleIds = new Set(profiles.map((p) => p.specialist_roles?.id).filter(Boolean));
    return roles.filter((r) => profileRoleIds.has(r.id));
  }, [roles, profiles]);

  // Tab counts
  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = { all: profiles.length };
    SECTIONS.forEach((s) => { counts[s.key] = 0; });
    profiles.forEach((p) => {
      const section = getSectionForRole(p.specialist_roles?.id || null, p.specialist_roles?.name || null);
      counts[section] = (counts[section] || 0) + 1;
    });
    return counts;
  }, [profiles]);

  // Filter profiles
  const filteredProfiles = useMemo(() => {
    let result = [...profiles];

    // Tab filter
    if (activeTab !== "all") {
      result = result.filter((p) => {
        const section = getSectionForRole(p.specialist_roles?.id || null, p.specialist_roles?.name || null);
        return section === activeTab;
      });
    }

    // Role filter
    if (selectedRole && selectedRole !== "all") {
      result = result.filter((p) => p.specialist_roles?.id === selectedRole || p.secondary_role_id === selectedRole);
    }

    // City filter
    if (selectedCity && selectedCity !== "all") {
      result = result.filter((p) => p.city === selectedCity);
    }

    // Level filter
    if (selectedLevel && selectedLevel !== "all") {
      result = result.filter((p) => p.level === selectedLevel);
    }

    // Sport filter
    if (selectedSport && selectedSport !== "all") {
      result = result.filter((p) => {
        const pSports = displaySports[p.id] || [];
        return pSports.some((s) => s.sport_id === selectedSport);
      });
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((p) => {
        const role = p.specialist_roles?.name?.toLowerCase() || "";
        const location = `${p.city || ""} ${p.country || ""}`.toLowerCase();
        return role.includes(q) || location.includes(q);
      });
    }

    // Sort by relevance
    result.sort((a, b) => {
      const sa = STATUS_ORDER[a.search_status || "not_looking"] ?? 3;
      const sb = STATUS_ORDER[b.search_status || "not_looking"] ?? 3;
      if (sa !== sb) return sa - sb;
      const la = LEVEL_ORDER[a.level || ""] ?? -1;
      const lb = LEVEL_ORDER[b.level || ""] ?? -1;
      return lb - la;
    });

    return result;
  }, [profiles, activeTab, selectedRole, selectedCity, selectedLevel, selectedSport, searchQuery, displaySports]);

  const hasActiveFilters = !!(selectedRole || selectedCity || selectedLevel || selectedSport || searchQuery);

  const clearFilters = () => {
    setSelectedRole("");
    setSelectedCity("");
    setSelectedLevel("");
    setSelectedSport("");
    setSearchQuery("");
  };

  const tabs = [
    { key: "all", title: "Все" },
    ...SECTIONS.map((s) => ({ key: s.key, title: s.title })),
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
            {rolesWithProfiles.map((role) => (
              <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Sport */}
      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
          Вид спорта
        </label>
        <Select value={selectedSport} onValueChange={setSelectedSport}>
          <SelectTrigger className="h-9 text-sm">
            <SelectValue placeholder="Все виды спорта" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все виды спорта</SelectItem>
            {sports.map((sport) => {
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
            {cities.map((city) => (
              <SelectItem key={city} value={city}>{city}</SelectItem>
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
          <div className="mb-5">
            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold uppercase">
              Банк специалистов
            </h1>
            <p className="text-white/80 text-base mt-1">
              Найдите лучших профессионалов для вашей команды
            </p>
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
                  <Users className="h-4 w-4" />
                  <span>
                    Найдено: <strong className="text-foreground">{filteredProfiles.length}</strong>
                  </span>
                </div>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1.5 text-muted-foreground hidden md:flex">
                    <X className="h-3.5 w-3.5" />
                    Сбросить
                  </Button>
                )}
              </div>

              {/* Specialist list */}
              {loading ? (
                <div className="space-y-3">
                  {[...Array(8)].map((_, i) => (
                    <Skeleton key={i} className="h-[140px] rounded-xl" />
                  ))}
                </div>
              ) : filteredProfiles.length === 0 ? (
                <div className="text-center py-16">
                  <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Специалисты не найдены</h3>
                  <p className="text-muted-foreground mb-6">
                    {hasActiveFilters
                      ? "Попробуйте изменить параметры поиска"
                      : "Пока нет специалистов в базе"}
                  </p>
                  {hasActiveFilters && (
                    <Button variant="outline" onClick={clearFilters}>Сбросить фильтры</Button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredProfiles.map((p) => {
                    const pSkills = (displaySkills[p.id] || []).map((s) => ({ name: getSkillName(s) }));
                    const pSports = displaySports[p.id] || [];
                    return (
                      <SpecialistCard
                        key={p.id}
                        id={p.id}
                        roleName={p.specialist_roles?.name || null}
                        level={p.level}
                        city={p.city}
                        country={p.country}
                        searchStatus={p.search_status}
                        isRelocatable={p.is_relocatable}
                        isRemoteAvailable={p.is_remote_available}
                        skills={pSkills}
                        sports={pSports}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
