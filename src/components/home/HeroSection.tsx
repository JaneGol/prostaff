import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Users, Search, ChevronRight } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative bg-hero-gradient bg-noise overflow-hidden">
      {/* Subtle pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M50 50c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10zM10 10c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10S0 25.523 0 20s4.477-10 10-10z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      
      {/* Gradient orbs for depth */}
      <div className="absolute top-20 -left-32 w-96 h-96 bg-primary-glow/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 -right-32 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />

      <div className="container relative">
        <div className="py-20 md:py-28 lg:py-36">
          {/* Main content */}
          <div className="max-w-5xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-2 px-5 py-2 mb-8 text-sm font-medium text-white bg-white/15 backdrop-blur-sm rounded-pill border border-white/20">
                <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                Карьерная платформа для спортивной индустрии
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="heading-hero text-white mb-4"
            >
              <span className="block text-5xl md:text-6xl lg:text-7xl xl:text-8xl mb-2">
                Найди свою
              </span>
              <span className="block text-6xl md:text-7xl lg:text-8xl xl:text-[6.5rem] text-white">
                команду
              </span>
              <span className="block text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-white/70 mt-2">
                в мире спорта
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg md:text-xl text-white/75 mb-10 max-w-2xl mx-auto font-normal leading-relaxed"
            >
              Единая база спортивных специалистов для клубов и федераций 
              России, Беларуси и Казахстана. Аналитики, тренеры, врачи — 
              все профессионалы в одном месте.
            </motion.p>

            {/* CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
            >
              <Link to="/auth?mode=signup&role=specialist">
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto btn-premium text-base px-8 py-6 h-auto glow-accent"
                >
                  <Users className="h-5 w-5 mr-2" />
                  Создать профиль
                  <ChevronRight className="h-5 w-5 ml-1" />
                </Button>
              </Link>
              <Link to="/specialists">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="w-full sm:w-auto border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50 text-base px-8 py-6 h-auto backdrop-blur-sm"
                >
                  <Search className="h-5 w-5 mr-2" />
                  Найти специалиста
                </Button>
              </Link>
            </motion.div>

            {/* Stats with better visual separation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="relative"
            >
              {/* Divider line */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-accent to-transparent" />
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 pt-8">
                {[
                  { value: "500+", label: "Специалистов" },
                  { value: "50+", label: "Клубов" },
                  { value: "20+", label: "Ролей" },
                  { value: "3", label: "Страны" },
                ].map((stat, index) => (
                  <div key={index} className="text-center group">
                    <div className="font-display text-4xl md:text-5xl lg:text-6xl text-white mb-1 group-hover:text-accent transition-colors">
                      {stat.value}
                    </div>
                    <div className="text-white/50 text-xs md:text-sm uppercase tracking-widest font-medium">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg 
          viewBox="0 0 1440 100" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto"
          preserveAspectRatio="none"
        >
          <path 
            d="M0 100L48 91.7C96 83.3 192 66.7 288 58.3C384 50 480 50 576 54.2C672 58.3 768 66.7 864 70.8C960 75 1056 75 1152 70.8C1248 66.7 1344 58.3 1392 54.2L1440 50V100H1392C1344 100 1248 100 1152 100C1056 100 960 100 864 100C768 100 672 100 576 100C480 100 384 100 288 100C192 100 96 100 48 100H0Z" 
            fill="hsl(0 0% 100%)"
          />
        </svg>
      </div>
    </section>
  );
}