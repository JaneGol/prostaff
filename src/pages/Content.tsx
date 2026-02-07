import { Layout } from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, User, Briefcase, TrendingUp, Award, Users } from "lucide-react";

interface Article {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  icon: React.ReactNode;
}

const articles: Article[] = [
  {
    id: "1",
    title: "Как стать видеоаналитиком в футболе: пошаговый гайд",
    excerpt: "Разбираем путь от новичка до профессионального видеоаналитика: необходимые навыки, инструменты и первые шаги в карьере.",
    category: "Карьера",
    readTime: "8 мин",
    icon: <TrendingUp className="h-6 w-6" />
  },
  {
    id: "2", 
    title: "Топ-10 инструментов спортивного аналитика в 2026 году",
    excerpt: "Обзор самых востребованных платформ и программ: Wyscout, Hudl, Tableau, Catapult и другие — что выбрать для старта.",
    category: "Инструменты",
    readTime: "6 мин",
    icon: <Briefcase className="h-6 w-6" />
  },
  {
    id: "3",
    title: "Интервью: Путь аналитика сборной России по футболу",
    excerpt: "Эксклюзивное интервью с ведущим аналитиком национальной команды о ежедневной работе, вызовах и секретах успеха.",
    category: "Интервью",
    readTime: "12 мин",
    icon: <User className="h-6 w-6" />
  },
  {
    id: "4",
    title: "Как составить резюме спортивного специалиста",
    excerpt: "Практические советы по созданию резюме, которое привлечёт внимание топ-клубов: структура, ключевые слова и портфолио.",
    category: "Карьера",
    readTime: "7 мин",
    icon: <Award className="h-6 w-6" />
  },
  {
    id: "5",
    title: "S&C специалист: кто это и как им стать",
    excerpt: "Всё о профессии специалиста по силовой и кондиционной подготовке в футболе: образование, сертификаты, карьерный путь.",
    category: "Профессии",
    readTime: "9 мин",
    icon: <Users className="h-6 w-6" />
  },
  {
    id: "6",
    title: "Тренды спортивной аналитики: что ждёт индустрию",
    excerpt: "AI, машинное обучение и big data в футболе — как технологии меняют работу аналитиков и что изучать уже сейчас.",
    category: "Тренды",
    readTime: "10 мин",
    icon: <TrendingUp className="h-6 w-6" />
  },
  {
    id: "7",
    title: "Работа в футбольном клубе: реальные зарплаты и условия",
    excerpt: "Честный разбор зарплат специалистов в клубах РПЛ, ФНЛ и академиях: от стажёра до руководителя департамента.",
    category: "Карьера",
    readTime: "8 мин",
    icon: <Briefcase className="h-6 w-6" />
  },
  {
    id: "8",
    title: "Python для футбольной аналитики: с чего начать",
    excerpt: "Базовый курс по Python для спортивных аналитиков: библиотеки, датасеты и первые проекты для портфолио.",
    category: "Обучение",
    readTime: "15 мин",
    icon: <BookOpen className="h-6 w-6" />
  }
];

const categoryColors: Record<string, string> = {
  "Карьера": "bg-accent/10 text-accent",
  "Инструменты": "bg-blue-100 text-blue-800",
  "Интервью": "bg-purple-100 text-purple-800",
  "Профессии": "bg-green-100 text-green-800",
  "Тренды": "bg-yellow-100 text-yellow-800",
  "Обучение": "bg-orange-100 text-orange-800"
};

export default function Content() {
  return (
    <Layout>
      {/* Hero */}
      <section className="bg-gradient-to-b from-primary to-primary-dark text-white py-12 md:py-16">
        <div className="container">
          <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold uppercase mb-4">
            Контент и статьи
          </h1>
          <p className="text-white/80 text-lg max-w-2xl">
            Полезные материалы о карьере в спорте: гайды, интервью с профессионалами, 
            обзоры инструментов и тренды индустрии
          </p>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-12 md:py-16">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map(article => (
              <Card key={article.id} className="hover:shadow-lg transition-shadow group cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                      {article.icon}
                    </div>
                    <Badge className={categoryColors[article.category] || "bg-muted"}>
                      {article.category}
                    </Badge>
                  </div>
                  
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-accent transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                  
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                    {article.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      {article.readTime}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-muted-foreground">
              Больше статей скоро появится. Следите за обновлениями!
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
}
