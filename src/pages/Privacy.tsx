import { Layout } from "@/components/layout/Layout";
import { Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const sections = [
  {
    title: "1. Общие положения",
    content:
      "Настоящая Политика конфиденциальности определяет порядок обработки и защиты персональных данных пользователей платформы ProStaff (далее — «Платформа»). Используя Платформу, вы соглашаетесь с условиями настоящей Политики.",
  },
  {
    title: "2. Какие данные мы собираем",
    list: [
      "Регистрационные данные: имя, фамилия, адрес электронной почты, номер телефона.",
      "Профиль специалиста: опыт работы, навыки, образование, портфолио, фото.",
      "Данные компании: название организации, описание, логотип, контактные данные.",
      "Технические данные: IP-адрес, тип устройства, браузер, данные о посещённых страницах.",
    ],
  },
  {
    title: "3. Цели обработки данных",
    list: [
      "Предоставление доступа к функционалу Платформы.",
      "Поиск и подбор специалистов для работодателей.",
      "Улучшение качества сервиса и аналитика использования.",
      "Отправка уведомлений о релевантных вакансиях и предложениях.",
      "Обеспечение безопасности и предотвращение мошенничества.",
    ],
  },
  {
    title: "4. Хранение и защита данных",
    content:
      "Мы применяем современные технические и организационные меры для защиты персональных данных от несанкционированного доступа, изменения, раскрытия или уничтожения. Данные хранятся на защищённых серверах и шифруются при передаче.",
  },
  {
    title: "5. Передача данных третьим лицам",
    content:
      "Мы не продаём и не передаём ваши персональные данные третьим лицам, за исключением случаев, предусмотренных законодательством, или с вашего явного согласия. Работодатели видят только ту информацию профиля, которую вы сделали публичной.",
  },
  {
    title: "6. Права пользователей",
    list: [
      "Запросить доступ к своим персональным данным.",
      "Исправить или дополнить свои данные.",
      "Удалить свой аккаунт и все связанные данные.",
      "Отозвать согласие на обработку данных.",
      "Подать жалобу в уполномоченный орган по защите данных.",
    ],
  },
  {
    title: "7. Файлы cookie",
    content:
      "Платформа использует файлы cookie для обеспечения работы сайта, аналитики посещаемости и улучшения пользовательского опыта. Вы можете отключить cookie в настройках браузера.",
  },
];

export default function Privacy() {
  return (
    <Layout>
      <section className="bg-gradient-to-b from-primary to-primary-dark text-white py-8 md:py-12">
        <div className="container max-w-6xl text-center">
          <Shield className="h-10 w-10 mx-auto mb-3 text-accent" />
          <h1 className="font-display text-3xl md:text-4xl font-bold uppercase tracking-tight">
            Политика конфиденциальности
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

          {/* Contact card */}
          <Card className="border-0 shadow-sm bg-muted/50">
            <CardContent className="p-5 md:p-6">
              <h2 className="font-semibold text-base md:text-lg mb-3">8. Контактная информация</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                По вопросам обработки персональных данных обращайтесь:
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
