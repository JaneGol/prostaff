import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, Trophy, Handshake } from "lucide-react";
import { getSportIcon } from "@/lib/sportIcons";

interface Sport {
  id: string;
  name: string;
  icon: string | null;
  type_participation: string | null;
  type_activity: string | null;
}

export interface SportExperience {
  id?: string;
  sport_id: string;
  years: number;
  level: string;
  sport?: Sport;
}

export interface SportOpenTo {
  id?: string;
  sport_id?: string;
  sport_group?: string;
  sport?: Sport;
}

interface SportsEditorProps {
  profileId: string | null;
  sportsExperience: SportExperience[];
  sportsOpenTo: SportOpenTo[];
  onExperienceChange: (items: SportExperience[]) => void;
  onOpenToChange: (items: SportOpenTo[]) => void;
}

const participationGroups = [
  { value: "team", label: "Командные" },
  { value: "individual", label: "Индивидуальные" },
];

const activityGroups = [
  { value: "game", label: "Игровые" },
  { value: "cyclic", label: "Циклические" },
  { value: "combat", label: "Единоборства" },
  { value: "power", label: "Силовые" },
  { value: "coordination", label: "Координационные" },
  { value: "technical", label: "Технические" },
  { value: "mixed", label: "Смешанные" },
];

const levelOptions = [
  { value: "beginner", label: "Начинающий" },
  { value: "intermediate", label: "Средний" },
  { value: "advanced", label: "Продвинутый" },
  { value: "expert", label: "Эксперт" },
];

export function SportsEditor({
  profileId,
  sportsExperience,
  sportsOpenTo,
  onExperienceChange,
  onOpenToChange,
}: SportsEditorProps) {
  const [sports, setSports] = useState<Sport[]>([]);

  useEffect(() => {
    supabase
      .from("sports")
      .select("id, name, icon, type_participation, type_activity")
      .eq("is_active", true)
      .order("sort_order")
      .then(({ data }) => {
        if (data) setSports(data);
      });
  }, []);

  const availableSportsForExp = sports.filter(
    (s) => !sportsExperience.some((e) => e.sport_id === s.id)
  );
  const availableSportsForOpen = sports.filter(
    (s) => !sportsOpenTo.some((o) => o.sport_id === s.id)
  );

  const selectedGroups = sportsOpenTo
    .filter((o) => o.sport_group)
    .map((o) => o.sport_group!);

  const toggleGroup = (group: string) => {
    if (selectedGroups.includes(group)) {
      onOpenToChange(sportsOpenTo.filter((o) => o.sport_group !== group));
    } else {
      onOpenToChange([...sportsOpenTo, { sport_group: group }]);
    }
  };

  const addExperience = (sportId: string) => {
    const sport = sports.find((s) => s.id === sportId);
    onExperienceChange([
      ...sportsExperience,
      { sport_id: sportId, years: 1, level: "intermediate", sport },
    ]);
  };

  const updateExperience = (index: number, field: string, value: any) => {
    onExperienceChange(
      sportsExperience.map((e, i) => (i === index ? { ...e, [field]: value } : e))
    );
  };

  const removeExperience = (index: number) => {
    onExperienceChange(sportsExperience.filter((_, i) => i !== index));
  };

  const addOpenTo = (sportId: string) => {
    const sport = sports.find((s) => s.id === sportId);
    onOpenToChange([...sportsOpenTo, { sport_id: sportId, sport }]);
  };

  const removeOpenTo = (index: number) => {
    onOpenToChange(sportsOpenTo.filter((_, i) => i !== index));
  };

  const getSportName = (sportId: string) =>
    sports.find((s) => s.id === sportId)?.name || "—";

  const getSportIconName = (sportId: string) =>
    sports.find((s) => s.id === sportId)?.icon || null;

  return (
    <div className="space-y-6">
      {/* Sport Experience */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-display uppercase flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Опыт по видам спорта
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Укажите виды спорта, в которых у вас есть профессиональный опыт
          </p>

          {sportsExperience.map((exp, index) => {
            const IconComponent = getSportIcon(getSportIconName(exp.sport_id));
            return (
              <div key={index} className="border rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <IconComponent className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="font-medium truncate">{getSportName(exp.sport_id)}</span>
                  </div>
                  <Button variant="ghost" size="sm" className="flex-shrink-0" onClick={() => removeExperience(index)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={1}
                    max={50}
                    value={exp.years}
                    onChange={(e) => updateExperience(index, "years", parseInt(e.target.value) || 1)}
                    className="w-16"
                  />
                  <span className="text-sm text-muted-foreground whitespace-nowrap">лет</span>
                  <Select
                    value={exp.level}
                    onValueChange={(v) => updateExperience(index, "level", v)}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {levelOptions.map((l) => (
                        <SelectItem key={l.value} value={l.value}>
                          {l.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            );
          })}

          {availableSportsForExp.length > 0 && (
            <Select onValueChange={addExperience}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="+ Добавить вид спорта" />
              </SelectTrigger>
              <SelectContent>
                {availableSportsForExp.map((sport) => {
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
          )}
        </CardContent>
      </Card>

      {/* Open To Sports */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display uppercase flex items-center gap-2">
            <Handshake className="h-5 w-5" />
            Готов работать в
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <p className="text-sm text-muted-foreground">
            Быстро выберите группы или конкретные виды спорта
          </p>

          {/* Any sport */}
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={selectedGroups.includes("any") ? "default" : "outline"}
              className="cursor-pointer py-1.5 px-3 transition-colors"
              onClick={() => toggleGroup("any")}
            >
              Рассматриваю любой вид спорта
            </Badge>
          </div>

          {/* Group chips — Participation */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">По типу</Label>
            <div className="flex flex-wrap gap-2">
              {participationGroups.map((g) => (
                <Badge
                  key={g.value}
                  variant={selectedGroups.includes(g.value) ? "default" : "outline"}
                  className="cursor-pointer py-1.5 px-3 transition-colors"
                  onClick={() => toggleGroup(g.value)}
                >
                  {g.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Group chips — Activity */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">По активности</Label>
            <div className="flex flex-wrap gap-2">
              {activityGroups.map((g) => (
                <Badge
                  key={g.value}
                  variant={selectedGroups.includes(g.value) ? "default" : "outline"}
                  className="cursor-pointer py-1.5 px-3 transition-colors"
                  onClick={() => toggleGroup(g.value)}
                >
                  {g.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Individual sports */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Или конкретные виды</Label>
            <div className="flex flex-wrap gap-2">
              {sportsOpenTo.filter(item => item.sport_id).map((item, index) => {
                const Icon = getSportIcon(getSportIconName(item.sport_id!));
                const originalIndex = sportsOpenTo.indexOf(item);
                return (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center gap-1.5 py-1.5 px-3 cursor-pointer hover:bg-destructive/10"
                    onClick={() => removeOpenTo(originalIndex)}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {getSportName(item.sport_id!)}
                    <Trash2 className="h-3 w-3 ml-1" />
                  </Badge>
                );
              })}
            </div>
          </div>

          {availableSportsForOpen.length > 0 && (
            <Select onValueChange={addOpenTo}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="+ Добавить вид спорта" />
              </SelectTrigger>
              <SelectContent>
                {availableSportsForOpen.map((sport) => {
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
