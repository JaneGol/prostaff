import { Link } from "react-router-dom";
import { MapPin, Clock, Building2 } from "lucide-react";
import { getSportIcon } from "@/lib/sportIcons";
import { getDefaultAvatar, isBankAvatar, decodeBankAvatar, isSilhouetteAvatar } from "@/lib/defaultAvatars";

const levelLabels: Record<string, string> = {
  intern: "Стажёр",
  junior: "Junior",
  middle: "Middle",
  senior: "Senior",
  head: "Head",
};

const levelStyles: Record<string, { text: string; bg: string; border: string }> = {
  intern: { text: "text-muted-foreground", bg: "bg-muted", border: "border-border" },
  junior: { text: "text-muted-foreground", bg: "bg-muted", border: "border-border" },
  middle: { text: "text-violet-600", bg: "bg-violet-50", border: "border-violet-300" },
  senior: { text: "text-sky-700", bg: "bg-sky-50", border: "border-sky-300" },
  head: { text: "text-amber-700", bg: "bg-amber-50", border: "border-amber-300" },
};

const statusConfig: Record<string, { dot: string; text: string; borderColor: string; bgColor: string; label: string }> = {
  actively_looking: { dot: "bg-blue-500", text: "text-blue-600", borderColor: "border-l-blue-500", bgColor: "bg-slate-50", label: "Ищет работу" },
  open_to_offers: { dot: "bg-emerald-500", text: "text-emerald-600", borderColor: "border-l-emerald-500", bgColor: "bg-slate-50", label: "Открыт к предложениям" },
  not_looking_but_open: { dot: "bg-amber-500", text: "text-amber-600", borderColor: "border-l-amber-500", bgColor: "bg-slate-50", label: "Рассматриваю варианты" },
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
  secondaryRoleName?: string | null;
  variant?: "bank" | "homepage";
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
  secondaryRoleName,
  variant = "bank",
}: SpecialistCardProps) {
  const isCompact = variant === "homepage";
  const maxSkills = isCompact ? 3 : 4;

  const status = searchStatus ? statusConfig[searchStatus] : null;
  const lvl = level ? levelStyles[level] || levelStyles.junior : null;

  // Resolve avatar
  const bankAvatar = avatarUrl && isBankAvatar(avatarUrl) ? decodeBankAvatar(avatarUrl) : null;
  const defaultBankAvatar = !avatarUrl ? getDefaultAvatar(id) : null;
  const resolvedBank = bankAvatar || defaultBankAvatar;
  const isCustomImage = !!avatarUrl && !isBankAvatar(avatarUrl);

  // Initials fallback
  const initials = (roleName || "??").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  // Build role display
  const roleDisplay = [roleName, secondaryRoleName].filter(Boolean).join(" · ");

  // Bio text truncated
  const bioText = aboutSnippet
    ? aboutSnippet.length > 80
      ? aboutSnippet.slice(0, 80) + "…"
      : aboutSnippet
    : null;

  // Location
  const location = [city, country].filter(Boolean).join(", ");

  // Experience years
  const expYears = experience?.total_years
    ? `${experience.total_years} ${experience.total_years === 1 ? "год" : experience.total_years < 5 ? "года" : "лет"}`
    : null;

  // Primary sport
  const primarySport = sports[0]?.sports?.name || null;

  return (
    <Link to={`/profile/${id}`} className="block h-full">
      <div
        className={`
          bg-card rounded-xl border border-border
          transition-all duration-200 cursor-pointer
          hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:border-slate-300
          flex flex-col h-full
          ${isCompact ? "p-5 w-full" : "p-5 md:p-6 w-full"}
        `}
      >
        {/* Level 1: Avatar + Role + Level */}
        <div className="flex items-start gap-3.5">
          {/* Avatar circle */}
          <div className="w-11 h-11 rounded-full bg-indigo-50 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {isCustomImage ? (
              <img src={avatarUrl!} alt="" className="w-full h-full object-cover" loading="lazy" />
            ) : resolvedBank ? (
              <img src={resolvedBank.src} alt={resolvedBank.label} className={`object-cover ${isSilhouetteAvatar(resolvedBank) ? "w-8 h-8 opacity-40" : "w-full h-full"}`} />
            ) : (
              <span className="text-sm font-semibold text-indigo-600 tracking-wide">{initials}</span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            {/* Role + Level badge */}
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-semibold text-base text-foreground leading-snug truncate">
                {roleDisplay || "Без специализации"}
              </h3>
              {level && lvl && (
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-md border flex-shrink-0 ${lvl.text} ${lvl.bg} ${lvl.border}`}>
                  {levelLabels[level] || level}
                </span>
              )}
            </div>

            {/* Level 2: Status */}
            {status && (
              <div className="flex items-center gap-1.5 mt-1">
                <span className={`w-[7px] h-[7px] rounded-full ${status.dot} flex-shrink-0`} />
                <span className={`text-[13px] font-medium ${status.text}`}>
                  {status.label}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-slate-100 my-3.5" />

        {/* Level 3: Bio accent block */}
        {bioText && status && (
          <div className={`rounded-r-md border-l-[3px] ${status.borderColor} ${status.bgColor} px-3 py-2 mb-3.5`}>
            <p className="text-[13px] text-slate-600 italic leading-relaxed">
              {bioText}
            </p>
          </div>
        )}

        {/* Level 4: Key Skills */}
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3.5">
            {skills.slice(0, maxSkills).map((s, i) => (
              <span
                key={i}
                className={`text-xs font-medium text-slate-700 bg-slate-100 rounded-md px-2.5 py-1 truncate hover:bg-slate-200 transition-colors ${isCompact ? "max-w-[180px]" : "max-w-[220px]"}`}
              >
                {s.name}
              </span>
            ))}
            {skills.length > maxSkills && (
              <span className="text-xs font-medium text-muted-foreground px-1 py-1">
                +{skills.length - maxSkills}
              </span>
            )}
          </div>
        )}

        {/* Level 5: Meta row */}
        <div className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground mt-auto">
          {experience?.latest_company && (
            <>
              <span className="flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5" />
                {experience.latest_company}
              </span>
              <span className="text-border">·</span>
            </>
          )}
          {expYears && (
            <>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {expYears}
              </span>
              <span className="text-border">·</span>
            </>
          )}
          {primarySport && (
            <>
              <span>{primarySport}</span>
              <span className="text-border">·</span>
            </>
          )}
          {location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {location}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
