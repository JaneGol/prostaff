/**
 * Job category sections for the /jobs page top tabs.
 */

export interface JobSectionConfig {
  key: string;
  title: string;
  /** Role IDs that belong to this section */
  roleIds: string[];
}

export const JOB_SECTIONS: JobSectionConfig[] = [
  {
    key: "coaching",
    title: "Тренеры по видам спорта",
    roleIds: [
      "e74c6476-9b5f-4ccd-a3b8-03faa2988d46", // Главный тренер
      "bd25686c-1063-4613-8afb-9d1c2aee3047", // Помощник тренера
      "c7c42a56-6bd1-4080-949a-f7f80e5c5651", // Тренер вратарей
    ],
  },
  {
    key: "performance",
    title: "Тренеры по физподготовке",
    roleIds: [
      "a9620db1-3cf0-4d57-a6bf-28c2961c43e1", // S&C специалист
      "cfd950a8-5ebe-4ba9-b16f-94e05903c4f2", // Тренер по физподготовке
    ],
  },
  {
    key: "analytics",
    title: "Аналитика и данные",
    roleIds: [
      "b79fbfc7-3c12-44aa-8606-fcba449c9373", // Аналитик данных
      "c19b18bc-4521-45b4-8ed7-54aa647cb17f", // Видеоаналитик
      "96069546-82b6-4337-9079-a5473e238b3f", // Аналитик GPS/отслеживания
    ],
  },
  {
    key: "medical",
    title: "Медицина и восстановление",
    roleIds: [
      "98271286-d569-4074-8d96-16dcf258fdcf", // Спортивный врач
      "0bd7deb6-adca-4ff7-b83f-ca8ad11758ad", // Реабилитолог
      "2e135641-1951-4b35-af1f-e9ad866fd889", // Массажист
      "8a1775dd-4e59-4a99-b378-07b19069b1ff", // Физиотерапевт
      "2056f7c5-6c00-491f-a298-bec303ff15cf", // Нутрициолог
    ],
  },
  {
    key: "other",
    title: "Другие специалисты",
    roleIds: [], // catch-all for everything not in above sections
  },
];

/** All role IDs that have a dedicated section (not "other") */
const KNOWN_ROLE_IDS = new Set(
  JOB_SECTIONS.filter(s => s.key !== "other").flatMap(s => s.roleIds)
);

/** Get section key for a given role ID */
export function getJobSectionForRole(roleId: string | null): string {
  if (!roleId) return "other";
  for (const section of JOB_SECTIONS) {
    if (section.key !== "other" && section.roleIds.includes(roleId)) return section.key;
  }
  return "other";
}

/** Check if a role ID belongs to a known (non-other) section */
export function isKnownJobRole(roleId: string | null): boolean {
  return !!roleId && KNOWN_ROLE_IDS.has(roleId);
}
