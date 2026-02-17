/**
 * Mapping of specialist roles to showcase sections.
 * Unified grouping used on both /specialists and /jobs pages.
 */

export interface SectionConfig {
  key: string;
  title: string;
  /** Role IDs from specialist_roles table that belong to this section */
  roleIds: string[];
  /** Role names (fallback matching for mock data) */
  roleNames: string[];
}

export const SECTIONS: SectionConfig[] = [
  {
    key: "coaching",
    title: "Тренеры по видам спорта",
    roleIds: [
      "e74c6476-9b5f-4ccd-a3b8-03faa2988d46", // Главный тренер
      "bd25686c-1063-4613-8afb-9d1c2aee3047", // Помощник тренера
      "c7c42a56-6bd1-4080-949a-f7f80e5c5651", // Тренер вратарей
    ],
    roleNames: ["Главный тренер", "Помощник тренера", "Тренер вратарей"],
  },
  {
    key: "performance",
    title: "Тренеры по физподготовке",
    roleIds: [
      "a9620db1-3cf0-4d57-a6bf-28c2961c43e1", // S&C специалист
      "cfd950a8-5ebe-4ba9-b16f-94e05903c4f2", // Тренер по физподготовке
    ],
    roleNames: ["S&C специалист", "Тренер по физподготовке"],
  },
  {
    key: "analytics",
    title: "Аналитика и данные",
    roleIds: [
      "b79fbfc7-3c12-44aa-8606-fcba449c9373", // Аналитик данных
      "c19b18bc-4521-45b4-8ed7-54aa647cb17f", // Видеоаналитик
      "96069546-82b6-4337-9079-a5473e238b3f", // Аналитик GPS/отслеживания
    ],
    roleNames: ["Аналитик данных", "Видеоаналитик", "Аналитик GPS/отслеживания"],
  },
  {
    key: "medical",
    title: "Медперсонал и восстановление",
    roleIds: [
      "98271286-d569-4074-8d96-16dcf258fdcf", // Спортивный врач
      "0bd7deb6-adca-4ff7-b83f-ca8ad11758ad", // Реабилитолог
      "2e135641-1951-4b35-af1f-e9ad866fd889", // Массажист
      "8a1775dd-4e59-4a99-b378-07b19069b1ff", // Физиотерапевт
      "2056f7c5-6c00-491f-a298-bec303ff15cf", // Нутрициолог
    ],
    roleNames: ["Спортивный врач", "Реабилитолог", "Массажист", "Физиотерапевт", "Нутрициолог"],
  },
  {
    key: "other",
    title: "Другие специалисты",
    roleIds: [
      "362ad39d-e65d-4f79-ab97-0710ff4b40e7", // Скаут
      "179b0d8c-7a31-49e6-9662-c53c4397cedc", // Спортивный директор
      "e5ac0126-f293-4664-80eb-a4147d15bd05", // Менеджер команды
      "e1c0d411-0ace-49c8-a1f1-e9f3c7996ce1", // Администратор академии
      "7d84c3f8-6859-4c4e-af48-9d22d111178a", // Медиа-менеджер
      "65ffb93a-82fe-476e-87a9-a6310c25109c", // Переводчик
      "c863d569-2553-42ba-b105-fb6aa73dd52d", // Психолог
    ],
    roleNames: ["Скаут", "Спортивный директор", "Менеджер команды", "Администратор академии", "Медиа-менеджер", "Переводчик", "Психолог"],
  },
];

/** Get section key for a given role */
export function getSectionForRole(roleId: string | null, roleName: string | null): string {
  if (!roleId && !roleName) return "other";
  for (const section of SECTIONS) {
    if (roleId && section.roleIds.includes(roleId)) return section.key;
    if (roleName && section.roleNames.includes(roleName)) return section.key;
  }
  return "other";
}
