import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Users, Building2 } from "lucide-react";
import { trackEvent } from "@/hooks/useAnalytics";

export function CTASection() {
  return (
    <section className="py-12 md:py-16 bg-background">
      <div className="container max-w-6xl">
        <div className="grid md:grid-cols-2 gap-5 md:gap-6">
          {/* For Specialists */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-2xl bg-hero-gradient-soft p-6 md:p-8"
          >
            <div className="relative z-10 flex flex-col h-full">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-display text-xl md:text-2xl font-bold text-white uppercase tracking-tight mb-2">
                Для специалистов
              </h3>
              <p className="text-white/80 mb-5 text-sm">
                Создайте профиль с пресетами навыков и будьте видимы для клубов индустрии.
              </p>
              <div className="mt-auto">
                <Link to="/auth?mode=signup&role=specialist" onClick={() => trackEvent("cta_click", "cta_section", "Создать профиль")}>
                  <Button size="default" className="w-full sm:w-auto">
                    Создать профиль
                  </Button>
                </Link>
              </div>
            </div>
            <div className="absolute -right-16 -bottom-16 w-48 h-48 rounded-full bg-white/5"></div>
          </motion.div>

          {/* For Clubs */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-2xl bg-primary-darker p-6 md:p-8"
          >
            <div className="relative z-10 flex flex-col h-full">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-4">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-display text-xl md:text-2xl font-bold text-white uppercase tracking-tight mb-2">
                Для клубов и организаций
              </h3>
              <p className="text-white/80 mb-5 text-sm">
                Находите специалистов по навыкам, опыту и видам спорта.
              </p>
              <div className="mt-auto">
                <Link to="/auth?mode=signup&role=company" onClick={() => trackEvent("cta_click", "cta_section", "Зарегистрировать организацию")}>
                  <Button size="default" className="w-full sm:w-auto">
                    Зарегистрировать организацию
                  </Button>
                </Link>
              </div>
            </div>
            <div className="absolute -right-16 -bottom-16 w-48 h-48 rounded-full bg-white/5"></div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
