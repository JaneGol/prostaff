import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Briefcase } from "lucide-react";
import { useState } from "react";

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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-display uppercase flex items-center gap-2">
          <Briefcase className="h-5 w-5" />
          Опыт работы
        </CardTitle>
        <Button variant="outline" size="sm" onClick={addExperience}>
          <Plus className="h-4 w-4 mr-2" />Добавить
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {experiences.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">Добавьте свой опыт работы</p>
        ) : (
          experiences.map((exp, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-4">
              <div className="flex justify-between items-start">
                <h4 className="font-medium">Место работы {index + 1}</h4>
                <Button variant="ghost" size="sm" onClick={() => remove(index)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Организация *</Label>
                  <Input value={exp.company_name} onChange={(e) => update(index, "company_name", e.target.value)} placeholder="ФК Спартак / Академия" />
                </div>
                <div className="space-y-2">
                  <Label>Должность *</Label>
                  <Input value={exp.position} onChange={(e) => update(index, "position", e.target.value)} placeholder="Видеоаналитик" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Тип занятости</Label>
                  <Select value={exp.employment_type} onValueChange={(v) => update(index, "employment_type", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {employmentTypes.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Уровень команды</Label>
                  <Select value={exp.team_level} onValueChange={(v) => update(index, "team_level", v)}>
                    <SelectTrigger><SelectValue placeholder="Выберите" /></SelectTrigger>
                    <SelectContent>
                      {teamLevels.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Лига</Label>
                  <Input value={exp.league} onChange={(e) => update(index, "league", e.target.value)} placeholder="РПЛ" />
                </div>
                <div className="flex items-center gap-4 pt-6">
                  <div className="flex items-center gap-2">
                    <Switch checked={exp.is_remote} onCheckedChange={(v) => update(index, "is_remote", v)} />
                    <Label className="text-sm">Удалённо</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={exp.hide_org} onCheckedChange={(v) => update(index, "hide_org", v)} />
                    <Label className="text-sm">Скрыть орг.</Label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Дата начала *</Label>
                  <Input type="date" value={exp.start_date} onChange={(e) => update(index, "start_date", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Дата окончания</Label>
                  <Input type="date" value={exp.end_date} onChange={(e) => update(index, "end_date", e.target.value)} disabled={exp.is_current} />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Switch checked={exp.is_current} onCheckedChange={(v) => update(index, "is_current", v)} />
                <Label>Текущее место работы</Label>
              </div>

              <div className="space-y-2">
                <Label>Описание</Label>
                <Textarea value={exp.description} onChange={(e) => update(index, "description", e.target.value)} placeholder="Обязанности и контекст..." rows={2} />
              </div>

              {/* Achievements */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Ключевые достижения</Label>
                  <Button variant="ghost" size="sm" onClick={() => addAchievement(index)} disabled={exp.achievements.length >= 6} type="button">
                    <Plus className="h-3 w-3 mr-1" />Добавить
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Конкретные результаты, измеримые показатели (3–6 пунктов)</p>
                {exp.achievements.map((ach, ai) => (
                  <div key={ai} className="flex gap-2">
                    <span className="text-muted-foreground mt-2">•</span>
                    <Input
                      value={ach}
                      onChange={(e) => updateAchievement(index, ai, e.target.value)}
                      placeholder="Внедрил систему GPS-аналитики, сократив травмы на 15%"
                      className="flex-1"
                    />
                    <Button variant="ghost" size="sm" onClick={() => removeAchievement(index, ai)} type="button">
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
