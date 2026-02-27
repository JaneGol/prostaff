import { cn } from "@/lib/utils";

const LEVELS = [
  { value: "intern", label: "Стажёр", desc: "Начало карьеры, обучение на практике" },
  { value: "junior", label: "Junior", desc: "1–2 года опыта, работа под руководством" },
  { value: "middle", label: "Middle", desc: "3–5 лет, самостоятельные задачи" },
  { value: "senior", label: "Senior", desc: "5+ лет, экспертиза и менторство" },
  { value: "head", label: "Head", desc: "Руководство подразделением / департаментом" },
];

interface Props {
  selected: string;
  onSelect: (level: string) => void;
}

export function StepLevelSelect({ selected, onSelect }: Props) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Укажите ваш текущий уровень позиции
      </p>
      <div className="space-y-2">
        {LEVELS.map((lvl) => (
          <button
            key={lvl.value}
            onClick={() => onSelect(lvl.value)}
            className={cn(
              "w-full rounded-lg border px-4 py-3 text-left transition-all",
              selected === lvl.value
                ? "border-accent bg-accent/5"
                : "border-border hover:border-accent/40 hover:bg-secondary/50"
            )}
          >
            <div className="font-medium text-sm text-foreground">{lvl.label}</div>
            <div className="text-xs text-muted-foreground">{lvl.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
