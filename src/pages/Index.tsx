import { Layout } from "@/components/layout/Layout";
import { HeroSection } from "@/components/home/HeroSection";
import { MockSpecialistsSection } from "@/components/home/MockSpecialistsSection";
import { RolesSection } from "@/components/home/RolesSection";
import { CTASection } from "@/components/home/CTASection";
import { useAuth } from "@/hooks/useAuth";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

const Index = () => {
  const { user, loading } = useAuth();

  usePageMeta({
    title: "Банк специалистов спортивной индустрии",
    description: "Нишевая платформа для поиска работы в спортивной индустрии. Объединяем специалистов и клубы РФ, Беларуси и Казахстана.",
    ogTitle: "ProStaff — Банк специалистов спортивной индустрии",
  });

  if (loading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Layout>
      <HeroSection />
      <MockSpecialistsSection />
      <RolesSection />
      <CTASection />
    </Layout>
  );
};

export default Index;
