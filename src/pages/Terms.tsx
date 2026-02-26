import { Layout } from "@/components/layout/Layout";
import { FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const sections = [
  {
    title: "1. Общие положения",
    content:
      "Настоящие Условия использования (далее — «Условия») регулируют порядок доступа и использования платформы ProStaff (далее — «Платформа»). Регистрируясь на Платформе, вы подтверждаете, что ознакомились с настоящими Условиями и принимаете их в полном объёме.",
  },
  {
    title: "2. Описание сервиса",
    content:
      "ProStaff — нишевая платформа для поиска работы и специалистов в спортивной индустрии. Платформа предоставляет специалистам возможность создавать профессиональные профили, а работодателям — искать кандидатов и публиковать вакансии.",
  },
  {
    title: "3. Регистрация и аккаунт",
    list: [
      "Для использования функционала Платформы необходимо пройти регистрацию.",
      "Вы обязуетесь предоставлять достоверную и актуальную информацию при регистрации.",
      "Вы несёте ответственность за сохранность данных доступа к вашему аккаунту.",
      "Администрация вправе заблокировать аккаунт при нарушении настоящих Условий.",
    ],
  },
  {
    title: "4. Права и обязанности пользователей",
    list: [
      "Не размещать ложную, вводящую в заблуждение или оскорбительную информацию.",
      "Не использовать Платформу для рассылки спама или несанкционированной рекламы.",
      "Не предпринимать действий, нарушающих работу Платформы или её безопасность.",
      "Уважать права других пользователей и интеллектуальную собственность.",
    ],
  },
  {
    title: "5. Контент пользователей",
    content:
      "Пользователи самостоятельно несут ответственность за размещаемый контент (профили, вакансии, портфолио). Администрация Платформы оставляет за собой право модерировать и удалять контент, нарушающий настоящие Условия или законодательство.",
  },
  {
    title: "6. Интеллектуальная собственность",
    content:
      "Все элементы дизайна, программный код, логотипы и контент Платформы являются собственностью ProStaff и защищены законодательством об интеллектуальной собственности. Копирование, распространение или использование материалов Платформы без письменного разрешения запрещено.",
  },
  {
    title: "7. Ограничение ответственности",
    list: [
      "Платформа предоставляется «как есть» без гарантий трудоустройства или найма.",
      "ProStaff не несёт ответственности за действия пользователей и достоверность предоставленной ими информации.",
      "ProStaff не гарантирует бесперебойную работу сервиса и не несёт ответственности за возможные технические сбои.",
    ],
  },
  {
    title: "8. Изменение условий",
    content:
      "Администрация Платформы вправе вносить изменения в настоящие Условия. Актуальная версия всегда доступна на данной странице. Продолжая использовать Платформу после внесения изменений, вы соглашаетесь с обновлёнными Условиями.",
  },
];

export default function Terms() {
  return (
    <Layout>
      <section className="bg-gradient-to-b from-primary to-primary-dark text-white py-8 md:py-12">
        <div className="container max-w-6xl text-center">
          <FileText className="h-10 w-10 mx-auto mb-3 text-accent" />
          <h1 className="font-display text-3xl md:text-4xl font-bold uppercase tracking-tight">
            Условия использования
          </h1>
          <p className="text-white/60 text-sm mt-2">Последнее обновление: 26 февраля 2026 г.</p>
        </div>
      </section>

      <section className="py-6 md:py-8 bg-background">
        <div className="container max-w-6xl space-y-4">
          {sections.map((s) => (
            <Card key={s.title} className="border-0 shadow-sm">
              <CardContent className="p-5 md:p-6">
                <h2 className="font-semibold text-base md:text-lg mb-3">{s.title}</h2>
                {s.content && (
                  <p className="text-muted-foreground text-sm leading-relaxed">{s.content}</p>
                )}
                {s.list && (
                  <ul className="space-y-1.5">
                    {s.list.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          ))}

          <Card className="border-0 shadow-sm bg-muted/50">
            <CardContent className="p-5 md:p-6">
              <h2 className="font-semibold text-base md:text-lg mb-3">9. Контактная информация</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                По вопросам, связанным с условиями использования, обращайтесь:
              </p>
              <div className="flex flex-wrap gap-4 mt-3 text-sm">
                <a href="mailto:e89030922661@gmail.com" className="text-primary hover:underline">
                  e89030922661@gmail.com
                </a>
                <a href="https://t.me/Gen_spb" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  @Gen_spb в Telegram
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
}
