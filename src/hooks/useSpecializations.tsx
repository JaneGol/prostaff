import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Specialization } from "@/lib/specialistSections";

/**
 * Loads specializations from DB and caches them.
 * Also loads specialist_roles with their specialization_id for mapping.
 */
export interface RoleWithSpec {
  id: string;
  name: string;
  specialization_id: string | null;
}

export function useSpecializations() {
  const [specializations, setSpecializations] = useState<Specialization[]>([]);
  const [rolesWithSpec, setRolesWithSpec] = useState<RoleWithSpec[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const [specRes, rolesRes] = await Promise.all([
        supabase
          .from("specializations")
          .select("id, name, group_key, sort_order")
          .order("sort_order"),
        supabase
          .from("specialist_roles")
          .select("id, name, specialization_id")
          .order("name"),
      ]);
      if (specRes.data) setSpecializations(specRes.data as Specialization[]);
      if (rolesRes.data) setRolesWithSpec(rolesRes.data as RoleWithSpec[]);
      setLoading(false);
    };
    fetch();
  }, []);

  /** Get the group_key for a given role_id */
  const getGroupForRoleId = (roleId: string | null): string => {
    if (!roleId) return "other";
    const role = rolesWithSpec.find((r) => r.id === roleId);
    if (!role?.specialization_id) return "other";
    const spec = specializations.find((s) => s.id === role.specialization_id);
    return spec?.group_key || "other";
  };

  /** Get specializations filtered by group_key */
  const getSpecsForGroup = (groupKey: string | null): Specialization[] => {
    const filtered = (!groupKey || groupKey === "all")
      ? specializations
      : specializations.filter((s) => s.group_key === groupKey);
    return [...filtered].sort((a, b) => a.name.localeCompare(b.name, "ru"));
  };

  /** Get role IDs belonging to a specialization */
  const getRoleIdsForSpec = (specId: string): string[] => {
    return rolesWithSpec.filter((r) => r.specialization_id === specId).map((r) => r.id);
  };

  /** Get role IDs belonging to a group */
  const getRoleIdsForGroup = (groupKey: string): string[] => {
    const specIds = specializations.filter((s) => s.group_key === groupKey).map((s) => s.id);
    return rolesWithSpec.filter((r) => r.specialization_id && specIds.includes(r.specialization_id)).map((r) => r.id);
  };

  return {
    specializations,
    rolesWithSpec,
    loading,
    getGroupForRoleId,
    getSpecsForGroup,
    getRoleIdsForSpec,
    getRoleIdsForGroup,
  };
}
