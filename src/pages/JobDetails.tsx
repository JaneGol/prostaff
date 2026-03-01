import { useState, useEffect } from "react";
import DOMPurify from "dompurify";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useFavoriteJobs } from "@/hooks/useFavoriteJobs";
import { useToast } from "@/hooks/use-toast";
import { trackEvent } from "@/hooks/useAnalytics";
import { 
  MapPin, 
  Building2,
  Clock,
  Briefcase,
  GraduationCap,
  Globe,
  Send,
  Edit,
  ArrowLeft,
  CheckCircle,
  Loader2,
  ExternalLink,
  Heart
} from "lucide-react";

interface JobDetails {
  id: string;
  title: string;
  description: string;
  requirements: string | null;
  responsibilities: string | null;
  city: string | null;
  country: string | null;
  level: string | null;
  contract_type: string | null;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string | null;
  is_remote: boolean;
  is_relocatable: boolean;
  created_at: string;
  external_source: string | null;
  external_url: string | null;
  companies: {
    id: string;
    name: string;
    logo_url: string | null;
    description: string | null;
    website: string | null;
  } | null;
  specialist_roles: {
    id: string;
    name: string;
  } | null;
}

interface Skill {
  id: string;
  name: string;
  is_required: boolean;
}

const levelLabels: Record<string, string> = {
  intern: "Стажёр",
  junior: "Junior",
  middle: "Middle",
  senior: "Senior",
  head: "Head"
};

const contractLabels: Record<string, string> = {
  full_time: "Полная занятость",
  part_time: "Частичная занятость",
  contract: "Контракт",
  internship: "Стажировка",
  freelance: "Фриланс"
};

export default function JobDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, userRole } = useAuth();
  const { isFavorite, toggleFavorite } = useFavoriteJobs();
  const { toast } = useToast();

  const [job, setJob] = useState<JobDetails | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasApplied, setHasApplied] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  
  // Application modal
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    if (id) {
      fetchJob();
    }
  }, [id, user]);

  const fetchJob = async () => {
    try {
      const { data: jobData, error } = await supabase
        .from("jobs")
        .select(`
          *,
          companies (id, name, logo_url, description, website),
          specialist_roles (id, name)
        `)
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      if (!jobData) {
        setLoading(false);
        return;
      }

      setJob(jobData);

      // Check if current user owns this job
      if (user && jobData.companies) {
        const { data: company } = await supabase
          .from("companies")
          .select("user_id")
          .eq("id", jobData.companies.id)
          .maybeSingle();
        
        if (company && company.user_id === user.id) {
          setIsOwner(true);
        }
      }

      // Fetch skills
      const { data: skillsData } = await supabase
        .from("job_skills")
        .select(`
          is_required,
          skills (id, name)
        `)
        .eq("job_id", id);

      if (skillsData) {
        setSkills(skillsData.map((s: any) => ({
          id: s.skills.id,
          name: s.skills.name,
          is_required: s.is_required
        })));
      }

      // Check if user has applied
      if (user && userRole === "specialist") {
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (profile) {
          const { data: application } = await supabase
            .from("applications")
            .select("id")
            .eq("job_id", id)
            .eq("profile_id", profile.id)
            .maybeSingle();

          setHasApplied(!!application);
        }
      }
    } catch (err) {
      console.error("Error fetching job:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    setApplying(true);

    try {
      // Get user's profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profileError || !profile) {
        toast({
          title: "Заполните профиль",
          description: "Для отклика на вакансию необходимо создать профиль специалиста",
          variant: "destructive"
        });
        navigate("/profile/edit");
        return;
      }

      // Submit application
      const { error } = await supabase
        .from("applications")
        .insert({
          job_id: id,
          profile_id: profile.id,
          cover_letter: coverLetter.trim() || null
        });

      if (error) {
        if (error.code === "23505") {
          toast({
            title: "Вы уже откликнулись",
            description: "Ваш отклик уже отправлен на эту вакансию",
            variant: "destructive"
          });
        } else {
          throw error;
        }
      } else {
        setHasApplied(true);
        setShowApplyModal(false);
        trackEvent("application_submit", "job", job?.title || "", id, {
          company: job?.companies?.name || "unknown",
        });
        toast({
          title: "Отклик отправлен!",
          description: "Работодатель получит ваш отклик и свяжется с вами"
        });
      }
    } catch (err) {
      console.error("Error applying:", err);
      toast({
        title: "Ошибка",
        description: "Не удалось отправить отклик",
        variant: "destructive"
      });
    } finally {
      setApplying(false);
    }
  };

  const formatSalary = (min: number | null, max: number | null, currency: string | null) => {
    if (!min && !max) return null;
    const curr = currency === "RUR" || currency === "RUB" ? "₽" : currency || "₽";
    if (min && max) return `${min.toLocaleString()} – ${max.toLocaleString()} ${curr}`;
    if (min) return `от ${min.toLocaleString()} ${curr}`;
    if (max) return `до ${max.toLocaleString()} ${curr}`;
    return null;
  };

  if (loading) {
    return (
      <Layout>
        <div className="container py-8">
          <Skeleton className="h-8 w-32 mb-6" />
          <Skeleton className="h-64 rounded-2xl mb-6" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
      </Layout>
    );
  }

  if (!job) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <Briefcase className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Вакансия не найдена</h1>
          <p className="text-muted-foreground mb-6">
            Возможно, вакансия была удалена или закрыта
          </p>
          <Link to="/jobs">
            <Button>К списку вакансий</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const salary = formatSalary(job.salary_min, job.salary_max, job.salary_currency);

  return (
    <Layout>
      <div className="container py-8 md:py-12">
        {/* Back button */}
        <Link to="/jobs" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" />
          К списку вакансий
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center overflow-hidden">
                    {job.companies?.logo_url ? (
                      <img 
                        src={job.companies.logo_url} 
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Building2 className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h1 className="font-display text-2xl md:text-3xl font-bold uppercase">
                      {job.title}
                    </h1>
                    {job.companies && (
                      <p className="text-lg text-muted-foreground mt-1">
                        {job.companies.name}
                      </p>
                    )}
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {job.specialist_roles && (
                    <Badge variant="secondary" className="rounded-md px-4 py-1.5 text-sm font-medium">
                      {job.specialist_roles.name}
                    </Badge>
                  )}
                  {job.level && (
                    <Badge variant="outline" className="rounded-md px-4 py-1.5 text-sm font-medium">
                      <GraduationCap className="h-3 w-3 mr-1" />
                      {levelLabels[job.level] || job.level}
                    </Badge>
                  )}
                  {job.contract_type && (
                    <Badge variant="outline" className="rounded-md px-4 py-1.5 text-sm font-medium">
                      {contractLabels[job.contract_type] || job.contract_type}
                    </Badge>
                  )}
                  {job.is_remote && (
                    <Badge variant="outline" className="rounded-md px-4 py-1.5 text-sm font-medium">
                      <Globe className="h-3 w-3 mr-1" />
                      Удалённо
                    </Badge>
                  )}
                  {job.is_relocatable && (
                    <Badge variant="outline" className="rounded-md px-4 py-1.5 text-sm font-medium">Релокация</Badge>
                  )}
                </div>

                {/* Meta */}
                <div className="flex flex-wrap items-center gap-6 mt-4 pt-4 border-t">
                  {(job.city || job.country) && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {[job.city, job.country].filter(Boolean).join(", ")}
                    </div>
                  )}
                  {salary && (
                    <div className="flex items-center gap-2 text-foreground font-semibold">
                      {salary}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {new Date(job.created_at).toLocaleDateString("ru-RU", {
                      day: "numeric",
                      month: "long",
                      year: "numeric"
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardContent className="p-6">
                <h2 className="font-display text-lg font-bold uppercase mb-4">Описание</h2>
                <div 
                  className="prose prose-sm max-w-none [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(job.description) }}
                />
              </CardContent>
            </Card>

            {/* Requirements */}
            {job.requirements && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="font-display text-lg font-bold uppercase mb-4">Требования</h2>
                  <div 
                    className="prose prose-sm max-w-none [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1"
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(job.requirements) }}
                  />
                </CardContent>
              </Card>
            )}

            {/* Responsibilities / Key Skills */}
            {job.responsibilities && (() => {
              // HH imports store key_skills as comma-separated string in responsibilities
              const isKeySkills = job.external_source === "hh" && !job.responsibilities.includes("<");
              if (isKeySkills) {
                const tags = job.responsibilities.split(",").map(s => s.trim()).filter(Boolean);
                return (
                  <Card>
                    <CardContent className="p-6">
                      <h2 className="font-display text-lg font-bold uppercase mb-4">Ключевые навыки</h2>
                      <div className="flex flex-wrap gap-2">
                        {tags.map((tag, i) => (
                          <Badge key={i} variant="secondary" className="rounded-md px-4 py-1.5 text-sm font-medium">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              }
              return (
                <Card>
                  <CardContent className="p-6">
                    <h2 className="font-display text-lg font-bold uppercase mb-4">Обязанности</h2>
                    <div 
                      className="prose prose-sm max-w-none [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1"
                      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(job.responsibilities) }}
                    />
                  </CardContent>
                </Card>
              );
            })()}

            {/* Skills */}
            {skills.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="font-display text-lg font-bold uppercase mb-4">Навыки</h2>
                  <div className="flex flex-wrap gap-2">
                    {skills.map(skill => (
                      <Badge 
                        key={skill.id} 
                        variant={skill.is_required ? "default" : "secondary"}
                        className="rounded-md px-4 py-1.5 text-sm font-medium"
                      >
                        {skill.name}
                        {skill.is_required && " *"}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">* Обязательные навыки</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Apply button */}
            <Card>
              <CardContent className="p-6">
                {isOwner ? (
                  <Link to={`/jobs/${job.id}/edit`}>
                    <Button className="w-full" size="lg">
                      <Edit className="h-4 w-4 mr-2" />
                      Редактировать
                    </Button>
                  </Link>
                ) : hasApplied ? (
                  <Button className="w-full" size="lg" disabled>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Вы откликнулись
                  </Button>
                ) : (
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={() => user ? setShowApplyModal(true) : navigate("/auth")}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Откликнуться
                  </Button>
                )}

                {job.external_source && job.external_url && (
                  <a
                    href={job.external_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 block"
                  >
                    <Button variant="outline" className="w-full gap-2">
                      <ExternalLink className="h-4 w-4" />
                      Открыть на HH
                    </Button>
                  </a>
                )}

                {userRole === "specialist" && (
                  <Button
                    variant="outline"
                    className="w-full mt-3 gap-2"
                    onClick={() => toggleFavorite(job.id)}
                  >
                    <Heart
                      className={`h-4 w-4 transition-colors ${
                        isFavorite(job.id)
                          ? "fill-destructive text-destructive"
                          : ""
                      }`}
                    />
                    {isFavorite(job.id) ? "В избранном" : "В избранное"}
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Company info */}
            {job.companies && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-display text-lg font-bold uppercase mb-4">О компании</h3>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                      {job.companies.logo_url ? (
                        <img 
                          src={job.companies.logo_url} 
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Building2 className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold">{job.companies.name}</p>
                      {job.companies.website && (
                        <a 
                          href={job.companies.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-accent hover:underline"
                        >
                          {job.companies.website.replace(/^https?:\/\//, "")}
                        </a>
                      )}
                    </div>
                  </div>
                  {job.companies.description && (
                    <p className="text-sm text-muted-foreground">
                      {job.companies.description.slice(0, 200)}
                      {job.companies.description.length > 200 && "..."}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      <Dialog open={showApplyModal} onOpenChange={setShowApplyModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Откликнуться на вакансию</DialogTitle>
            <DialogDescription>
              Добавьте сопроводительное письмо (необязательно)
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Расскажите, почему вы подходите на эту позицию..."
              rows={6}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApplyModal(false)}>
              Отмена
            </Button>
            <Button onClick={handleApply} disabled={applying}>
              {applying ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Отправка...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Отправить отклик
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
