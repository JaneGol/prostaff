import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { SpecialistCard } from "./SpecialistCard";

interface SportDisplay {
  sport_id: string;
  years: number;
  sports: { name: string; icon: string | null } | null;
}

interface SkillDisplay {
  name: string;
}

export interface SectionProfile {
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

interface SpecialistSectionProps {
  title: string;
  sectionKey: string;
  profiles: SectionProfile[];
  totalCount: number;
}

export function SpecialistSection({
  title,
  sectionKey,
  profiles,
  totalCount,
}: SpecialistSectionProps) {
  if (profiles.length === 0) return null;

  const displayProfiles = profiles.slice(0, 3);

  return (
    <section className="py-4 first:pt-0">
      {/* Section header */}
      <div className="flex items-baseline justify-between gap-4 mb-5">
        <h2 className="text-lg md:text-xl font-semibold text-foreground">
          {title}
        </h2>
        <Link
          to={`/specialists?section=${sectionKey}`}
          className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors whitespace-nowrap shrink-0"
        >
          Все ({totalCount})
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayProfiles.map((p) => (
          <SpecialistCard key={p.id} {...p} />
        ))}
      </div>
    </section>
  );
}
