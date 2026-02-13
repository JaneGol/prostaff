import { usePageTracking } from "@/hooks/useAnalytics";

export function AnalyticsProvider() {
  usePageTracking();
  return null;
}
