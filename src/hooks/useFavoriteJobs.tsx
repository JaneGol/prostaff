import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function useFavoriteJobs() {
  const { user, userRole } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && userRole === "specialist") {
      fetchFavorites();
    } else {
      setFavoriteIds(new Set());
    }
  }, [user, userRole]);

  const fetchFavorites = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data } = await supabase
        .from("favorite_jobs")
        .select("job_id")
        .eq("user_id", user.id);
      if (data) {
        setFavoriteIds(new Set(data.map((d) => d.job_id)));
      }
    } catch (err) {
      console.error("Error fetching favorites:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = useCallback(
    async (jobId: string) => {
      if (!user) return false;
      const isFav = favoriteIds.has(jobId);
      // Optimistic update
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (isFav) next.delete(jobId);
        else next.add(jobId);
        return next;
      });

      try {
        if (isFav) {
          await supabase
            .from("favorite_jobs")
            .delete()
            .eq("user_id", user.id)
            .eq("job_id", jobId);
        } else {
          await supabase
            .from("favorite_jobs")
            .insert({ user_id: user.id, job_id: jobId });
        }
        return true;
      } catch {
        // Revert
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          if (isFav) next.add(jobId);
          else next.delete(jobId);
          return next;
        });
        return false;
      }
    },
    [user, favoriteIds]
  );

  const isFavorite = useCallback(
    (jobId: string) => favoriteIds.has(jobId),
    [favoriteIds]
  );

  return { isFavorite, toggleFavorite, favoriteIds, loading };
}
