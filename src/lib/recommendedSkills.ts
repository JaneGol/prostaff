/**
 * Recommended skills v2.0 — 3-category architecture.
 * Categories: Hard Skills (basic/advanced/expert), Tools, Soft Skills.
 * Skills are short (1-3 words, ≤25 chars cyrillic).
 */

export interface HardSkillLevels {
  basic: string[];
  advanced: string[];
  expert: string[];
}

export interface SkillGroup {
  groupKey: string;
  hardSkills: HardSkillLevels;
  tools: string[];
}

export interface RecommendedSkillsResult {
  hardSkills: HardSkillLevels;
  tools: string[];
  softSkills: string[];
}

// ── Legacy compat ──
export interface SkillSubGroup {
  title: string;
  skills: string[];
}

// ─── COACHING ───
const COACHING: SkillGroup = {
  groupKey: "coaching",
  hardSkills: {
    basic: [
      "Планирование тренировок", "Анализ матча", "Игровая модель",
      "Стандарты", "Предматчевая подготовка", "Работа с молодёжью",
      "Разработка PlayBook", "Подготовка данных",
    ],
    advanced: [
      "Тактическая периодизация", "Управление штабом", "Ротация состава",
      "Разбор соперника", "Индивидуальные планы", "Стратегия сезона",
      "Психология молодёжи", "Презентация тактики",
    ],
    expert: [
      "Философия игры", "Трансферная стратегия", "Управление кризисом",
      "Медиакоммуникация", "Построение штаба", "Развитие академии",
    ],
  },
  tools: [
    "Hudl", "Sportscode", "Wyscout", "InStat", "Tactics Board",
    "GPS-отчёты", "PowerPoint", "Keynote", "Google Slides",
    "Яндекс Документы", "Видеоредакторы",
  ],
};

// ─── PERFORMANCE ───
const PERFORMANCE: SkillGroup = {
  groupKey: "performance",
  hardSkills: {
    basic: [
      "Силовая подготовка", "Скоростная работа", "ОФП",
      "Тестирование", "Разминка/заминка", "Стретчинг", "Плиометрика",
    ],
    advanced: [
      "Периодизация", "Контроль нагрузки", "Программирование",
      "Профилактика травм", "Восстановление", "Планирование циклов",
    ],
    expert: [
      "Индивидуализация нагрузок", "Return-to-train", "Модели готовности",
      "Интеграция с медициной", "Биомеханика",
    ],
  },
  tools: [
    "Catapult", "Polar", "STATSports", "Gymaware", "VALD", "Nordbord",
    "ForceDecks", "Excel", "Google Sheets", "Яндекс Таблицы",
    "TeamBuildr", "Smartabase", "Басайт", "Google Forms",
  ],
};

// ─── ANALYTICS ───
const ANALYTICS: SkillGroup = {
  groupKey: "analytics",
  hardSkills: {
    basic: [
      "Разметка видео", "Нарезка клипов", "Тегирование",
      "Сбор статистики", "Сбор данных", "Валидация данных",
      "GPS-мониторинг", "Базовая статистика", "Визуализация",
      "Отчётность", "Скаутинг соперника", "Профиль игрока",
    ],
    advanced: [
      "Разбор соперника", "Прессинг-модели", "Pre-match pack",
      "Презентация штабу", "Анализ стандартов", "Статмоделирование",
      "xG/xA-модели", "Дашборды", "KPI-фреймворки",
      "ACWR-модели", "Контроль утомления", "Оценка потенциала",
      "Шортлисты", "Half-time анализ", "Live-кодинг", "Storytelling",
    ],
    expert: [
      "Игровая модель", "Автоматизация", "Предиктивные модели",
      "Machine learning", "Data pipeline", "Интеграция систем",
      "Модели готовности", "Скаутинг-стратегия", "Рыночная аналитика",
      "Real-time insights",
    ],
  },
  tools: [
    "Hudl Sportscode", "Wyscout", "InStat", "Catapult", "Second Spectrum",
    "StatsBomb", "Opta", "Nacsport", "LongoMatch", "Dartfish",
    "Python", "R", "SQL", "Tableau", "Power BI", "Excel",
    "Google Sheets", "Яндекс Таблицы", "Smartabase", "SciSports", "SkillCorner",
  ],
};

// ─── MEDICAL ───
const MEDICAL: SkillGroup = {
  groupKey: "medical",
  hardSkills: {
    basic: [
      "Осмотр спортсменов", "Допуск к нагрузке", "Первая помощь",
      "Фармакология", "Диагностика", "Мануальная терапия",
      "Тейпирование", "Криотерапия", "Электротерапия",
      "Оценка травм", "ЛФК", "Мобилизация", "Спортивный массаж",
      "Составление рационов", "Гидратация", "Контроль веса",
      "Ментальная подготовка", "Мотивация", "Управление стрессом",
    ],
    advanced: [
      "Медицинский протокол", "Антидопинг", "Травматология",
      "Return-to-play", "Реабилитация ACL", "Return-to-train",
      "Прогрессия нагрузок", "Миофасциальный релиз",
      "Триггерные точки", "Периодизация питания",
      "Восстановительное питание", "Работа с командой",
      "Визуализация", "Предматчевый массаж",
    ],
    expert: [
      "Управление мед. штабом", "Медицинская стратегия",
      "Программа реабилитации", "Профилактика травм",
      "Интеграция с S&C", "Индивидуальные протоколы",
      "Состав тела", "Кризисная интервенция", "Комплексная реабилитация",
    ],
  },
  tools: [
    "Smartabase", "Kitman Labs", "AMS", "Wellness-опросники",
    "RPE-шкалы", "Nordbord", "ForceDecks", "Excel", "Google Forms",
  ],
};

// ─── OTHER ───
const OTHER: SkillGroup = {
  groupKey: "other",
  hardSkills: {
    basic: [
      "Логистика", "Документооборот", "Организация сборов",
      "Визы", "Экипировка", "Устный перевод", "Письменный перевод",
      "Спортивная терминология", "Скаутинг", "Трансферный рынок",
    ],
    advanced: [
      "Бюджетирование", "Работа с федерациями", "Организация выездов",
      "Синхронный перевод", "Работа с прессой", "Управление штабом",
      "Построение академии", "Стратегия клуба",
    ],
    expert: [
      "Управление проектами", "Кризис-менеджмент", "Контрактная работа",
      "Международные трансферы", "Развитие бренда", "Медицинская терминология",
    ],
  },
  tools: [
    "Excel", "Google Sheets", "Яндекс Таблицы", "Google Docs",
    "1С", "Битрикс24", "Trello", "Notion",
  ],
};

// ─── SOFT SKILLS (universal) ───
export const SOFT_SKILLS: string[] = [
  "Работа в штабе",
  "Решения под давлением",
  "Межштабная коммуникация",
  "Адаптация плана",
  "Обратная связь",
  "Управление конфликтами",
  "Конфиденциальность",
  "Работа в сезоне",
  "Презентация данных",
  "Мультиспортивность",
];

const ALL_GROUPS: SkillGroup[] = [COACHING, PERFORMANCE, ANALYTICS, MEDICAL, OTHER];

/**
 * Get recommended skills for one or two groups.
 * If secondaryGroupKey differs from primary — merges & deduplicates.
 */
export function getRecommendedSkills(
  primaryGroupKey: string | null,
  secondaryGroupKey?: string | null,
): RecommendedSkillsResult {
  const primary = ALL_GROUPS.find(g => g.groupKey === primaryGroupKey);

  const hardSkills: HardSkillLevels = {
    basic: [...(primary?.hardSkills.basic || [])],
    advanced: [...(primary?.hardSkills.advanced || [])],
    expert: [...(primary?.hardSkills.expert || [])],
  };
  const toolsSet = new Set<string>(primary?.tools || []);

  // Merge secondary group if different
  if (secondaryGroupKey && secondaryGroupKey !== primaryGroupKey) {
    const secondary = ALL_GROUPS.find(g => g.groupKey === secondaryGroupKey);
    if (secondary) {
      const addUnique = (target: string[], source: string[]) => {
        const set = new Set(target);
        source.forEach(s => { if (!set.has(s)) target.push(s); });
      };
      addUnique(hardSkills.basic, secondary.hardSkills.basic);
      addUnique(hardSkills.advanced, secondary.hardSkills.advanced);
      addUnique(hardSkills.expert, secondary.hardSkills.expert);
      secondary.tools.forEach(t => toolsSet.add(t));
    }
  }

  return {
    hardSkills,
    tools: Array.from(toolsSet),
    softSkills: SOFT_SKILLS,
  };
}

// ── Legacy compatibility wrapper ──
// Some components may still use the old SkillSubGroup[] format
export function getRecommendedSkillsLegacy(groupKey: string | null): SkillSubGroup[] {
  const result = getRecommendedSkills(groupKey);
  const sections: SkillSubGroup[] = [];
  if (result.hardSkills.basic.length) sections.push({ title: "Базовые", skills: result.hardSkills.basic });
  if (result.hardSkills.advanced.length) sections.push({ title: "Продвинутые", skills: result.hardSkills.advanced });
  if (result.hardSkills.expert.length) sections.push({ title: "Экспертные", skills: result.hardSkills.expert });
  if (result.tools.length) sections.push({ title: "Инструменты", skills: result.tools });
  sections.push({ title: "Soft Skills", skills: result.softSkills });
  return sections;
}
