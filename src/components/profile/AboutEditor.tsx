import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { User } from "lucide-react";

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
  roleName,
}: AboutEditorProps) {
  const ph = placeholders.default;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display uppercase flex items-center gap-2">
          <User className="h-5 w-5" />
          О себе
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Общее описание</Label>
          <Textarea
            value={bio}
            onChange={(e) => onBioChange(e.target.value)}
            placeholder="Расскажите о своём опыте и профессиональных интересах..."
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label>Чем я полезен команде</Label>
          <Textarea
            value={aboutUseful}
            onChange={(e) => onAboutUsefulChange(e.target.value)}
            placeholder={ph.useful}
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <Label>Мой стиль работы / подход</Label>
          <Textarea
            value={aboutStyle}
            onChange={(e) => onAboutStyleChange(e.target.value)}
            placeholder={ph.style}
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <Label>Цели (что ищу)</Label>
          <Textarea
            value={aboutGoals}
            onChange={(e) => onAboutGoalsChange(e.target.value)}
            placeholder={ph.goals}
            rows={2}
          />
        </div>
      </CardContent>
    </Card>
  );
}
