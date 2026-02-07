import { Progress } from "@/components/ui/progress";
import { CheckCircle, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfileField {
  key: string;
  label: string;
  completed: boolean;
  weight: number;
}

interface ProfileProgressProps {
  fields: ProfileField[];
  className?: string;
}

export function ProfileProgress({ fields, className }: ProfileProgressProps) {
  const totalWeight = fields.reduce((sum, f) => sum + f.weight, 0);
  const completedWeight = fields
    .filter(f => f.completed)
    .reduce((sum, f) => sum + f.weight, 0);
  
  const percentage = Math.round((completedWeight / totalWeight) * 100);

  const getProgressColor = () => {
    if (percentage >= 80) return "bg-green-500";
    if (percentage >= 50) return "bg-yellow-500";
    return "bg-accent";
  };

  const getProgressMessage = () => {
    if (percentage >= 100) return "Отличный профиль! 🎉";
    if (percentage >= 80) return "Почти готово!";
    if (percentage >= 50) return "Хорошее начало";
    return "Заполните профиль для лучшей видимости";
  };

  return (
    <div className={cn("bg-card border border-border rounded-xl p-6", className)}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-foreground">Заполненность профиля</h3>
        <span className={cn(
          "text-lg font-bold",
          percentage >= 80 ? "text-green-600" : percentage >= 50 ? "text-yellow-600" : "text-accent"
        )}>
          {percentage}%
        </span>
      </div>

      <Progress 
        value={percentage} 
        className="h-2 mb-3"
      />

      <p className="text-sm text-muted-foreground mb-4">
        {getProgressMessage()}
      </p>

      <div className="space-y-2">
        {fields.map((field) => (
          <div
            key={field.key}
            className="flex items-center gap-2 text-sm"
          >
            {field.completed ? (
              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
            ) : (
              <Circle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            )}
            <span className={cn(
              field.completed ? "text-foreground" : "text-muted-foreground"
            )}>
              {field.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}