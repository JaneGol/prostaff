import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface RoleGroup {
  id: string;
  key: string;
  title: string;
  sort_order: number;
}

export interface Role {
  id: string;
  name: string;
  group_id: string | null;
  description: string | null;
  is_custom_allowed: boolean;
  is_active: boolean;
  sort_order: number;
}

/**
 * Loads role_groups and specialist_roles from DB.
 * Replaces the old useSpecializations hook.
 */
export function useRoleGroups() {
  const [groups, setGroups] = useState<RoleGroup[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [groupsRes, rolesRes] = await Promise.all([
        supabase
          .from("role_groups")
          .select("id, key, title, sort_order")
          .order("sort_order"),
        supabase
          .from("specialist_roles")
          .select("id, name, group_id, description, is_custom_allowed, is_active, sort_order")
          .eq("is_active", true)
          .order("sort_order"),
      ]);
      if (groupsRes.data) setGroups(groupsRes.data as RoleGroup[]);
      if (rolesRes.data) setRoles(rolesRes.data as Role[]);
      setLoading(false);
    };
    load();
  }, []);

  /** Get group key for a given role_id */
  const getGroupKeyForRoleId = (roleId: string | null): string => {
    if (!roleId) return "other";
    const role = roles.find((r) => r.id === roleId);
    if (!role?.group_id) return "other";
    const group = groups.find((g) => g.id === role.group_id);
    return group?.key || "other";
  };

  /** Get roles for a group key */
  const getRolesForGroup = (groupKey: string | null): Role[] => {
    if (!groupKey || groupKey === "all") return roles;
    const group = groups.find((g) => g.key === groupKey);
    if (!group) return [];
    return roles.filter((r) => r.group_id === group.id);
  };

  /** Get role IDs for a group key */
  const getRoleIdsForGroup = (groupKey: string): string[] => {
    const group = groups.find((g) => g.key === groupKey);
    if (!group) return [];
    return roles.filter((r) => r.group_id === group.id).map((r) => r.id);
  };

  return {
    groups,
    roles,
    loading,
    getGroupKeyForRoleId,
    getRolesForGroup,
    getRoleIdsForGroup,
  };
}
