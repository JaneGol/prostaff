import { Link } from "react-router-dom";
import { MapPin, Clock, Building2 } from "lucide-react";

export interface JobCardData {
  id: string;
  title: string;
  description: string;
  city: string | null;
  country: string | null;
  level: string | null;
  contract_type: string | null;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string | null;
  is_remote: boolean;
  created_at: string;
  external_source: string | null;
  external_url: string | null;
  companies: {
    id: string;
    name: string;
    logo_url: string | null;
  } | null;
  specialist_roles: {
    id: string;
    name: string;
  } | null;
}

export const levelLabels: Record<string, string> = {
  intern: "Стажёр",
  junior: "Junior",
  middle: "Middle",
  senior: "Senior",
  head: "Head",
};

export const contractLabels: Record<string, string> = {
  full_time: "Полная занятость",
  part_time: "Частичная занятость",
  contract: "Контракт",
  internship: "Стажировка",
  freelance: "Фриланс",
};

const formatSalary = (
  min: number | null,
  max: number | null,
  currency: string | null,
) => {
  if (!min && !max) return null;
  const curr = currency === "RUB" ? "₽" : currency || "₽";
  if (min && max)
    return `${min.toLocaleString("ru-RU")} – ${max.toLocaleString("ru-RU")} ${curr}`;
  if (min) return `от ${min.toLocaleString("ru-RU")} ${curr}`;
  if (max) return `до ${max.toLocaleString("ru-RU")} ${curr}`;
  return null;
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diffDays === 0) return "Сегодня";
  if (diffDays === 1) return "Вчера";
  if (diffDays < 7) return `${diffDays} дн. назад`;
  return date.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
};

export function JobCardItem({ job }: { job: JobCardData }) {
  const salary = formatSalary(
    job.salary_min,
    job.salary_max,
    job.salary_currency,
  );
  const location = [job.city, job.country].filter(Boolean).join(", ");
  const contract = job.contract_type
    ? contractLabels[job.contract_type] || job.contract_type
    : null;

  // Build subtitle parts
  const subtitleParts: string[] = [];
  if (location) subtitleParts.push(location);
  if (contract) subtitleParts.push(contract);
  if (job.is_remote) subtitleParts.push("Удалённо");

  return (
    <Link to={`/jobs/${job.id}`} className="block group">
      <div className="rounded-2xl bg-card p-5 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-150">
        <div className="flex items-start gap-4">
          {/* Company logo */}
          <div className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0 overflow-hidden">
            {job.companies?.logo_url ? (
              <img
                src={job.companies.logo_url}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <Building2 className="h-5 w-5 text-muted-foreground" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Title */}
            <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1 mb-0.5">
              {job.title}
            </h3>

            {/* Company */}
            {job.companies && (
              <p className="text-sm text-muted-foreground mb-2">
                {job.companies.name}
              </p>
            )}

            {/* Meta line */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mb-2">
              {location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {location}
                </span>
              )}
              {contract && <span>{contract}</span>}
              {job.is_remote && (
                <span className="text-primary font-medium">Удалённо</span>
              )}
            </div>

            {/* Salary — visual anchor */}
            {salary && (
              <p className="text-base font-semibold text-foreground mb-2">
                {salary}
              </p>
            )}

            {/* Description snippet */}
            {job.description && (
              <p className="text-sm text-muted-foreground line-clamp-1">
                {job.description}
              </p>
            )}
          </div>

          {/* Date */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0 whitespace-nowrap">
            <Clock className="h-3 w-3" />
            {formatDate(job.created_at)}
          </div>
        </div>
      </div>
    </Link>
  );
}
