import { useState, useEffect, useMemo, useRef } from "react";
import { trackEvent } from "@/hooks/useAnalytics";
import { useSearchParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { getSportIcon } from "@/lib/sportIcons";
import { useRoleGroups } from "@/hooks/useRoleGroups";
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
  about_useful: string | null;
}

interface ExperienceSummary {
  count: number;
  latest_position: string | null;
  latest_company: string | null;
  total_years: number;
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

// Mock data for demo — 12 profiles from ProStaff spec
const MOCK_PROFILES: ProfileCard[] = [
  { id: "mock-1", first_name: "", last_name: "", avatar_url: null, city: "Ростов-на-Дону", country: null, level: "middle", search_status: "open_to_offers", is_relocatable: false, is_remote_available: false, show_name: false, specialist_roles: { id: "7ad1271f-af77-49b3-9f85-97517d2813ac", name: "Видеоаналитик" }, secondary_role_id: null, about_useful: "Анализ соперников и подготовка видеоотчётов для тренерского штаба" },
  { id: "mock-2", first_name: "", last_name: "", avatar_url: null, city: "Москва", country: null, level: "senior", search_status: "actively_looking", is_relocatable: true, is_remote_available: false, show_name: false, specialist_roles: { id: "d0983c7c-024e-44ec-86f3-d95a61b82147", name: "Аналитик данных" }, secondary_role_id: null, about_useful: "Помогаю командам принимать решения на основе данных" },
  { id: "mock-3", first_name: "", last_name: "", avatar_url: null, city: "Калининград", country: null, level: "senior", search_status: "not_looking_but_open", is_relocatable: false, is_remote_available: false, show_name: false, specialist_roles: { id: "8521eba5-924a-4257-8d7a-a0f2641b0d29", name: "Главный тренер" }, secondary_role_id: null, about_useful: "Главный тренер с опытом работы в ФНЛ и молодёжных составах" },
  { id: "mock-4", first_name: "", last_name: "", avatar_url: null, city: "Казань", country: null, level: "senior", search_status: "open_to_offers", is_relocatable: false, is_remote_available: false, show_name: false, specialist_roles: { id: "cf311cce-e815-412c-b45e-a2b3f7e32682", name: "Тренер по физической подготовке (команда)" }, secondary_role_id: null, about_useful: "Периодизация силовых программ для профессиональных команд" },
  { id: "mock-5", first_name: "", last_name: "", avatar_url: null, city: "Минск", country: null, level: "middle", search_status: "not_looking_but_open", is_relocatable: false, is_remote_available: false, show_name: false, specialist_roles: { id: "5fa9c98f-326f-421d-8d97-7b2e425e6f67", name: "Физиотерапевт" }, secondary_role_id: null, about_useful: "Спортивная реабилитация и return-to-play протоколы" },
  { id: "mock-6", first_name: "", last_name: "", avatar_url: null, city: "Екатеринбург", country: null, level: "middle", search_status: "actively_looking", is_relocatable: false, is_remote_available: false, show_name: false, specialist_roles: { id: "c46ce72b-92e4-4dd5-9a50-97a852b5a018", name: "Тренер вратарей" }, secondary_role_id: null, about_useful: "Подготовка вратарей от молодёжки до основного состава" },
  { id: "mock-7", first_name: "", last_name: "", avatar_url: null, city: "Москва", country: null, level: "senior", search_status: "open_to_offers", is_relocatable: false, is_remote_available: false, show_name: false, specialist_roles: { id: "e0966a6f-48df-43f2-b0bb-738cb9b51b84", name: "Спортивный врач" }, secondary_role_id: null, about_useful: "Медицинское сопровождение профессиональных команд" },
  { id: "mock-8", first_name: "", last_name: "", avatar_url: null, city: "Казань", country: null, level: "middle", search_status: "open_to_offers", is_relocatable: false, is_remote_available: false, show_name: false, specialist_roles: { id: "c09a18dd-3e92-4e7d-a411-216c5c15ab85", name: "Скаут-аналитик" }, secondary_role_id: null, about_useful: "Скаутинг и оценка игроков для трансферных решений" },
  { id: "mock-9", first_name: "", last_name: "", avatar_url: null, city: "Краснодар", country: null, level: "middle", search_status: "not_looking_but_open", is_relocatable: false, is_remote_available: false, show_name: false, specialist_roles: { id: "273fb6a9-a5d2-4192-8ecf-24c649709b8f", name: "Тренер молодёжных команд" }, secondary_role_id: null, about_useful: "Развитие молодых игроков в академиях профессиональных клубов" },
  { id: "mock-10", first_name: "", last_name: "", avatar_url: null, city: "Новосибирск", country: null, level: "middle", search_status: "actively_looking", is_relocatable: false, is_remote_available: false, show_name: false, specialist_roles: { id: "46f431e4-afea-4e42-87bd-37fa81b226e3", name: "Нутрициолог" }, secondary_role_id: null, about_useful: "Спортивное питание и нутриционная поддержка команд" },
  { id: "mock-11", first_name: "", last_name: "", avatar_url: null, city: "Казань", country: null, level: "junior", search_status: "actively_looking", is_relocatable: true, is_remote_available: true, show_name: false, specialist_roles: { id: "02b6d18f-f8a1-4f3b-814a-b86ae0b924da", name: "Аналитик GPS / Performance" }, secondary_role_id: null, about_useful: "Сбор и анализ GPS-данных для контроля нагрузки" },
  { id: "mock-12", first_name: "", last_name: "", avatar_url: null, city: "Санкт-Петербург", country: null, level: "senior", search_status: "open_to_offers", is_relocatable: false, is_remote_available: false, show_name: false, specialist_roles: { id: "3dc1ef67-39cd-4664-9a56-c48266c59171", name: "Менеджер команды" }, secondary_role_id: null, about_useful: "Организация логистики и административных процессов команды" },
];

const MOCK_SKILLS: Record<string, ProfileSkillRow[]> = {
  "mock-1": [
    { profile_id: "mock-1", skill_id: "s1", is_top: true, custom_name: "Разметка видео", is_custom: true },
    { profile_id: "mock-1", skill_id: "s2", is_top: true, custom_name: "Sportscode", is_custom: true },
    { profile_id: "mock-1", skill_id: "s3", is_top: true, custom_name: "Разбор соперника", is_custom: true },
    { profile_id: "mock-1", skill_id: "s4", is_top: true, custom_name: "Pre-match pack", is_custom: true },
  ],
  "mock-2": [
    { profile_id: "mock-2", skill_id: "s1", is_top: true, custom_name: "Python", is_custom: true },
    { profile_id: "mock-2", skill_id: "s2", is_top: true, custom_name: "Дашборды", is_custom: true },
    { profile_id: "mock-2", skill_id: "s3", is_top: true, custom_name: "SQL", is_custom: true },
    { profile_id: "mock-2", skill_id: "s4", is_top: true, custom_name: "xG/xA-модели", is_custom: true },
  ],
  "mock-3": [
    { profile_id: "mock-3", skill_id: "s1", is_top: true, custom_name: "Игровая модель", is_custom: true },
    { profile_id: "mock-3", skill_id: "s2", is_top: true, custom_name: "Управление штабом", is_custom: true },
    { profile_id: "mock-3", skill_id: "s3", is_top: true, custom_name: "Стратегия сезона", is_custom: true },
    { profile_id: "mock-3", skill_id: "s4", is_top: true, custom_name: "Стандарты", is_custom: true },
  ],
  "mock-4": [
    { profile_id: "mock-4", skill_id: "s1", is_top: true, custom_name: "Периодизация", is_custom: true },
    { profile_id: "mock-4", skill_id: "s2", is_top: true, custom_name: "Контроль нагрузки", is_custom: true },
    { profile_id: "mock-4", skill_id: "s3", is_top: true, custom_name: "GPS-мониторинг", is_custom: true },
    { profile_id: "mock-4", skill_id: "s4", is_top: true, custom_name: "Catapult", is_custom: true },
  ],
  "mock-5": [
    { profile_id: "mock-5", skill_id: "s1", is_top: true, custom_name: "Return-to-play", is_custom: true },
    { profile_id: "mock-5", skill_id: "s2", is_top: true, custom_name: "Мануальная терапия", is_custom: true },
    { profile_id: "mock-5", skill_id: "s3", is_top: true, custom_name: "Тейпирование", is_custom: true },
    { profile_id: "mock-5", skill_id: "s4", is_top: true, custom_name: "Криотерапия", is_custom: true },
  ],
  "mock-6": [
    { profile_id: "mock-6", skill_id: "s1", is_top: true, custom_name: "Предматчевая подготовка", is_custom: true },
    { profile_id: "mock-6", skill_id: "s2", is_top: true, custom_name: "Индивидуальные планы", is_custom: true },
    { profile_id: "mock-6", skill_id: "s3", is_top: true, custom_name: "Анализ матча", is_custom: true },
    { profile_id: "mock-6", skill_id: "s4", is_top: true, custom_name: "Hudl", is_custom: true },
  ],
  "mock-7": [
    { profile_id: "mock-7", skill_id: "s1", is_top: true, custom_name: "Медицинский протокол", is_custom: true },
    { profile_id: "mock-7", skill_id: "s2", is_top: true, custom_name: "Допуск к нагрузке", is_custom: true },
    { profile_id: "mock-7", skill_id: "s3", is_top: true, custom_name: "Травматология", is_custom: true },
    { profile_id: "mock-7", skill_id: "s4", is_top: true, custom_name: "Фармакология", is_custom: true },
  ],
  "mock-8": [
    { profile_id: "mock-8", skill_id: "s1", is_top: true, custom_name: "Wyscout", is_custom: true },
    { profile_id: "mock-8", skill_id: "s2", is_top: true, custom_name: "Оценка потенциала", is_custom: true },
    { profile_id: "mock-8", skill_id: "s3", is_top: true, custom_name: "Шортлисты", is_custom: true },
    { profile_id: "mock-8", skill_id: "s4", is_top: true, custom_name: "Профиль игрока", is_custom: true },
  ],
  "mock-9": [
    { profile_id: "mock-9", skill_id: "s1", is_top: true, custom_name: "Работа с молодёжью", is_custom: true },
    { profile_id: "mock-9", skill_id: "s2", is_top: true, custom_name: "Индивидуальные планы", is_custom: true },
    { profile_id: "mock-9", skill_id: "s3", is_top: true, custom_name: "Психология молодёжи", is_custom: true },
    { profile_id: "mock-9", skill_id: "s4", is_top: true, custom_name: "Развитие академии", is_custom: true },
  ],
  "mock-10": [
    { profile_id: "mock-10", skill_id: "s1", is_top: true, custom_name: "Составление рационов", is_custom: true },
    { profile_id: "mock-10", skill_id: "s2", is_top: true, custom_name: "Гидратация", is_custom: true },
    { profile_id: "mock-10", skill_id: "s3", is_top: true, custom_name: "Контроль веса", is_custom: true },
    { profile_id: "mock-10", skill_id: "s4", is_top: true, custom_name: "Периодизация питания", is_custom: true },
  ],
  "mock-11": [
    { profile_id: "mock-11", skill_id: "s1", is_top: true, custom_name: "Catapult", is_custom: true },
    { profile_id: "mock-11", skill_id: "s2", is_top: true, custom_name: "GPS-мониторинг", is_custom: true },
    { profile_id: "mock-11", skill_id: "s3", is_top: true, custom_name: "ACWR-модели", is_custom: true },
    { profile_id: "mock-11", skill_id: "s4", is_top: true, custom_name: "Контроль утомления", is_custom: true },
  ],
  "mock-12": [
    { profile_id: "mock-12", skill_id: "s1", is_top: true, custom_name: "Логистика", is_custom: true },
    { profile_id: "mock-12", skill_id: "s2", is_top: true, custom_name: "Документооборот", is_custom: true },
    { profile_id: "mock-12", skill_id: "s3", is_top: true, custom_name: "Организация сборов", is_custom: true },
    { profile_id: "mock-12", skill_id: "s4", is_top: true, custom_name: "Бюджетирование", is_custom: true },
  ],
};

const MOCK_SPORTS: Record<string, ProfileSportExp[]> = {
  "mock-1": [{ sport_id: "s1", years: 3, sports: { name: "Футбол", icon: "circle-dot" } }],
  "mock-2": [{ sport_id: "s1", years: 6, sports: { name: "Футбол", icon: "circle-dot" } }],
  "mock-3": [{ sport_id: "s1", years: 12, sports: { name: "Футбол", icon: "circle-dot" } }],
  "mock-4": [{ sport_id: "s2", years: 8, sports: { name: "Хоккей", icon: "snowflake" } }],
  "mock-5": [{ sport_id: "s3", years: 4, sports: { name: "Баскетбол", icon: "target" } }],
  "mock-6": [{ sport_id: "s1", years: 5, sports: { name: "Футбол", icon: "circle-dot" } }],
  "mock-7": [{ sport_id: "s1", years: 10, sports: { name: "Футбол", icon: "circle-dot" } }],
  "mock-8": [{ sport_id: "s1", years: 3, sports: { name: "Футбол", icon: "circle-dot" } }],
  "mock-9": [{ sport_id: "s1", years: 6, sports: { name: "Футбол", icon: "circle-dot" } }],
  "mock-10": [{ sport_id: "s4", years: 4, sports: { name: "Волейбол", icon: "activity" } }],
  "mock-11": [{ sport_id: "s1", years: 1, sports: { name: "Футбол", icon: "circle-dot" } }],
  "mock-12": [{ sport_id: "s1", years: 7, sports: { name: "Футбол", icon: "circle-dot" } }],
};

const MOCK_EXPERIENCE: Record<string, ExperienceSummary> = {
  "mock-1": { count: 1, latest_position: "Видеоаналитик", latest_company: "ФК Ростов", total_years: 3 },
  "mock-2": { count: 2, latest_position: "Аналитик данных", latest_company: "ФК Динамо", total_years: 6 },
  "mock-3": { count: 3, latest_position: "Главный тренер", latest_company: "ФК Балтика", total_years: 12 },
  "mock-4": { count: 2, latest_position: "S&C Coach", latest_company: "ХК СКА", total_years: 8 },
  "mock-5": { count: 1, latest_position: "Физиотерапевт", latest_company: null, total_years: 4 },
  "mock-6": { count: 2, latest_position: "Тренер вратарей", latest_company: "ФК Урал", total_years: 5 },
  "mock-7": { count: 2, latest_position: "Спортивный врач", latest_company: "ПФК ЦСКА", total_years: 10 },
  "mock-8": { count: 1, latest_position: "Скаут-аналитик", latest_company: "ФК Рубин", total_years: 3 },
  "mock-9": { count: 2, latest_position: "Тренер молодёжки", latest_company: "Академия Краснодар", total_years: 6 },
  "mock-10": { count: 1, latest_position: "Нутрициолог", latest_company: null, total_years: 4 },
  "mock-11": { count: 0, latest_position: "GPS-аналитик", latest_company: null, total_years: 1 },
  "mock-12": { count: 2, latest_position: "Менеджер команды", latest_company: "ФК Зенит", total_years: 7 },
};

const STATUS_ORDER: Record<string, number> = { actively_looking: 0, open_to_offers: 1, not_looking_but_open: 2, not_looking: 3 };
const LEVEL_ORDER: Record<string, number> = { intern: 0, junior: 1, middle: 2, senior: 3, head: 4 };

const PRIORITY_CITIES = ["Москва", "Санкт-Петербург", "Казань", "Краснодар", "Екатеринбург", "Новосибирск"];

export default function Specialists() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { groups, roles: availableRoles, getGroupKeyForRoleId, getRolesForGroup } = useRoleGroups();

  const [profiles, setProfiles] = useState<ProfileCard[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [skills, setSkills] = useState<SkillRef[]>([]);
  const [profileSports, setProfileSports] = useState<Record<string, ProfileSportExp[]>>({});
  const [profileSkills, setProfileSkills] = useState<Record<string, ProfileSkillRow[]>>({});
  const [profileExperience, setProfileExperience] = useState<Record<string, ExperienceSummary>>({});
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedSpec, setSelectedSpec] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedSport, setSelectedSport] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Track search queries (debounced)
  const searchTimer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => {
    if (!searchQuery.trim()) return;
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      trackEvent("search_query", "specialists", searchQuery.trim(), undefined, { page: "specialists" });
    }, 1500);
    return () => clearTimeout(searchTimer.current);
  }, [searchQuery]);

  useEffect(() => {
    fetchData();
  }, []);

  // Sync section param to tab
  useEffect(() => {
    const section = searchParams.get("section");
    if (section && groups.some((g) => g.key === section)) {
      setActiveTab(section);
    }
  }, [searchParams]);

  // Reset spec filter when tab changes
  useEffect(() => {
    setSelectedSpec("");
  }, [activeTab]);

  const fetchData = async () => {
    try {
      const [sportsRes, skillsRes] = await Promise.all([
        supabase.from("sports").select("id, name, icon").eq("is_active", true).order("sort_order"),
        supabase.from("skills").select("id, name, category").order("name"),
      ]);
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
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/profile-api?mode=list`,
        { headers }
      );

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const result = await res.json();

      const profilesList = (result.profiles || []) as ProfileCard[];
      // Filter out empty profiles (no role assigned)
      const validProfiles = profilesList.filter(p => p.specialist_roles?.name);
      const mergedProfiles = [...validProfiles, ...MOCK_PROFILES];
      setProfiles(mergedProfiles);

      const serverSports = result.profileSports || {};
      const serverSkills = result.profileSkills || {};
      const serverExperience = result.profileExperience || {};
      setProfileSports({ ...MOCK_SPORTS, ...serverSports });
      setProfileSkills({ ...MOCK_SKILLS, ...serverSkills });
      setProfileExperience({ ...MOCK_EXPERIENCE, ...serverExperience });
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

  // Roles available for current tab
  const rolesForTab = useMemo(() => {
    return getRolesForGroup(activeTab === "all" ? null : activeTab);
  }, [activeTab, availableRoles]);

  // Tab counts
  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = { all: profiles.length };
    groups.forEach((g) => { counts[g.key] = 0; });
    profiles.forEach((p) => {
      const group = getGroupKeyForRoleId(p.specialist_roles?.id || null);
      counts[group] = (counts[group] || 0) + 1;
    });
    return counts;
  }, [profiles, groups, getGroupKeyForRoleId]);

  // Filter profiles
  const filteredProfiles = useMemo(() => {
    let result = [...profiles];

    // Tab filter
    if (activeTab !== "all") {
      result = result.filter((p) => {
        const group = getGroupKeyForRoleId(p.specialist_roles?.id || null);
        return group === activeTab;
      });
    }

    // Role filter
    if (selectedSpec && selectedSpec !== "all") {
      result = result.filter((p) => {
        const roleId = p.specialist_roles?.id;
        return roleId === selectedSpec;
      });
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
  }, [profiles, activeTab, selectedSpec, selectedCity, selectedLevel, selectedSport, searchQuery, displaySports, getGroupKeyForRoleId]);

  const hasActiveFilters = !!(selectedSpec || selectedCity || selectedLevel || selectedSport || searchQuery);

  const clearFilters = () => {
    setSelectedSpec("");
    setSelectedCity("");
    setSelectedLevel("");
    setSelectedSport("");
    setSearchQuery("");
  };

  const tabs = [
    { key: "all", title: "Все" },
    ...groups.map((g) => ({ key: g.key, title: g.title })),
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
          Роль
        </label>
        <Select value={selectedSpec} onValueChange={setSelectedSpec}>
          <SelectTrigger className="h-9 text-sm">
            <SelectValue placeholder="Все роли" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все роли</SelectItem>
            {rolesForTab.map((role) => (
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
        <div className="container max-w-6xl">
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
        <div className="container max-w-6xl">
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
                    const secRoleName = p.secondary_role_id ? availableRoles.find(r => r.id === p.secondary_role_id)?.name || null : null;
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
                        avatarUrl={p.avatar_url}
                        aboutSnippet={p.about_useful}
                        experience={profileExperience[p.id] || null}
                        secondaryRoleName={secRoleName}
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
