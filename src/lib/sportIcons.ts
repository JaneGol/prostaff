import {
  CircleDot,
  Snowflake,
  Target,
  Activity,
  Sun,
  Hand,
  Waves,
  Shield,
  Diamond,
  Swords,
  Timer,
  Bike,
  MountainSnow,
  Dumbbell,
  Sparkles,
  Gauge,
  Monitor,
  LucideIcon,
  Trophy,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  "circle-dot": CircleDot,
  snowflake: Snowflake,
  target: Target,
  activity: Activity,
  sun: Sun,
  hand: Hand,
  waves: Waves,
  shield: Shield,
  diamond: Diamond,
  swords: Swords,
  timer: Timer,
  bike: Bike,
  "mountain-snow": MountainSnow,
  dumbbell: Dumbbell,
  sparkles: Sparkles,
  gauge: Gauge,
  monitor: Monitor,
};

export function getSportIcon(iconName: string | null | undefined): LucideIcon {
  if (!iconName) return Trophy;
  return iconMap[iconName] || Trophy;
}
