/**
 * Job category sections for the /jobs page top tabs.
 * Reuses the unified section config from specialistSections.
 */

import { SECTIONS } from "./specialistSections";

export { SECTIONS as JOB_SECTIONS };

/** Get section key for a given role ID */
export function getJobSectionForRole(roleId: string | null): string {
  if (!roleId) return "other";
  for (const section of SECTIONS) {
    if (section.roleIds.includes(roleId)) return section.key;
  }
  return "other";
}
