import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Zap, Crown, Rocket, Eye, Users, Search, MessageSquare, BarChart3, Shield } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useClubAccess } from "@/hooks/useClubAccess";
import { useNavigate } from "react-router-dom";

const plans = [
  {
    name: "Базовый",
    price: "Бесплатно",
    period: "6 месяцев",
    description: "Для клубов, которые только начинают работу с платформой",
    icon: Zap,
    badge: "Текущий",
    features: [
      { text: "10 просмотров профилей в неделю", icon: Eye },
      { text: "Поиск по базе специалистов", icon: Search },
      { text: "Публикация до 3 вакансий", icon: Users },
      { text: "Базовые фильтры поиска", icon: Search },
    ],
    highlighted: false,
    cta: "Активен",
    disabled: true,
  },
  {
    name: "Про",
    price: "Бесплатно",
    period: "6 месяцев",
    originalPrice: "15 000 ₽/мес",
    description: "Для активно нанимающих клубов и агентств",
    icon: Crown,
    badge: "Популярный",
    features: [
      { text: "50 просмотров профилей в неделю", icon: Eye },
      { text: "Расширенные фильтры и сортировка", icon: Search },
      { text: "Публикация до 10 вакансий", icon: Users },
      { text: "Приоритетные отклики кандидатов", icon: MessageSquare },
      { text: "Аналитика просмотров и откликов", icon: BarChart3 },
    ],
    highlighted: true,
    cta: "Перейти на Про",
    disabled: false,
  },
  {
    name: "Премиум",
    price: "Бесплатно",
    period: "6 месяцев",
    originalPrice: "35 000 ₽/мес",
    description: "Для федераций, крупных клубов и агентств",
    icon: Rocket,
    badge: "Максимум",
    features: [
      { text: "Безлимитные просмотры профилей", icon: Eye },
      { text: "Неограниченное число вакансий", icon: Users },
      { text: "Консьерж-поиск специалистов", icon: Shield },
      { text: "Прямой контакт с кандидатами", icon: MessageSquare },
      { text: "Детальная HR-аналитика", icon: BarChart3 },
      { text: "Приоритетная поддержка", icon: Shield },
    ],
    highlighted: false,
    cta: "Перейти на Премиум",
    disabled: false,
  },
];

export default function Pricing() {
  const { user, userRole } = useAuth();
  const { access } = useClubAccess();
  const navigate = useNavigate();

  return (
    <Layout>
      <main className="min-h-screen">
        {/* Hero */}
        <section className="bg-hero-gradient text-primary-foreground py-8 md:py-12">
          <div className="container text-center">
            <Badge className="bg-white/20 text-white border-white/30 mb-6">
              🎉 Все тарифы бесплатны первые 6 месяцев
            </Badge>
            <h1 className="text-white mb-4">Тарифы для работодателей</h1>
            <p className="text-white/80 text-body-l max-w-2xl mx-auto">
              Получите доступ к лучшим спортивным специалистам. Выберите план, который подходит вашему клубу.
            </p>
            {access && (
              <div className="mt-8 inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-pill px-6 py-3">
                <Eye className="h-5 w-5" />
                <span className="font-medium">
                  У вас осталось <span className="text-accent-foreground font-bold">{access.free_views_remaining}</span> просмотров
                </span>
              </div>
            )}
          </div>
        </section>

        {/* Plans */}
        <section className="container py-16 md:py-24">
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={`relative flex flex-col transition-all duration-300 hover:shadow-card-hover ${
                  plan.highlighted
                    ? "border-accent shadow-card-hover scale-[1.02] ring-2 ring-accent/20"
                    : "shadow-card"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-accent text-accent-foreground">
                      {plan.badge}
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-2">
                  <div className="mx-auto w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                    <plan.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>

                <CardContent className="flex-1">
                  <div className="text-center mb-6">
                    <div className="text-3xl font-display font-bold text-foreground">
                      {plan.price}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {plan.period}
                    </div>
                    {plan.originalPrice && (
                      <div className="text-sm text-muted-foreground line-through mt-1">
                        {plan.originalPrice}
                      </div>
                    )}
                  </div>

                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-success shrink-0 mt-0.5" />
                        <span className="text-sm text-foreground">{feature.text}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter>
                  <Button
                    className="w-full"
                    variant={plan.highlighted ? "default" : "outline"}
                    disabled={plan.disabled}
                    onClick={() => {
                      if (!user) navigate("/auth?mode=signup");
                    }}
                  >
                    {plan.disabled ? "✓ Активен" : plan.cta}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>

        {/* FAQ-like note */}
        <section className="container pb-16">
          <div className="max-w-3xl mx-auto text-center">
            <Card className="bg-secondary border-0">
              <CardContent className="p-8">
                <h3 className="text-lg font-display font-medium mb-2">
                  🚀 Тестовый период — 6 месяцев бесплатно
                </h3>
                <p className="text-muted-foreground">
                  Мы запускаем платформу и хотим, чтобы вы оценили все возможности. 
                  В течение первых 6 месяцев все тарифы доступны бесплатно. 
                  После окончания тестового периода вы сможете выбрать подходящий план.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </Layout>
  );
}
