import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  Users,
  Briefcase,
  Mail,
  Phone,
  Calendar,
  FileText,
  Eye,
  MessageSquare,
  ChevronDown,
  Loader2,
  ArrowLeft
} from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type ApplicationStatus = Database["public"]["Enums"]["application_status"];

interface Application {
  id: string;
  cover_letter: string | null;
  status: ApplicationStatus;
  employer_notes: string | null;
  created_at: string;
  profiles: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url: string | null;
    email: string | null;
    phone: string | null;
    city: string | null;
    country: string | null;
    level: string | null;
    specialist_roles: {
      name: string;
    } | null;
  };
  jobs: {
    id: string;
    title: string;
  };
}

interface Job {
  id: string;
  title: string;
  applications_count: number;
}

const statusLabels: Record<ApplicationStatus, string> = {
  pending: "На рассмотрении",
  reviewed: "Просмотрено",
  shortlisted: "В шорт-листе",
  interview: "Интервью",
  rejected: "Отклонён",
  hired: "Принят"
};

const statusColors: Record<ApplicationStatus, string> = {
  pending: "bg-muted text-muted-foreground",
  reviewed: "bg-blue-100 text-blue-800",
  shortlisted: "bg-yellow-100 text-yellow-800",
  interview: "bg-purple-100 text-purple-800",
  rejected: "bg-red-100 text-red-800",
  hired: "bg-green-100 text-green-800"
};

const levelLabels: Record<string, string> = {
  intern: "Стажёр",
  junior: "Junior",
  middle: "Middle",
  senior: "Senior",
  head: "Head"
};

export default function EmployerApplications() {
  const navigate = useNavigate();
  const { user, userRole, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [applications, setApplications] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  
  // Notes modal
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [notes, setNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || userRole !== "employer")) {
      navigate("/auth");
    }
  }, [user, userRole, authLoading, navigate]);

  useEffect(() => {
    if (user && userRole === "employer") {
      fetchData();
    }
  }, [user, userRole]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Get company
      const { data: company } = await supabase
        .from("companies")
        .select("id")
        .eq("user_id", user!.id)
        .maybeSingle();

      if (!company) {
        setLoading(false);
        return;
      }

      // Get jobs
      const { data: jobsData } = await supabase
        .from("jobs")
        .select("id, title, applications_count")
        .eq("company_id", company.id)
        .order("created_at", { ascending: false });

      setJobs(jobsData || []);

      // Get all applications for company's jobs
      const { data: applicationsData, error } = await supabase
        .from("applications")
        .select(`
          id,
          cover_letter,
          status,
          employer_notes,
          created_at,
          profiles (
            id,
            first_name,
            last_name,
            avatar_url,
            email,
            phone,
            city,
            country,
            level,
            specialist_roles (name)
          ),
          jobs (id, title)
        `)
        .in("job_id", (jobsData || []).map(j => j.id))
        .order("created_at", { ascending: false });

      if (error) throw error;
      setApplications(applicationsData as unknown as Application[] || []);
    } catch (err) {
      console.error("Error fetching applications:", err);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить отклики",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (applicationId: string, newStatus: ApplicationStatus) => {
    try {
      const { error } = await supabase
        .from("applications")
        .update({ status: newStatus })
        .eq("id", applicationId);

      if (error) throw error;

      setApplications(prev =>
        prev.map(app =>
          app.id === applicationId ? { ...app, status: newStatus } : app
        )
      );

      toast({
        title: "Статус обновлён",
        description: `Статус изменён на "${statusLabels[newStatus]}"`
      });
    } catch (err) {
      console.error("Error updating status:", err);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить статус",
        variant: "destructive"
      });
    }
  };

  const openNotesModal = (application: Application) => {
    setSelectedApplication(application);
    setNotes(application.employer_notes || "");
    setShowNotesModal(true);
  };

  const saveNotes = async () => {
    if (!selectedApplication) return;
    
    setSavingNotes(true);
    try {
      const { error } = await supabase
        .from("applications")
        .update({ employer_notes: notes.trim() || null })
        .eq("id", selectedApplication.id);

      if (error) throw error;

      setApplications(prev =>
        prev.map(app =>
          app.id === selectedApplication.id 
            ? { ...app, employer_notes: notes.trim() || null } 
            : app
        )
      );

      setShowNotesModal(false);
      toast({ title: "Заметки сохранены" });
    } catch (err) {
      console.error("Error saving notes:", err);
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить заметки",
        variant: "destructive"
      });
    } finally {
      setSavingNotes(false);
    }
  };

  const filteredApplications = applications.filter(app => {
    if (selectedJob !== "all" && app.jobs.id !== selectedJob) return false;
    if (selectedStatus !== "all" && app.status !== selectedStatus) return false;
    return true;
  });

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="container max-w-6xl py-8">
          <Skeleton className="h-8 w-64 mb-6" />
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-2xl" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-6xl py-8 md:py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <Link to="/jobs" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4">
              <ArrowLeft className="h-4 w-4" />
              К вакансиям
            </Link>
            <h1 className="font-display text-3xl md:text-4xl font-bold uppercase">
              Отклики кандидатов
            </h1>
            <p className="text-muted-foreground mt-2">
              Управляйте откликами на ваши вакансии
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Users className="h-8 w-8 text-muted-foreground" />
            <div className="text-right">
              <p className="text-2xl font-bold">{applications.length}</p>
              <p className="text-sm text-muted-foreground">всего откликов</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Select value={selectedJob} onValueChange={setSelectedJob}>
            <SelectTrigger className="w-[250px]">
              <Briefcase className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Все вакансии" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все вакансии</SelectItem>
              {jobs.map(job => (
                <SelectItem key={job.id} value={job.id}>
                  {job.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Все статусы" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все статусы</SelectItem>
              {Object.entries(statusLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="ml-auto text-muted-foreground">
            Показано: {filteredApplications.length}
          </div>
        </div>

        {/* Applications List */}
        {filteredApplications.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Откликов пока нет</h3>
              <p className="text-muted-foreground">
                {jobs.length === 0 
                  ? "Создайте вакансию, чтобы получать отклики"
                  : "Когда кандидаты откликнутся на ваши вакансии, они появятся здесь"
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map(application => (
              <Card key={application.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                    {/* Avatar */}
                    <Avatar className="h-14 w-14">
                      <AvatarImage src={application.profiles.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary text-lg">
                        {application.profiles.first_name[0]}
                        {application.profiles.last_name[0]}
                      </AvatarFallback>
                    </Avatar>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 mb-3">
                        <div>
                          <Link 
                            to={`/profile/${application.profiles.id}`}
                            className="font-semibold text-lg hover:text-accent transition-colors"
                          >
                            {application.profiles.first_name} {application.profiles.last_name}
                          </Link>
                          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                            {application.profiles.specialist_roles && (
                              <span>{application.profiles.specialist_roles.name}</span>
                            )}
                            {application.profiles.level && (
                              <>
                                <span>•</span>
                                <span>{levelLabels[application.profiles.level] || application.profiles.level}</span>
                              </>
                            )}
                            {application.profiles.city && (
                              <>
                                <span>•</span>
                                <span>{application.profiles.city}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <Badge className={statusColors[application.status]}>
                          {statusLabels[application.status]}
                        </Badge>
                      </div>

                      {/* Job */}
                      <div className="text-sm text-muted-foreground mb-3">
                        <Briefcase className="h-4 w-4 inline mr-1" />
                        На вакансию: <Link to={`/jobs/${application.jobs.id}`} className="text-accent hover:underline">{application.jobs.title}</Link>
                      </div>

                      {/* Cover Letter Preview */}
                      {application.cover_letter && (
                        <div className="bg-muted/50 rounded-lg p-3 mb-3">
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            <FileText className="h-4 w-4 inline mr-1" />
                            {application.cover_letter}
                          </p>
                        </div>
                      )}

                      {/* Contact & Date */}
                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        {application.profiles.email && (
                          <a href={`mailto:${application.profiles.email}`} className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
                            <Mail className="h-4 w-4" />
                            {application.profiles.email}
                          </a>
                        )}
                        {application.profiles.phone && (
                          <a href={`tel:${application.profiles.phone}`} className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
                            <Phone className="h-4 w-4" />
                            {application.profiles.phone}
                          </a>
                        )}
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {new Date(application.created_at).toLocaleDateString("ru-RU")}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-row lg:flex-col gap-2">
                      <Link to={`/profile/${application.profiles.id}`}>
                        <Button variant="outline" size="sm" className="w-full">
                          <Eye className="h-4 w-4 mr-1" />
                          Профиль
                        </Button>
                      </Link>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => openNotesModal(application)}
                        className="w-full"
                      >
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Заметки
                      </Button>
                      <Select 
                        value={application.status} 
                        onValueChange={(value) => updateStatus(application.id, value as ApplicationStatus)}
                      >
                        <SelectTrigger className="w-full">
                          <ChevronDown className="h-4 w-4 mr-1" />
                          Статус
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(statusLabels).map(([key, label]) => (
                            <SelectItem key={key} value={key}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Notes Modal */}
      <Dialog open={showNotesModal} onOpenChange={setShowNotesModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Заметки о кандидате</DialogTitle>
            <DialogDescription>
              {selectedApplication && (
                <>
                  {selectedApplication.profiles.first_name} {selectedApplication.profiles.last_name}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Добавьте заметки о кандидате..."
            rows={5}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNotesModal(false)}>
              Отмена
            </Button>
            <Button onClick={saveNotes} disabled={savingNotes}>
              {savingNotes && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
