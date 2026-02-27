import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Star, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { getRecommendedSkills, type RecommendedSkillsResult } from "@/lib/recommendedSkills";

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
  maxCustomSkills?: number;
  primaryRoleName?: string;
  groupKey?: string;
  secondaryGroupKey?: string;
}

const MAX_KEY = 8;
const MAX_ADDITIONAL = 5;
const MAX_CUSTOM = 3;

const HINT = "text-[12px] text-muted-foreground/60";

export function SkillsEditor({
  allSkills, selectedSkills, onChange,
  maxSkills = MAX_KEY + MAX_ADDITIONAL + MAX_CUSTOM,
  maxTopSkills = MAX_KEY,
  maxCustomSkills = MAX_CUSTOM,
  primaryRoleName, groupKey, secondaryGroupKey,
}: SkillsEditorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [customName, setCustomName] = useState("");

  // Build recommended skills based on group(s)
  const recommended = useMemo(
    () => getRecommendedSkills(groupKey || null, secondaryGroupKey),
    [groupKey, secondaryGroupKey],
  );

  const topCount = selectedSkills.filter(s => s.is_top).length;
  const customCount = selectedSkills.filter(s => s.is_custom).length;
  const additionalCount = selectedSkills.filter(s => !s.is_top && !s.is_custom).length;

  // Helper: find DB skill by name
  const findSkillByName = (name: string): Skill | undefined =>
    allSkills.find(s => s.name.toLowerCase() === name.toLowerCase());

  const isSkillSelected = (name: string): boolean => {
    const dbSkill = findSkillByName(name);
    if (dbSkill) return selectedSkills.some(s => s.skill_id === dbSkill.id);
    return selectedSkills.some(s => s.custom_name?.toLowerCase() === name.toLowerCase());
  };

  const canAddMore = selectedSkills.length < maxSkills;

  const toggleRecommendedSkill = (name: string) => {
    const dbSkill = findSkillByName(name);
    if (dbSkill) {
      const exists = selectedSkills.some(s => s.skill_id === dbSkill.id);
      if (exists) onChange(selectedSkills.filter(s => s.skill_id !== dbSkill.id));
      else if (canAddMore) onChange([...selectedSkills, { skill_id: dbSkill.id, proficiency: 2, is_top: false, is_custom: false }]);
    } else {
      const exists = selectedSkills.some(s => s.custom_name?.toLowerCase() === name.toLowerCase());
      if (exists) onChange(selectedSkills.filter(s => s.custom_name?.toLowerCase() !== name.toLowerCase()));
      else if (canAddMore) onChange([...selectedSkills, { skill_id: null, proficiency: 2, is_top: false, is_custom: false, custom_name: name, custom_group: "Рекомендованные" }]);
    }
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
    if (!customName.trim() || customCount >= maxCustomSkills || !canAddMore) return;
    onChange([...selectedSkills, {
      skill_id: null, proficiency: 2, is_top: false, is_custom: true,
      custom_name: customName.trim(), custom_group: "Свои навыки",
    }]);
    setCustomName("");
  };

  const removeSkill = (index: number) => onChange(selectedSkills.filter((_, i) => i !== index));

  // Collect all skill names for search
  const allRecNames = useMemo(() => {
    const { hardSkills, tools, softSkills } = recommended;
    return [...hardSkills.basic, ...hardSkills.advanced, ...hardSkills.expert, ...tools, ...softSkills];
  }, [recommended]);

  const filteredSkills = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase();
    const matchedRec = allRecNames.filter(n => n.toLowerCase().includes(q));
    const recSet = new Set(allRecNames.map(n => n.toLowerCase()));
    const matchedDb = allSkills.filter(s => s.name.toLowerCase().includes(q) && !recSet.has(s.name.toLowerCase()));
    return { recommended: matchedRec, db: matchedDb };
  }, [searchQuery, allRecNames, allSkills]);

  // Render a flat list of checkboxes with star toggle
  const renderSkillList = (skills: string[]) => (
    <div className="space-y-1 py-2">
      {skills.map(name => {
        const selected = isSkillSelected(name);
        return (
          <label key={name} className="flex items-center gap-2.5 cursor-pointer text-[13px] py-0.5">
            <Checkbox checked={selected} onCheckedChange={() => toggleRecommendedSkill(name)} />
            <span className="flex-1 text-foreground">{name}</span>
            {selected && (
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); toggleTop(findSkillByName(name)?.id || null, findSkillByName(name) ? undefined : name); }}
                className={cn("flex-shrink-0", getStarClass(name))}
              >
                <Star className="h-3.5 w-3.5" fill={isTop(name) ? "currentColor" : "none"} />
              </button>
            )}
          </label>
        );
      })}
    </div>
  );

  const isTop = (name: string): boolean => {
    const dbSkill = findSkillByName(name);
    if (dbSkill) return selectedSkills.some(s => s.skill_id === dbSkill.id && s.is_top);
    return selectedSkills.some(s => s.custom_name?.toLowerCase() === name.toLowerCase() && s.is_top);
  };

  const getStarClass = (name: string): string =>
    isTop(name) ? "text-yellow-500" : "text-muted-foreground/30 hover:text-yellow-400";

  return (
    <div className="bg-card rounded-xl p-5 md:p-6 shadow-card space-y-4">
      <h2 className="text-[16px] font-semibold text-foreground">Навыки</h2>

      <p className={`${HINT} bg-secondary/60 rounded-lg p-3`}>
        Выберите до {maxTopSkills} ключевых (⭐) и до {MAX_ADDITIONAL} дополнительных навыков.
        {primaryRoleName && <> Рекомендации для роли «{primaryRoleName}».</>}
      </p>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
        <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Поиск навыка..." className="pl-10 text-[14px]" />
      </div>

      {/* Search results */}
      {filteredSkills ? (
        <div className="space-y-1 p-3 rounded-lg bg-secondary/40 max-h-[300px] overflow-y-auto">
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
                      else if (canAddMore) onChange([...selectedSkills, { skill_id: skill.id, proficiency: 2, is_top: false, is_custom: false }]);
                    }}
                  />
                  <span className="text-foreground">{skill.name}</span>
                  <span className="text-muted-foreground/50 text-[11px]">{skill.category}</span>
                </label>
              ))}
            </>
          )}
        </div>
      ) : (
        /* Tabs: Hard Skills / Tools / Soft Skills */
        <Tabs defaultValue="hard" className="w-full">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="hard" className="text-[12px]">Hard Skills</TabsTrigger>
            <TabsTrigger value="tools" className="text-[12px]">Инструменты</TabsTrigger>
            <TabsTrigger value="soft" className="text-[12px]">Soft Skills</TabsTrigger>
          </TabsList>

          <TabsContent value="hard" className="space-y-3">
            {recommended.hardSkills.basic.length > 0 && (
              <div>
                <h4 className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide mt-2">Базовые</h4>
                {renderSkillList(recommended.hardSkills.basic)}
              </div>
            )}
            {recommended.hardSkills.advanced.length > 0 && (
              <div>
                <h4 className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">Продвинутые</h4>
                {renderSkillList(recommended.hardSkills.advanced)}
              </div>
            )}
            {recommended.hardSkills.expert.length > 0 && (
              <div>
                <h4 className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">Экспертные</h4>
                {renderSkillList(recommended.hardSkills.expert)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="tools">
            {renderSkillList(recommended.tools)}
          </TabsContent>

          <TabsContent value="soft">
            {renderSkillList(recommended.softSkills)}
          </TabsContent>
        </Tabs>
      )}

      {/* Custom skills */}
      <div className="border-t border-border/50 pt-4 space-y-3">
        <Label className="text-[13px] font-medium text-muted-foreground">Добавить свой навык ({customCount}/{maxCustomSkills})</Label>
        <div className="flex gap-2">
          <Input value={customName} onChange={(e) => setCustomName(e.target.value)} placeholder="Название навыка" className="flex-1 text-[14px]"
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomSkill(); }}}
          />
          <Button variant="outline" size="sm" onClick={addCustomSkill} disabled={!customName.trim() || customCount >= maxCustomSkills}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Selected skills summary */}
      {selectedSkills.length > 0 && (
        <div className="border-t border-border/50 pt-4 space-y-2">
          <Label className="text-[13px] font-medium text-muted-foreground">Выбранные навыки</Label>
          <p className={HINT}>
            Нажмите ⭐ чтобы отметить как ключевой (макс {maxTopSkills})
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
                {sel.is_custom && <Badge variant="outline" className="text-[10px]">свой</Badge>}
                <button type="button" onClick={() => removeSkill(index)} className="text-muted-foreground/40 hover:text-destructive text-[11px]">✕</button>
              </div>
            );
          })}
        </div>
      )}

      {/* Counters */}
      <div className="flex flex-wrap gap-3 text-[12px] text-muted-foreground pt-2 border-t border-border/30">
        <span>Ключевых: <strong className="text-foreground">{topCount}</strong>/{maxTopSkills}</span>
        <span>Доп.: <strong className="text-foreground">{additionalCount}</strong>/{MAX_ADDITIONAL}</span>
        <span>Своих: <strong className="text-foreground">{customCount}</strong>/{maxCustomSkills}</span>
      </div>
    </div>
  );
}
