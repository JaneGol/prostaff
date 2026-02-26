import { Layout } from "@/components/layout/Layout";
import { HelpCircle, Construction } from "lucide-react";

export default function FAQ() {
  return (
    <Layout>
      <section className="bg-gradient-to-b from-primary to-primary-dark text-white py-8 md:py-12">
        <div className="container max-w-4xl text-center">
          <HelpCircle className="h-12 w-12 mx-auto mb-4 text-accent" />
          <h1 className="font-display text-3xl md:text-4xl font-bold uppercase tracking-tight">
            Часто задаваемые вопросы
          </h1>
        </div>
      </section>

      <section className="py-20 md:py-28 bg-background">
        <div className="container max-w-2xl text-center">
          <Construction className="h-16 w-16 mx-auto mb-6 text-muted-foreground" />
          <h2 className="font-display text-2xl md:text-3xl font-bold uppercase tracking-tight mb-4">
            Раздел в разработке
          </h2>
          <p className="text-muted-foreground text-lg">
            Мы собираем самые популярные вопросы пользователей и скоро опубликуем ответы здесь.
          </p>
          <p className="text-muted-foreground mt-4">
            Задайте вопрос: <a href="https://t.me/Gen_spb" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">@Gen_spb в Telegram</a>
          </p>
        </div>
      </section>
    </Layout>
  );
}
