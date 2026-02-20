import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, X, Users, Activity, BarChart3, HeartPulse, Briefcase, ChevronDown, Check, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ImageUpload } from "@/components/shared/ImageUpload";
import { AvatarBankPicker } from "@/components/shared/AvatarBankPicker";
import { isBankAvatar, decodeBankAvatar } from "@/lib/defaultAvatars";
import { GROUPS } from "@/lib/specialistSections";
import { ProfileProgress } from "@/components/shared/ProfileProgress";
import { ProfileSidebar } from "@/components/profile/ProfileSidebar";
import { SportsEditor, SportExperience, SportOpenTo } from "@/components/profile/SportsEditor";
import { SkillsEditor, SkillSelection } from "@/components/profile/SkillsEditor";
import { ExperienceEditor, Experience } from "@/components/profile/ExperienceEditor";
import { EducationEditor, Education, Certificate } from "@/components/profile/EducationEditor";
import { PortfolioEditor, PortfolioItem } from "@/components/profile/PortfolioEditor";
import { AboutEditor } from "@/components/profile/AboutEditor";

// --- Shared label classNames for consistent typography ---
const LABEL = "text-[13px] font-medium text-muted-foreground";
const HINT = "text-[12px] text-muted-foreground/60";
const SECTION_TITLE = "text-[16px] font-semibold text-foreground";
const SUB_TITLE = "text-[13px] font-medium text-muted-foreground";
const FIELD_TEXT = "text-[14px]";

interface SpecialistRole {
  id: string;
  name: string;
  specialization_id: string | null;
}

interface SpecializationOption {
  id: string;
  name: string;
  group_key: string;
}

interface Skill {
  id: string;
  name: string;
  category: string | null;
}

interface SportOption {
  id: string;
  name: string;
  icon: string | null;
}

const levels = [
  { value: "intern", label: "Стажёр", desc: "Обучение, помощь старшим специалистам" },
  { value: "junior", label: "Junior", desc: "Начальный опыт, выполнение задач по заданию" },
  { value: "middle", label: "Middle", desc: "Самостоятельная работа, ответственность за результат" },
  { value: "senior", label: "Senior", desc: "Эксперт, принятие решений, наставничество" },
  { value: "head", label: "Head", desc: "Руководство направлением или командой" }
];

const searchStatuses = [
  { value: "actively_looking", label: "Активно ищу работу" },
  { value: "open_to_offers", label: "Открыт к предложениям" },
  { value: "not_looking_but_open", label: "Не ищу, но готов рассмотреть топ-роль" },
  { value: "not_looking", label: "Не ищу работу" }
];

const visibilityLevels = [
  { value: "public_preview", label: "Публичное превью (роль, навыки, опыт без деталей)" },
  { value: "clubs_only", label: "Только для зарегистрированных клубов" },
  { value: "hidden", label: "Скрытый (только по прямой ссылке)" },
];

export default function ProfileEdit() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingSection, setSavingSection] = useState<string | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState("basic");

  // Basic info
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [specializationId, setSpecializationId] = useState("");
  const [selectedGroupKey, setSelectedGroupKey] = useState("");
  const [roleId, setRoleId] = useState("");
  const [secondaryRoleId, setSecondaryRoleId] = useState("");
  const [secondarySpecializationId, setSecondarySpecializationId] = useState("");
  const [level, setLevel] = useState("middle");
  const [avatarUrl, setAvatarUrl] = useState("");

  // About
  const [bio, setBio] = useState("");
  const [aboutUseful, setAboutUseful] = useState("");
  const [aboutStyle, setAboutStyle] = useState("");
  const [aboutGoals, setAboutGoals] = useState("");

  // Location & Status
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("Россия");
  const [isRelocatable, setIsRelocatable] = useState(false);
  const [isRemoteAvailable, setIsRemoteAvailable] = useState(false);
  const [searchStatus, setSearchStatus] = useState("open_to_offers");
  const [desiredCity, setDesiredCity] = useState("");
  const [desiredCountry, setDesiredCountry] = useState("");
  const [desiredContractType, setDesiredContractType] = useState("");

  // Privacy
  const [isPublic, setIsPublic] = useState(true);
  const [visibilityLevel, setVisibilityLevel] = useState("public_preview");
  const [showName, setShowName] = useState(true);
  const [showContacts, setShowContacts] = useState(true);
  const [hideCurrentOrg, setHideCurrentOrg] = useState(false);

  // Contacts
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [telegram, setTelegram] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");

  // Reference data
  const [roles, setRoles] = useState<SpecialistRole[]>([]);
  const [specializations, setSpecializations] = useState<SpecializationOption[]>([]);
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [allowedSecondaryRoles, setAllowedSecondaryRoles] = useState<string[]>([]);
  const [allSports, setAllSports] = useState<SportOption[]>([]);
  const [selectedSportIds, setSelectedSportIds] = useState<string[]>([]);

  // Complex fields
  const [selectedSkills, setSelectedSkills] = useState<SkillSelection[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [sportsExperience, setSportsExperience] = useState<SportExperience[]>([]);
  const [sportsOpenTo, setSportsOpenTo] = useState<SportOpenTo[]>([]);

  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }
    if (user) fetchData();
  }, [user, authLoading]);

  const fetchData = async () => {
    try {
      const [rolesRes, skillsRes, specsRes, sportsRes] = await Promise.all([
        supabase.from("specialist_roles").select("id, name, specialization_id").order("name"),
        supabase.from("skills").select("id, name, category").order("name"),
        supabase.from("specializations").select("id, name, group_key").order("sort_order"),
        supabase.from("sports").select("id, name, icon").eq("is_active", true).order("sort_order"),
      ]);

      if (rolesRes.data) setRoles(rolesRes.data);
      if (skillsRes.data) setAllSkills(skillsRes.data);
      if (specsRes.data) setSpecializations(specsRes.data);
      if (sportsRes.data) setAllSports(sportsRes.data);

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();

      if (profile) {
        setProfileId(profile.id);
        setFirstName(profile.first_name);
        setLastName(profile.last_name);
        setSpecializationId((profile as any).specialization_id || "");
        if ((profile as any).specialization_id && specsRes.data) {
          const spec = specsRes.data.find((s: any) => s.id === (profile as any).specialization_id);
          if (spec) setSelectedGroupKey(spec.group_key);
        }
        setRoleId(profile.role_id || "");
        setSecondaryRoleId((profile as any).secondary_role_id || "");
        setSecondarySpecializationId((profile as any).secondary_specialization_id || "");
        setLevel(profile.level || "middle");
        setBio(profile.bio || "");
        setAboutUseful((profile as any).about_useful || "");
        setAboutStyle((profile as any).about_style || "");
        setAboutGoals((profile as any).about_goals || "");
        setCity(profile.city || "");
        setCountry(profile.country || "Россия");
        setIsRelocatable(profile.is_relocatable || false);
        setIsRemoteAvailable(profile.is_remote_available || false);
        setSearchStatus(profile.search_status || "open_to_offers");
        setDesiredCity((profile as any).desired_city || "");
        setDesiredCountry((profile as any).desired_country || "");
        setDesiredContractType((profile as any).desired_contract_type || "");
        setIsPublic(profile.is_public !== false);
        setVisibilityLevel((profile as any).visibility_level || "public_preview");
        setShowName(profile.show_name !== false);
        setShowContacts(profile.show_contacts !== false);
        setHideCurrentOrg((profile as any).hide_current_org || false);
        setEmail(profile.email || user!.email || "");
        setPhone(profile.phone || "");
        setTelegram(profile.telegram || "");
        setLinkedinUrl(profile.linkedin_url || "");
        setPortfolioUrl(profile.portfolio_url || "");
        setAvatarUrl(profile.avatar_url || "");

        const [skillsData, expData, eduData, certData, portData, sportsExpData, sportsOpenData] = await Promise.all([
          supabase.from("profile_skills").select("*").eq("profile_id", profile.id),
          supabase.from("experiences").select("*").eq("profile_id", profile.id).order("start_date", { ascending: false }),
          supabase.from("candidate_education").select("*").eq("profile_id", profile.id).order("start_year", { ascending: false }),
          supabase.from("candidate_certificates").select("*").eq("profile_id", profile.id).order("year", { ascending: false }),
          supabase.from("candidate_portfolio").select("*").eq("profile_id", profile.id),
          supabase.from("profile_sports_experience").select("id, sport_id, years, level, sports:sport_id (id, name, icon)").eq("profile_id", profile.id),
          supabase.from("profile_sports_open_to").select("id, sport_id, sport_group, sports:sport_id (id, name, icon)").eq("profile_id", profile.id),
        ]);

        if (skillsData.data) {
          setSelectedSkills(skillsData.data.map((s: any) => ({
            skill_id: s.skill_id, proficiency: s.proficiency || 2, is_top: s.is_top || false,
            is_custom: s.is_custom || false, custom_name: s.custom_name || undefined, custom_group: s.custom_group || undefined,
          })));
        }
        if (expData.data) {
          setExperiences(expData.data.map((e: any) => ({
            id: e.id, company_name: e.company_name, position: e.position, league: e.league || "",
            team_level: e.team_level || "", start_date: e.start_date, end_date: e.end_date || "",
            is_current: e.is_current || false, description: e.description || "", employment_type: e.employment_type || "full_time",
            achievements: Array.isArray(e.achievements) ? e.achievements : [], is_remote: e.is_remote || false, hide_org: e.hide_org || false,
          })));
        }
        if (eduData.data) {
          setEducation(eduData.data.map((e: any) => ({
            id: e.id, institution: e.institution, degree: e.degree || "", field_of_study: e.field_of_study || "",
            start_year: e.start_year, end_year: e.end_year, country: e.country || "", city: e.city || "", is_current: e.is_current || false,
          })));
        }
        if (certData.data) {
          setCertificates(certData.data.map((c: any) => ({
            id: c.id, name: c.name, issuer: c.issuer || "", year: c.year, url: c.url || "",
          })));
        }
        if (portData.data) {
          setPortfolio(portData.data.map((p: any) => ({
            id: p.id, type: p.type || "other", title: p.title, url: p.url,
            description: p.description || "", tags: Array.isArray(p.tags) ? p.tags : [], visibility: p.visibility || "public",
          })));
        }
        if (sportsExpData.data) {
          const mapped = sportsExpData.data.map((s: any) => ({
            id: s.id, sport_id: s.sport_id, years: s.years || 1, level: s.level || "intermediate", sport: s.sports,
          }));
          setSportsExperience(mapped);
          setSelectedSportIds(mapped.map((s: any) => s.sport_id));
        }
        if (sportsOpenData.data) {
          setSportsOpenTo(sportsOpenData.data.map((s: any) => ({
            id: s.id, sport_id: s.sport_id || undefined, sport_group: s.sport_group || undefined, sport: s.sports || undefined,
          })));
        }
      } else {
        setEmail(user!.email || "");
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      toast({ title: "Ошибка", description: "Не удалось загрузить данные", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      toast({ title: "Ошибка", description: "Заполните имя и фамилию", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const profileData = {
        user_id: user!.id, first_name: firstName.trim(), last_name: lastName.trim(),
        specialization_id: specializationId || null, secondary_specialization_id: secondarySpecializationId || null,
        role_id: roleId || null, secondary_role_id: secondaryRoleId || null, level: level as any,
        bio: bio.trim() || null, about_useful: aboutUseful.trim() || null, about_style: aboutStyle.trim() || null,
        about_goals: aboutGoals.trim() || null, city: city.trim() || null, country: country.trim() || null,
        is_relocatable: isRelocatable, is_remote_available: isRemoteAvailable, search_status: searchStatus as any,
        desired_city: desiredCity.trim() || null, desired_country: desiredCountry.trim() || null,
        desired_contract_type: desiredContractType || null, is_public: isPublic, visibility_level: visibilityLevel,
        show_name: showName, show_contacts: showContacts, hide_current_org: hideCurrentOrg,
        email: email.trim() || null, phone: phone.trim() || null, telegram: telegram.trim() || null,
        linkedin_url: linkedinUrl.trim() || null, portfolio_url: portfolioUrl.trim() || null, avatar_url: avatarUrl || null,
      } as any;

      let newProfileId = profileId;
      if (profileId) {
        const { error } = await supabase.from("profiles").update(profileData).eq("id", profileId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from("profiles").insert(profileData).select("id").single();
        if (error) throw error;
        newProfileId = data.id;
        setProfileId(data.id);
      }

      if (newProfileId) {
        await supabase.from("profile_skills").delete().eq("profile_id", newProfileId);
        if (selectedSkills.length > 0) {
          await supabase.from("profile_skills").insert(
            selectedSkills.map(s => ({
              profile_id: newProfileId!, skill_id: s.skill_id, proficiency: s.proficiency,
              is_top: s.is_top, is_custom: s.is_custom, custom_name: s.custom_name || null,
              custom_group: s.custom_group || null, status: s.is_custom ? "pending" : "approved",
            })) as any
          );
        }

        await supabase.from("experiences").delete().eq("profile_id", newProfileId);
        for (const exp of experiences) {
          await supabase.from("experiences").insert({
            profile_id: newProfileId, company_name: exp.company_name, position: exp.position,
            league: exp.league || null, team_level: exp.team_level || null,
            start_date: exp.start_date, end_date: exp.end_date || null, is_current: exp.is_current,
            description: exp.description || null, employment_type: exp.employment_type,
            achievements: exp.achievements, is_remote: exp.is_remote, hide_org: exp.hide_org,
          } as any);
        }

        await supabase.from("candidate_education").delete().eq("profile_id", newProfileId);
        for (const edu of education) {
          if (!edu.institution.trim()) continue;
          await supabase.from("candidate_education").insert({
            profile_id: newProfileId, institution: edu.institution, degree: edu.degree || null,
            field_of_study: edu.field_of_study || null, start_year: edu.start_year, end_year: edu.end_year,
            country: edu.country || null, city: edu.city || null, is_current: edu.is_current,
          } as any);
        }

        await supabase.from("candidate_certificates").delete().eq("profile_id", newProfileId);
        for (const cert of certificates) {
          if (!cert.name.trim()) continue;
          await supabase.from("candidate_certificates").insert({
            profile_id: newProfileId, name: cert.name, issuer: cert.issuer || null,
            year: cert.year, url: cert.url || null,
          } as any);
        }

        await supabase.from("candidate_portfolio").delete().eq("profile_id", newProfileId);
        for (const item of portfolio) {
          if (!item.title.trim() || !item.url.trim()) continue;
          await supabase.from("candidate_portfolio").insert({
            profile_id: newProfileId, type: item.type, title: item.title, url: item.url,
            description: item.description || null, tags: item.tags, visibility: item.visibility,
          } as any);
        }

        await supabase.from("profile_sports_experience").delete().eq("profile_id", newProfileId);
        const existingSportIds = new Set(sportsExperience.map(s => s.sport_id));
        const mergedSports = [
          ...sportsExperience,
          ...selectedSportIds.filter(id => !existingSportIds.has(id)).map(id => ({ sport_id: id, years: 1, level: "intermediate" })),
        ];
        if (mergedSports.length > 0) {
          await supabase.from("profile_sports_experience").insert(
            mergedSports.map(s => ({ profile_id: newProfileId!, sport_id: s.sport_id, years: s.years, level: s.level }))
          );
        }

        await supabase.from("profile_sports_open_to").delete().eq("profile_id", newProfileId);
        if (sportsOpenTo.length > 0) {
          await supabase.from("profile_sports_open_to").insert(
            sportsOpenTo.map(s => ({ profile_id: newProfileId!, sport_id: s.sport_id || null, sport_group: s.sport_group || null }))
          );
        }
      }

      toast({ title: "Сохранено", description: "Профиль успешно обновлён" });
      navigate(`/profile/${newProfileId}`);
    } catch (err) {
      console.error("Error saving profile:", err);
      toast({ title: "Ошибка", description: "Не удалось сохранить профиль", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const ensureProfileId = async (): Promise<string> => {
    if (profileId) return profileId;
    if (!firstName.trim() || !lastName.trim()) throw new Error("Заполните имя и фамилию");
    const profileData = {
      user_id: user!.id, first_name: firstName.trim(), last_name: lastName.trim(),
      level: level as any, search_status: searchStatus as any, country: country.trim() || null,
    } as any;
    const { data, error } = await supabase.from("profiles").insert(profileData).select("id").single();
    if (error) throw error;
    setProfileId(data.id);
    return data.id;
  };

  const handleSectionSave = async (section: string) => {
    setSavingSection(section);
    try {
      const pid = await ensureProfileId();

      if (section === "basic" || section === "photo") {
        const updateData = {
          first_name: firstName.trim(), last_name: lastName.trim(),
          specialization_id: specializationId || null, secondary_specialization_id: secondarySpecializationId || null,
          role_id: roleId || null, secondary_role_id: secondaryRoleId || null,
          level: level as any, avatar_url: avatarUrl || null,
        } as any;
        const { error } = await supabase.from("profiles").update(updateData).eq("id", pid);
        if (error) throw error;
        await supabase.from("profile_sports_experience").delete().eq("profile_id", pid);
        const existingSportIds = new Set(sportsExperience.map(s => s.sport_id));
        const mergedSports = [
          ...sportsExperience,
          ...selectedSportIds.filter(id => !existingSportIds.has(id)).map(id => ({ sport_id: id, years: 1, level: "intermediate" })),
        ];
        if (mergedSports.length > 0) {
          await supabase.from("profile_sports_experience").insert(
            mergedSports.map(s => ({ profile_id: pid, sport_id: s.sport_id, years: s.years, level: s.level }))
          );
        }
      } else if (section === "about") {
        const { error } = await supabase.from("profiles").update({
          bio: bio.trim() || null, about_useful: aboutUseful.trim() || null,
          about_style: aboutStyle.trim() || null, about_goals: aboutGoals.trim() || null,
        } as any).eq("id", pid);
        if (error) throw error;
      } else if (section === "status") {
        const { error } = await supabase.from("profiles").update({
          city: city.trim() || null, country: country.trim() || null,
          is_relocatable: isRelocatable, is_remote_available: isRemoteAvailable,
          search_status: searchStatus as any, desired_city: desiredCity.trim() || null,
          desired_country: desiredCountry.trim() || null, desired_contract_type: desiredContractType || null,
          is_public: isPublic, visibility_level: visibilityLevel, show_name: showName,
          show_contacts: showContacts, hide_current_org: hideCurrentOrg,
        } as any).eq("id", pid);
        if (error) throw error;
      } else if (section === "skills") {
        await supabase.from("profile_skills").delete().eq("profile_id", pid);
        if (selectedSkills.length > 0) {
          await supabase.from("profile_skills").insert(
            selectedSkills.map(s => ({
              profile_id: pid, skill_id: s.skill_id, proficiency: s.proficiency,
              is_top: s.is_top, is_custom: s.is_custom, custom_name: s.custom_name || null,
              custom_group: s.custom_group || null, status: s.is_custom ? "pending" : "approved",
            })) as any
          );
        }
      } else if (section === "sports") {
        await supabase.from("profile_sports_experience").delete().eq("profile_id", pid);
        const existingSportIds = new Set(sportsExperience.map(s => s.sport_id));
        const mergedSports = [
          ...sportsExperience,
          ...selectedSportIds.filter(id => !existingSportIds.has(id)).map(id => ({ sport_id: id, years: 1, level: "intermediate" })),
        ];
        if (mergedSports.length > 0) {
          await supabase.from("profile_sports_experience").insert(
            mergedSports.map(s => ({ profile_id: pid, sport_id: s.sport_id, years: s.years, level: s.level }))
          );
        }
        await supabase.from("profile_sports_open_to").delete().eq("profile_id", pid);
        if (sportsOpenTo.length > 0) {
          await supabase.from("profile_sports_open_to").insert(
            sportsOpenTo.map(s => ({ profile_id: pid, sport_id: s.sport_id || null, sport_group: s.sport_group || null }))
          );
        }
      } else if (section === "experience") {
        await supabase.from("experiences").delete().eq("profile_id", pid);
        for (const exp of experiences) {
          await supabase.from("experiences").insert({
            profile_id: pid, company_name: exp.company_name, position: exp.position,
            league: exp.league || null, team_level: exp.team_level || null,
            start_date: exp.start_date, end_date: exp.end_date || null,
            is_current: exp.is_current, description: exp.description || null,
            employment_type: exp.employment_type, achievements: exp.achievements,
            is_remote: exp.is_remote, hide_org: exp.hide_org,
          } as any);
        }
      } else if (section === "education") {
        await supabase.from("candidate_education").delete().eq("profile_id", pid);
        for (const edu of education) {
          if (!edu.institution.trim()) continue;
          await supabase.from("candidate_education").insert({
            profile_id: pid, institution: edu.institution, degree: edu.degree || null,
            field_of_study: edu.field_of_study || null, start_year: edu.start_year,
            end_year: edu.end_year, country: edu.country || null, city: edu.city || null,
            is_current: edu.is_current,
          } as any);
        }
        await supabase.from("candidate_certificates").delete().eq("profile_id", pid);
        for (const cert of certificates) {
          if (!cert.name.trim()) continue;
          await supabase.from("candidate_certificates").insert({
            profile_id: pid, name: cert.name, issuer: cert.issuer || null,
            year: cert.year, url: cert.url || null,
          } as any);
        }
      } else if (section === "portfolio") {
        await supabase.from("candidate_portfolio").delete().eq("profile_id", pid);
        for (const item of portfolio) {
          if (!item.title.trim() || !item.url.trim()) continue;
          await supabase.from("candidate_portfolio").insert({
            profile_id: pid, type: item.type, title: item.title, url: item.url,
            description: item.description || null, tags: item.tags, visibility: item.visibility,
          } as any);
        }
      } else if (section === "contacts") {
        const { error } = await supabase.from("profiles").update({
          email: email.trim() || null, phone: phone.trim() || null,
          telegram: telegram.trim() || null, linkedin_url: linkedinUrl.trim() || null,
          portfolio_url: portfolioUrl.trim() || null,
        } as any).eq("id", pid);
        if (error) throw error;
      }

      toast({ title: "Сохранено ✓", description: "Раздел успешно обновлён" });
    } catch (err: any) {
      console.error("Section save error:", err);
      toast({ title: "Ошибка", description: err.message || "Не удалось сохранить", variant: "destructive" });
    } finally {
      setSavingSection(null);
    }
  };

  const SectionSaveIcon = ({ section }: { section: string }) => (
    <button
      onClick={() => handleSectionSave(section)}
      disabled={savingSection === section}
      className="text-muted-foreground/30 hover:text-primary transition-colors disabled:opacity-50"
      title="Сохранить"
    >
      {savingSection === section ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Save className="h-4 w-4" />
      )}
    </button>
  );

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    sectionRefs.current[sectionId]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const primarySpecName = specializations.find(s => s.id === specializationId)?.name;
  const specsForGroup = selectedGroupKey
    ? specializations.filter(s => s.group_key === selectedGroupKey)
    : specializations;
  const additionalSpecOptions = specsForGroup.filter(s => s.id !== specializationId);

  const profileFields = useMemo(() => [
    { key: "avatar", label: "Фото профиля", completed: !!avatarUrl, weight: 5 },
    { key: "role", label: "Специализация + уровень", completed: !!specializationId && !!level, weight: 15 },
    { key: "about", label: "О себе", completed: !!bio && bio.length > 20, weight: 10 },
    { key: "location", label: "Город и формат работы", completed: !!city && !!country, weight: 10 },
    { key: "skills", label: "Навыки (минимум 5)", completed: selectedSkills.length >= 5, weight: 15 },
    { key: "experience", label: "Опыт работы (минимум 1)", completed: experiences.length > 0 && experiences.some(e => e.company_name && e.position), weight: 20 },
    { key: "education", label: "Образование / сертификаты", completed: education.length > 0 || certificates.length > 0, weight: 10 },
    { key: "sports", label: "Виды спорта (опыт)", completed: sportsExperience.length > 0, weight: 10 },
    { key: "contacts", label: "Контакты", completed: !!email || !!telegram, weight: 5 },
  ], [avatarUrl, specializationId, level, bio, city, country, selectedSkills, experiences, education, certificates, sportsExperience, email, telegram]);

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-secondary/30 min-h-screen">
        <div className="container max-w-6xl py-6 md:py-8">
          <div className="flex gap-6 lg:gap-8 relative">
            {/* Sidebar */}
            <div className="hidden lg:block w-48 shrink-0">
              <div className="sticky top-24 space-y-6">
                <ProfileSidebar activeSection={activeSection} onSectionClick={scrollToSection} />
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0 space-y-5">
              {/* Page Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-[22px] font-semibold text-foreground tracking-tight">
                    {profileId ? "Редактирование профиля" : "Создание профиля"}
                  </h1>
                  <p className="text-[14px] text-muted-foreground mt-0.5">Заполните профиль — и клубы смогут вас найти</p>
                </div>
                <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => navigate(-1)}>
                  <X className="h-4 w-4 mr-1.5" />Отмена
                </Button>
              </div>

              {/* Progress visible on mobile/tablet */}
              <div className="xl:hidden">
                <ProfileProgress fields={profileFields} onFieldClick={(key) => {
                  const sectionMap: Record<string, string> = { avatar: "basic", role: "basic", about: "about", location: "status", skills: "skills", experience: "experience", education: "education", sports: "sports", contacts: "contacts" };
                  scrollToSection(sectionMap[key] || key);
                }} />
              </div>

              {/* ═══════════════════ IDENTITY BLOCK ═══════════════════ */}
              <div ref={el => { sectionRefs.current["basic"] = el; }} className="space-y-5">
                <div className="bg-card rounded-xl p-5 md:p-6 shadow-card">
                  <div className="flex items-start gap-5">
                    <div className="flex flex-col items-center gap-2">
                      {/* Show bank avatar or image upload */}
                      {isBankAvatar(avatarUrl) ? (
                        <div className="relative group">
                          <img
                            src={decodeBankAvatar(avatarUrl)!.src}
                            alt={decodeBankAvatar(avatarUrl)!.label}
                            className="w-32 h-32 rounded-full overflow-hidden border-2 border-border object-cover"
                          />
                          <button
                            onClick={() => setAvatarUrl("")}
                            className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <ImageUpload
                          currentImageUrl={avatarUrl}
                          onImageUploaded={setAvatarUrl}
                          bucket="avatars"
                          userId={user!.id}
                          size="lg"
                          shape="circle"
                          placeholder={
                            <span className="text-xl font-semibold text-muted-foreground/60">
                              {firstName?.[0] || "?"}{lastName?.[0] || "?"}
                            </span>
                          }
                        />
                      )}
                      <AvatarBankPicker onSelect={setAvatarUrl} />
                    </div>
                    <div className="flex-1 pt-1 space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label className={LABEL}>Имя</Label>
                          <Input className="text-[18px] font-semibold h-11 border-0 border-b border-border rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary bg-transparent" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Иван" />
                        </div>
                        <div className="space-y-1">
                          <Label className={LABEL}>Фамилия</Label>
                          <Input className="text-[18px] font-semibold h-11 border-0 border-b border-border rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary bg-transparent" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Иванов" />
                        </div>
                      </div>
                      {/* Role subtitle under name */}
                      {primarySpecName && (
                        <p className="text-[14px] text-muted-foreground">
                          {primarySpecName}
                          {level && <> · {levels.find(l => l.value === level)?.label}</>}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* ═══════════════════ BASIC INFO ═══════════════════ */}
                <div className="bg-card rounded-xl p-5 md:p-6 shadow-card space-y-5">
                  <div className="flex items-center justify-between">
                    <h2 className={SECTION_TITLE}>Основная информация</h2>
                    <SectionSaveIcon section="basic" />
                  </div>

                  {/* Direction */}
                  <div>
                    <p className={`${SUB_TITLE} mb-2.5`}>Направление</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                      {GROUPS.map(g => {
                        const icons: Record<string, React.ReactNode> = {
                          coaching: <Users className="h-4 w-4" />,
                          performance: <Activity className="h-4 w-4" />,
                          analytics: <BarChart3 className="h-4 w-4" />,
                          medical: <HeartPulse className="h-4 w-4" />,
                          other: <Briefcase className="h-4 w-4" />,
                        };
                        const isActive = selectedGroupKey === g.key;
                        return (
                          <button
                            key={g.key}
                            type="button"
                            onClick={() => {
                              setSelectedGroupKey(g.key);
                              const currentSpec = specializations.find(s => s.id === specializationId);
                              if (currentSpec && currentSpec.group_key !== g.key) {
                                setSpecializationId("");
                                setRoleId("");
                                setSecondaryRoleId("");
                              }
                            }}
                            className={`flex flex-col items-center gap-1.5 rounded-lg border p-3 text-center transition-all ${
                              isActive
                                ? "border-primary bg-primary/5 text-primary"
                                : "border-transparent bg-secondary/60 text-muted-foreground hover:bg-secondary"
                            }`}
                          >
                            {icons[g.key] || <Briefcase className="h-4 w-4" />}
                            <span className="text-[11px] font-medium leading-tight">{g.shortTitle}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Specialization + Sport */}
                  <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-1">
                        <Label className={LABEL}>Специализация</Label>
                        <Select value={specializationId} onValueChange={(val) => {
                          setSpecializationId(val);
                          if (secondarySpecializationId === val) setSecondarySpecializationId("");
                        }} disabled={!selectedGroupKey}>
                          <SelectTrigger className={FIELD_TEXT}><SelectValue placeholder={selectedGroupKey ? "Выберите специализацию" : "Сначала выберите направление"} /></SelectTrigger>
                          <SelectContent>
                            {specsForGroup.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <p className={HINT}>Определяет категорию, в которой вас найдут клубы</p>
                      </div>
                      <div className="space-y-1">
                        <Label className={LABEL}>Вид спорта</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" role="combobox" className={`w-full justify-between ${FIELD_TEXT} h-10 font-normal`}>
                              <span className="truncate">
                                {selectedSportIds.length > 0
                                  ? `Выбрано: ${selectedSportIds.length}`
                                  : "Выберите виды спорта"}
                              </span>
                              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[--radix-popover-trigger-width] p-0 z-50 bg-popover" align="start">
                            <div className="max-h-60 overflow-y-auto p-1">
                              {allSports.map(sport => {
                                const isSelected = selectedSportIds.includes(sport.id);
                                return (
                                  <button
                                    key={sport.id}
                                    type="button"
                                    onClick={() => {
                                      setSelectedSportIds(prev =>
                                        isSelected ? prev.filter(id => id !== sport.id) : [...prev, sport.id]
                                      );
                                    }}
                                    className="flex items-center gap-2 w-full px-3 py-2 text-[13px] rounded-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                                  >
                                    <div className={`flex h-4 w-4 items-center justify-center rounded-sm border ${isSelected ? "bg-primary border-primary text-primary-foreground" : "border-input"}`}>
                                      {isSelected && <Check className="h-3 w-3" />}
                                    </div>
                                    {sport.name}
                                  </button>
                                );
                              })}
                            </div>
                          </PopoverContent>
                        </Popover>
                        {selectedSportIds.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {selectedSportIds.map(id => {
                              const sport = allSports.find(s => s.id === id);
                              return sport ? (
                                <span key={id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-medium">
                                  {sport.name}
                                  <button type="button" onClick={() => setSelectedSportIds(prev => prev.filter(sid => sid !== id))} className="hover:text-destructive">
                                    <X className="h-3 w-3" />
                                  </button>
                                </span>
                              ) : null;
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Additional Specialization */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-1">
                        <Label className={LABEL}>Доп. специализация</Label>
                        <Select value={secondarySpecializationId} onValueChange={setSecondarySpecializationId} disabled={!specializationId}>
                          <SelectTrigger className={FIELD_TEXT}><SelectValue placeholder="Опционально" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Нет</SelectItem>
                            {additionalSpecOptions.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <p className={HINT}>Помогает клубам находить вас шире</p>
                      </div>
                      <div>{/* alignment */}</div>
                    </div>

                    {/* Level */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Label className={LABEL}>Уровень позиции</Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-3.5 w-3.5 text-muted-foreground/40 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-[260px] text-xs">
                              Уровень помогает клубам понять, с какими задачами вы работали и какой уровень ответственности вам подходит.
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <Select value={level} onValueChange={setLevel}>
                        <SelectTrigger className={`${FIELD_TEXT} w-full`}>
                          <SelectValue placeholder="Выберите уровень">
                            {level && levels.find(l => l.value === level)?.label}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {levels.map(l => (
                            <SelectItem key={l.value} value={l.value} className="group">
                              <div className="flex flex-col">
                                <span>{l.label}</span>
                                <span className="text-[12px] text-muted-foreground/60 transition-colors group-focus:text-accent-foreground/70">{l.desc}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              {/* ═══════════════════ ABOUT ═══════════════════ */}
              <div ref={el => { sectionRefs.current["about"] = el; }}>
                <AboutEditor
                  bio={bio} aboutUseful={aboutUseful} aboutStyle={aboutStyle} aboutGoals={aboutGoals}
                  onBioChange={setBio} onAboutUsefulChange={setAboutUseful}
                  onAboutStyleChange={setAboutStyle} onAboutGoalsChange={setAboutGoals}
                  roleName={primarySpecName}
                  onSave={() => handleSectionSave("about")}
                  isSaving={savingSection === "about"}
                />
              </div>

              {/* ═══════════════════ STATUS & PRIVACY ═══════════════════ */}
              <div ref={el => { sectionRefs.current["status"] = el; }}>
                <div className="bg-card rounded-xl p-5 md:p-6 shadow-card space-y-5">
                  <div className="flex items-center justify-between">
                    <h2 className={SECTION_TITLE}>Локация, статус и приватность</h2>
                    <SectionSaveIcon section="status" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className={LABEL}>Город</Label>
                      <Input className={FIELD_TEXT} value={city} onChange={(e) => setCity(e.target.value)} placeholder="Москва" />
                    </div>
                    <div className="space-y-1">
                      <Label className={LABEL}>Страна</Label>
                      <Input className={FIELD_TEXT} value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Россия" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className={LABEL}>Статус поиска</Label>
                    <Select value={searchStatus} onValueChange={setSearchStatus}>
                      <SelectTrigger className={FIELD_TEXT}><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {searchStatuses.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  {searchStatus !== "not_looking" && (
                    <div className="border-t border-border/50 pt-4 space-y-4">
                      <p className={SUB_TITLE}>Предпочтения</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label className={LABEL}>Формат</Label>
                          <Select value={desiredContractType} onValueChange={setDesiredContractType}>
                            <SelectTrigger className={FIELD_TEXT}><SelectValue placeholder="Любой" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="any">Любой</SelectItem>
                              <SelectItem value="full_time">Полная занятость</SelectItem>
                              <SelectItem value="part_time">Частичная</SelectItem>
                              <SelectItem value="contract">Контракт</SelectItem>
                              <SelectItem value="freelance">Фриланс</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label className={LABEL}>Желаемый город</Label>
                          <Input className={FIELD_TEXT} value={desiredCity} onChange={(e) => setDesiredCity(e.target.value)} placeholder="Любой" />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-3 border-t border-border/50 pt-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-[13px]">Готов к релокации</Label>
                      <Switch checked={isRelocatable} onCheckedChange={setIsRelocatable} />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-[13px]">Удалённая работа</Label>
                      <Switch checked={isRemoteAvailable} onCheckedChange={setIsRemoteAvailable} />
                    </div>
                  </div>

                  <div className="border-t border-border/50 pt-4 space-y-3">
                    <p className={SUB_TITLE}>Видимость профиля</p>
                    <Select value={visibilityLevel} onValueChange={setVisibilityLevel}>
                      <SelectTrigger className={FIELD_TEXT}><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {visibilityLevels.map(v => <SelectItem key={v.value} value={v.value}>{v.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="border-t border-border/50 pt-4 space-y-3">
                    <p className={SUB_TITLE}>Приватность</p>
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-[13px]">Показывать имя клубам</Label>
                          <p className={HINT}>Если выключено — клубы увидят только роль</p>
                        </div>
                        <Switch checked={showName} onCheckedChange={setShowName} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-[13px]">Показывать контакты</Label>
                          <p className={HINT}>Видны только после разблокировки</p>
                        </div>
                        <Switch checked={showContacts} onCheckedChange={setShowContacts} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-[13px]">Скрыть текущую организацию</Label>
                          <p className={HINT}>Название текущей работы будет скрыто</p>
                        </div>
                        <Switch checked={hideCurrentOrg} onCheckedChange={setHideCurrentOrg} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ═══════════════════ SKILLS ═══════════════════ */}
              <div ref={el => { sectionRefs.current["skills"] = el; }}>
                <SkillsEditor
                  allSkills={allSkills}
                  selectedSkills={selectedSkills}
                  onChange={setSelectedSkills}
                  primaryRoleName={primarySpecName}
                  groupKey={selectedGroupKey}
                />
              </div>

              {/* ═══════════════════ SPORTS ═══════════════════ */}
              <div ref={el => { sectionRefs.current["sports"] = el; }}>
                <SportsEditor
                  profileId={profileId}
                  sportsExperience={sportsExperience}
                  sportsOpenTo={sportsOpenTo}
                  onExperienceChange={setSportsExperience}
                  onOpenToChange={setSportsOpenTo}
                />
              </div>

              {/* ═══════════════════ EXPERIENCE ═══════════════════ */}
              <div ref={el => { sectionRefs.current["experience"] = el; }}>
                <ExperienceEditor experiences={experiences} onChange={setExperiences} />
              </div>

              {/* ═══════════════════ EDUCATION ═══════════════════ */}
              <div ref={el => { sectionRefs.current["education"] = el; }}>
                <EducationEditor
                  education={education}
                  certificates={certificates}
                  onEducationChange={setEducation}
                  onCertificatesChange={setCertificates}
                />
              </div>

              {/* ═══════════════════ PORTFOLIO ═══════════════════ */}
              <div ref={el => { sectionRefs.current["portfolio"] = el; }}>
                <PortfolioEditor items={portfolio} onChange={setPortfolio} />
              </div>

              {/* ═══════════════════ CONTACTS ═══════════════════ */}
              <div ref={el => { sectionRefs.current["contacts"] = el; }}>
                <div className="bg-card rounded-xl p-5 md:p-6 shadow-card space-y-5">
                  <h2 className={SECTION_TITLE}>Контакты</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className={LABEL}>Email</Label>
                      <Input className={FIELD_TEXT} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ivan@example.com" />
                    </div>
                    <div className="space-y-1">
                      <Label className={LABEL}>Телефон</Label>
                      <Input className={FIELD_TEXT} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+7 (999) 123-45-67" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className={LABEL}>Telegram</Label>
                      <Input className={FIELD_TEXT} value={telegram} onChange={(e) => setTelegram(e.target.value)} placeholder="@username" />
                    </div>
                    <div className="space-y-1">
                      <Label className={LABEL}>LinkedIn</Label>
                      <Input className={FIELD_TEXT} value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} placeholder="https://linkedin.com/in/username" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className={LABEL}>Портфолио / Сайт</Label>
                    <Input className={FIELD_TEXT} value={portfolioUrl} onChange={(e) => setPortfolioUrl(e.target.value)} placeholder="https://example.com" />
                  </div>
                </div>
              </div>

              {/* Save */}
              <div className="flex justify-end gap-3 pb-10 pt-2">
                <Button variant="ghost" className="text-muted-foreground" onClick={() => navigate(-1)}>Отмена</Button>
                <Button onClick={handleSave} disabled={saving} size="lg" className="px-8 text-[14px]">
                  {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Сохранение...</> : <><Save className="h-4 w-4 mr-2" />Сохранить профиль</>}
                </Button>
              </div>
            </div>

            {/* Right column — sticky progress + mini-preview */}
            <div className="hidden xl:block w-72 shrink-0">
              <div className="sticky top-24 space-y-5">
                {/* Mini Preview Card — matches SpecialistCard layout */}
                <div className="bg-card rounded-xl p-4 shadow-card">
                  <p className={`${SUB_TITLE} mb-3`}>Как вас видят клубы</p>
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {avatarUrl ? (
                        (() => {
                          const bankRef = isBankAvatar(avatarUrl) ? decodeBankAvatar(avatarUrl) : null;
                          if (bankRef) {
                            return <img src={bankRef.src} alt="" className="w-full h-full object-cover" />;
                          }
                          return <img src={avatarUrl} alt="" className="w-full h-full object-cover" />;
                        })()
                      ) : (
                        <span className="text-xs font-medium text-muted-foreground/50">
                          {firstName?.[0] || "?"}{lastName?.[0] || "?"}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      {/* Role + level */}
                      <div className="flex items-start justify-between gap-1">
                        <div className="min-w-0">
                          <p className="text-[13px] font-semibold text-foreground line-clamp-1">
                            {primarySpecName || "Без специализации"}
                          </p>
                          {/* Secondary spec + experience on second line */}
                          {(() => {
                            const secondaryName = secondarySpecializationId ? specializations.find(s => s.id === secondarySpecializationId)?.name : null;
                            const latestExp = experiences.length > 0 && experiences[0]?.position ? experiences[0] : null;
                            const parts: string[] = [];
                            if (secondaryName) parts.push(`+ ${secondaryName}`);
                            if (latestExp?.company_name) parts.push(latestExp.company_name);
                            return parts.length > 0 ? (
                              <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                                {parts.join(" · ")}
                              </p>
                            ) : null;
                          })()}
                        </div>
                        {level && (
                          <span className="text-[10px] font-medium border border-border rounded px-1.5 py-0.5 shrink-0">
                            {levels.find(l => l.value === level)?.label || level}
                          </span>
                        )}
                      </div>
                      {/* About snippet */}
                      {aboutUseful && (
                        <p className="text-[10px] text-muted-foreground/70 line-clamp-1 mt-0.5 italic">
                          {aboutUseful.slice(0, 80)}
                        </p>
                      )}
                      {/* Skills */}
                      {selectedSkills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {selectedSkills.slice(0, 3).map((s, i) => {
                            const skill = allSkills.find(sk => sk.id === s.skill_id);
                            return (
                              <span key={i} className="text-[10px] border border-border rounded px-1.5 py-0.5">
                                {s.is_custom ? s.custom_name : skill?.name || "—"}
                              </span>
                            );
                          })}
                          {selectedSkills.length > 3 && (
                            <span className="text-[10px] border border-border rounded px-1.5 py-0.5">
                              +{selectedSkills.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                      {/* Location + sports */}
                      <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[11px] text-muted-foreground">
                        {(city || country) && (
                          <span className="flex items-center gap-0.5">
                            📍 {[city, country].filter(Boolean).join(", ")}
                          </span>
                        )}
                        {selectedSportIds.slice(0, 2).map(id => {
                          const sport = allSports.find(s => s.id === id);
                          const exp = sportsExperience.find(se => se.sport_id === id);
                          return sport ? (
                            <span key={id} className="flex items-center gap-0.5">
                              {sport.name}
                              {exp && exp.years > 0 && <span className="text-muted-foreground/50">({exp.years}л)</span>}
                            </span>
                          ) : null;
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress */}
                <ProfileProgress
                  fields={profileFields}
                  onFieldClick={(key) => {
                    const sectionMap: Record<string, string> = { avatar: "basic", role: "basic", about: "about", location: "status", skills: "skills", experience: "experience", education: "education", sports: "sports", contacts: "contacts" };
                    scrollToSection(sectionMap[key] || key);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
