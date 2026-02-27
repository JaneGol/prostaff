import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Users, Building2 } from "lucide-react";
import { trackEvent } from "@/hooks/useAnalytics";

export function CTASection() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container max-w-6xl">
        <div className="grid md:grid-cols-2 gap-6 md:gap-8 mb-16">
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
                Создайте профиль, расскажите о своём опыте и целях, 
                будьте видимы для клубов и организаций спортивной индустрии.
              </p>
              <ul className="space-y-2 mb-8 text-white/90">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
                  Публичный профессиональный профиль
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
                  Возможность заявить о готовности к предложениям
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
                  Шеринг профиля и резюме
                </li>
              </ul>
              <Link to="/auth?mode=signup&role=specialist" onClick={() => trackEvent("cta_click", "cta_section", "Создать профиль")}>
                <Button size="lg" className="w-full sm:w-auto">
                  Создать профиль
                </Button>
              </Link>
            </div>
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
                Для клубов и организаций
              </h3>
              <p className="text-white/80 mb-6 max-w-md">
                Получите доступ к базе специалистов, 
                находите профессионалов под конкретные задачи и направления.
              </p>
              <ul className="space-y-2 mb-8 text-white/90">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
                  Поиск по ролям, опыту и параметрам
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
                  Публикация вакансий
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
                  Прямая связь со специалистами
                </li>
              </ul>
              <Link to="/auth?mode=signup&role=company" onClick={() => trackEvent("cta_click", "cta_section", "Зарегистрировать организацию")}>
                <Button size="lg" className="w-full sm:w-auto">
                  Зарегистрировать организацию
                </Button>
              </Link>
            </div>
            <div className="absolute -right-20 -bottom-20 w-64 h-64 rounded-full bg-white/5"></div>
          </motion.div>
        </div>

        {/* Final calm statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto"
        >
          <p className="text-muted-foreground text-lg leading-relaxed">
            ProStaff — это не просто вакансии. 
            Это пространство, где специалисты спортивной индустрии могут быть увидены, услышаны 
            и найти своё профессиональное развитие.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
