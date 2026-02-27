import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { getSportIcon } from "@/lib/sportIcons";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Sport {
  id: string;
  name: string;
  icon: string | null;
  is_olympic: boolean | null;
}

interface Props {
  selectedSportIds: string[];
  onToggle: (id: string) => void;
}

export function StepSportSelect({ selectedSportIds, onToggle }: Props) {
  const [sports, setSports] = useState<Sport[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    supabase
      .from("sports")
      .select("id, name, icon, is_olympic")
      .eq("is_active", true)
      .order("sort_order")
      .then(({ data }) => {
        if (data) setSports(data);
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return sports;
    const q = search.toLowerCase();
    return sports.filter((s) => s.name.toLowerCase().includes(q));
  }, [sports, search]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-2">
        {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-12 rounded-lg" />)}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">Выберите виды спорта (можно несколько)</p>

      {sports.length > 8 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск вида спорта..."
            className="pl-9"
          />
        </div>
      )}

      <div className="max-h-[240px] overflow-y-auto pr-1 grid grid-cols-2 gap-2">
        {filtered.map((sport) => {
          const Icon = getSportIcon(sport.icon);
          const isSelected = selectedSportIds.includes(sport.id);
          return (
            <button
              key={sport.id}
              onClick={() => onToggle(sport.id)}
              className={cn(
                "flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left text-sm transition-all",
                isSelected
                  ? "border-accent bg-accent/5 font-medium"
                  : "border-border hover:border-accent/40 hover:bg-secondary/50"
              )}
            >
              <Icon className={cn("h-4 w-4 shrink-0", isSelected ? "text-accent" : "text-muted-foreground")} />
              <span className="truncate">{sport.name}</span>
            </button>
          );
        })}
      </div>

      {selectedSportIds.length > 0 && (
        <p className="text-xs text-muted-foreground">Выбрано: {selectedSportIds.length}</p>
      )}
    </div>
  );
}
