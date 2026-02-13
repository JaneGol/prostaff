import { Progress } from "@/components/ui/progress";
import { CheckCircle, Circle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface ProfileField {
  key: string;
  label: string;
  completed: boolean;
  weight: number;
}

interface ProfileProgressProps {
  fields: ProfileField[];
  className?: string;
  onFieldClick?: (key: string) => void;
}

// Friendly labels (recommendation tone)
const friendlyLabels: Record<string, string> = {
  avatar: "Загрузите фото профиля",
  role: "Укажите специализацию и уровень",
  about: "Расскажите о себе",
  location: "Добавьте город и формат работы",
  skills: "Добавьте навыки (минимум 5)",
  experience: "Добавьте опыт работы",
  education: "Укажите образование или сертификаты",
  sports: "Добавьте виды спорта",
  contacts: "Укажите контактные данные",
};

export function ProfileProgress({ fields, className, onFieldClick }: ProfileProgressProps) {
  const totalWeight = fields.reduce((sum, f) => sum + f.weight, 0);
  const completedWeight = fields
    .filter(f => f.completed)
    .reduce((sum, f) => sum + f.weight, 0);
  
  const percentage = Math.round((completedWeight / totalWeight) * 100);

  const getProgressMessage = () => {
    if (percentage >= 100) return "Отличный профиль! 🎉";
    if (percentage >= 80) return "Почти готово — осталось немного!";
    if (percentage >= 50) return "Хорошее начало, продолжайте";
    if (percentage > 0) return "Заполните профиль — вас заметят клубы";
    return "Начните создание профессионального профиля";
  };

  const incomplete = fields.filter(f => !f.completed);
  const completed = fields.filter(f => f.completed);

  return (
    <div className={cn("bg-card rounded-2xl p-5 shadow-card", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[15px] font-medium text-foreground">Заполненность</h3>
        <span className={cn(
          "text-xl font-bold tabular-nums",
          percentage >= 80 ? "text-[hsl(var(--success))]" : "text-primary"
        )}>
          {percentage}%
        </span>
      </div>

      {/* Progress bar — thin, smooth */}
      <div className="relative h-1.5 w-full rounded-full bg-secondary overflow-hidden mb-3">
        <motion.div
          className={cn(
            "h-full rounded-full",
            percentage >= 80 ? "bg-[hsl(var(--success))]" : "bg-primary"
          )}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>

      <p className="text-[13px] text-muted-foreground mb-5">
        {getProgressMessage()}
      </p>

      {/* Incomplete items */}
      {incomplete.length > 0 && (
        <div className="space-y-2.5 mb-4">
          {incomplete.map((field) => (
            <button
              key={field.key}
              onClick={() => onFieldClick?.(field.key)}
              className="flex items-center gap-2.5 text-[13px] w-full text-left group hover:bg-muted/50 rounded-lg px-2 py-1.5 -mx-2 transition-colors"
            >
              <Circle className="h-3.5 w-3.5 text-muted-foreground/50 flex-shrink-0" />
              <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                {friendlyLabels[field.key] || field.label}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Completed items — collapsed */}
      {completed.length > 0 && (
        <div className="border-t border-border pt-3 space-y-2">
          {completed.map((field) => (
            <div
              key={field.key}
              className="flex items-center gap-2.5 text-[13px] px-2 py-0.5"
            >
              <CheckCircle className="h-3.5 w-3.5 text-[hsl(var(--success))] flex-shrink-0" />
              <span className="text-muted-foreground line-through decoration-muted-foreground/30">
                {friendlyLabels[field.key] || field.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
