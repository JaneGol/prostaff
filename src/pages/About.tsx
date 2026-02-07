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
  Send,
  ChevronRight
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
      <section className="bg-hero-gradient bg-noise text-white py-20 md:py-28 relative overflow-hidden">
        {/* Gradient orbs */}
        <div className="absolute top-10 -left-20 w-72 h-72 bg-primary-glow/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 -right-20 w-72 h-72 bg-accent/15 rounded-full blur-3xl" />
        
        <div className="container relative">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 text-sm font-medium bg-white/15 backdrop-blur-sm rounded-pill border border-white/20">
              <span className="w-2 h-2 rounded-full bg-accent" />
              О платформе
            </span>
            <h1 className="heading-hero text-5xl md:text-6xl lg:text-7xl mb-6">
              PRO<span className="text-accent">STAFF</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/75 leading-relaxed">
              Нишевая платформа для поиска работы в спортивной индустрии. 
              Мы объединяем специалистов и клубы, создавая экосистему профессионального развития.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <span className="text-accent font-semibold uppercase tracking-widest text-sm">
                Наша миссия
              </span>
              <h2 className="font-display text-4xl md:text-5xl tracking-wide mt-2 mb-6">
                РАЗВИВАЕМ КАРЬЕРЫ В СПОРТЕ
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  ProStaff был создан для решения ключевой проблемы спортивной индустрии — 
                  сложности поиска узкопрофильных специалистов. Клубы тратят недели на поиск 
                  аналитиков, тренеров и спортивных врачей через разрозненные каналы.
                </p>
                <p>
                  Мы верим, что профессионалы спорта заслуживают специализированную платформу, 
                  которая понимает их уникальные навыки и требования индустрии. Наша цель — 
                  стать центром спортивного рекрутинга на русскоязычном пространстве.
                </p>
                <p>
                  В отличие от универсальных job-board, мы фокусируемся исключительно на 
                  спортивной сфере, что обеспечивает более качественные совпадения между 
                  кандидатами и работодателями.
                </p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-muted to-muted/50 rounded-2xl p-8 md:p-10">
              <div className="grid grid-cols-2 gap-8">
                {stats.map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className="font-display text-5xl md:text-6xl text-primary mb-2">
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
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <span className="text-accent font-semibold uppercase tracking-widest text-sm">
              Наши ценности
            </span>
            <h2 className="font-display text-4xl md:text-5xl tracking-wide mt-2">
              ЧТО НАС ОТЛИЧАЕТ
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((value) => (
              <Card key={value.title} className="border-0 shadow-card hover:shadow-card-hover transition-shadow bg-white">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-4">
                    <value.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{value.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container">
          <div className="text-center mb-12">
            <span className="text-accent font-semibold uppercase tracking-widest text-sm">
              Как это работает
            </span>
            <h2 className="font-display text-4xl md:text-5xl tracking-wide mt-2">
              ПРОСТОЙ ПУТЬ К НАЙМУ
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {/* For Specialists */}
            <div className="bg-gradient-to-br from-primary/5 via-primary/8 to-primary/5 rounded-2xl p-8 border border-primary/10">
              <h3 className="font-display text-3xl tracking-wide mb-6 text-primary">
                ДЛЯ СПЕЦИАЛИСТОВ
              </h3>
              <ol className="space-y-5">
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-display text-xl">
                    1
                  </span>
                  <div>
                    <div className="font-semibold text-lg mb-1">Создайте профиль</div>
                    <div className="text-sm text-muted-foreground">
                      Заполните структурированную анкету с опытом и навыками
                    </div>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-display text-xl">
                    2
                  </span>
                  <div>
                    <div className="font-semibold text-lg mb-1">Получайте предложения</div>
                    <div className="text-sm text-muted-foreground">
                      Клубы найдут вас через поиск и отправят приглашения
                    </div>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-display text-xl">
                    3
                  </span>
                  <div>
                    <div className="font-semibold text-lg mb-1">Откликайтесь на вакансии</div>
                    <div className="text-sm text-muted-foreground">
                      Ищите позиции и отправляйте заявки напрямую
                    </div>
                  </div>
                </li>
              </ol>
              <Button asChild className="mt-8 w-full btn-premium h-12">
                <Link to="/auth?mode=signup&role=specialist">
                  Создать профиль
                  <ChevronRight className="h-5 w-5 ml-1" />
                </Link>
              </Button>
            </div>

            {/* For Clubs */}
            <div className="bg-gradient-to-br from-accent/5 via-accent/8 to-accent/5 rounded-2xl p-8 border border-accent/10">
              <h3 className="font-display text-3xl tracking-wide mb-6 text-accent">
                ДЛЯ КЛУБОВ
              </h3>
              <ol className="space-y-5">
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-10 h-10 rounded-xl bg-accent text-white flex items-center justify-center font-display text-xl">
                    1
                  </span>
                  <div>
                    <div className="font-semibold text-lg mb-1">Зарегистрируйте клуб</div>
                    <div className="text-sm text-muted-foreground">
                      Создайте профиль организации с описанием и логотипом
                    </div>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-10 h-10 rounded-xl bg-accent text-white flex items-center justify-center font-display text-xl">
                    2
                  </span>
                  <div>
                    <div className="font-semibold text-lg mb-1">Ищите специалистов</div>
                    <div className="text-sm text-muted-foreground">
                      Используйте фильтры по ролям, навыкам и локации
                    </div>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-10 h-10 rounded-xl bg-accent text-white flex items-center justify-center font-display text-xl">
                    3
                  </span>
                  <div>
                    <div className="font-semibold text-lg mb-1">Публикуйте вакансии</div>
                    <div className="text-sm text-muted-foreground">
                      Получайте отклики и управляйте наймом в одном месте
                    </div>
                  </div>
                </li>
              </ol>
              <Button asChild variant="outline" className="mt-8 w-full h-12 border-2 border-accent text-accent hover:bg-accent hover:text-white">
                <Link to="/auth?mode=signup&role=employer">
                  Зарегистрировать клуб
                  <ChevronRight className="h-5 w-5 ml-1" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 md:py-24 bg-primary text-white relative overflow-hidden">
        {/* Background orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-glow/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        
        <div className="container relative">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-display text-4xl md:text-5xl tracking-wide mb-4">
              СВЯЖИТЕСЬ С НАМИ
            </h2>
            <p className="text-white/70 mb-10 text-lg">
              Есть вопросы или предложения? Мы всегда рады помочь и услышать обратную связь.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:hello@prostaff.ru"
                className="inline-flex items-center justify-center gap-2 bg-white text-primary px-8 py-4 rounded-xl font-semibold hover:bg-white/90 transition-colors shadow-lg"
              >
                <Mail className="h-5 w-5" />
                hello@prostaff.ru
              </a>
              <a
                href="https://t.me/prostaff"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-white/15 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/25 transition-colors border border-white/20"
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