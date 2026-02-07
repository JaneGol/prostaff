import { motion } from "framer-motion";
import { 
  Users, 
  Search, 
  Briefcase, 
  GraduationCap, 
  Globe, 
  Shield 
} from "lucide-react";

const features = [
  {
    icon: Users,
    title: "База специалистов",
    description: "Структурированные профили аналитиков, тренеров, врачей и других профессионалов спорта",
  },
  {
    icon: Search,
    title: "Умный поиск",
    description: "Фильтры по ролям, навыкам, опыту, локации и готовности к переезду",
  },
  {
    icon: Briefcase,
    title: "Вакансии",
    description: "Актуальные предложения от клубов, федераций и спортивных организаций",
  },
  {
    icon: GraduationCap,
    title: "Карьерный контент",
    description: "Гайды, интервью с профессионалами, советы по развитию в спортивной индустрии",
  },
  {
    icon: Globe,
    title: "3 страны",
    description: "Охватываем рынки России, Беларуси и Казахстана с возможностью расширения",
  },
  {
    icon: Shield,
    title: "Проверенные профили",
    description: "Верификация опыта работы и рекомендации от коллег по индустрии",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container">
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-1.5 mb-4 text-sm font-medium text-accent bg-accent-light rounded-pill"
          >
            Возможности платформы
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground uppercase tracking-tight mb-4"
          >
            Всё для карьеры в спорте
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground text-lg"
          >
            Нишевая платформа, созданная специально для спортивной индустрии. 
            Не просто доска вакансий — полноценная экосистема развития карьеры.
          </motion.p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group p-6 md:p-8 bg-secondary/50 hover:bg-white rounded-lg border border-transparent hover:border-border hover:shadow-card transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 group-hover:bg-accent/10 flex items-center justify-center mb-4 transition-colors">
                <feature.icon className="h-6 w-6 text-primary group-hover:text-accent transition-colors" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground uppercase tracking-tight mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
