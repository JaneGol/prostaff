import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const roles = [
  { name: "Видеоаналитик", count: 85 },
  { name: "Аналитик данных", count: 42 },
  { name: "Тренер", count: 120 },
  { name: "Физиотерапевт", count: 38 },
  { name: "Спортивный врач", count: 25 },
  { name: "S&C тренер", count: 56 },
  { name: "Скаут", count: 31 },
  { name: "Менеджер команды", count: 18 },
  { name: "Переводчик", count: 22 },
  { name: "Спортивный психолог", count: 15 },
  { name: "Нутрициолог", count: 28 },
  { name: "Массажист", count: 45 },
];

export function RolesSection() {
  return (
    <section className="py-16 md:py-24 bg-secondary">
      <div className="container max-w-6xl">
        {/* Section header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div className="max-w-xl">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="inline-block px-4 py-1.5 mb-4 text-sm font-medium text-accent bg-accent-light rounded-pill"
            >
              Специализации
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground uppercase tracking-tight mb-4"
            >
              20+ ролей в спорте
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-muted-foreground text-lg"
            >
              От аналитиков и тренеров до медицинского персонала — 
              найдите специалистов любой спортивной профессии.
            </motion.p>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <Link to="/specialists">
              <Button variant="outline">
                Все специалисты
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Roles grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
          {roles.map((role, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                to={`/specialists?role=${encodeURIComponent(role.name)}`}
                className="block p-4 h-full min-h-[88px] bg-white rounded-lg border border-border hover:border-accent hover:shadow-card transition-all duration-200 group flex flex-col justify-center"
              >
                <div className="font-medium text-foreground group-hover:text-accent transition-colors mb-1">
                  {role.name}
                </div>
                <div className="text-sm text-muted-foreground">
                  {role.count} профилей
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
