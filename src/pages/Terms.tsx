import { Layout } from "@/components/layout/Layout";
import { FileText, Construction } from "lucide-react";

export default function Terms() {
  return (
    <Layout>
      <section className="bg-gradient-to-b from-primary to-primary-dark text-white py-8 md:py-12">
        <div className="container max-w-4xl text-center">
          <FileText className="h-12 w-12 mx-auto mb-4 text-accent" />
          <h1 className="font-display text-3xl md:text-4xl font-bold uppercase tracking-tight">
            Условия использования
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
            Мы готовим полный текст условий использования платформы ProStaff.
            Он будет опубликован в ближайшее время.
          </p>
          <p className="text-muted-foreground mt-4">
            По всем вопросам: <a href="mailto:e89030922661@gmail.com" className="text-primary hover:underline">e89030922661@gmail.com</a>
          </p>
        </div>
      </section>
    </Layout>
  );
}
