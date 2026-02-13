import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, X } from "lucide-react";
import { ImageUpload } from "@/components/shared/ImageUpload";
import { ProfileProgress } from "@/components/shared/ProfileProgress";
import { ProfileSidebar } from "@/components/profile/ProfileSidebar";
import { SportsEditor, SportExperience, SportOpenTo } from "@/components/profile/SportsEditor";
import { SkillsEditor, SkillSelection } from "@/components/profile/SkillsEditor";
import { ExperienceEditor, Experience } from "@/components/profile/ExperienceEditor";
import { EducationEditor, Education, Certificate } from "@/components/profile/EducationEditor";
import { PortfolioEditor, PortfolioItem } from "@/components/profile/PortfolioEditor";
import { AboutEditor } from "@/components/profile/AboutEditor";

interface SpecialistRole {
  id: string;
  name: string;
}

interface Skill {
  id: string;
  name: string;
  category: string | null;
}

const levels = [
  { value: "intern", label: "Стажёр" },
  { value: "junior", label: "Junior" },
  { value: "middle", label: "Middle" },
  { value: "senior", label: "Senior" },
  { value: "head", label: "Head" }
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
  const [profileId, setProfileId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState("basic");

  // Basic info
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [roleId, setRoleId] = useState("");
  const [secondaryRoleId, setSecondaryRoleId] = useState("");
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
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [allowedSecondaryRoles, setAllowedSecondaryRoles] = useState<string[]>([]);

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

  // Fetch allowed secondary roles when primary role changes
  useEffect(() => {
    if (roleId) {
      supabase
        .from("role_relations")
        .select("secondary_role_id")
        .eq("primary_role_id", roleId)
        .eq("is_allowed", true)
        .then(({ data }) => {
          setAllowedSecondaryRoles(data?.map(r => r.secondary_role_id) || []);
        });
    } else {
      setAllowedSecondaryRoles([]);
      setSecondaryRoleId("");
    }
  }, [roleId]);

  const fetchData = async () => {
    try {
      const [rolesRes, skillsRes] = await Promise.all([
        supabase.from("specialist_roles").select("id, name").order("name"),
        supabase.from("skills").select("id, name, category").order("name")
      ]);

      if (rolesRes.data) setRoles(rolesRes.data);
      if (skillsRes.data) setAllSkills(skillsRes.data);

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();

      if (profile) {
        setProfileId(profile.id);
        setFirstName(profile.first_name);
        setLastName(profile.last_name);
        setRoleId(profile.role_id || "");
        setSecondaryRoleId((profile as any).secondary_role_id || "");
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

        // Fetch all related data in parallel
        const [skillsData, expData, eduData, certData, portData, sportsExpData, sportsOpenData] = await Promise.all([
          supabase.from("profile_skills").select("*").eq("profile_id", profile.id),
          supabase.from("experiences").select("*").eq("profile_id", profile.id).order("start_date", { ascending: false }),
          supabase.from("candidate_education").select("*").eq("profile_id", profile.id).order("start_year", { ascending: false }),
          supabase.from("candidate_certificates").select("*").eq("profile_id", profile.id).order("year", { ascending: false }),
          supabase.from("candidate_portfolio").select("*").eq("profile_id", profile.id),
          supabase.from("profile_sports_experience").select("id, sport_id, years, level, sports:sport_id (id, name, icon)").eq("profile_id", profile.id),
          supabase.from("profile_sports_open_to").select("id, sport_id, sports:sport_id (id, name, icon)").eq("profile_id", profile.id),
        ]);

        if (skillsData.data) {
          setSelectedSkills(skillsData.data.map((s: any) => ({
            skill_id: s.skill_id,
            proficiency: s.proficiency || 2,
            is_top: s.is_top || false,
            is_custom: s.is_custom || false,
            custom_name: s.custom_name || undefined,
            custom_group: s.custom_group || undefined,
          })));
        }

        if (expData.data) {
          setExperiences(expData.data.map((e: any) => ({
            id: e.id,
            company_name: e.company_name,
            position: e.position,
            league: e.league || "",
            team_level: e.team_level || "",
            start_date: e.start_date,
            end_date: e.end_date || "",
            is_current: e.is_current || false,
            description: e.description || "",
            employment_type: e.employment_type || "full_time",
            achievements: Array.isArray(e.achievements) ? e.achievements : [],
            is_remote: e.is_remote || false,
            hide_org: e.hide_org || false,
          })));
        }

        if (eduData.data) {
          setEducation(eduData.data.map((e: any) => ({
            id: e.id,
            institution: e.institution,
            degree: e.degree || "",
            field_of_study: e.field_of_study || "",
            start_year: e.start_year,
            end_year: e.end_year,
            country: e.country || "",
            city: e.city || "",
            is_current: e.is_current || false,
          })));
        }

        if (certData.data) {
          setCertificates(certData.data.map((c: any) => ({
            id: c.id,
            name: c.name,
            issuer: c.issuer || "",
            year: c.year,
            url: c.url || "",
          })));
        }

        if (portData.data) {
          setPortfolio(portData.data.map((p: any) => ({
            id: p.id,
            type: p.type || "other",
            title: p.title,
            url: p.url,
            description: p.description || "",
            tags: Array.isArray(p.tags) ? p.tags : [],
            visibility: p.visibility || "public",
          })));
        }

        if (sportsExpData.data) {
          setSportsExperience(sportsExpData.data.map((s: any) => ({
            id: s.id, sport_id: s.sport_id, years: s.years || 1, level: s.level || "intermediate", sport: s.sports,
          })));
        }

        if (sportsOpenData.data) {
          setSportsOpenTo(sportsOpenData.data.map((s: any) => ({
            id: s.id, sport_id: s.sport_id, sport: s.sports,
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
        user_id: user!.id,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        role_id: roleId || null,
        secondary_role_id: secondaryRoleId || null,
        level: level as any,
        bio: bio.trim() || null,
        about_useful: aboutUseful.trim() || null,
        about_style: aboutStyle.trim() || null,
        about_goals: aboutGoals.trim() || null,
        city: city.trim() || null,
        country: country.trim() || null,
        is_relocatable: isRelocatable,
        is_remote_available: isRemoteAvailable,
        search_status: searchStatus as any,
        desired_city: desiredCity.trim() || null,
        desired_country: desiredCountry.trim() || null,
        desired_contract_type: desiredContractType || null,
        is_public: isPublic,
        visibility_level: visibilityLevel,
        show_name: showName,
        show_contacts: showContacts,
        hide_current_org: hideCurrentOrg,
        email: email.trim() || null,
        phone: phone.trim() || null,
        telegram: telegram.trim() || null,
        linkedin_url: linkedinUrl.trim() || null,
        portfolio_url: portfolioUrl.trim() || null,
        avatar_url: avatarUrl || null
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
        // Skills
        await supabase.from("profile_skills").delete().eq("profile_id", newProfileId);
        if (selectedSkills.length > 0) {
          await supabase.from("profile_skills").insert(
            selectedSkills.map(s => ({
              profile_id: newProfileId!,
              skill_id: s.skill_id,
              proficiency: s.proficiency,
              is_top: s.is_top,
              is_custom: s.is_custom,
              custom_name: s.custom_name || null,
              custom_group: s.custom_group || null,
              status: s.is_custom ? "pending" : "approved",
            })) as any
          );
        }

        // Experiences
        await supabase.from("experiences").delete().eq("profile_id", newProfileId);
        for (const exp of experiences) {
          await supabase.from("experiences").insert({
            profile_id: newProfileId,
            company_name: exp.company_name,
            position: exp.position,
            league: exp.league || null,
            team_level: exp.team_level || null,
            start_date: exp.start_date,
            end_date: exp.end_date || null,
            is_current: exp.is_current,
            description: exp.description || null,
            employment_type: exp.employment_type,
            achievements: exp.achievements,
            is_remote: exp.is_remote,
            hide_org: exp.hide_org,
          } as any);
        }

        // Education
        await supabase.from("candidate_education").delete().eq("profile_id", newProfileId);
        for (const edu of education) {
          if (!edu.institution.trim()) continue;
          await supabase.from("candidate_education").insert({
            profile_id: newProfileId,
            institution: edu.institution,
            degree: edu.degree || null,
            field_of_study: edu.field_of_study || null,
            start_year: edu.start_year,
            end_year: edu.end_year,
            country: edu.country || null,
            city: edu.city || null,
            is_current: edu.is_current,
          } as any);
        }

        // Certificates
        await supabase.from("candidate_certificates").delete().eq("profile_id", newProfileId);
        for (const cert of certificates) {
          if (!cert.name.trim()) continue;
          await supabase.from("candidate_certificates").insert({
            profile_id: newProfileId,
            name: cert.name,
            issuer: cert.issuer || null,
            year: cert.year,
            url: cert.url || null,
          } as any);
        }

        // Portfolio
        await supabase.from("candidate_portfolio").delete().eq("profile_id", newProfileId);
        for (const item of portfolio) {
          if (!item.title.trim() || !item.url.trim()) continue;
          await supabase.from("candidate_portfolio").insert({
            profile_id: newProfileId,
            type: item.type,
            title: item.title,
            url: item.url,
            description: item.description || null,
            tags: item.tags,
            visibility: item.visibility,
          } as any);
        }

        // Sports experience
        await supabase.from("profile_sports_experience").delete().eq("profile_id", newProfileId);
        if (sportsExperience.length > 0) {
          await supabase.from("profile_sports_experience").insert(
            sportsExperience.map(s => ({ profile_id: newProfileId!, sport_id: s.sport_id, years: s.years, level: s.level }))
          );
        }

        // Sports open to
        await supabase.from("profile_sports_open_to").delete().eq("profile_id", newProfileId);
        if (sportsOpenTo.length > 0) {
          await supabase.from("profile_sports_open_to").insert(
            sportsOpenTo.map(s => ({ profile_id: newProfileId!, sport_id: s.sport_id }))
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

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    sectionRefs.current[sectionId]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const primaryRoleName = roles.find(r => r.id === roleId)?.name;
  const secondaryRoleOptions = roles.filter(r => r.id !== roleId && (allowedSecondaryRoles.length === 0 || allowedSecondaryRoles.includes(r.id)));

  const profileFields = useMemo(() => [
    { key: "avatar", label: "Фото профиля", completed: !!avatarUrl, weight: 5 },
    { key: "role", label: "Специализация + уровень", completed: !!roleId && !!level, weight: 15 },
    { key: "about", label: "О себе", completed: !!bio && bio.length > 20, weight: 10 },
    { key: "location", label: "Город и формат работы", completed: !!city && !!country, weight: 10 },
    { key: "skills", label: "Навыки (минимум 5)", completed: selectedSkills.length >= 5, weight: 15 },
    { key: "experience", label: "Опыт работы (минимум 1)", completed: experiences.length > 0 && experiences.some(e => e.company_name && e.position), weight: 20 },
    { key: "education", label: "Образование / сертификаты", completed: education.length > 0 || certificates.length > 0, weight: 10 },
    { key: "sports", label: "Виды спорта (опыт)", completed: sportsExperience.length > 0, weight: 10 },
    { key: "contacts", label: "Контакты", completed: !!email || !!telegram, weight: 5 },
  ], [avatarUrl, roleId, level, bio, city, country, selectedSkills, experiences, education, certificates, sportsExperience, email, telegram]);

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
      <div className="container py-8 md:py-12">
        <div className="flex gap-8">
          {/* Sidebar */}
          <ProfileSidebar activeSection={activeSection} onSectionClick={scrollToSection} />

          {/* Main Content */}
          <div className="flex-1 max-w-3xl space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="font-display text-2xl md:text-3xl font-bold uppercase">
                {profileId ? "Редактирование профиля" : "Создание профиля"}
              </h1>
              <Button variant="outline" onClick={() => navigate(-1)}>
                <X className="h-4 w-4 mr-2" />Отмена
              </Button>
            </div>

            <ProfileProgress fields={profileFields} />

            {/* BASIC */}
            <div ref={el => { sectionRefs.current["basic"] = el; }}>
              <Card>
                <CardContent className="py-6">
                  <div className="flex items-center gap-6">
                    <ImageUpload
                      currentImageUrl={avatarUrl}
                      onImageUploaded={setAvatarUrl}
                      bucket="avatars"
                      userId={user!.id}
                      size="lg"
                      shape="circle"
                      placeholder={
                        <span className="text-2xl font-display font-bold text-muted-foreground">
                          {firstName?.[0] || "?"}{lastName?.[0] || "?"}
                        </span>
                      }
                    />
                    <div>
                      <h3 className="font-semibold mb-1">Фото профиля</h3>
                      <p className="text-sm text-muted-foreground">400×400 px рекомендуется</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="font-display uppercase">Основная информация</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Имя *</Label>
                      <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Иван" />
                    </div>
                    <div className="space-y-2">
                      <Label>Фамилия *</Label>
                      <Input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Иванов" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Основная специализация</Label>
                      <Select value={roleId} onValueChange={setRoleId}>
                        <SelectTrigger><SelectValue placeholder="Выберите роль" /></SelectTrigger>
                        <SelectContent>
                          {roles.map(role => <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Смежная специализация</Label>
                      <Select value={secondaryRoleId} onValueChange={setSecondaryRoleId} disabled={!roleId}>
                        <SelectTrigger><SelectValue placeholder="Опционально" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Нет</SelectItem>
                          {secondaryRoleOptions.map(role => <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">Смежная роль помогает клубам находить вас шире. Выберите, если реально выполняете задачи этой роли.</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Уровень</Label>
                    <Select value={level} onValueChange={setLevel}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {levels.map(l => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* ABOUT */}
            <div ref={el => { sectionRefs.current["about"] = el; }}>
              <AboutEditor
                bio={bio} aboutUseful={aboutUseful} aboutStyle={aboutStyle} aboutGoals={aboutGoals}
                onBioChange={setBio} onAboutUsefulChange={setAboutUseful}
                onAboutStyleChange={setAboutStyle} onAboutGoalsChange={setAboutGoals}
                roleName={primaryRoleName}
              />
            </div>

            {/* STATUS & PRIVACY */}
            <div ref={el => { sectionRefs.current["status"] = el; }}>
              <Card>
                <CardHeader>
                  <CardTitle className="font-display uppercase">Локация, статус и приватность</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Город</Label>
                      <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Москва" />
                    </div>
                    <div className="space-y-2">
                      <Label>Страна</Label>
                      <Input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Россия" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Статус поиска</Label>
                    <Select value={searchStatus} onValueChange={setSearchStatus}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {searchStatuses.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Desired role preferences */}
                  {searchStatus !== "not_looking" && (
                    <div className="border-t pt-4 space-y-4">
                      <h4 className="font-medium text-sm">Что ищу</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Формат</Label>
                          <Select value={desiredContractType} onValueChange={setDesiredContractType}>
                            <SelectTrigger><SelectValue placeholder="Любой" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="any">Любой</SelectItem>
                              <SelectItem value="full_time">Полная занятость</SelectItem>
                              <SelectItem value="part_time">Частичная</SelectItem>
                              <SelectItem value="contract">Контракт</SelectItem>
                              <SelectItem value="freelance">Фриланс</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Желаемый город</Label>
                          <Input value={desiredCity} onChange={(e) => setDesiredCity(e.target.value)} placeholder="Любой" />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-3 border-t pt-4">
                    <div className="flex items-center justify-between">
                      <Label>Готов к релокации</Label>
                      <Switch checked={isRelocatable} onCheckedChange={setIsRelocatable} />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Удалённая работа</Label>
                      <Switch checked={isRemoteAvailable} onCheckedChange={setIsRemoteAvailable} />
                    </div>
                  </div>

                  {/* Visibility */}
                  <div className="border-t pt-4 space-y-3">
                    <h4 className="font-medium text-sm">Видимость профиля</h4>
                    <Select value={visibilityLevel} onValueChange={setVisibilityLevel}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {visibilityLevels.map(v => <SelectItem key={v.value} value={v.value}>{v.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="border-t pt-4 space-y-3">
                    <h4 className="font-medium text-sm">Настройки приватности</h4>
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Показывать имя клубам</Label>
                          <p className="text-xs text-muted-foreground">Если выключено — клубы увидят только роль</p>
                        </div>
                        <Switch checked={showName} onCheckedChange={setShowName} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Показывать контакты</Label>
                          <p className="text-xs text-muted-foreground">Контакты видны только после разблокировки</p>
                        </div>
                        <Switch checked={showContacts} onCheckedChange={setShowContacts} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Скрыть текущую организацию</Label>
                          <p className="text-xs text-muted-foreground">В публичном профиле название текущей работы будет скрыто</p>
                        </div>
                        <Switch checked={hideCurrentOrg} onCheckedChange={setHideCurrentOrg} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* SKILLS */}
            <div ref={el => { sectionRefs.current["skills"] = el; }}>
              <SkillsEditor
                allSkills={allSkills}
                selectedSkills={selectedSkills}
                onChange={setSelectedSkills}
                primaryRoleName={primaryRoleName}
              />
            </div>

            {/* SPORTS */}
            <div ref={el => { sectionRefs.current["sports"] = el; }}>
              <SportsEditor
                profileId={profileId}
                sportsExperience={sportsExperience}
                sportsOpenTo={sportsOpenTo}
                onExperienceChange={setSportsExperience}
                onOpenToChange={setSportsOpenTo}
              />
            </div>

            {/* EXPERIENCE */}
            <div ref={el => { sectionRefs.current["experience"] = el; }}>
              <ExperienceEditor experiences={experiences} onChange={setExperiences} />
            </div>

            {/* EDUCATION */}
            <div ref={el => { sectionRefs.current["education"] = el; }}>
              <EducationEditor
                education={education}
                certificates={certificates}
                onEducationChange={setEducation}
                onCertificatesChange={setCertificates}
              />
            </div>

            {/* PORTFOLIO */}
            <div ref={el => { sectionRefs.current["portfolio"] = el; }}>
              <PortfolioEditor items={portfolio} onChange={setPortfolio} />
            </div>

            {/* CONTACTS */}
            <div ref={el => { sectionRefs.current["contacts"] = el; }}>
              <Card>
                <CardHeader>
                  <CardTitle className="font-display uppercase">Контакты</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ivan@example.com" />
                    </div>
                    <div className="space-y-2">
                      <Label>Телефон</Label>
                      <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+7 (999) 123-45-67" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Telegram</Label>
                      <Input value={telegram} onChange={(e) => setTelegram(e.target.value)} placeholder="@username" />
                    </div>
                    <div className="space-y-2">
                      <Label>LinkedIn</Label>
                      <Input value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} placeholder="https://linkedin.com/in/username" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Портфолио / Сайт</Label>
                    <Input value={portfolioUrl} onChange={(e) => setPortfolioUrl(e.target.value)} placeholder="https://example.com" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Save */}
            <div className="flex justify-end gap-4 pb-8">
              <Button variant="outline" onClick={() => navigate(-1)}>Отмена</Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Сохранение...</> : <><Save className="h-4 w-4 mr-2" />Сохранить</>}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
