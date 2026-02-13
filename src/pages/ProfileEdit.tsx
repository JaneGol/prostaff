import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, X, Plus, Trash2 } from "lucide-react";
import { ImageUpload } from "@/components/shared/ImageUpload";
import { ProfileProgress } from "@/components/shared/ProfileProgress";
import { SportsEditor, SportExperience, SportOpenTo } from "@/components/profile/SportsEditor";

interface SpecialistRole {
  id: string;
  name: string;
}

interface Skill {
  id: string;
  name: string;
  category: string | null;
}

interface Experience {
  id?: string;
  company_name: string;
  position: string;
  league: string;
  team_level: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  description: string;
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
  { value: "not_looking", label: "Не ищу работу" }
];

export default function ProfileEdit() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);

  // Form data
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [roleId, setRoleId] = useState("");
  const [level, setLevel] = useState("middle");
  const [bio, setBio] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("Россия");
  const [isRelocatable, setIsRelocatable] = useState(false);
  const [isRemoteAvailable, setIsRemoteAvailable] = useState(false);
  const [searchStatus, setSearchStatus] = useState("open_to_offers");
  const [isPublic, setIsPublic] = useState(true);
  const [showName, setShowName] = useState(true);
  const [showContacts, setShowContacts] = useState(true);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [telegram, setTelegram] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  // Reference data
  const [roles, setRoles] = useState<SpecialistRole[]>([]);
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [sportsExperience, setSportsExperience] = useState<SportExperience[]>([]);
  const [sportsOpenTo, setSportsOpenTo] = useState<SportOpenTo[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }
    if (user) {
      fetchData();
    }
  }, [user, authLoading]);

  const fetchData = async () => {
    try {
      // Fetch reference data
      const [rolesRes, skillsRes] = await Promise.all([
        supabase.from("specialist_roles").select("id, name").order("name"),
        supabase.from("skills").select("id, name, category").order("name")
      ]);

      if (rolesRes.data) setRoles(rolesRes.data);
      if (skillsRes.data) setAllSkills(skillsRes.data);

      // Fetch existing profile
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
        setLevel(profile.level || "middle");
        setBio(profile.bio || "");
        setCity(profile.city || "");
        setCountry(profile.country || "Россия");
        setIsRelocatable(profile.is_relocatable || false);
        setIsRemoteAvailable(profile.is_remote_available || false);
        setSearchStatus(profile.search_status || "open_to_offers");
        setIsPublic(profile.is_public !== false);
        setShowName((profile as any).show_name !== false);
        setShowContacts((profile as any).show_contacts !== false);
        setEmail(profile.email || user!.email || "");
        setPhone(profile.phone || "");
        setTelegram(profile.telegram || "");
        setLinkedinUrl(profile.linkedin_url || "");
        setPortfolioUrl(profile.portfolio_url || "");
        setAvatarUrl(profile.avatar_url || "");

        // Fetch skills
        const { data: profileSkills } = await supabase
          .from("profile_skills")
          .select("skill_id")
          .eq("profile_id", profile.id);

        if (profileSkills) {
          setSelectedSkills(profileSkills.map(s => s.skill_id));
        }

        // Fetch experiences
        const { data: experiencesData } = await supabase
          .from("experiences")
          .select("*")
          .eq("profile_id", profile.id)
          .order("start_date", { ascending: false });

        if (experiencesData) {
          setExperiences(experiencesData.map(e => ({
            id: e.id,
            company_name: e.company_name,
            position: e.position,
            league: e.league || "",
            team_level: e.team_level || "",
            start_date: e.start_date,
            end_date: e.end_date || "",
            is_current: e.is_current || false,
            description: e.description || ""
          })));
        }

        // Fetch sports experience
        const { data: sportsExpData } = await supabase
          .from("profile_sports_experience")
          .select("id, sport_id, years, level, sports:sport_id (id, name, icon)")
          .eq("profile_id", profile.id);

        if (sportsExpData) {
          setSportsExperience(sportsExpData.map((s: any) => ({
            id: s.id,
            sport_id: s.sport_id,
            years: s.years || 1,
            level: s.level || "intermediate",
            sport: s.sports,
          })));
        }

        // Fetch sports open to
        const { data: sportsOpenData } = await supabase
          .from("profile_sports_open_to")
          .select("id, sport_id, sports:sport_id (id, name, icon)")
          .eq("profile_id", profile.id);

        if (sportsOpenData) {
          setSportsOpenTo(sportsOpenData.map((s: any) => ({
            id: s.id,
            sport_id: s.sport_id,
            sport: s.sports,
          })));
        }
      } else {
        // New profile - set email from auth
        setEmail(user!.email || "");
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить данные",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      toast({
        title: "Ошибка",
        description: "Заполните имя и фамилию",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);

    try {
      const profileData = {
        user_id: user!.id,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        role_id: roleId || null,
        level: level as any,
        bio: bio.trim() || null,
        city: city.trim() || null,
        country: country.trim() || null,
        is_relocatable: isRelocatable,
        is_remote_available: isRemoteAvailable,
        search_status: searchStatus as any,
        is_public: isPublic,
        show_name: showName,
        show_contacts: showContacts,
        email: email.trim() || null,
        phone: phone.trim() || null,
        telegram: telegram.trim() || null,
        linkedin_url: linkedinUrl.trim() || null,
        portfolio_url: portfolioUrl.trim() || null,
        avatar_url: avatarUrl || null
      } as any;

      let newProfileId = profileId;

      if (profileId) {
        // Update existing
        const { error } = await supabase
          .from("profiles")
          .update(profileData)
          .eq("id", profileId);

        if (error) throw error;
      } else {
        // Create new
        const { data, error } = await supabase
          .from("profiles")
          .insert(profileData)
          .select("id")
          .single();

        if (error) throw error;
        newProfileId = data.id;
        setProfileId(data.id);
      }

      // Update skills
      if (newProfileId) {
        // Remove old skills
        await supabase
          .from("profile_skills")
          .delete()
          .eq("profile_id", newProfileId);

        // Add new skills
        if (selectedSkills.length > 0) {
          await supabase
            .from("profile_skills")
            .insert(selectedSkills.map(skillId => ({
              profile_id: newProfileId,
              skill_id: skillId
            })));
        }

        // Handle experiences
        // Delete removed experiences
        const existingIds = experiences.filter(e => e.id).map(e => e.id);
        if (existingIds.length > 0) {
          await supabase
            .from("experiences")
            .delete()
            .eq("profile_id", newProfileId)
            .not("id", "in", `(${existingIds.join(",")})`);
        } else {
          await supabase
            .from("experiences")
            .delete()
            .eq("profile_id", newProfileId);
        }

        // Upsert experiences
        for (const exp of experiences) {
          if (exp.id) {
            await supabase
              .from("experiences")
              .update({
                company_name: exp.company_name,
                position: exp.position,
                league: exp.league || null,
                team_level: exp.team_level || null,
                start_date: exp.start_date,
                end_date: exp.end_date || null,
                is_current: exp.is_current,
                description: exp.description || null
              })
              .eq("id", exp.id);
          } else {
            await supabase
              .from("experiences")
              .insert({
                profile_id: newProfileId,
                company_name: exp.company_name,
                position: exp.position,
                league: exp.league || null,
                team_level: exp.team_level || null,
                start_date: exp.start_date,
                end_date: exp.end_date || null,
                is_current: exp.is_current,
                description: exp.description || null
              });
          }
        }

        // Save sports experience
        await supabase.from("profile_sports_experience").delete().eq("profile_id", newProfileId);
        if (sportsExperience.length > 0) {
          await supabase.from("profile_sports_experience").insert(
            sportsExperience.map((s) => ({
              profile_id: newProfileId!,
              sport_id: s.sport_id,
              years: s.years,
              level: s.level,
            }))
          );
        }

        // Save sports open to
        await supabase.from("profile_sports_open_to").delete().eq("profile_id", newProfileId);
        if (sportsOpenTo.length > 0) {
          await supabase.from("profile_sports_open_to").insert(
            sportsOpenTo.map((s) => ({
              profile_id: newProfileId!,
              sport_id: s.sport_id,
            }))
          );
        }
      }

      toast({
        title: "Сохранено",
        description: "Профиль успешно обновлён"
      });

      navigate(`/profile/${newProfileId}`);
    } catch (err) {
      console.error("Error saving profile:", err);
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить профиль",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleSkill = (skillId: string) => {
    setSelectedSkills(prev =>
      prev.includes(skillId)
        ? prev.filter(id => id !== skillId)
        : [...prev, skillId]
    );
  };

  const addExperience = () => {
    setExperiences(prev => [...prev, {
      company_name: "",
      position: "",
      league: "",
      team_level: "",
      start_date: "",
      end_date: "",
      is_current: false,
      description: ""
    }]);
  };

  const updateExperience = (index: number, field: keyof Experience, value: any) => {
    setExperiences(prev => prev.map((exp, i) =>
      i === index ? { ...exp, [field]: value } : exp
    ));
  };

  const removeExperience = (index: number) => {
    setExperiences(prev => prev.filter((_, i) => i !== index));
  };

  // Group skills by category (computed before return)
  const skillsByCategory = allSkills.reduce((acc, skill) => {
    const cat = skill.category || "Прочее";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  // Profile completeness calculation (must be before conditional returns)
  const profileFields = useMemo(() => [
    { key: "avatar", label: "Фото профиля", completed: !!avatarUrl, weight: 10 },
    { key: "name", label: "Имя и фамилия", completed: !!firstName && !!lastName, weight: 15 },
    { key: "role", label: "Специализация", completed: !!roleId, weight: 15 },
    { key: "bio", label: "О себе", completed: !!bio && bio.length > 20, weight: 10 },
    { key: "location", label: "Город и страна", completed: !!city && !!country, weight: 10 },
    { key: "skills", label: "Навыки (минимум 3)", completed: selectedSkills.length >= 3, weight: 15 },
    { key: "experience", label: "Опыт работы", completed: experiences.length > 0 && experiences.some(e => e.company_name && e.position), weight: 15 },
    { key: "contacts", label: "Контакты (email/telegram)", completed: !!email || !!telegram, weight: 10 },
  ], [avatarUrl, firstName, lastName, roleId, bio, city, country, selectedSkills, experiences, email, telegram]);

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
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="font-display text-2xl md:text-3xl font-bold uppercase">
              {profileId ? "Редактирование профиля" : "Создание профиля"}
            </h1>
            <Button variant="outline" onClick={() => navigate(-1)}>
              <X className="h-4 w-4 mr-2" />
              Отмена
            </Button>
          </div>

          {/* Profile Progress */}
          <ProfileProgress fields={profileFields} />

          {/* Avatar Upload */}
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
                  <p className="text-sm text-muted-foreground">
                    Нажмите на изображение, чтобы загрузить фото.<br />
                    Рекомендуемый размер: 400×400 пикселей.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display uppercase">Основная информация</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Имя *</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Иван"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Фамилия *</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Иванов"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Специализация</Label>
                  <Select value={roleId} onValueChange={setRoleId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите роль" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map(role => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Уровень</Label>
                  <Select value={level} onValueChange={setLevel}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {levels.map(l => (
                        <SelectItem key={l.value} value={l.value}>
                          {l.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">О себе</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Расскажите о своём опыте и профессиональных интересах..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Location & Status */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display uppercase">Локация и статус</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">Город</Label>
                  <Input
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Москва"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Страна</Label>
                  <Input
                    id="country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="Россия"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Статус поиска</Label>
                <Select value={searchStatus} onValueChange={setSearchStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {searchStatuses.map(s => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="relocatable">Готов к релокации</Label>
                  <Switch
                    id="relocatable"
                    checked={isRelocatable}
                    onCheckedChange={setIsRelocatable}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="remote">Удалённая работа</Label>
                  <Switch
                    id="remote"
                    checked={isRemoteAvailable}
                    onCheckedChange={setIsRemoteAvailable}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="public">Публичный профиль</Label>
                  <Switch
                    id="public"
                    checked={isPublic}
                    onCheckedChange={setIsPublic}
                  />
                </div>
              </div>

              {/* Privacy toggles */}
              <div className="border-t pt-4 mt-4 space-y-1">
                <h4 className="font-medium text-sm mb-3">Настройки приватности</h4>
                <p className="text-xs text-muted-foreground mb-3">
                  Контролируйте, какую информацию видят работодатели до подтверждения доступа
                </p>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="showName">Показывать имя клубам</Label>
                      <p className="text-xs text-muted-foreground">Если выключено, клубы увидят только роль и навыки</p>
                    </div>
                    <Switch
                      id="showName"
                      checked={showName}
                      onCheckedChange={setShowName}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="showContacts">Показывать контакты</Label>
                      <p className="text-xs text-muted-foreground">Email, телефон, Telegram будут скрыты для новых просмотров</p>
                    </div>
                    <Switch
                      id="showContacts"
                      checked={showContacts}
                      onCheckedChange={setShowContacts}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Skills */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display uppercase">Навыки</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(skillsByCategory).map(([category, skills]) => (
                <div key={category}>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">{category}</h4>
                  <div className="flex flex-wrap gap-2">
                    {skills.map(skill => (
                      <Badge
                        key={skill.id}
                        variant={selectedSkills.includes(skill.id) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleSkill(skill.id)}
                      >
                        {skill.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Sports */}
          <SportsEditor
            profileId={profileId}
            sportsExperience={sportsExperience}
            sportsOpenTo={sportsOpenTo}
            onExperienceChange={setSportsExperience}
            onOpenToChange={setSportsOpenTo}
          />

          {/* Experience */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="font-display uppercase">Опыт работы</CardTitle>
              <Button variant="outline" size="sm" onClick={addExperience}>
                <Plus className="h-4 w-4 mr-2" />
                Добавить
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {experiences.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Добавьте свой опыт работы
                </p>
              ) : (
                experiences.map((exp, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-4">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium">Место работы {index + 1}</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeExperience(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Компания/Клуб *</Label>
                        <Input
                          value={exp.company_name}
                          onChange={(e) => updateExperience(index, "company_name", e.target.value)}
                          placeholder="ФК Спартак"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Должность *</Label>
                        <Input
                          value={exp.position}
                          onChange={(e) => updateExperience(index, "position", e.target.value)}
                          placeholder="Видеоаналитик"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Лига</Label>
                        <Input
                          value={exp.league}
                          onChange={(e) => updateExperience(index, "league", e.target.value)}
                          placeholder="РПЛ"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Команда/Уровень</Label>
                        <Input
                          value={exp.team_level}
                          onChange={(e) => updateExperience(index, "team_level", e.target.value)}
                          placeholder="Основа / U-21"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Дата начала *</Label>
                        <Input
                          type="date"
                          value={exp.start_date}
                          onChange={(e) => updateExperience(index, "start_date", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Дата окончания</Label>
                        <Input
                          type="date"
                          value={exp.end_date}
                          onChange={(e) => updateExperience(index, "end_date", e.target.value)}
                          disabled={exp.is_current}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={exp.is_current}
                        onCheckedChange={(checked) => updateExperience(index, "is_current", checked)}
                      />
                      <Label>Текущее место работы</Label>
                    </div>
                    <div className="space-y-2">
                      <Label>Описание</Label>
                      <Textarea
                        value={exp.description}
                        onChange={(e) => updateExperience(index, "description", e.target.value)}
                        placeholder="Опишите ваши обязанности и достижения..."
                        rows={3}
                      />
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Contacts */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display uppercase">Контакты</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ivan@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Телефон</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+7 (999) 123-45-67"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="telegram">Telegram</Label>
                  <Input
                    id="telegram"
                    value={telegram}
                    onChange={(e) => setTelegram(e.target.value)}
                    placeholder="@username"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="portfolio">Портфолио / Сайт</Label>
                <Input
                  id="portfolio"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  placeholder="https://example.com"
                />
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={() => navigate(-1)}>
              Отмена
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Сохранение...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Сохранить
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
