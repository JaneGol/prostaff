import { useState, useMemo } from "react";
import { useRoleGroups } from "@/hooks/useRoleGroups";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Search, PenLine } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  groupId: string;
  selectedRoleId: string | null;
  customRoleTitle: string;
  onSelectRole: (roleId: string) => void;
  onCustomRole: (title: string) => void;
}

export function StepRoleSelect({ groupId, selectedRoleId, customRoleTitle, onSelectRole, onCustomRole }: Props) {
  const { roles, groups, loading } = useRoleGroups();
  const [search, setSearch] = useState("");
  const [showCustom, setShowCustom] = useState(!!customRoleTitle);

  const group = groups.find((g) => g.id === groupId);
  const groupRoles = useMemo(() => {
    return roles.filter((r) => r.group_id === groupId);
  }, [roles, groupId]);

  const filtered = useMemo(() => {
    if (!search.trim()) return groupRoles;
    const q = search.toLowerCase();
    return groupRoles.filter((r) => r.name.toLowerCase().includes(q));
  }, [groupRoles, search]);

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-12 rounded-lg" />)}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Выберите роль в направлении «{group?.title}»
      </p>

      {/* Search */}
      {groupRoles.length > 5 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск роли..."
            className="pl-9"
          />
        </div>
      )}

      {/* Roles list */}
      <div className="max-h-[220px] space-y-1.5 overflow-y-auto pr-1">
        {filtered.map((role) => (
          <button
            key={role.id}
            onClick={() => { onSelectRole(role.id); setShowCustom(false); }}
            className={cn(
              "w-full rounded-lg border px-4 py-3 text-left text-sm transition-all",
              selectedRoleId === role.id && !showCustom
                ? "border-accent bg-accent/5 font-medium text-foreground"
                : "border-border hover:border-accent/40 hover:bg-secondary/50 text-foreground"
            )}
          >
            {role.name}
            {role.description && (
              <span className="block text-xs text-muted-foreground mt-0.5">{role.description}</span>
            )}
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="py-4 text-center text-sm text-muted-foreground">Нет ролей по запросу</p>
        )}
      </div>

      {/* Custom role */}
      <button
        onClick={() => { setShowCustom(true); onCustomRole(customRoleTitle || ""); }}
        className={cn(
          "flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-all",
          showCustom
            ? "border-accent bg-accent/5"
            : "border-dashed border-border hover:border-accent/40"
        )}
      >
        <PenLine className="h-4 w-4 text-muted-foreground shrink-0" />
        <span className="text-muted-foreground">Другое (свой вариант)</span>
      </button>

      {showCustom && (
        <Input
          value={customRoleTitle}
          onChange={(e) => onCustomRole(e.target.value)}
          placeholder="Введите название вашей роли..."
          autoFocus
        />
      )}
    </div>
  );
}
