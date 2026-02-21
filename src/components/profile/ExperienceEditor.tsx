import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";

export interface Experience {
  id?: string;
  company_name: string;
  position: string;
  league: string;
  team_level: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  description: string;
  employment_type: string;
  achievements: string[];
  is_remote: boolean;
  hide_org: boolean;
}

interface ExperienceEditorProps {
  experiences: Experience[];
  onChange: (items: Experience[]) => void;
}

const LABEL = "text-[13px] font-medium text-muted-foreground";
const HINT = "text-[12px] text-muted-foreground/60";
const FIELD_TEXT = "text-[14px]";

const employmentTypes = [
  { value: "full_time", label: "Полная занятость" },
  { value: "part_time", label: "Частичная занятость" },
  { value: "contract", label: "Контракт / проект" },
  { value: "internship", label: "Стажировка" },
  { value: "freelance", label: "Фриланс" },
];

const teamLevels = [
  { value: "academy", label: "Академия" },
  { value: "youth", label: "Молодёжная команда" },
  { value: "main", label: "Основной состав" },
  { value: "national", label: "Сборная" },
  { value: "other", label: "Другое" },
];

export function ExperienceEditor({ experiences, onChange }: ExperienceEditorProps) {
  const addExperience = () => {
    onChange([...experiences, {
      company_name: "", position: "", league: "", team_level: "",
      start_date: "", end_date: "", is_current: false, description: "",
      employment_type: "full_time", achievements: [], is_remote: false, hide_org: false,
    }]);
  };

  const update = (index: number, field: keyof Experience, value: any) => {
    onChange(experiences.map((e, i) => i === index ? { ...e, [field]: value } : e));
  };

  const remove = (index: number) => {
    onChange(experiences.filter((_, i) => i !== index));
  };

  const addAchievement = (index: number) => {
    const exp = experiences[index];
    update(index, "achievements", [...exp.achievements, ""]);
  };

  const updateAchievement = (expIndex: number, achIndex: number, value: string) => {
    const exp = experiences[expIndex];
    const newAch = exp.achievements.map((a, i) => i === achIndex ? value : a);
    update(expIndex, "achievements", newAch);
  };

  const removeAchievement = (expIndex: number, achIndex: number) => {
    const exp = experiences[expIndex];
    update(expIndex, "achievements", exp.achievements.filter((_, i) => i !== achIndex));
  };

  return (
    <div className="bg-card rounded-xl p-5 md:p-6 shadow-card space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-[16px] font-semibold text-foreground">Опыт работы</h2>
        <Button variant="outline" size="sm" onClick={addExperience} className="text-[13px]">
          <Plus className="h-4 w-4 mr-1.5" />Добавить
        </Button>
      </div>

      {experiences.length === 0 ? (
        <p className="text-muted-foreground/60 text-center py-6 text-[14px]">Добавьте свой опыт работы</p>
      ) : (
        experiences.map((exp, index) => (
          <div key={index} className="border border-border/40 rounded-lg p-4 space-y-4">
            <div className="flex justify-between items-start">
              <h4 className="text-[14px] font-medium text-foreground">Место работы {index + 1}</h4>
              <Button variant="ghost" size="sm" onClick={() => remove(index)}>
                <Trash2 className="h-4 w-4 text-muted-foreground/40 hover:text-destructive" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className={LABEL}>Организация</Label>
                <Input className={FIELD_TEXT} value={exp.company_name} onChange={(e) => update(index, "company_name", e.target.value)} placeholder="ФК Спартак / Академия" />
              </div>
              <div className="space-y-1">
                <Label className={LABEL}>Должность</Label>
                <Input className={FIELD_TEXT} value={exp.position} onChange={(e) => update(index, "position", e.target.value)} placeholder="Видеоаналитик" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className={LABEL}>Тип занятости</Label>
                <Select value={exp.employment_type} onValueChange={(v) => update(index, "employment_type", v)}>
                  <SelectTrigger className={FIELD_TEXT}><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {employmentTypes.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className={LABEL}>Уровень команды</Label>
                <Select value={exp.team_level} onValueChange={(v) => update(index, "team_level", v)}>
                  <SelectTrigger className={FIELD_TEXT}><SelectValue placeholder="Выберите" /></SelectTrigger>
                  <SelectContent>
                    {teamLevels.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className={LABEL}>Лига</Label>
                <Input className={FIELD_TEXT} value={exp.league} onChange={(e) => update(index, "league", e.target.value)} placeholder="РПЛ" />
              </div>
              <div className="flex flex-col gap-3 pt-5">
                <div className="flex items-center gap-2">
                  <Switch checked={exp.is_remote} onCheckedChange={(v) => update(index, "is_remote", v)} />
                  <Label className="text-[13px]">Удалённо</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={exp.hide_org} onCheckedChange={(v) => update(index, "hide_org", v)} />
                  <Label className="text-[13px]">Скрыть организацию для незарегистрированных компаний</Label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className={LABEL}>Дата начала</Label>
                <Input className={FIELD_TEXT} type="date" value={exp.start_date} onChange={(e) => update(index, "start_date", e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className={LABEL}>Дата окончания</Label>
                <Input className={FIELD_TEXT} type="date" value={exp.end_date} onChange={(e) => update(index, "end_date", e.target.value)} disabled={exp.is_current} />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch checked={exp.is_current} onCheckedChange={(v) => update(index, "is_current", v)} />
              <Label className="text-[13px]">Текущее место работы</Label>
            </div>

            <div className="space-y-1">
              <Label className={LABEL}>Описание</Label>
              <Textarea className={FIELD_TEXT} value={exp.description} onChange={(e) => update(index, "description", e.target.value)} placeholder="Обязанности и контекст..." rows={2} />
            </div>

            {/* Achievements */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className={LABEL}>Ключевые достижения</Label>
                <Button variant="ghost" size="sm" onClick={() => addAchievement(index)} disabled={exp.achievements.length >= 6} type="button" className="text-[12px]">
                  <Plus className="h-3 w-3 mr-1" />Добавить
                </Button>
              </div>
              <p className={HINT}>Конкретные результаты, измеримые показатели (3–6 пунктов)</p>
              {exp.achievements.map((ach, ai) => (
                <div key={ai} className="flex gap-2">
                  <span className="text-muted-foreground/40 mt-2">•</span>
                  <Input className={`flex-1 ${FIELD_TEXT}`} value={ach} onChange={(e) => updateAchievement(index, ai, e.target.value)} placeholder="Внедрил систему GPS-аналитики, сократив травмы на 15%" />
                  <Button variant="ghost" size="sm" onClick={() => removeAchievement(index, ai)} type="button">
                    <Trash2 className="h-3 w-3 text-muted-foreground/40 hover:text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
