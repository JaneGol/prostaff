import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Search, Star, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { getRecommendedSkills, type SkillSubGroup } from "@/lib/recommendedSkills";

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
  groupKey?: string;
}

const proficiencyLabels: Record<number, string> = {
  1: "Базовый",
  2: "Уверенный",
  3: "Эксперт",
};

const LABEL = "text-[13px] font-medium text-muted-foreground";
const HINT = "text-[12px] text-muted-foreground/60";

export function SkillsEditor({
  allSkills, selectedSkills, onChange, maxSkills = 20, maxTopSkills = 5, primaryRoleName, groupKey,
}: SkillsEditorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [customName, setCustomName] = useState("");
  const [customGroup, setCustomGroup] = useState("");
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  // Build recommended sections based on specialist group
  const recommendedSections = useMemo(() => getRecommendedSkills(groupKey || null), [groupKey]);

  // Helper: find the DB skill matching a recommended skill name, or treat as custom
  const findSkillByName = (name: string): Skill | undefined => {
    return allSkills.find(s => s.name.toLowerCase() === name.toLowerCase());
  };

  // Check if a skill name is selected (either by DB id or custom name)
  const isSkillSelected = (name: string): boolean => {
    const dbSkill = findSkillByName(name);
    if (dbSkill) return selectedSkills.some(s => s.skill_id === dbSkill.id);
    return selectedSkills.some(s => s.custom_name?.toLowerCase() === name.toLowerCase());
  };

  const topCount = selectedSkills.filter(s => s.is_top).length;

  // Toggle a recommended skill
  const toggleRecommendedSkill = (name: string) => {
    const dbSkill = findSkillByName(name);

    if (dbSkill) {
      const exists = selectedSkills.some(s => s.skill_id === dbSkill.id);
      if (exists) {
        onChange(selectedSkills.filter(s => s.skill_id !== dbSkill.id));
      } else if (selectedSkills.length < maxSkills) {
        onChange([...selectedSkills, { skill_id: dbSkill.id, proficiency: 2, is_top: false, is_custom: false }]);
      }
    } else {
      // Custom-style: match by custom_name
      const exists = selectedSkills.some(s => s.custom_name?.toLowerCase() === name.toLowerCase());
      if (exists) {
        onChange(selectedSkills.filter(s => s.custom_name?.toLowerCase() !== name.toLowerCase()));
      } else if (selectedSkills.length < maxSkills) {
        onChange([...selectedSkills, {
          skill_id: null, proficiency: 2, is_top: false, is_custom: true,
          custom_name: name, custom_group: "Рекомендованные",
        }]);
      }
    }
  };

  // Search across recommended + DB skills
  const filteredSkills = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase();
    // Collect all recommended names
    const recNames = recommendedSections.flatMap(s => s.skills);
    const matchedRec = recNames.filter(n => n.toLowerCase().includes(q));
    // Also match DB skills not in recommended
    const recSet = new Set(recNames.map(n => n.toLowerCase()));
    const matchedDb = allSkills.filter(s => s.name.toLowerCase().includes(q) && !recSet.has(s.name.toLowerCase()));
    return { recommended: matchedRec, db: matchedDb };
  }, [searchQuery, recommendedSections, allSkills]);

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

  const toggleSection = (title: string) => {
    setOpenSections(prev => ({ ...prev, [title]: !prev[title] }));
  };

  const countSelectedInSection = (section: SkillSubGroup): number => {
    return section.skills.filter(name => isSkillSelected(name)).length;
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
        <div className="space-y-2 p-3 rounded-lg bg-secondary/40">
          {filteredSkills.recommended.length === 0 && filteredSkills.db.length === 0 ? (
            <p className={HINT}>Ничего не найдено</p>
          ) : (
            <>
              {filteredSkills.recommended.map(name => (
                <label key={name} className="flex items-center gap-2.5 cursor-pointer text-[13px] py-0.5">
                  <Checkbox checked={isSkillSelected(name)} onCheckedChange={() => toggleRecommendedSkill(name)} />
                  <span className="text-foreground">{name}</span>
                </label>
              ))}
              {filteredSkills.db.map(skill => (
                <label key={skill.id} className="flex items-center gap-2.5 cursor-pointer text-[13px] py-0.5">
                  <Checkbox
                    checked={selectedSkills.some(s => s.skill_id === skill.id)}
                    onCheckedChange={() => {
                      const exists = selectedSkills.some(s => s.skill_id === skill.id);
                      if (exists) onChange(selectedSkills.filter(s => s.skill_id !== skill.id));
                      else if (selectedSkills.length < maxSkills) onChange([...selectedSkills, { skill_id: skill.id, proficiency: 2, is_top: false, is_custom: false }]);
                    }}
                  />
                  <span className="text-foreground">{skill.name}</span>
                  <span className="text-muted-foreground/50 text-[11px]">{skill.category}</span>
                </label>
              ))}
            </>
          )}
        </div>
      )}

      {/* Recommended sections */}
      {!filteredSkills && recommendedSections.map(section => (
        <Collapsible key={section.title} open={openSections[section.title] ?? false} onOpenChange={() => toggleSection(section.title)}>
          <CollapsibleTrigger className="flex items-center gap-2 w-full text-left text-[13px] font-medium text-muted-foreground hover:text-foreground py-1">
            <ChevronDown className={cn("h-4 w-4 transition-transform", openSections[section.title] && "rotate-180")} />
            {section.title}
            <span className="text-[11px] text-muted-foreground/60">
              ({countSelectedInSection(section)}/{section.skills.length})
            </span>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="space-y-1 pt-2 pb-3 pl-6">
              {section.skills.map(name => (
                <label key={name} className="flex items-center gap-2.5 cursor-pointer text-[13px] py-0.5">
                  <Checkbox checked={isSkillSelected(name)} onCheckedChange={() => toggleRecommendedSkill(name)} />
                  <span className="text-foreground">{name}</span>
                </label>
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
