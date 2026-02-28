import { Layout } from "@/components/layout/Layout";
import { usePageMeta } from "@/hooks/usePageMeta";
import { HelpCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqItems = [
  {
    q: "Что такое ProStaff?",
    a: "ProStaff — нишевая платформа для поиска работы в спортивной индустрии. Мы объединяем специалистов (аналитиков, тренеров, врачей, менеджеров) и работодателей (клубы, федерации, агентства) на одной площадке.",
  },
  {
    q: "Бесплатна ли регистрация для специалистов?",
    a: "Да, создание профиля и все базовые функции полностью бесплатны для специалистов. Вы можете создать профиль, искать вакансии и откликаться на них без каких-либо оплат.",
  },
  {
    q: "Как клубу начать использовать платформу?",
    a: "Зарегистрируйтесь как работодатель, заполните профиль компании (название, описание, логотип) и начните искать специалистов через фильтры или публиковать вакансии. Первые 6 месяцев все тарифы доступны бесплатно.",
  },
  {
    q: "Какие специализации представлены на платформе?",
    a: "Мы покрываем широкий спектр спортивных специальностей: видеоаналитики, спортивные учёные, тренеры, физиотерапевты, спортивные врачи, менеджеры, скауты, переводчики и многие другие роли.",
  },
  {
    q: "Могу ли я скрыть свой профиль от текущего работодателя?",
    a: "Да, в настройках профиля можно скрыть текущую организацию, включить режим ограниченной видимости или временно приостановить поиск работы.",
  },
  {
    q: "Как работает поиск специалистов для клубов?",
    a: "Работодатели могут искать кандидатов по ролям, навыкам, уровню опыта, виду спорта, локации, готовности к релокации и другим параметрам. Результаты ранжируются по релевантности.",
  },
  {
    q: "Какие регионы охватывает платформа?",
    a: "На данный момент мы фокусируемся на рынках России, Беларуси и Казахстана, но специалисты из других стран также могут создать профиль.",
  },
  {
    q: "Как связаться с поддержкой?",
    a: "Вы можете написать нам на e89030922661@gmail.com или в Telegram @Gen_spb. Мы отвечаем в течение 24 часов.",
  },
];

export default function FAQ() {
  usePageMeta({
    title: "Частые вопросы",
    description: "Ответы на частые вопросы о ProStaff: регистрация, поиск специалистов, размещение вакансий и тарифы.",
  });

  return (
    <Layout>
      <section className="bg-gradient-to-b from-primary to-primary-dark text-white py-8 md:py-12">
        <div className="container max-w-6xl text-center">
          <HelpCircle className="h-10 w-10 mx-auto mb-3 text-accent" />
          <h1 className="font-display text-3xl md:text-4xl font-bold uppercase tracking-tight">
            Часто задаваемые вопросы
          </h1>
          <p className="text-white/60 text-sm mt-2">Ответы на популярные вопросы о платформе</p>
        </div>
      </section>

      <section className="py-6 md:py-8 bg-background">
        <div className="container max-w-6xl">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-5 md:p-6">
              <Accordion type="single" collapsible className="w-full">
                {faqItems.map((item, i) => (
                  <AccordionItem key={i} value={`item-${i}`}>
                    <AccordionTrigger className="text-sm md:text-base font-medium text-left">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-muted/50 mt-4">
            <CardContent className="p-5 md:p-6 text-center">
              <p className="text-muted-foreground text-sm">
                Не нашли ответ?{" "}
                <a href="https://t.me/Gen_spb" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  Напишите нам в Telegram
                </a>{" "}
                или на{" "}
                <a href="mailto:e89030922661@gmail.com" className="text-primary hover:underline">
                  e89030922661@gmail.com
                </a>
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
}
