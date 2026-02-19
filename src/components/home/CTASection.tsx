import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Users, Building2 } from "lucide-react";
import { trackEvent } from "@/hooks/useAnalytics";

export function CTASection() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container max-w-6xl">
        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          {/* For Specialists */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-2xl bg-hero-gradient-soft p-8 md:p-10"
          >
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center mb-6">
                <Users className="h-7 w-7 text-white" />
              </div>
              <h3 className="font-display text-2xl md:text-3xl font-bold text-white uppercase tracking-tight mb-4">
                Для специалистов
              </h3>
              <p className="text-white/80 mb-6 max-w-md">
                Создайте профиль бесплатно и станьте видимыми для клубов. 
                Получайте приглашения, находите вакансии и развивайте карьеру в спорте.
              </p>
              <ul className="space-y-2 mb-8 text-white/90">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
                  Структурированный профиль-резюме
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
                  Публичная страница для шеринга
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
                  Уведомления о просмотрах профиля
                </li>
              </ul>
              <Link to="/auth?mode=signup&role=specialist" onClick={() => trackEvent("cta_click", "cta_section", "Создать профиль (специалист)")}>
                <Button size="lg" className="w-full sm:w-auto">
                  Создать профиль
                </Button>
              </Link>
            </div>
            {/* Decorative element */}
            <div className="absolute -right-20 -bottom-20 w-64 h-64 rounded-full bg-white/5"></div>
          </motion.div>

          {/* For Clubs */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-2xl bg-primary-darker p-8 md:p-10"
          >
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center mb-6">
                <Building2 className="h-7 w-7 text-white" />
              </div>
              <h3 className="font-display text-2xl md:text-3xl font-bold text-white uppercase tracking-tight mb-4">
                Для клубов
              </h3>
              <p className="text-white/80 mb-6 max-w-md">
                Получите доступ к базе квалифицированных специалистов. 
                Ищите по фильтрам, связывайтесь напрямую и закрывайте позиции быстрее.
              </p>
              <ul className="space-y-2 mb-8 text-white/90">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
                  Поиск по 20+ параметрам
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
                  Публикация вакансий
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
                  Прямая связь с кандидатами
                </li>
              </ul>
              <Link to="/auth?mode=signup&role=company" onClick={() => trackEvent("cta_click", "cta_section", "Зарегистрировать клуб")}>
                <Button size="lg" className="w-full sm:w-auto">
                  Зарегистрировать клуб
                </Button>
              </Link>
            </div>
            {/* Decorative element */}
            <div className="absolute -right-20 -bottom-20 w-64 h-64 rounded-full bg-white/5"></div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
