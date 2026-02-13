import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  category: string | null;
  is_published: boolean | null;
  created_at: string | null;
}

const categoryColors: Record<string, string> = {
  "Карьера": "bg-accent/10 text-accent",
  "Инструменты": "bg-blue-100 text-blue-800",
  "Интервью": "bg-purple-100 text-purple-800",
  "Профессии": "bg-green-100 text-green-800",
  "Тренды": "bg-yellow-100 text-yellow-800",
  "Обучение": "bg-orange-100 text-orange-800",
  "Новости": "bg-primary/10 text-primary",
};

function ArticleList() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("articles")
      .select("*")
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setArticles(data || []);
        setLoading(false);
      });
  }, []);

  return (
    <Layout>
      <section className="bg-gradient-to-b from-primary to-primary-dark text-white py-12 md:py-16">
        <div className="container">
          <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold uppercase mb-4">
            Контент и статьи
          </h1>
          <p className="text-white/80 text-lg max-w-2xl">
            Полезные материалы о карьере в спорте: гайды, интервью с профессионалами, 
            обзоры инструментов и тренды индустрии
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container">
          {loading ? (
            <p className="text-center text-muted-foreground py-12">Загрузка...</p>
          ) : articles.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">
              Статьи скоро появятся. Следите за обновлениями!
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map(article => (
                <Link to={`/content/${article.slug}`} key={article.id}>
                  <Card className="hover:shadow-lg transition-shadow group cursor-pointer h-full">
                    <CardContent className="p-6 flex flex-col h-full">
                      {article.cover_image_url && (
                        <img
                          src={article.cover_image_url}
                          alt={article.title}
                          className="w-full h-40 object-cover rounded-lg mb-4"
                        />
                      )}
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                          <BookOpen className="h-6 w-6" />
                        </div>
                        {article.category && (
                          <Badge className={categoryColors[article.category] || "bg-muted"}>
                            {article.category}
                          </Badge>
                        )}
                      </div>
                      
                      <h3 className="font-semibold text-lg mb-2 group-hover:text-accent transition-colors line-clamp-2">
                        {article.title}
                      </h3>
                      
                      {article.excerpt && (
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-3 flex-1">
                          {article.excerpt}
                        </p>
                      )}
                      
                      <div className="flex items-center text-sm text-muted-foreground mt-auto">
                        <span>
                          {article.created_at
                            ? new Date(article.created_at).toLocaleDateString("ru-RU")
                            : ""}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}

function ArticlePage({ slug }: { slug: string }) {
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("articles")
      .select("*")
      .eq("slug", slug)
      .eq("is_published", true)
      .maybeSingle()
      .then(({ data }) => {
        setArticle(data);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <Layout>
        <div className="container py-12 text-center text-muted-foreground">Загрузка...</div>
      </Layout>
    );
  }

  if (!article) {
    return (
      <Layout>
        <div className="container py-12 text-center">
          <p className="text-muted-foreground mb-4">Статья не найдена</p>
          <Button asChild variant="outline">
            <Link to="/content"><ArrowLeft className="h-4 w-4 mr-2" /> К статьям</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <article className="container max-w-3xl py-12">
        <Button asChild variant="ghost" className="mb-6">
          <Link to="/content"><ArrowLeft className="h-4 w-4 mr-2" /> Все статьи</Link>
        </Button>

        {article.category && (
          <Badge className={`${categoryColors[article.category] || "bg-muted"} mb-4`}>
            {article.category}
          </Badge>
        )}

        <h1 className="text-3xl md:text-4xl font-bold mb-4">{article.title}</h1>

        {article.created_at && (
          <p className="text-muted-foreground mb-8">
            {new Date(article.created_at).toLocaleDateString("ru-RU", {
              year: "numeric", month: "long", day: "numeric"
            })}
          </p>
        )}

        {article.cover_image_url && (
          <img
            src={article.cover_image_url}
            alt={article.title}
            className="w-full rounded-xl mb-8 max-h-96 object-cover"
          />
        )}

        <div className="prose prose-lg max-w-none whitespace-pre-wrap">
          {article.content}
        </div>
      </article>
    </Layout>
  );
}

export default function Content() {
  const { slug } = useParams();

  if (slug) {
    return <ArticlePage slug={slug} />;
  }

  return <ArticleList />;
}
