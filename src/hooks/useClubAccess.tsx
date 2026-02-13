import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface ClubAccess {
  free_views_remaining: number;
  free_views_per_week: number;
  trial_expires_at: string;
  is_subscribed: boolean;
}

export function useClubAccess() {
  const { user, userRole } = useAuth();
  const [access, setAccess] = useState<ClubAccess | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || userRole !== "employer") {
      setAccess(null);
      setLoading(false);
      return;
    }

    const fetch = async () => {
      const { data } = await supabase
        .from("club_access")
        .select("free_views_remaining, free_views_per_week, trial_expires_at, is_subscribed")
        .eq("user_id", user.id)
        .maybeSingle();

      setAccess(data);
      setLoading(false);
    };

    fetch();

    // Listen for changes
    const channel = supabase
      .channel("club_access_changes")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "club_access", filter: `user_id=eq.${user.id}` },
        (payload) => {
          setAccess(payload.new as ClubAccess);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, userRole]);

  return { access, loading };
}
