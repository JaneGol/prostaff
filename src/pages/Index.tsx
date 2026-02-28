import { useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { HeroSection } from "@/components/home/HeroSection";
import { MockSpecialistsSection } from "@/components/home/MockSpecialistsSection";
import { RolesSection } from "@/components/home/RolesSection";
import { CTASection } from "@/components/home/CTASection";
import { useAuth } from "@/hooks/useAuth";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

const JSONLD_ORG = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "ProStaff",
  url: "https://prostaff.lovable.app",
  logo: "https://prostaff.lovable.app/og-image.png",
  description: "Нишевая платформа для поиска работы в спортивной индустрии. Объединяем специалистов и клубы РФ, Беларуси и Казахстана.",
  contactPoint: {
    "@type": "ContactPoint",
    email: "e89030922661@gmail.com",
    contactType: "customer support",
  },
};

const JSONLD_WEBSITE = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "ProStaff",
  url: "https://prostaff.lovable.app",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://prostaff.lovable.app/specialists?q={search_term_string}",
    "query-input": "required name=search_term_string",
  },
};

const Index = () => {
  const { user, loading } = useAuth();

  usePageMeta({
    title: "Банк специалистов спортивной индустрии",
    description: "Платформа для тренеров, аналитиков, врачей и других специалистов спортивной индустрии.",
    ogTitle: "ProStaff - Банк специалистов спортивной индустрии",
  });

  // Inject JSON-LD structured data
  useEffect(() => {
    const addJsonLd = (data: object, id: string) => {
      let el = document.getElementById(id);
      if (!el) {
        el = document.createElement("script");
        el.id = id;
        el.setAttribute("type", "application/ld+json");
        document.head.appendChild(el);
      }
      el.textContent = JSON.stringify(data);
    };
    addJsonLd(JSONLD_ORG, "jsonld-org");
    addJsonLd(JSONLD_WEBSITE, "jsonld-website");
    return () => {
      document.getElementById("jsonld-org")?.remove();
      document.getElementById("jsonld-website")?.remove();
    };
  }, []);

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
