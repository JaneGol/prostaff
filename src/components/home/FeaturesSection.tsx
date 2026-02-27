import { motion } from "framer-motion";
import { Users, Search, Globe } from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Профили специалистов",
    description: "Структурированные профили с опытом, навыками, специализациями и карьерными целями.",
  },
  {
    icon: Search,
    title: "Поиск и открытость к предложениям",
    description: "Организации находят специалистов по ролям, опыту и видам спорта. Специалисты сами определяют свою готовность к предложениям.",
  },
  {
    icon: Globe,
    title: "Сообщество спортивной индустрии",
    description: "Специалисты из разных дисциплин и направлений — в одном месте, без привязки к конкретному виду спорта.",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container max-w-6xl">
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-3xl md:text-4xl font-bold text-foreground uppercase tracking-tight mb-4"
          >
            Платформа для специалистов спортивной индустрии
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground text-lg"
          >
            Сегодня многие профессионалы в спорте остаются незаметными за пределами своего круга. 
            ProStaff — это единое пространство, где специалисты могут представить свой опыт, навыки и цели, 
            а клубы и организации — находить людей под свои задачи.
          </motion.p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
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
