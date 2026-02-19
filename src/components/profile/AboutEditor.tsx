import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { User, Save, Loader2 } from "lucide-react";

interface AboutEditorProps {
  bio: string;
  aboutUseful: string;
  aboutStyle: string;
  aboutGoals: string;
  onBioChange: (val: string) => void;
  onAboutUsefulChange: (val: string) => void;
  onAboutStyleChange: (val: string) => void;
  onAboutGoalsChange: (val: string) => void;
  roleName?: string;
  onSave?: () => void;
  isSaving?: boolean;
}

const placeholders: Record<string, { useful: string; style: string; goals: string }> = {
  default: {
    useful: "Пример: Помогаю тренерскому штабу принимать решения на основе данных. Владею инструментами видеоанализа и GPS-мониторинга.",
    style: "Пример: Предпочитаю работать в команде, системный подход к задачам, готов к ненормированному графику в период сборов.",
    goals: "Пример: Ищу клуб с амбициозным проектом, где смогу развивать аналитический отдел.",
  },
};

export function AboutEditor({
  bio, aboutUseful, aboutStyle, aboutGoals,
  onBioChange, onAboutUsefulChange, onAboutStyleChange, onAboutGoalsChange,
  roleName, onSave, isSaving,
}: AboutEditorProps) {
  const ph = placeholders.default;

  return (
    <div className="bg-card rounded-2xl p-6 shadow-card space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-[18px] font-medium flex items-center gap-2">
          <User className="h-5 w-5 text-muted-foreground" />
          О себе
        </h2>
        {onSave && (
          <button
            onClick={onSave}
            disabled={isSaving}
            className="text-muted-foreground/40 hover:text-primary transition-colors disabled:opacity-50"
            title="Сохранить"
          >
            {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
          </button>
        )}
      </div>

      <div className="space-y-2">
        <Label className="text-[14px]">Общее описание</Label>
        <Textarea
          value={bio}
          onChange={(e) => onBioChange(e.target.value)}
          placeholder="Расскажите о своём опыте и профессиональных интересах..."
          rows={3}
          className="text-[15px]"
        />
        <p className="text-[12px] text-muted-foreground">{bio.length}/500 символов</p>
      </div>

      <div className="space-y-2">
        <Label className="text-[14px]">Чем я полезен команде</Label>
        <Textarea
          value={aboutUseful}
          onChange={(e) => onAboutUsefulChange(e.target.value)}
          placeholder={ph.useful}
          rows={2}
          className="text-[15px]"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-[14px]">Мой стиль работы / подход</Label>
        <Textarea
          value={aboutStyle}
          onChange={(e) => onAboutStyleChange(e.target.value)}
          placeholder={ph.style}
          rows={2}
          className="text-[15px]"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-[14px]">Цели (что ищу)</Label>
        <Textarea
          value={aboutGoals}
          onChange={(e) => onAboutGoalsChange(e.target.value)}
          placeholder={ph.goals}
          rows={2}
          className="text-[15px]"
        />
      </div>
    </div>
  );
}
