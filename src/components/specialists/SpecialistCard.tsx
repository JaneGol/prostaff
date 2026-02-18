import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, User, ChevronRight } from "lucide-react";
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

  return (
    <Link to={`/profile/${id}`}>
      <Card className="hover:shadow-lg transition-shadow group shadow-sm mb-3">
        <CardContent className="p-4 md:p-5">
          <div className="flex items-start gap-3">
            {/* Avatar placeholder */}
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
              <User className="h-4 w-4 text-muted-foreground" />
            </div>

            <div className="flex-1 min-w-0">
              {/* Title row */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-semibold text-sm group-hover:text-accent transition-colors line-clamp-1">
                    {roleName || "Без специализации"}
                  </h3>
                  {statusLabel && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <span className={`h-1.5 w-1.5 rounded-full inline-block ${isActive ? "bg-primary" : "bg-primary/40"}`} />
                      {statusLabel}
                    </p>
                  )}
                </div>
                {level && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 flex-shrink-0">
                    {levelLabels[level] || level}
                  </Badge>
                )}
              </div>

              {/* Badges row */}
              <div className="flex flex-wrap gap-1 mt-1.5">
                {isRelocatable && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">Релокация</Badge>
                )}
                {isRemoteAvailable && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">Удалённо</Badge>
                )}
                {skills.slice(0, 2).map((s, i) => (
                  <Badge key={i} variant="outline" className="text-[10px] px-1.5 py-0">
                    {s.name}
                  </Badge>
                ))}
                {skills.length > 2 && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                    +{skills.length - 2}
                  </Badge>
                )}
              </div>

              {/* Bottom row: location + sports */}
              <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs">
                {location && (
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {location}
                  </span>
                )}
                {sports.slice(0, 2).map((s) => {
                  const Icon = getSportIcon(s.sports?.icon || null);
                  return (
                    <span key={s.sport_id} className="flex items-center gap-1 text-muted-foreground">
                      <Icon className="h-3 w-3" />
                      {s.sports?.name}
                    </span>
                  );
                })}
              </div>
            </div>

            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors hidden md:block flex-shrink-0 mt-1" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
