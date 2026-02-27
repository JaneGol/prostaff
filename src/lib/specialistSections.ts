/**
 * Types for role groups (loaded from DB via useRoleGroups).
 * The old hardcoded GROUPS array is removed — groups come from role_groups table.
 */

export interface RoleGroupConfig {
  id: string;
  key: string;
  title: string;
  sort_order: number;
}

/**
 * @deprecated Use RoleGroupConfig from useRoleGroups instead.
 * Kept temporarily for backward compatibility during migration.
 */
export interface GroupConfig {
  key: string;
  title: string;
  shortTitle: string;
}

/**
 * @deprecated Specialization layer removed. Roles link directly to role_groups.
 */
export interface Specialization {
  id: string;
  name: string;
  group_key: string;
  sort_order: number;
}

/**
 * @deprecated Use getGroupKeyForRoleId from useRoleGroups.
 */
export function getGroupForSpecialization(groupKey: string | null): string {
  if (!groupKey) return "other";
  return groupKey;
}
