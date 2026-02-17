import { useState, useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { getSportIcon } from "@/lib/sportIcons";
import { SECTIONS, getSectionForRole } from "@/lib/specialistSections";
import { SpecialistSection, type SectionProfile } from "@/components/specialists/SpecialistSection";
import { SpecialistCard } from "@/components/specialists/SpecialistCard";
import {
  Search,
  MapPin,
  Filter,
  ChevronRight,
  Users,
  ArrowUpDown,
  X,
  ArrowLeft,
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

type SortOption = "relevance" | "level_desc" | "level_asc";
const SORT_LABELS: Record<SortOption, string> = {
  relevance: "По релевантности",
  level_desc: "Уровень ↓",
  level_asc: "Уровень ↑",
};
const LEVEL_ORDER: Record<string, number> = { intern: 0, junior: 1, middle: 2, senior: 3, head: 4 };
const STATUS_ORDER: Record<string, number> = { actively_looking: 0, open_to_offers: 1, not_looking_but_open: 2, not_looking: 3 };

function sortByRelevance(a: ProfileCard, b: ProfileCard): number {
  const sa = STATUS_ORDER[a.search_status || "not_looking"] ?? 3;
  const sb = STATUS_ORDER[b.search_status || "not_looking"] ?? 3;
  if (sa !== sb) return sa - sb;
  const la = LEVEL_ORDER[a.level || ""] ?? -1;
  const lb = LEVEL_ORDER[b.level || ""] ?? -1;
  return lb - la;
}

export default function Specialists() {
  const [searchParams, setSearchParams] = useSearchParams();
  const sectionFilter = searchParams.get("section");

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

  // Determine view mode: showcase (default) vs list (search/filter/section active)
  const isListMode = !!(
    sectionFilter ||
    searchQuery.trim() ||
    (selectedRole && selectedRole !== "all") ||
    (selectedLevel && selectedLevel !== "all") ||
    (selectedSport && selectedSport !== "all") ||
    (selectedSkill && selectedSkill !== "all")
  );

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
          id, first_name, last_name, avatar_url, city, country, level,
          search_status, is_relocatable, is_remote_available, show_name,
          secondary_role_id,
          specialist_roles!profiles_role_id_fkey (id, name)
        `)
        .eq("is_public", true)
        .order("updated_at", { ascending: false });

      if (selectedRole && selectedRole !== "all") {
        if (includeSecondaryRole) {
          query = query.or(`role_id.eq.${selectedRole},secondary_role_id.eq.${selectedRole}`);
        } else {
          query = query.eq("role_id", selectedRole);
        }
      }
      if (selectedLevel && selectedLevel !== "all") {
        query = query.eq("level", selectedLevel as any);
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
            .from("profile_skills").select("profile_id")
            .eq("skill_id", selectedSkill).in("profile_id", profileIds);
          const matchIds = new Set((skillMatches || []).map(r => r.profile_id));
          profilesList = profilesList.filter(p => matchIds.has(p.id));
        }
      }

      // Apply same filters to mock profiles
      let filteredMocks = [...MOCK_PROFILES];
      if (selectedRole && selectedRole !== "all") {
        if (includeSecondaryRole) {
          filteredMocks = filteredMocks.filter(p => p.specialist_roles?.id === selectedRole || p.secondary_role_id === selectedRole);
        } else {
          filteredMocks = filteredMocks.filter(p => p.specialist_roles?.id === selectedRole);
        }
      }
      if (selectedLevel && selectedLevel !== "all") {
        filteredMocks = filteredMocks.filter(p => p.level === selectedLevel);
      }
      if (selectedSport && selectedSport !== "all") {
        filteredMocks = filteredMocks.filter(p => {
          const mockSports = MOCK_SPORTS[p.id] || [];
          return mockSports.some(s => s.sport_id === selectedSport);
        });
      }
      if (selectedSkill && selectedSkill !== "all") {
        filteredMocks = filteredMocks.filter(p => {
          const mockSkillRows = MOCK_SKILLS[p.id] || [];
          return mockSkillRows.some(s => s.skill_id === selectedSkill || s.custom_name?.toLowerCase() === skills.find(sk => sk.id === selectedSkill)?.name?.toLowerCase());
        });
      }
      const mergedProfiles = [...profilesList, ...filteredMocks];
      setProfiles(mergedProfiles);

      // Fetch sports & skills
      const realIds = profilesList.map(p => p.id);
      if (realIds.length > 0) {
        const [sportsData, skillsData] = await Promise.all([
          supabase.from("profile_sports_experience")
            .select("profile_id, sport_id, years, sports:sport_id (name, icon)")
            .in("profile_id", realIds).order("years", { ascending: false }),
          supabase.from("profile_skills")
            .select("profile_id, skill_id, is_top, custom_name, is_custom")
            .in("profile_id", realIds).eq("is_top", true),
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
    const skill = skills.find(s => s.id === row.skill_id);
    return skill?.name || "—";
  };

  const displaySkills = { ...MOCK_SKILLS, ...profileSkills };
  const displaySports = { ...MOCK_SPORTS, ...profileSports };

  // Convert profile to SectionProfile format
  const toSectionProfile = (p: ProfileCard): SectionProfile => ({
    id: p.id,
    roleName: p.specialist_roles?.name || null,
    level: p.level,
    city: p.city,
    country: p.country,
    searchStatus: p.search_status,
    isRelocatable: p.is_relocatable,
    isRemoteAvailable: p.is_remote_available,
    skills: (displaySkills[p.id] || []).map(s => ({ name: getSkillName(s) })),
    sports: displaySports[p.id] || [],
  });

  // Group profiles by section
  const sectionData = useMemo(() => {
    const sorted = [...profiles].sort(sortByRelevance);
    return SECTIONS.map((section) => {
      const sectionProfiles = sorted.filter((p) => {
        const roleId = p.specialist_roles?.id || null;
        const roleName = p.specialist_roles?.name || null;
        const sKey = getSectionForRole(roleId, roleName);
        return sKey === section.key;
      });
      return {
        ...section,
        profiles: sectionProfiles.map(toSectionProfile),
        totalCount: sectionProfiles.length,
      };
    }).filter(s => s.totalCount > 0);
  }, [profiles, displaySkills, displaySports, skills]);

  // List mode: filtered + searched profiles
  const listProfiles = useMemo(() => {
    let result = [...profiles];

    // Section filter from URL
    if (sectionFilter) {
      const section = SECTIONS.find(s => s.key === sectionFilter);
      if (section) {
        result = result.filter(p => {
          const roleId = p.specialist_roles?.id || null;
          const roleName = p.specialist_roles?.name || null;
          return getSectionForRole(roleId, roleName) === sectionFilter;
        });
      }
    }

    // Text search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => {
        const role = p.specialist_roles?.name?.toLowerCase() || "";
        const location = `${p.city || ""} ${p.country || ""}`.toLowerCase();
        return role.includes(q) || location.includes(q);
      });
    }

    // Sort
    if (sortBy === "relevance") result.sort(sortByRelevance);
    else if (sortBy === "level_desc") result.sort((a, b) => (LEVEL_ORDER[b.level || ""] ?? -1) - (LEVEL_ORDER[a.level || ""] ?? -1));
    else if (sortBy === "level_asc") result.sort((a, b) => (LEVEL_ORDER[a.level || ""] ?? -1) - (LEVEL_ORDER[b.level || ""] ?? -1));

    return result;
  }, [profiles, searchQuery, sortBy, sectionFilter]);

  const clearFilters = () => {
    setSelectedRole("all");
    setSelectedLevel("all");
    setSelectedSport("all");
    setSelectedSkill("all");
    setSearchQuery("");
    setSearchParams({});
  };

  const hasActiveFilters = !!(
    sectionFilter ||
    (selectedRole && selectedRole !== "all") ||
    (selectedLevel && selectedLevel !== "all") ||
    (selectedSport && selectedSport !== "all") ||
    (selectedSkill && selectedSkill !== "all") ||
    searchQuery
  );

  const sectionTitle = sectionFilter
    ? SECTIONS.find(s => s.key === sectionFilter)?.title || "Специалисты"
    : null;

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-gradient-to-b from-primary to-primary-dark text-white py-10 md:py-14">
        <div className="container">
          <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold uppercase text-center mb-3">
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
                placeholder="Поиск по роли или городу..."
                className="pl-12 h-14 text-lg bg-white border-0"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-8 md:py-12">
        <div className="container">
          {/* Toolbar: filters, sort, count */}
          <div className="flex flex-wrap items-center gap-4 mb-8">
            {/* Back to showcase from section filter */}
            {sectionFilter && (
              <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => setSearchParams({})}>
                <ArrowLeft className="h-4 w-4" />
                Все направления
              </Button>
            )}

            <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="gap-2">
              <Filter className="h-4 w-4" />
              Фильтры
              {hasActiveFilters && (
                <Badge variant="default" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs rounded-full">!</Badge>
              )}
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
              {isListMode && (
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
              )}
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Users className="h-4 w-4" />
                <span>Найдено: {isListMode ? listProfiles.length : profiles.length}</span>
              </div>
            </div>
          </div>

          {/* Loading state */}
          {loading ? (
            <div className="space-y-12">
              {[1, 2, 3].map(i => (
                <div key={i}>
                  <Skeleton className="h-7 w-56 mb-6" />
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map(j => (
                      <Skeleton key={j} className="h-48 rounded-lg" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : isListMode ? (
            /* ======== LIST MODE ======== */
            <>
              {sectionTitle && (
                <h2 className="font-display text-xl md:text-2xl font-semibold text-foreground mb-6">
                  {sectionTitle}
                </h2>
              )}
              {listProfiles.length === 0 ? (
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
                  {listProfiles.map(p => (
                    <SpecialistCard key={p.id} {...toSectionProfile(p)} />
                  ))}
                </div>
              )}
            </>
          ) : (
            /* ======== SHOWCASE MODE ======== */
            <div className="space-y-4">
              {sectionData.length === 0 ? (
                <div className="text-center py-16">
                  <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Пока нет специалистов</h3>
                  <p className="text-muted-foreground">Скоро здесь появятся профили</p>
                </div>
              ) : (
                sectionData.map((section) => (
                  <SpecialistSection
                    key={section.key}
                    title={section.title}
                    sectionKey={section.key}
                    profiles={section.profiles}
                    totalCount={section.totalCount}
                  />
                ))
              )}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
