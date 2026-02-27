import { useRoleGroups } from "@/hooks/useRoleGroups";
import { cn } from "@/lib/utils";
import { Users, Activity, BarChart3, HeartPulse, MoreHorizontal } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const GROUP_ICONS: Record<string, React.ElementType> = {
  coaches: Users,
  fitness: Activity,
  analytics: BarChart3,
  medical: HeartPulse,
  other: MoreHorizontal,
};

const GROUP_DESCRIPTIONS: Record<string, string> = {
  coaches: "Главные, ассистенты, тренеры вратарей, скауты",
  fitness: "Физподготовка, S&C, нагрузки",
  analytics: "Видео, данные, статистика, BI",
  medical: "Врачи, физиотерапевты, нутрициологи",
  other: "Менеджмент, переводчики, координаторы",
};

interface Props {
  selectedGroupId: string | null;
  onSelect: (groupId: string) => void;
}

export function StepGroupSelect({ selectedGroupId, onSelect }: Props) {
  const { groups, loading } = useRoleGroups();

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">Выберите направление вашей деятельности</p>
      <div className="grid grid-cols-1 gap-2.5">
        {groups.map((group) => {
          const Icon = GROUP_ICONS[group.key] || MoreHorizontal;
          const isSelected = selectedGroupId === group.id;
          return (
            <button
              key={group.id}
              onClick={() => onSelect(group.id)}
              className={cn(
                "flex items-center gap-4 rounded-xl border-2 p-4 text-left transition-all",
                isSelected
                  ? "border-accent bg-accent/5 shadow-sm"
                  : "border-border hover:border-accent/40 hover:bg-secondary/50"
              )}
            >
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                  isSelected ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="font-medium text-foreground">{group.title}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {GROUP_DESCRIPTIONS[group.key] || ""}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
