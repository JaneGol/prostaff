import { Layout } from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  Target, 
  Users, 
  Trophy, 
  Globe, 
  Zap, 
  Shield,
  Mail,
  Send
} from "lucide-react";

const values = [
  {
    icon: Target,
    title: "Фокус на спорте",
    description: "Мы понимаем специфику спортивной индустрии и создаём инструменты именно для неё"
  },
  {
    icon: Users,
    title: "Сообщество",
    description: "Объединяем профессионалов, которые разделяют страсть к спорту и развитию карьеры"
  },
  {
    icon: Trophy,
    title: "Качество",
    description: "Каждый профиль и вакансия проходят проверку для обеспечения высокого уровня соответствия"
  },
  {
    icon: Zap,
    title: "Скорость",
    description: "Сокращаем время на поиск — клубы находят кандидатов за минуты, а не недели"
  },
  {
    icon: Globe,
    title: "Охват",
    description: "Работаем с клубами и специалистами из России, Беларуси, Казахстана и СНГ"
  },
  {
    icon: Shield,
    title: "Надёжность",
    description: "Защита данных и конфиденциальность — приоритет для нас"
  }
];

const stats = [
  { value: "500+", label: "Специалистов в базе" },
  { value: "50+", label: "Клубов и организаций" },
  { value: "100+", label: "Успешных наймов" },
  { value: "3", label: "Страны охвата" }
];

export default function About() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary to-primary-dark text-white py-8 md:py-12">
        <div className="container max-w-6xl">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold uppercase tracking-tight mb-6">
              О платформе <span className="text-accent">ProStaff</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/80 leading-relaxed">
              Нишевая платформа для поиска работы в спортивной индустрии. 
              Мы объединяем специалистов и клубы, создавая экосистему профессионального развития.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 md:py-20 bg-background">
        <div className="container max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-accent font-semibold uppercase tracking-wide text-sm">
                Наша миссия
              </span>
              <h2 className="font-display text-3xl md:text-4xl font-bold uppercase tracking-tight mt-2 mb-6">
                Развиваем карьеры в спорте
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  ProStaff был создан для решения ключевой проблемы спортивной индустрии — 
                  сложности поиска узкопрофильных специалистов.
                  <br />
                  Клубы тратят недели на поиск аналитиков, тренеров и спортивных врачей через разрозненные каналы.
                </p>
                <p>
                  Мы верим, что профессионалы спорта заслуживают специализированную платформу, 
                  которая понимает их уникальные навыки и требования индустрии.
                  <br />
                  Наша цель — стать центром спортивного рекрутинга на русскоязычном пространстве.
                </p>
                <p>
                  В отличие от универсальных job-board, мы фокусируемся исключительно на 
                  спортивной сфере, что обеспечивает более качественные совпадения между 
                  кандидатами и работодателями.
                </p>
              </div>
            </div>
            <div className="bg-muted rounded-2xl p-8">
              <div className="grid grid-cols-2 gap-6">
                {stats.map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className="font-display text-4xl md:text-5xl font-bold text-primary mb-2">
                      {stat.value}
                    </div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 md:py-20 bg-muted/50">
        <div className="container max-w-6xl">
          <div className="text-center mb-12">
            <span className="text-accent font-semibold uppercase tracking-wide text-sm">
              Наши ценности
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold uppercase tracking-tight mt-2">
              Что нас отличает
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((value) => (
              <Card key={value.title} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <value.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{value.title}</h3>
                  <p className="text-muted-foreground text-sm">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 md:py-20 bg-background">
        <div className="container max-w-6xl">
          <div className="text-center mb-12">
            <span className="text-accent font-semibold uppercase tracking-wide text-sm">
              Как это работает
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold uppercase tracking-tight mt-2">
              Простой путь к найму
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-12">
            {/* For Specialists */}
            <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-8">
              <h3 className="font-display text-2xl font-bold uppercase mb-6">
                Для специалистов
              </h3>
              <ol className="space-y-4">
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                    1
                  </span>
                  <div>
                    <div className="font-semibold">Создайте профиль</div>
                    <div className="text-sm text-muted-foreground">
                      Заполните структурированную анкету с опытом и навыками
                    </div>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                    2
                  </span>
                  <div>
                    <div className="font-semibold">Получайте предложения</div>
                    <div className="text-sm text-muted-foreground">
                      Клубы найдут вас через поиск и отправят приглашения
                    </div>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                    3
                  </span>
                  <div>
                    <div className="font-semibold">Откликайтесь на вакансии</div>
                    <div className="text-sm text-muted-foreground">
                      Ищите позиции и отправляйте заявки напрямую
                    </div>
                  </div>
                </li>
              </ol>
              <Button asChild className="mt-6 w-full">
                <Link to="/auth?mode=signup&role=specialist">Создать профиль</Link>
              </Button>
            </div>

            {/* For Clubs */}
            <div className="bg-gradient-to-br from-accent/5 to-accent/10 rounded-2xl p-8">
              <h3 className="font-display text-2xl font-bold uppercase mb-6">
                Для клубов
              </h3>
              <ol className="space-y-4">
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center font-bold">
                    1
                  </span>
                  <div>
                    <div className="font-semibold">Зарегистрируйте клуб</div>
                    <div className="text-sm text-muted-foreground">
                      Создайте профиль организации с описанием и логотипом
                    </div>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center font-bold">
                    2
                  </span>
                  <div>
                    <div className="font-semibold">Ищите специалистов</div>
                    <div className="text-sm text-muted-foreground">
                      Используйте фильтры по ролям, навыкам и локации
                    </div>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center font-bold">
                    3
                  </span>
                  <div>
                    <div className="font-semibold">Публикуйте вакансии</div>
                    <div className="text-sm text-muted-foreground">
                      Получайте отклики и управляйте наймом в одном месте
                    </div>
                  </div>
                </li>
              </ol>
              <Button asChild className="mt-6 w-full bg-white text-muted-foreground border-0 shadow-none hover:bg-accent hover:text-white">
                <Link to="/auth?mode=signup&role=employer">Зарегистрировать клуб</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 md:py-20 bg-primary text-white">
        <div className="container max-w-6xl">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold uppercase tracking-tight mb-4">
              Свяжитесь с нами
            </h2>
            <p className="text-white/80 mb-8">
              Есть вопросы или предложения? Мы всегда рады помочь и услышать обратную связь.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:hello@prostaff.ru"
                className="inline-flex items-center justify-center gap-2 bg-white text-primary px-6 py-3 rounded-full font-semibold hover:bg-white/90 transition-colors"
              >
                <Mail className="h-5 w-5" />
                hello@prostaff.ru
              </a>
              <a
                href="https://t.me/prostaff"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-white/10 text-white px-6 py-3 rounded-full font-semibold hover:bg-white/20 transition-colors"
              >
                <Send className="h-5 w-5" />
                Telegram
              </a>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
