/**
 * Group definitions for the top-level tabs.
 * Specializations are loaded dynamically from the DB.
 */

export interface GroupConfig {
  key: string;
  title: string;
  /** Short label for tabs */
  shortTitle: string;
}

export const GROUPS: GroupConfig[] = [
  { key: "coaching", title: "Тренеры по видам спорта", shortTitle: "Тренеры" },
  { key: "performance", title: "Тренеры по физической подготовке", shortTitle: "Тренеры по физической подготовке" },
  { key: "analytics", title: "Аналитика и данные", shortTitle: "Аналитика и данные" },
  { key: "medical", title: "Медицина и восстановление", shortTitle: "Медицина и восстановление" },
  { key: "other", title: "Другие специалисты", shortTitle: "Другое" },
];

export interface Specialization {
  id: string;
  name: string;
  group_key: string;
  sort_order: number;
}

/** Get group key for a specialization */
export function getGroupForSpecialization(groupKey: string | null): string {
  if (!groupKey) return "other";
  if (GROUPS.some((g) => g.key === groupKey)) return groupKey;
  return "other";
}
