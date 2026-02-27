import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Users, Search } from "lucide-react";
import { trackEvent } from "@/hooks/useAnalytics";

export function HeroSection() {
  return (
    <section className="relative bg-hero-gradient-soft overflow-hidden">
      {/* Background pattern */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="container max-w-6xl relative">
        <div className="py-12 md:py-24 lg:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="font-display text-white mb-5"
            >
              Платформа для
              <br />
              <span className="text-white/90">профессионалов спорта</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl mx-auto"
            >
              Профили с пресетами навыков для тренеров, аналитиков, тренеров по физподготовке, врачей и других специалистов.
            </motion.p>

            {/* CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link to="/auth?mode=signup&role=specialist" className="w-full sm:w-auto" onClick={() => trackEvent("cta_click", "hero", "Создать профиль")}>
                <Button size="lg" className="w-full sm:min-w-[240px] h-auto py-3 rounded-xl gap-2">
                  <Users className="h-5 w-5" />
                  Создать профиль
                  <span className="text-xs font-normal opacity-70 ml-1">· Бесплатно</span>
                </Button>
              </Link>
              <Link to="/specialists" className="w-full sm:w-auto" onClick={() => trackEvent("cta_click", "hero", "Найти специалистов")}>
                <Button size="lg" variant="outline" className="w-full sm:min-w-[240px] h-auto py-3 rounded-xl border-white text-white hover:bg-white/10 gap-2">
                  <Search className="h-5 w-5" />
                  Найти специалистов
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg 
          viewBox="0 0 1440 120" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto"
          preserveAspectRatio="none"
        >
          <path 
            d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" 
            fill="white"
          />
        </svg>
      </div>
    </section>
  );
}
