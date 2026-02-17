import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import { getSportIcon } from "@/lib/sportIcons";
import defaultAvatar from "@/assets/default-avatar.png";

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
  avatarUrl?: string | null;
  displayName?: string | null;
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
  avatarUrl,
  displayName,
}: SpecialistCardProps) {
  const isActive = searchStatus === "actively_looking";
  const isOpen = searchStatus === "open_to_offers";
  const statusLabel = isActive
    ? "Ищет работу"
    : isOpen
      ? "Открыт к предложениям"
      : null;

  const location = [city, country].filter(Boolean).join(", ");
  const formats: string[] = [];
  if (isRelocatable) formats.push("Релокация");
  if (isRemoteAvailable) formats.push("Удалённо");

  const sportLine = sports
    .slice(0, 2)
    .map((s) => s.sports?.name)
    .filter(Boolean)
    .join(", ");

  const locationParts = [sportLine, location].filter(Boolean).join(" · ");

  return (
    <Link to={`/profile/${id}`} className="block h-full group">
      <div className="h-full rounded-2xl bg-card p-5 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-150">
        {/* Top row: avatar + name + level */}
        <div className="flex items-start gap-3.5 mb-3">
          <img
            src={avatarUrl || defaultAvatar}
            alt=""
            className="w-11 h-11 rounded-full object-cover bg-muted flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                {displayName && (
                  <p className="text-sm font-medium text-foreground truncate">
                    {displayName}
                  </p>
                )}
                <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-1">
                  {roleName || "Специалист"}
                </h3>
              </div>
              {level && (
                <span className="text-xs font-medium text-primary bg-primary/8 px-2 py-0.5 rounded-full whitespace-nowrap shrink-0 mt-0.5">
                  {levelLabels[level] || level}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Location + sport */}
        {locationParts && (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{locationParts}</span>
          </div>
        )}

        {/* Skills chips */}
        {skills.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap mb-3">
            {skills.slice(0, 3).map((s, i) => (
              <span
                key={i}
                className="text-xs bg-secondary text-muted-foreground px-2.5 py-1 rounded-full"
              >
                {s.name}
              </span>
            ))}
            {skills.length > 3 && (
              <span className="text-xs text-muted-foreground">
                +{skills.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Status */}
        {statusLabel && (
          <div className="flex items-center gap-1.5 mb-3">
            <span
              className={`h-2 w-2 rounded-full shrink-0 ${
                isActive ? "bg-success" : "bg-success/50"
              }`}
            />
            <span className="text-xs text-muted-foreground">{statusLabel}</span>
          </div>
        )}

        {/* CTA */}
        <div className="pt-2 border-t border-border">
          <span className="text-sm font-medium text-primary group-hover:underline">
            Смотреть профиль
          </span>
        </div>
      </div>
    </Link>
  );
}
