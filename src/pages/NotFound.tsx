import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <Layout>
      <section className="py-20 md:py-28 bg-background">
        <div className="container max-w-6xl text-center">
          <div className="font-display text-8xl md:text-9xl font-bold text-primary/20 mb-4">
            404
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold uppercase tracking-tight mb-4">
            Страница не найдена
          </h1>
          <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
            К сожалению, запрашиваемая страница не существует или была перемещена.
          </p>
          <Button asChild>
            <Link to="/">
              <Home className="h-4 w-4 mr-2" />
              На главную
            </Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
};

export default NotFound;
