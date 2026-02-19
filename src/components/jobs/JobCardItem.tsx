import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Building2, Clock, ChevronRight, FileText, ListChecks, Heart } from "lucide-react";

/** Strip HTML tags and decode HTML entities for plain-text preview */
const stripHtml = (html: string) => {
  const text = html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ");
  const el = document.createElement("textarea");
  el.innerHTML = text;
  return el.value.trim();
};

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
  requirements: string | null;
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

const levelLabels: Record<string, string> = {
  intern: "Стажёр",
  junior: "Junior",
  middle: "Middle",
  senior: "Senior",
  head: "Head",
};

const contractLabels: Record<string, string> = {
  full_time: "Полная занятость",
  part_time: "Частичная занятость",
  contract: "Контракт",
  internship: "Стажировка",
  freelance: "Фриланс",
};

export { levelLabels, contractLabels };

const formatSalary = (min: number | null, max: number | null, currency: string | null) => {
  if (!min && !max) return null;
  const curr = currency === "RUR" || currency === "RUB" ? "₽" : currency || "₽";
  if (min && max) return `${min.toLocaleString()} – ${max.toLocaleString()} ${curr}`;
  if (min) return `от ${min.toLocaleString()} ${curr}`;
  if (max) return `до ${max.toLocaleString()} ${curr}`;
  return null;
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Сегодня";
  if (diffDays === 1) return "Вчера";
  if (diffDays < 7) return `${diffDays} дн. назад`;
  return date.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
};

interface JobCardItemProps {
  job: JobCardData;
  isFavorite?: boolean;
  onToggleFavorite?: (jobId: string) => void;
}

export function JobCardItem({ job, isFavorite, onToggleFavorite }: JobCardItemProps) {
  const navigate = useNavigate();

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleFavorite?.(job.id);
  };

  const handleApply = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/jobs/${job.id}`);
  };

  return (
    <Link to={`/jobs/${job.id}`}>
      <Card className="hover:shadow-lg transition-shadow group shadow-sm mb-3">
        <CardContent className="p-4 md:p-5">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
              {job.companies?.logo_url ? (
                <img src={job.companies.logo_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <Building2 className="h-5 w-5 text-muted-foreground" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-semibold text-base group-hover:text-accent transition-colors line-clamp-1">
                    {job.title}
                  </h3>
                  {job.companies && (
                    <p className="text-sm text-muted-foreground">{job.companies.name}</p>
                  )}
                </div>
                <div className="flex items-center gap-2.5 flex-shrink-0">
                  {onToggleFavorite && (
                    <button
                      onClick={handleFavorite}
                      className="p-1.5 rounded-full hover:bg-muted transition-colors"
                      aria-label={isFavorite ? "Убрать из избранного" : "Добавить в избранное"}
                    >
                      <Heart
                        className={`h-6 w-6 transition-colors ${
                          isFavorite
                            ? "fill-destructive text-destructive"
                            : "text-muted-foreground hover:text-destructive"
                        }`}
                      />
                    </button>
                  )}
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatDate(job.created_at)}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-1 mt-1.5">
                {job.level && (
                  <Badge variant="outline" className="text-xs px-2 py-0.5">
                    {levelLabels[job.level] || job.level}
                  </Badge>
                )}
                {job.contract_type && (
                  <Badge variant="outline" className="text-xs px-2 py-0.5">
                    {contractLabels[job.contract_type] || job.contract_type}
                  </Badge>
                )}
                {job.is_remote && (
                  <Badge variant="outline" className="text-xs px-2 py-0.5">Удалённо</Badge>
                )}
                {job.external_source === "hh" && (
                  <Badge className="text-xs px-2 py-0.5 bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20">
                    HH
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 mt-2 text-sm">
                {(job.city || job.country) && (
                  <span className="flex items-center gap-1 text-primary font-medium">
                    <MapPin className="h-3.5 w-3.5" />
                    {[job.city, job.country].filter(Boolean).join(", ")}
                  </span>
                )}
                {formatSalary(job.salary_min, job.salary_max, job.salary_currency) && (
                  <span className="flex items-center gap-1 text-foreground font-medium">
                    {formatSalary(job.salary_min, job.salary_max, job.salary_currency)}
                  </span>
                )}
              </div>

              {/* Description + Requirements preview with Apply button */}
              {(job.description || job.requirements) && (
                <div className="mt-2.5 pt-2.5 border-t border-border/50 flex items-center gap-4">
                  <div className="flex-1 min-w-0 space-y-1.5">
                    {job.description && (
                      <div className="flex items-start gap-1.5">
                        <FileText className="h-3.5 w-3.5 text-muted-foreground/60 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                          {stripHtml(job.description)}
                        </p>
                      </div>
                    )}
                    {job.requirements && (
                      <div className="flex items-start gap-1.5">
                        <ListChecks className="h-3.5 w-3.5 text-muted-foreground/60 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-1">
                          {stripHtml(job.requirements)}
                        </p>
                      </div>
                    )}
                  </div>
                  <Button
                    variant="primary"
                    size="default"
                    className="hidden md:flex flex-shrink-0 animate-fade-in !rounded-sm ml-6 bg-primary/85 hover:bg-primary/75 text-sm"
                    onClick={handleApply}
                  >
                    Откликнуться
                  </Button>
                </div>
              )}
            </div>

            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors hidden md:block flex-shrink-0 mt-1" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
