import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { useRoleGroups } from "@/hooks/useRoleGroups";

const VISIBLE_COUNT = 3;

export function RolesSection() {
  const { groups, roles, loading } = useRoleGroups();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  if (loading) return null;

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  };

  return (
    <section className="py-12 md:py-16 bg-secondary">
      <div className="container max-w-6xl">
        {/* Header */}
        <div className="flex items-end justify-between gap-4 mb-8">
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-2xl md:text-3xl font-bold text-foreground uppercase tracking-tight"
          >
            Специализации
          </motion.h2>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Link to="/specialists">
              <Button variant="outline" size="sm">
                Все специалисты
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </Link>
          </motion.div>
        </div>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-muted-foreground mb-8 max-w-xl"
        >
          Тренеры, аналитики, врачи, специалисты по физподготовке и другие направления.
        </motion.p>

        {/* Groups */}
        <div className="space-y-5">
          {groups.map((group, gi) => {
            const groupRoles = roles.filter((r) => r.group_id === group.id);
            if (groupRoles.length === 0) return null;

            const isExpanded = expandedGroups.has(group.id);
            const visibleRoles = isExpanded ? groupRoles : groupRoles.slice(0, VISIBLE_COUNT);
            const hiddenCount = groupRoles.length - VISIBLE_COUNT;

            return (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: gi * 0.05 }}
              >
                <h3 className="text-sm font-semibold text-foreground/70 uppercase tracking-wide mb-2.5">
                  {group.title}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {visibleRoles.map((role) => (
                    <Link
                      key={role.id}
                      to={`/specialists?role=${encodeURIComponent(role.name)}`}
                    >
                      <Badge
                        variant="outline"
                        className="px-3 py-1.5 text-sm font-normal cursor-pointer hover:bg-accent hover:text-white hover:border-accent transition-colors"
                      >
                        {role.name}
                      </Badge>
                    </Link>
                  ))}
                  {!isExpanded && hiddenCount > 0 && (
                    <button onClick={() => toggleGroup(group.id)}>
                      <Badge
                        variant="secondary"
                        className="px-3 py-1.5 text-sm font-normal cursor-pointer hover:bg-muted-foreground/20 transition-colors"
                      >
                        ещё {hiddenCount}
                      </Badge>
                    </button>
                  )}
                  {isExpanded && hiddenCount > 0 && (
                    <button onClick={() => toggleGroup(group.id)}>
                      <Badge
                        variant="secondary"
                        className="px-3 py-1.5 text-sm font-normal cursor-pointer hover:bg-muted-foreground/20 transition-colors"
                      >
                        свернуть
                      </Badge>
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
