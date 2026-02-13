import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

function getSessionId(): string {
  let sid = sessionStorage.getItem("analytics_sid");
  if (!sid) {
    sid = crypto.randomUUID();
    sessionStorage.setItem("analytics_sid", sid);
  }
  return sid;
}

function getDeviceType(): string {
  const w = window.innerWidth;
  if (w < 768) return "mobile";
  if (w < 1024) return "tablet";
  return "desktop";
}

export function usePageTracking() {
  const location = useLocation();
  const { user } = useAuth();
  const prevPath = useRef<string | null>(null);

  useEffect(() => {
    if (prevPath.current === location.pathname) return;
    prevPath.current = location.pathname;

    supabase.from("page_views").insert({
      user_id: user?.id || null,
      session_id: getSessionId(),
      page_path: location.pathname,
      page_title: document.title,
      referrer: document.referrer || null,
      user_agent: navigator.userAgent,
      device_type: getDeviceType(),
    }).then(() => {});
  }, [location.pathname, user?.id]);
}

export function trackEvent(
  eventType: string,
  category?: string,
  label?: string,
  value?: string,
  metadata?: Record<string, unknown>
) {
  const userId = supabase.auth.getSession().then(({ data }) => data.session?.user?.id);
  
  userId.then((uid) => {
    supabase.from("analytics_events").insert([{
      user_id: uid || null,
      session_id: getSessionId(),
      event_type: eventType,
      event_category: category || null,
      event_label: label || null,
      event_value: value || null,
      page_path: window.location.pathname,
      metadata: (metadata || {}) as any,
    }]).then(() => {});
  });
}
