import { Layout } from "@/components/layout/Layout";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Phone, Send } from "lucide-react";

export default function Contact() {
  usePageMeta({
    title: "Контакты",
    description: "Свяжитесь с командой ProStaff: email, телефон и Telegram. Мы рады помочь и услышать обратную связь.",
  });

  return (
    <Layout>
      <section className="bg-gradient-to-b from-primary to-primary-dark text-white py-8 md:py-12">
        <div className="container max-w-6xl text-center">
          <Mail className="h-10 w-10 mx-auto mb-3 text-accent" />
          <h1 className="font-display text-3xl md:text-4xl font-bold uppercase tracking-tight">
            Связаться с нами
          </h1>
          <p className="text-white/70 mt-2">Мы всегда рады помочь и услышать обратную связь</p>
        </div>
      </section>

      <section className="py-6 md:py-8 bg-background">
        <div className="container max-w-6xl">
          <div className="grid sm:grid-cols-3 gap-6">
            <Card className="text-center">
              <CardContent className="p-6">
                <Mail className="h-8 w-8 mx-auto mb-3 text-primary" />
                <h3 className="font-semibold mb-1">Email</h3>
                <a href="mailto:e89030922661@gmail.com" className="text-sm text-primary hover:underline">
                  e89030922661@gmail.com
                </a>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-6">
                <Phone className="h-8 w-8 mx-auto mb-3 text-primary" />
                <h3 className="font-semibold mb-1">Телефон</h3>
                <a href="tel:+789030922661" className="text-sm text-primary hover:underline">
                  8 903 092-26-61
                </a>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-6">
                <Send className="h-8 w-8 mx-auto mb-3 text-primary" />
                <h3 className="font-semibold mb-1">Telegram</h3>
                <a href="https://t.me/Gen_spb" target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                  @Gen_spb
                </a>
                <p className="text-xs text-muted-foreground mt-1">Вопросы и сотрудничество</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </Layout>
  );
}
