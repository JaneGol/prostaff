import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Search, Star, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface Skill {
  id: string;
  name: string;
  category: string | null;
}

export interface SkillSelection {
  skill_id: string | null;
  proficiency: number;
  is_top: boolean;
  custom_name?: string;
  custom_group?: string;
  is_custom: boolean;
}

interface SkillsEditorProps {
  allSkills: Skill[];
  selectedSkills: SkillSelection[];
  onChange: (skills: SkillSelection[]) => void;
  maxSkills?: number;
  maxTopSkills?: number;
  primaryRoleName?: string;
}

const proficiencyLabels: Record<number, string> = {
  1: "Базовый",
  2: "Уверенный",
  3: "Эксперт",
};

const LABEL = "text-[13px] font-medium text-muted-foreground";
const HINT = "text-[12px] text-muted-foreground/60";

export function SkillsEditor({
  allSkills, selectedSkills, onChange, maxSkills = 20, maxTopSkills = 5, primaryRoleName,
}: SkillsEditorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [customName, setCustomName] = useState("");
  const [customGroup, setCustomGroup] = useState("");
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});

  const skillsByCategory = useMemo(() => {
    return allSkills.reduce((acc, skill) => {
      const cat = skill.category || "Прочее";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(skill);
      return acc;
    }, {} as Record<string, Skill[]>);
  }, [allSkills]);

  const selectedIds = new Set(selectedSkills.filter(s => s.skill_id).map(s => s.skill_id));
  const topCount = selectedSkills.filter(s => s.is_top).length;

  const filteredSkills = searchQuery.trim()
    ? allSkills.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : null;

  const toggleSkill = (skillId: string) => {
    if (selectedIds.has(skillId)) {
      onChange(selectedSkills.filter(s => s.skill_id !== skillId));
    } else if (selectedSkills.length < maxSkills) {
      onChange([...selectedSkills, { skill_id: skillId, proficiency: 2, is_top: false, is_custom: false }]);
    }
  };

  const updateProficiency = (skillId: string | null, customName: string | undefined, proficiency: number) => {
    onChange(selectedSkills.map(s => {
      if (s.skill_id === skillId && s.custom_name === customName) return { ...s, proficiency };
      return s;
    }));
  };

  const toggleTop = (skillId: string | null, customName: string | undefined) => {
    const skill = selectedSkills.find(s => s.skill_id === skillId && s.custom_name === customName);
    if (!skill) return;
    if (!skill.is_top && topCount >= maxTopSkills) return;
    onChange(selectedSkills.map(s => {
      if (s.skill_id === skillId && s.custom_name === customName) return { ...s, is_top: !s.is_top };
      return s;
    }));
  };

  const addCustomSkill = () => {
    if (!customName.trim() || selectedSkills.length >= maxSkills) return;
    onChange([...selectedSkills, {
      skill_id: null, proficiency: 2, is_top: false, is_custom: true,
      custom_name: customName.trim(), custom_group: customGroup.trim() || "Прочее",
    }]);
    setCustomName("");
    setCustomGroup("");
  };

  const removeSkill = (index: number) => {
    onChange(selectedSkills.filter((_, i) => i !== index));
  };

  const toggleCategory = (cat: string) => {
    setOpenCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  return (
    <div className="bg-card rounded-xl p-5 md:p-6 shadow-card space-y-4">
      <h2 className="text-[16px] font-semibold text-foreground">Навыки</h2>

      <div className="flex items-center justify-between text-[13px]">
        <span className="text-muted-foreground">
          Выбрано: <strong className="text-foreground">{selectedSkills.length}</strong>/{maxSkills}
        </span>
        <span className="text-muted-foreground">
          Ключевых: <strong className="text-foreground">{topCount}</strong>/{maxTopSkills}
        </span>
      </div>

      {primaryRoleName && (
        <p className={`${HINT} bg-secondary/60 rounded-lg p-3`}>
          Рекомендуем выбрать навыки, релевантные роли «{primaryRoleName}»
        </p>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
        <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Поиск навыка..." className="pl-10 text-[14px]" />
      </div>

      {/* Search results */}
      {filteredSkills && (
        <div className="flex flex-wrap gap-2 p-3 rounded-lg bg-secondary/40">
          {filteredSkills.length === 0 ? (
            <p className={HINT}>Ничего не найдено</p>
          ) : (
            filteredSkills.map(skill => (
              <Badge key={skill.id} variant={selectedIds.has(skill.id) ? "default" : "outline"} className="cursor-pointer text-[12px]" onClick={() => toggleSkill(skill.id)}>
                {skill.name}
              </Badge>
            ))
          )}
        </div>
      )}

      {/* Categories */}
      {!filteredSkills && Object.entries(skillsByCategory).map(([category, skills]) => (
        <Collapsible key={category} open={openCategories[category] ?? false} onOpenChange={() => toggleCategory(category)}>
          <CollapsibleTrigger className="flex items-center gap-2 w-full text-left text-[13px] font-medium text-muted-foreground hover:text-foreground py-1">
            <ChevronDown className={cn("h-4 w-4 transition-transform", openCategories[category] && "rotate-180")} />
            {category}
            <span className="text-[11px] text-muted-foreground/60">({skills.filter(s => selectedIds.has(s.id)).length}/{skills.length})</span>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="flex flex-wrap gap-2 pt-2 pb-3">
              {skills.map(skill => (
                <Badge key={skill.id} variant={selectedIds.has(skill.id) ? "default" : "outline"} className="cursor-pointer text-[12px]" onClick={() => toggleSkill(skill.id)}>
                  {skill.name}
                </Badge>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      ))}

      {/* Custom skill */}
      <div className="border-t border-border/50 pt-4 space-y-3">
        <Label className={LABEL}>Добавить свой навык</Label>
        <div className="flex gap-2">
          <Input value={customName} onChange={(e) => setCustomName(e.target.value)} placeholder="Название навыка" className="flex-1 text-[14px]" />
          <Input value={customGroup} onChange={(e) => setCustomGroup(e.target.value)} placeholder="Группа" className="w-[140px] text-[14px]" />
          <Button variant="outline" size="sm" onClick={addCustomSkill} disabled={!customName.trim()}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Selected skills with levels */}
      {selectedSkills.length > 0 && (
        <div className="border-t border-border/50 pt-4 space-y-2">
          <Label className={LABEL}>Уровни и ключевые навыки</Label>
          <p className={HINT}>
            Отметьте ⭐ для 5 ключевых навыков — они будут показаны в карточке
          </p>
          {selectedSkills.map((sel, index) => {
            const skill = sel.skill_id ? allSkills.find(s => s.id === sel.skill_id) : null;
            const name = skill?.name || sel.custom_name || "—";
            return (
              <div key={index} className="flex items-center gap-2 text-[13px]">
                <button
                  type="button"
                  onClick={() => toggleTop(sel.skill_id, sel.custom_name)}
                  className={cn("flex-shrink-0", sel.is_top ? "text-yellow-500" : "text-muted-foreground/40 hover:text-yellow-400")}
                >
                  <Star className="h-4 w-4" fill={sel.is_top ? "currentColor" : "none"} />
                </button>
                <span className="flex-1 truncate text-foreground">{name}</span>
                {sel.is_custom && <Badge variant="outline" className="text-[10px]">custom</Badge>}
                <div className="flex gap-1">
                  {[1, 2, 3].map(lvl => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => updateProficiency(sel.skill_id, sel.custom_name, lvl)}
                      className={cn(
                        "px-2 py-0.5 rounded text-[11px] border",
                        sel.proficiency === lvl
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border/60 hover:bg-secondary text-muted-foreground"
                      )}
                    >
                      {proficiencyLabels[lvl]}
                    </button>
                  ))}
                </div>
                <button type="button" onClick={() => removeSkill(index)} className="text-muted-foreground/40 hover:text-destructive text-[11px]">✕</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
