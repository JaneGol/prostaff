import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save, Loader2 } from "lucide-react";

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

const LABEL = "text-[13px] font-medium text-muted-foreground";
const HINT = "text-[12px] text-muted-foreground/60";

const placeholders = {
  useful: "Помогаю тренерскому штабу принимать решения на основе данных. Владею инструментами видеоанализа и GPS-мониторинга.",
  style: "Предпочитаю работать в команде, системный подход к задачам, готов к ненормированному графику в период сборов.",
  goals: "Ищу клуб с амбициозным проектом, где смогу развивать аналитический отдел.",
};

export function AboutEditor({
  bio, aboutUseful, aboutStyle, aboutGoals,
  onBioChange, onAboutUsefulChange, onAboutStyleChange, onAboutGoalsChange,
  roleName, onSave, isSaving,
}: AboutEditorProps) {
  return (
    <div className="bg-card rounded-xl p-5 md:p-6 shadow-card space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-[16px] font-semibold text-foreground">О себе</h2>
        {onSave && (
          <button
            onClick={onSave}
            disabled={isSaving}
            className="text-muted-foreground/30 hover:text-primary transition-colors disabled:opacity-50"
            title="Сохранить"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          </button>
        )}
      </div>

      <div className="space-y-1">
        <Label className={LABEL}>Общее описание</Label>
        <Textarea
          value={bio}
          onChange={(e) => onBioChange(e.target.value)}
          placeholder="Расскажите о своём опыте и профессиональных интересах..."
          rows={3}
          className="text-[14px]"
        />
        <p className={HINT}>{bio.length}/500 символов</p>
      </div>

      <div className="space-y-1">
        <Label className={LABEL}>Чем я полезен команде</Label>
        <Textarea
          value={aboutUseful}
          onChange={(e) => onAboutUsefulChange(e.target.value)}
          placeholder={placeholders.useful}
          rows={2}
          className="text-[14px]"
        />
      </div>

      <div className="space-y-1">
        <Label className={LABEL}>Мой стиль работы</Label>
        <Textarea
          value={aboutStyle}
          onChange={(e) => onAboutStyleChange(e.target.value)}
          placeholder={placeholders.style}
          rows={2}
          className="text-[14px]"
        />
      </div>

      <div className="space-y-1">
        <Label className={LABEL}>Цели</Label>
        <Textarea
          value={aboutGoals}
          onChange={(e) => onAboutGoalsChange(e.target.value)}
          placeholder={placeholders.goals}
          rows={2}
          className="text-[14px]"
        />
      </div>
    </div>
  );
}
