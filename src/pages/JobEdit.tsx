import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import { Loader2, Save, X, Trash2, Plus, Search } from "lucide-react";
import { useRoleGroups } from "@/hooks/useRoleGroups";
import { getRecommendedSkillsLegacy as getRecommendedSkills } from "@/lib/recommendedSkills"; // v2
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

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

const contractTypes = [
  { value: "full_time", label: "Полная занятость" },
  { value: "part_time", label: "Частичная занятость" },
  { value: "contract", label: "Контракт" },
  { value: "internship", label: "Стажировка" },
  { value: "freelance", label: "Фриланс" }
];

const statuses = [
  { value: "draft", label: "Черновик" },
  { value: "active", label: "Активна" },
  { value: "paused", label: "Приостановлена" },
  { value: "closed", label: "Закрыта" }
];

export default function JobEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, userRole, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const isNew = !id || id === "new";
  const { getGroupKeyForRoleId } = useRoleGroups();

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [companyId, setCompanyId] = useState<string | null>(null);

  // Form data
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [responsibilities, setResponsibilities] = useState("");
  const [roleId, setRoleId] = useState("");
  const [level, setLevel] = useState("");
  const [contractType, setContractType] = useState("full_time");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("Россия");
  const [isRemote, setIsRemote] = useState(false);
  const [isRelocatable, setIsRelocatable] = useState(false);
  const [status, setStatus] = useState("active");

  // Reference data
  const [roles, setRoles] = useState<SpecialistRole[]>([]);
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<{ id: string; required: boolean }[]>([]);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate("/auth");
        return;
      }
      if (userRole && userRole !== "employer") {
        navigate("/");
        return;
      }
      fetchData();
    }
  }, [user, userRole, authLoading]);

  const fetchData = async () => {
    try {
      // Fetch company
      const { data: company } = await supabase
        .from("companies")
        .select("id")
        .eq("user_id", user!.id)
        .maybeSingle();

      if (!company) {
        toast({
          title: "Создайте профиль компании",
          description: "Для публикации вакансий необходимо заполнить данные компании",
          variant: "destructive"
        });
        navigate("/company/edit");
        return;
      }

      setCompanyId(company.id);

      // Fetch reference data
      const [rolesRes, skillsRes] = await Promise.all([
        supabase.from("specialist_roles").select("id, name").order("name"),
        supabase.from("skills").select("id, name, category").order("name")
      ]);

      if (rolesRes.data) setRoles(rolesRes.data);
      if (skillsRes.data) setAllSkills(skillsRes.data);

      // Fetch existing job if editing
      if (!isNew) {
        const { data: job } = await supabase
          .from("jobs")
          .select("*")
          .eq("id", id)
          .maybeSingle();

        if (job) {
          setTitle(job.title);
          setDescription(job.description);
          setRequirements(job.requirements || "");
          setResponsibilities(job.responsibilities || "");
          setRoleId(job.role_id || "");
          setLevel(job.level || "");
          setContractType(job.contract_type || "full_time");
          setSalaryMin(job.salary_min?.toString() || "");
          setSalaryMax(job.salary_max?.toString() || "");
          setCity(job.city || "");
          setCountry(job.country || "Россия");
          setIsRemote(job.is_remote || false);
          setIsRelocatable(job.is_relocatable || false);
          setStatus(job.status || "active");

          // Fetch skills
          const { data: jobSkills } = await supabase
            .from("job_skills")
            .select("skill_id, is_required")
            .eq("job_id", id);

          if (jobSkills) {
            setSelectedSkills(jobSkills.map(s => ({
              id: s.skill_id,
              required: s.is_required
            })));
          }
        }
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
    if (!title.trim() || !description.trim()) {
      toast({
        title: "Ошибка",
        description: "Заполните название и описание вакансии",
        variant: "destructive"
      });
      return;
    }

    if (!companyId) {
      toast({
        title: "Ошибка",
        description: "Компания не найдена",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);

    try {
      const jobData = {
        company_id: companyId,
        title: title.trim(),
        description: description.trim(),
        requirements: requirements.trim() || null,
        responsibilities: responsibilities.trim() || null,
        role_id: roleId || null,
        level: (level || null) as "intern" | "junior" | "middle" | "senior" | "head" | null,
        contract_type: contractType as "full_time" | "part_time" | "contract" | "internship" | "freelance",
        salary_min: salaryMin ? parseInt(salaryMin) : null,
        salary_max: salaryMax ? parseInt(salaryMax) : null,
        city: city.trim() || null,
        country: country.trim() || null,
        is_remote: isRemote,
        is_relocatable: isRelocatable,
        status: status as "draft" | "active" | "paused" | "closed"
      };

      let jobId = id;

      if (isNew) {
        const { data, error } = await supabase
          .from("jobs")
          .insert(jobData)
          .select("id")
          .single();

        if (error) throw error;
        jobId = data.id;
      } else {
        const { error } = await supabase
          .from("jobs")
          .update(jobData)
          .eq("id", id);

        if (error) throw error;
      }

      // Update skills
      if (jobId) {
        await supabase
          .from("job_skills")
          .delete()
          .eq("job_id", jobId);

        if (selectedSkills.length > 0) {
          await supabase
            .from("job_skills")
            .insert(selectedSkills.map(s => ({
              job_id: jobId,
              skill_id: s.id,
              is_required: s.required
            })));
        }
      }

      toast({
        title: "Сохранено",
        description: isNew ? "Вакансия создана" : "Вакансия обновлена"
      });

      navigate(`/jobs/${jobId}`);
    } catch (err) {
      console.error("Error saving job:", err);
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить вакансию",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleSkill = (skillId: string) => {
    setSelectedSkills(prev => {
      const exists = prev.find(s => s.id === skillId);
      if (exists) {
        return prev.filter(s => s.id !== skillId);
      }
      return [...prev, { id: skillId, required: false }];
    });
  };

  /** Ensure a skill exists in DB by name; create if missing. Returns skill id. */
  const ensureSkillByName = async (name: string): Promise<string | null> => {
    // Check local cache first
    const existing = allSkills.find(s => s.name === name);
    if (existing) return existing.id;
    // Create in DB
    const { data, error } = await supabase
      .from("skills")
      .insert({ name, category: "Рекомендованные" })
      .select("id, name, category")
      .single();
    if (error || !data) return null;
    // Update local cache
    setAllSkills(prev => [...prev, data as Skill]);
    return data.id;
  };

  const handleRecommendedClick = async (skillName: string) => {
    const skillId = await ensureSkillByName(skillName);
    if (skillId) toggleSkill(skillId);
  };

  const handleRecommendedDoubleClick = async (skillName: string) => {
    const skillId = allSkills.find(s => s.name === skillName)?.id;
    if (skillId && selectedSkills.find(s => s.id === skillId)) {
      toggleRequired(skillId);
    }
  };

  const toggleRequired = (skillId: string) => {
    setSelectedSkills(prev =>
      prev.map(s => s.id === skillId ? { ...s, required: !s.required } : s)
    );
  };

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  // Get recommended skills based on selected role's group
  const groupKey = getGroupKeyForRoleId(roleId || null);
  const recommendedSections = getRecommendedSkills(groupKey === "other" && !roleId ? null : groupKey);

  // Group remaining DB skills by category (excluding already recommended names)
  const recommendedNames = new Set(recommendedSections.flatMap(s => s.skills));
  const extraSkills = allSkills.filter(s => !recommendedNames.has(s.name));
  const skillsByCategory = extraSkills.reduce((acc, skill) => {
    const cat = skill.category || "Прочее";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  // Helper: find skill id by name (or null)
  const findSkillId = (name: string) => allSkills.find(s => s.name === name)?.id || null;

  return (
    <Layout>
      <div className="container max-w-6xl py-8 md:py-12">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="font-display text-2xl md:text-3xl font-bold uppercase">
              {isNew ? "Новая вакансия" : "Редактирование вакансии"}
            </h1>
            <Button variant="outline" onClick={() => navigate(-1)}>
              <X className="h-4 w-4 mr-2" />
              Отмена
            </Button>
          </div>

          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display uppercase">Основная информация</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Название вакансии *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Видеоаналитик в основную команду"
                />
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
                      <SelectValue placeholder="Выберите уровень" />
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
                <Label htmlFor="description">Описание *</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Подробное описание вакансии..."
                  rows={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="requirements">Требования</Label>
                <Textarea
                  id="requirements"
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  placeholder="Требования к кандидату..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="responsibilities">Обязанности</Label>
                <Textarea
                  id="responsibilities"
                  value={responsibilities}
                  onChange={(e) => setResponsibilities(e.target.value)}
                  placeholder="Что предстоит делать..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Conditions */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display uppercase">Условия</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Тип занятости</Label>
                  <Select value={contractType} onValueChange={setContractType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {contractTypes.map(ct => (
                        <SelectItem key={ct.value} value={ct.value}>
                          {ct.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Статус</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map(s => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="salaryMin">Зарплата от</Label>
                  <Input
                    id="salaryMin"
                    type="number"
                    value={salaryMin}
                    onChange={(e) => setSalaryMin(e.target.value)}
                    placeholder="100000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salaryMax">Зарплата до</Label>
                  <Input
                    id="salaryMax"
                    type="number"
                    value={salaryMax}
                    onChange={(e) => setSalaryMax(e.target.value)}
                    placeholder="150000"
                  />
                </div>
              </div>

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

              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="remote">Удалённая работа</Label>
                  <Switch
                    id="remote"
                    checked={isRemote}
                    onCheckedChange={setIsRemote}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="relocatable">Помощь с релокацией</Label>
                  <Switch
                    id="relocatable"
                    checked={isRelocatable}
                    onCheckedChange={setIsRelocatable}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Skills */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display uppercase">Требуемые навыки</CardTitle>
              {roleId && (
                <p className="text-sm text-muted-foreground">
                  Рекомендации на основе выбранной специализации. Клик — выбрать, двойной клик — обязательный (*).
                </p>
              )}
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Recommended skills from specialization */}
              {recommendedSections.map((section, si) => (
                <div key={si}>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">{section.title}</h4>
                  <div className="flex flex-wrap gap-2">
                    {section.skills.map(skillName => {
                      const skillId = findSkillId(skillName);
                      const selected = skillId ? selectedSkills.find(s => s.id === skillId) : null;
                      return (
                        <Badge
                          key={skillName}
                          variant={selected ? (selected.required ? "default" : "secondary") : "outline"}
                          className="cursor-pointer text-xs"
                          onClick={() => handleRecommendedClick(skillName)}
                          onDoubleClick={() => handleRecommendedDoubleClick(skillName)}
                        >
                          {skillName}
                          {selected?.required && " *"}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Extra skills from DB */}
              {Object.keys(skillsByCategory).length > 0 && (
                <Collapsible>
                  <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-primary hover:underline mt-2">
                    <Plus className="h-3.5 w-3.5" />
                    Добавить другие навыки
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-3 space-y-3">
                    {Object.entries(skillsByCategory).map(([category, skills]) => (
                      <div key={category}>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">{category}</h4>
                        <div className="flex flex-wrap gap-2">
                          {skills.map(skill => {
                            const selected = selectedSkills.find(s => s.id === skill.id);
                            return (
                              <Badge
                                key={skill.id}
                                variant={selected ? (selected.required ? "default" : "secondary") : "outline"}
                                className="cursor-pointer text-xs"
                                onClick={() => toggleSkill(skill.id)}
                                onDoubleClick={() => selected && toggleRequired(skill.id)}
                              >
                                {skill.name}
                                {selected?.required && " *"}
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              )}

              {selectedSkills.length > 0 && (
                <div className="pt-3 border-t border-border/50">
                  <p className="text-xs text-muted-foreground mb-2">
                    Выбрано: {selectedSkills.length} {selectedSkills.filter(s => s.required).length > 0 && `(обязательных: ${selectedSkills.filter(s => s.required).length})`}
                  </p>
                </div>
              )}
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
                  {isNew ? "Опубликовать" : "Сохранить"}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
