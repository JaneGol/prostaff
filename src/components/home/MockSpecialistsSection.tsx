import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { SpecialistCard } from "@/components/specialists/SpecialistCard";

const allMockSpecialists = [
  // Аналитика
  {
    id: "home-mock-1",
    roleName: "Аналитик данных",
    secondaryRoleName: null,
    level: "senior",
    city: "Москва",
    country: null,
    searchStatus: "actively_looking",
    isRelocatable: true,
    isRemoteAvailable: false,
    avatarUrl: "bank:17", // мужчина
    skills: [
      { name: "Python" },
      { name: "Дашборды" },
      { name: "SQL" },
    ],
    sports: [{ sport_id: "s1", years: 6, sports: { name: "Футбол", icon: "circle-dot" } }],
    aboutSnippet: "Помогаю командам принимать решения на основе данных",
    experience: { count: 2, latest_position: "Аналитик данных", latest_company: "ФК Динамо", total_years: 6 },
    category: "analytics",
  },
  {
    id: "home-mock-2",
    roleName: "Видеоаналитик",
    secondaryRoleName: null,
    level: "middle",
    city: "Ростов-на-Дону",
    country: null,
    searchStatus: "open_to_offers",
    isRelocatable: false,
    isRemoteAvailable: false,
    skills: [
      { name: "Sportscode" },
      { name: "Разметка видео" },
      { name: "Разбор соперника" },
    ],
    sports: [{ sport_id: "s1", years: 3, sports: { name: "Футбол", icon: "circle-dot" } }],
    aboutSnippet: "Анализ соперников и подготовка видеоотчётов для тренерского штаба",
    experience: { count: 1, latest_position: "Видеоаналитик", latest_company: "ФК Ростов", total_years: 3 },
    category: "analytics",
  },
  {
    id: "home-mock-3",
    roleName: "Скаут-аналитик",
    secondaryRoleName: null,
    level: "middle",
    city: "Казань",
    country: null,
    searchStatus: "open_to_offers",
    isRelocatable: false,
    isRemoteAvailable: false,
    avatarUrl: "bank:17",
    skills: [
      { name: "Wyscout" },
      { name: "Оценка потенциала" },
      { name: "Шортлисты" },
    ],
    sports: [{ sport_id: "s1", years: 3, sports: { name: "Футбол", icon: "circle-dot" } }],
    aboutSnippet: "Скаутинг и оценка игроков для трансферных решений",
    experience: { count: 1, latest_position: "Скаут-аналитик", latest_company: "ФК Рубин", total_years: 3 },
    category: "analytics",
  },
  // Тренеры
  {
    id: "home-mock-4",
    roleName: "Главный тренер",
    secondaryRoleName: null,
    level: "senior",
    city: "Калининград",
    country: null,
    searchStatus: "not_looking_but_open",
    isRelocatable: false,
    isRemoteAvailable: false,
    avatarUrl: "bank:17",
    skills: [
      { name: "Игровая модель" },
      { name: "Управление штабом" },
      { name: "Стратегия сезона" },
    ],
    sports: [{ sport_id: "s1", years: 12, sports: { name: "Футбол", icon: "circle-dot" } }],
    aboutSnippet: "Главный тренер с опытом работы в ФНЛ и молодёжных составах",
    experience: { count: 3, latest_position: "Главный тренер", latest_company: "ФК Балтика", total_years: 12 },
    category: "coaches",
  },
  {
    id: "home-mock-5",
    roleName: "Тренер вратарей",
    secondaryRoleName: null,
    level: "middle",
    city: "Екатеринбург",
    country: null,
    searchStatus: "actively_looking",
    isRelocatable: false,
    isRemoteAvailable: false,
    avatarUrl: "bank:17",
    skills: [
      { name: "Предматчевая подготовка" },
      { name: "Индивидуальные планы" },
      { name: "Анализ матча" },
    ],
    sports: [{ sport_id: "s1", years: 5, sports: { name: "Футбол", icon: "circle-dot" } }],
    aboutSnippet: "Подготовка вратарей от молодёжки до основного состава",
    experience: { count: 2, latest_position: "Тренер вратарей", latest_company: "ФК Урал", total_years: 5 },
    category: "coaches",
  },
  // Медицина
  {
    id: "home-mock-6",
    roleName: "Спортивный врач",
    secondaryRoleName: null,
    level: "senior",
    city: "Москва",
    country: null,
    searchStatus: "open_to_offers",
    isRelocatable: false,
    isRemoteAvailable: false,
    avatarUrl: "bank:18",
    skills: [
      { name: "Медицинский протокол" },
      { name: "Травматология" },
      { name: "Допуск к нагрузке" },
    ],
    sports: [{ sport_id: "s1", years: 10, sports: { name: "Футбол", icon: "circle-dot" } }],
    aboutSnippet: "Медицинское сопровождение профессиональных команд",
    experience: { count: 2, latest_position: "Спортивный врач", latest_company: "ПФК ЦСКА", total_years: 10 },
    category: "medicine",
  },
  {
    id: "home-mock-7",
    roleName: "Физиотерапевт",
    secondaryRoleName: null,
    level: "middle",
    city: "Минск",
    country: null,
    searchStatus: "not_looking_but_open",
    isRelocatable: false,
    isRemoteAvailable: false,
    avatarUrl: "bank:18",
    skills: [
      { name: "Return-to-play" },
      { name: "Мануальная терапия" },
      { name: "Тейпирование" },
    ],
    sports: [{ sport_id: "s3", years: 4, sports: { name: "Баскетбол", icon: "target" } }],
    aboutSnippet: "Спортивная реабилитация и return-to-play протоколы",
    experience: { count: 1, latest_position: "Физиотерапевт", latest_company: null, total_years: 4 },
    category: "medicine",
  },
  // Физподготовка
  {
    id: "home-mock-8",
    roleName: "Тренер по физической подготовке",
    secondaryRoleName: null,
    level: "senior",
    city: "Казань",
    country: null,
    searchStatus: "open_to_offers",
    isRelocatable: false,
    isRemoteAvailable: false,
    avatarUrl: "bank:17",
    skills: [
      { name: "Периодизация" },
      { name: "GPS-мониторинг" },
      { name: "Catapult" },
    ],
    sports: [{ sport_id: "s2", years: 8, sports: { name: "Хоккей", icon: "snowflake" } }],
    aboutSnippet: "Периодизация силовых программ для профессиональных команд",
    experience: { count: 2, latest_position: "S&C Coach", latest_company: "ХК СКА", total_years: 8 },
    category: "fitness",
  },
  // Другое
  {
    id: "home-mock-9",
    roleName: "Менеджер команды",
    secondaryRoleName: null,
    level: "senior",
    city: "Санкт-Петербург",
    country: null,
    searchStatus: "open_to_offers",
    isRelocatable: false,
    isRemoteAvailable: false,
    skills: [
      { name: "Логистика" },
      { name: "Организация сборов" },
      { name: "Бюджетирование" },
    ],
    sports: [{ sport_id: "s1", years: 7, sports: { name: "Футбол", icon: "circle-dot" } }],
    aboutSnippet: "Организация логистики и административных процессов команды",
    experience: { count: 2, latest_position: "Менеджер команды", latest_company: "ФК Зенит", total_years: 7 },
    category: "other",
  },
];

// Pick 3 from different categories, rotate on each mount
const categories = ["analytics", "coaches", "medicine", "fitness", "other"];

function pickHomepageThree() {
  // Фиксированные 3 карточки: Главный тренер, Спортивный врач, Аналитик данных
  const ids = ["home-mock-4", "home-mock-6", "home-mock-1"];
  return ids.map((id) => allMockSpecialists.find((s) => s.id === id)!);
}

export function MockSpecialistsSection() {
  const [selected] = useState(() => pickHomepageThree());

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
          {selected.map((spec, index) => (
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
                avatarUrl={spec.avatarUrl}
                variant="homepage"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
