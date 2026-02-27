import { motion } from "framer-motion";
import { SpecialistCard } from "@/components/specialists/SpecialistCard";

const mockSpecialists = [
  {
    id: "home-mock-1",
    roleName: "Видеоаналитик",
    secondaryRoleName: "Аналитик данных",
    level: "senior",
    city: "Москва",
    country: null,
    searchStatus: "open_to_offers",
    isRelocatable: true,
    isRemoteAvailable: false,
    skills: [
      { name: "Hudl" },
      { name: "Sportscode" },
      { name: "анализ соперника" },
      { name: "прессинг-модели" },
    ],
    sports: [{ sport_id: "s1", years: 5, sports: { name: "Футбол", icon: "circle-dot" } }],
    aboutSnippet: "Помогаю командам принимать решения на основе данных",
    experience: { count: 2, latest_position: "Видеоаналитик", latest_company: "ФК Динамо", total_years: 5 },
  },
  {
    id: "home-mock-2",
    roleName: "Тренер по физической подготовке",
    secondaryRoleName: null,
    level: "senior",
    city: "Казань",
    country: null,
    searchStatus: "actively_looking",
    isRelocatable: false,
    isRemoteAvailable: false,
    skills: [
      { name: "периодизация" },
      { name: "плиометрика" },
      { name: "GPS-мониторинг" },
      { name: "нагрузочный контроль" },
    ],
    sports: [
      { sport_id: "s1", years: 8, sports: { name: "Хоккей", icon: "snowflake" } },
      { sport_id: "s2", years: 3, sports: { name: "Футбол", icon: "circle-dot" } },
    ],
    aboutSnippet: "Периодизация силовых программ для профессиональных команд",
    experience: { count: 3, latest_position: "S&C Coach", latest_company: "СШОР 2", total_years: 8 },
  },
  {
    id: "home-mock-3",
    roleName: "Физиотерапевт",
    secondaryRoleName: null,
    level: "middle",
    city: "Минск",
    country: null,
    searchStatus: "not_looking_but_open",
    isRelocatable: false,
    isRemoteAvailable: false,
    skills: [
      { name: "спортивная реабилитация" },
      { name: "return-to-play" },
      { name: "мануальная терапия" },
    ],
    sports: [{ sport_id: "s3", years: 6, sports: { name: "Баскетбол", icon: "target" } }],
    aboutSnippet: "Спортивная реабилитация и return-to-play протоколы",
    experience: { count: 2, latest_position: "Физиотерапевт", latest_company: null, total_years: 6 },
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
              key={spec.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="h-full"
            >
              <SpecialistCard
                id={spec.id}
                roleName={spec.roleName}
                level={spec.level}
                city={spec.city}
                country={spec.country}
                searchStatus={spec.searchStatus}
                isRelocatable={spec.isRelocatable}
                isRemoteAvailable={spec.isRemoteAvailable}
                skills={spec.skills}
                sports={spec.sports}
                aboutSnippet={spec.aboutSnippet}
                experience={spec.experience}
                secondaryRoleName={spec.secondaryRoleName}
                variant="homepage"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
