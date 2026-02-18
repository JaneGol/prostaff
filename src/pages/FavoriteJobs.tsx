import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useFavoriteJobs } from "@/hooks/useFavoriteJobs";
import { useQuery } from "@tanstack/react-query";
import { JobCardItem, type JobCardData } from "@/components/jobs/JobCardItem";
import { Heart, ArrowLeft, Briefcase } from "lucide-react";

export default function FavoriteJobs() {
  const { user, userRole, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { favoriteIds, isFavorite, toggleFavorite, loading: favsLoading } = useFavoriteJobs();

  useEffect(() => {
    if (!authLoading && (!user || userRole !== "specialist")) {
      navigate("/auth");
    }
  }, [user, userRole, authLoading, navigate]);

  const { data: jobs, isLoading } = useQuery({
    queryKey: ["favorite-jobs", Array.from(favoriteIds)],
    queryFn: async () => {
      if (favoriteIds.size === 0) return [];
      const { data } = await supabase
        .from("jobs")
        .select(`
          id, title, description, city, country, level, contract_type,
          salary_min, salary_max, salary_currency, is_remote, requirements, created_at,
          external_source, external_url,
          companies (id, name, logo_url),
          specialist_roles (id, name)
        `)
        .in("id", Array.from(favoriteIds))
        .order("created_at", { ascending: false });
      return (data || []) as JobCardData[];
    },
    enabled: favoriteIds.size > 0 && !favsLoading,
  });

  if (authLoading) return null;

  return (
    <Layout>
      <section className="bg-gradient-to-b from-primary to-primary-dark text-white py-8 md:py-12">
        <div className="container">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-4 text-sm">
            <ArrowLeft className="h-4 w-4" />
            Личный кабинет
          </Link>
          <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold uppercase flex items-center gap-3">
            <Heart className="h-8 w-8" />
            Избранные вакансии
          </h1>
          <p className="text-white/80 text-base mt-1">
            Сохранённые вакансии, которые вас заинтересовали
          </p>
        </div>
      </section>

      <section className="py-6 md:py-8">
        <div className="container max-w-3xl">
          {isLoading || favsLoading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))}
            </div>
          ) : !jobs || jobs.length === 0 ? (
            <div className="text-center py-16">
              <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Нет избранных вакансий</h3>
              <p className="text-muted-foreground mb-6">
                Нажмите на сердечко на карточке вакансии, чтобы сохранить её
              </p>
              <Link to="/jobs">
                <Button>Смотреть вакансии</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {jobs.map((job) => (
                <JobCardItem
                  key={job.id}
                  job={job}
                  isFavorite={isFavorite(job.id)}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
