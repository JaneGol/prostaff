import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, User, ChevronRight, Briefcase, Clock } from "lucide-react";
import { getSportIcon } from "@/lib/sportIcons";
import { getDefaultAvatar, isBankAvatar, decodeBankAvatar } from "@/lib/defaultAvatars";

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

interface ExperienceSummary {
  count: number;
  latest_position: string | null;
  latest_company: string | null;
  total_years: number;
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
  aboutSnippet?: string | null;
  experience?: ExperienceSummary | null;
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
  aboutSnippet,
  experience,
}: SpecialistCardProps) {
  const isActive = searchStatus === "actively_looking";
  const isOpen = searchStatus === "open_to_offers";
  const statusLabel = isActive ? "Ищет работу" : isOpen ? "Открыт к предложениям" : null;

  const location = [city, country].filter(Boolean).join(", ");
  
  // Resolve avatar: custom URL, bank reference, or default from bank
  const bankAvatar = avatarUrl && isBankAvatar(avatarUrl) ? decodeBankAvatar(avatarUrl) : null;
  const defaultBankAvatar = !avatarUrl ? getDefaultAvatar(id) : null;
  const resolvedBank = bankAvatar || defaultBankAvatar;
  const isCustomImage = !!avatarUrl && !isBankAvatar(avatarUrl);

  // Total sport years (max across sports)
  const maxSportYears = sports.length > 0
    ? Math.max(...sports.map(s => s.years || 0))
    : 0;

  return (
    <Link to={`/profile/${id}`}>
      <Card className="hover:shadow-lg transition-shadow group shadow-sm mb-3">
        <CardContent className="p-4 md:p-5">
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
              {isCustomImage ? (
                <img src={avatarUrl!} alt="" className="w-full h-full object-cover" />
              ) : resolvedBank ? (
                <img src={resolvedBank.src} alt={resolvedBank.label} className="w-full h-full object-cover" />
              ) : (
                <User className="h-5 w-5 text-muted-foreground" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              {/* Title row */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-semibold text-base group-hover:text-accent transition-colors line-clamp-1">
                    {roleName || "Без специализации"}
                  </h3>
                  {statusLabel && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <span className={`h-1.5 w-1.5 rounded-full inline-block ${isActive ? "bg-primary" : "bg-primary/40"}`} />
                      {statusLabel}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {level && (
                    <Badge variant="outline" className="text-xs px-2 py-0.5">
                      {levelLabels[level] || level}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Experience & bio row */}
              {(experience?.latest_position || aboutSnippet) && (
                <div className="mt-1.5">
                  {experience?.latest_position && (
                    <p className="text-[13px] text-muted-foreground flex items-center gap-1.5 line-clamp-1">
                      <Briefcase className="h-3 w-3 flex-shrink-0" />
                      <span className="font-medium text-foreground/80">{experience.latest_position}</span>
                      {experience.latest_company && (
                        <span className="text-muted-foreground">· {experience.latest_company}</span>
                      )}
                      {experience.total_years > 0 && (
                        <span className="text-muted-foreground/70">· {experience.total_years} {experience.total_years === 1 ? "год" : experience.total_years < 5 ? "года" : "лет"}</span>
                      )}
                    </p>
                  )}
                  {aboutSnippet && (
                    <p className="text-[12px] text-muted-foreground/80 line-clamp-1 mt-0.5 italic">
                      {aboutSnippet}
                    </p>
                  )}
                </div>
              )}

              {/* Badges row */}
              <div className="flex flex-wrap gap-1 mt-1.5">
                {isRelocatable && (
                  <Badge variant="outline" className="text-xs px-2 py-0.5">Релокация</Badge>
                )}
                {isRemoteAvailable && (
                  <Badge variant="outline" className="text-xs px-2 py-0.5">Удалённо</Badge>
                )}
                {skills.slice(0, 3).map((s, i) => (
                  <Badge key={i} variant="outline" className="text-xs px-2 py-0.5">
                    {s.name}
                  </Badge>
                ))}
                {skills.length > 3 && (
                  <Badge variant="outline" className="text-xs px-2 py-0.5">
                    +{skills.length - 3}
                  </Badge>
                )}
              </div>

              {/* Bottom row: location + sports */}
              <div className="flex flex-wrap items-center gap-3 mt-2 text-sm">
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
                      {s.years > 0 && <span className="text-muted-foreground/60 text-xs">({s.years}л)</span>}
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
