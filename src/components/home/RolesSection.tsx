import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Trophy, Dumbbell, BarChart3, Heart, Briefcase } from "lucide-react";
import { useRoleGroups } from "@/hooks/useRoleGroups";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const VISIBLE_COUNT = 3;
const MAX_TAG_LENGTH = 30;

const GROUP_CONFIG: Record<string, { icon: typeof Trophy; borderColor: string }> = {
  coaches:   { icon: Trophy,    borderColor: "border-l-blue-500" },
  fitness:   { icon: Dumbbell,  borderColor: "border-l-amber-500" },
  analytics: { icon: BarChart3, borderColor: "border-l-violet-500" },
  medical:   { icon: Heart,     borderColor: "border-l-emerald-500" },
  other:     { icon: Briefcase, borderColor: "border-l-gray-500" },
};

function truncateRole(name: string): { display: string; isTruncated: boolean } {
  if (name.length <= MAX_TAG_LENGTH) return { display: name, isTruncated: false };
  return { display: name.slice(0, MAX_TAG_LENGTH) + "…", isTruncated: true };
}

export function RolesSection() {
  const { groups, roles, loading } = useRoleGroups();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  if (loading) return null;

  const totalRoles = roles.length;

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  };

  return (
    <TooltipProvider delayDuration={300}>
      <section className="py-12 md:py-16 bg-secondary">
        <div className="container max-w-6xl">
          {/* Header */}
          <div className="flex items-end justify-between gap-4 mb-6">
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
            className="text-muted-foreground mb-8"
          >
            {totalRoles} {totalRoles === 31 ? "роль" : "ролей"} в {groups.length} направлениях
          </motion.p>

          {/* Groups — vertical list */}
          <div className="space-y-3">
            {groups.map((group, gi) => {
              const groupRoles = roles.filter((r) => r.group_id === group.id);
              if (groupRoles.length === 0) return null;

              const isExpanded = expandedGroups.has(group.id);
              const visibleRoles = isExpanded ? groupRoles : groupRoles.slice(0, VISIBLE_COUNT);
              const hiddenCount = groupRoles.length - VISIBLE_COUNT;
              const config = GROUP_CONFIG[group.key] || GROUP_CONFIG.other;
              const IconComponent = config.icon;

              return (
                <motion.div
                  key={group.id}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: gi * 0.05 }}
                  className="rounded-xl bg-background p-4 shadow-sm border border-border"
                >
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                    <IconComponent className="h-4 w-4 text-primary/70" />
                    {group.title}
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {visibleRoles.map((role) => {
                      const { display, isTruncated } = truncateRole(role.name);
                      const tag = (
                        <Link
                          key={role.id}
                          to={`/specialists?role=${encodeURIComponent(role.name)}`}
                        >
                          <Badge
                            variant="outline"
                            className="px-2.5 py-1 text-xs font-normal cursor-pointer hover:bg-primary hover:text-primary-foreground hover:border-primary hover:shadow-sm transition-all duration-150"
                          >
                            {display}
                          </Badge>
                        </Link>
                      );

                      if (isTruncated) {
                        return (
                          <Tooltip key={role.id}>
                            <TooltipTrigger asChild>{tag}</TooltipTrigger>
                            <TooltipContent side="top" className="text-xs max-w-[280px]">
                              {role.name}
                            </TooltipContent>
                          </Tooltip>
                        );
                      }
                      return tag;
                    })}
                    {!isExpanded && hiddenCount > 0 && (
                      <button onClick={() => toggleGroup(group.id)}>
                        <span className="inline-flex items-center px-2.5 py-1 text-xs font-semibold text-primary cursor-pointer hover:underline transition-all duration-150">
                          +{hiddenCount}
                        </span>
                      </button>
                    )}
                    {isExpanded && hiddenCount > 0 && (
                      <button onClick={() => toggleGroup(group.id)}>
                        <span className="inline-flex items-center px-2.5 py-1 text-xs font-semibold text-primary cursor-pointer hover:underline transition-all duration-150">
                          свернуть
                        </span>
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </TooltipProvider>
  );
}