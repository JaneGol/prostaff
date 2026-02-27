import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Briefcase, User } from "lucide-react";

const mockSpecialists = [
  {
    initials: "АМ",
    name: "Алексей М.",
    role: "Видеоаналитик",
    level: "Senior",
    skills: ["Hudl", "Sportscode", "анализ соперника", "прессинг-модели"],
    experience: "5 лет",
    sports: ["Футбол"],
    status: "Открыт к предложениям",
    statusColor: "bg-green-500",
    location: "Москва, Россия",
  },
  {
    initials: "ДК",
    name: "Дмитрий К.",
    role: "Тренер по физической подготовке",
    level: "Senior",
    skills: ["периодизация", "плиометрика", "GPS-мониторинг", "нагрузочный контроль"],
    experience: "8 лет",
    sports: ["Хоккей", "Футбол"],
    status: "Открыт к предложениям",
    statusColor: "bg-green-500",
    location: "Санкт-Петербург, Россия",
  },
  {
    initials: "МС",
    name: "Мария С.",
    role: "Физиотерапевт",
    level: "Middle",
    skills: ["спортивная реабилитация", "return-to-play", "мануальная терапия"],
    experience: "6 лет",
    sports: ["Баскетбол"],
    status: "Рассматриваю варианты",
    statusColor: "bg-yellow-500",
    location: "Минск, Беларусь",
  },
];

export function MockSpecialistsSection() {
  return (
    <section className="py-12 md:py-16 bg-background">
      <div className="container max-w-6xl">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-muted-foreground text-sm uppercase tracking-wide font-medium mb-6"
        >
          Специалисты на платформе
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
          {mockSpecialists.map((spec, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow h-full border-border">
                <CardContent className="p-5">
                  {/* Header: avatar + name + status */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-semibold text-primary">{spec.initials}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-foreground text-[15px] min-h-[2.5rem] leading-snug">{spec.role}</h3>
                        <Badge variant="outline" className="text-xs px-2 py-0.5 flex-shrink-0">
                          {spec.level}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                        <span className={`h-1.5 w-1.5 rounded-full inline-block ${spec.statusColor}`} />
                        {spec.status}
                      </p>
                    </div>
                  </div>

                  {/* Skills tags */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {spec.skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-xs px-2 py-0.5 font-normal">
                        {skill}
                      </Badge>
                    ))}
                  </div>

                  {/* Bottom: experience + location */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Briefcase className="h-3 w-3" />
                      {spec.experience} · {spec.sports.join(", ")}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {spec.location}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
