import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, ChevronRight } from "lucide-react";
import { getSportIcon } from "@/lib/sportIcons";

const levelLabels: Record<string, string> = {
  intern: "Стажёр",
  junior: "Junior",
  middle: "Middle",
  senior: "Senior",
  head: "Head",
};

interface SportDisplay {
  sport_id: string;
  years: number;
  sports: { name: string; icon: string | null } | null;
}

interface SkillDisplay {
  name: string;
}

interface SpecialistCardProps {
  id: string;
  roleName: string | null;
  level: string | null;
  city: string | null;
  country: string | null;
  searchStatus: string | null;
  isRelocatable: boolean;
  isRemoteAvailable: boolean;
  skills: SkillDisplay[];
  sports: SportDisplay[];
}

export function SpecialistCard({
  id,
  roleName,
  level,
  city,
  country,
  searchStatus,
  isRelocatable,
  isRemoteAvailable,
  skills,
  sports,
}: SpecialistCardProps) {
  const isActive = searchStatus === "actively_looking";
  const isOpen = searchStatus === "open_to_offers";
  const statusLabel = isActive ? "Ищет работу" : isOpen ? "Открыт к предложениям" : null;

  const location = [city, country].filter(Boolean).join(", ");
  const formats: string[] = [];
  if (isRelocatable) formats.push("Релокация");
  if (isRemoteAvailable) formats.push("Удалённо");
  const locationLine = [location, ...formats].filter(Boolean).join(" · ");

  return (
    <Link to={`/profile/${id}`} className="block h-full">
      <Card className="h-full rounded-lg border border-border hover:border-primary/40 hover:shadow-card-hover hover:-translate-y-0.5 transition-all group overflow-hidden">
        <div className="flex h-full">
          {/* Status strip — left side */}
          <div className={`w-1 shrink-0 rounded-l-lg ${isActive ? "bg-primary" : isOpen ? "bg-primary/40" : "bg-border"}`} />

          <CardContent className="px-3 py-3 flex flex-col flex-1">
            {/* Role + Level */}
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <h3 className="font-display font-semibold text-lg leading-snug group-hover:text-primary transition-colors line-clamp-2">
                {roleName || "Без специализации"}
              </h3>
              {level && (
                <span className="text-xs font-medium text-primary bg-primary/8 px-2 py-0.5 rounded-sm whitespace-nowrap shrink-0">
                  {levelLabels[level] || level}
                </span>
              )}
            </div>

            {/* Status */}
            {statusLabel && (
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className={`h-2 w-2 rounded-full shrink-0 ${isActive ? "bg-primary" : "bg-primary/40"}`} />
                <span className="text-xs text-muted-foreground">{statusLabel}</span>
              </div>
            )}

            {/* Location + format — single line */}
            {locationLine && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{locationLine}</span>
              </div>
            )}

            {/* Skills — max 2 chips */}
            {skills.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
                {skills.slice(0, 2).map((s, i) => (
                  <span key={i} className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-sm">
                    {s.name}
                  </span>
                ))}
                {skills.length > 2 && (
                  <span className="text-xs text-muted-foreground">+{skills.length - 2}</span>
                )}
              </div>
            )}

            {/* Sports — max 2, inline */}
            {sports.length > 0 && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {sports.slice(0, 2).map((s) => {
                  const Icon = getSportIcon(s.sports?.icon || null);
                  return (
                    <span key={s.sport_id} className="flex items-center gap-1">
                      <Icon className="h-3 w-3" />
                      {s.sports?.name}
                    </span>
                  );
                })}
              </div>
            )}
          </CardContent>
        </div>
      </Card>
    </Link>
  );
}
