import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Eye, EyeOff, FileText } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  category: string | null;
  is_published: boolean | null;
  author_id: string;
  created_at: string | null;
  updated_at: string | null;
}

const CATEGORIES = ["Карьера", "Инструменты", "Интервью", "Профессии", "Тренды", "Обучение", "Новости"];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[а-яё]/gi, (char) => {
      const map: Record<string, string> = {
        а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo", ж: "zh",
        з: "z", и: "i", й: "j", к: "k", л: "l", м: "m", н: "n", о: "o",
        п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "c",
        ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
      };
      return map[char.toLowerCase()] || char;
    })
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function ArticleEditor() {
  const { user } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Новости");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [isPublished, setIsPublished] = useState(false);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    const { data } = await supabase
      .from("articles")
      .select("*")
      .order("created_at", { ascending: false });
    setArticles(data || []);
    setLoading(false);
  };

  const resetForm = () => {
    setTitle("");
    setSlug("");
    setExcerpt("");
    setContent("");
    setCategory("Новости");
    setCoverImageUrl("");
    setIsPublished(false);
    setEditingArticle(null);
  };

  const openCreate = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEdit = (article: Article) => {
    setEditingArticle(article);
    setTitle(article.title);
    setSlug(article.slug);
    setExcerpt(article.excerpt || "");
    setContent(article.content);
    setCategory(article.category || "Новости");
    setCoverImageUrl(article.cover_image_url || "");
    setIsPublished(article.is_published ?? false);
    setDialogOpen(true);
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!editingArticle) {
      setSlug(slugify(val));
    }
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim() || !slug.trim()) {
      toast({ title: "Заполните обязательные поля", description: "Название, slug и содержание обязательны", variant: "destructive" });
      return;
    }
    if (!user) return;

    setSaving(true);
    const payload = {
      title: title.trim(),
      slug: slug.trim(),
      excerpt: excerpt.trim() || null,
      content: content.trim(),
      category,
      cover_image_url: coverImageUrl.trim() || null,
      is_published: isPublished,
      author_id: user.id,
    };

    if (editingArticle) {
      const { error } = await supabase
        .from("articles")
        .update(payload)
        .eq("id", editingArticle.id);
      if (error) {
        toast({ title: "Ошибка", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Статья обновлена" });
      }
    } else {
      const { error } = await supabase.from("articles").insert(payload);
      if (error) {
        toast({ title: "Ошибка", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Статья создана" });
      }
    }

    setSaving(false);
    setDialogOpen(false);
    resetForm();
    fetchArticles();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Удалить статью?")) return;
    await supabase.from("articles").delete().eq("id", id);
    toast({ title: "Статья удалена" });
    fetchArticles();
  };

  const togglePublish = async (article: Article) => {
    await supabase
      .from("articles")
      .update({ is_published: !article.is_published })
      .eq("id", article.id);
    fetchArticles();
  };

  if (loading) return <p className="text-center text-muted-foreground py-8">Загрузка...</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Статьи ({articles.length})
        </h3>
        <Button onClick={openCreate} size="sm">
          <Plus className="h-4 w-4 mr-1" /> Новая статья
        </Button>
      </div>

      {articles.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Нет статей. Создайте первую!
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {articles.map((article) => (
            <Card key={article.id}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium truncate">{article.title}</span>
                    <Badge variant={article.is_published ? "default" : "secondary"} className="shrink-0">
                      {article.is_published ? "Опубликовано" : "Черновик"}
                    </Badge>
                    {article.category && (
                      <Badge variant="outline" className="shrink-0">{article.category}</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{article.excerpt || "Без описания"}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {article.created_at ? new Date(article.created_at).toLocaleDateString("ru-RU") : ""}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="ghost" size="icon" onClick={() => togglePublish(article)} title={article.is_published ? "Снять с публикации" : "Опубликовать"}>
                    {article.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => openEdit(article)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(article.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingArticle ? "Редактировать статью" : "Новая статья"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Название *</Label>
              <Input value={title} onChange={(e) => handleTitleChange(e.target.value)} placeholder="Заголовок статьи" />
            </div>
            <div>
              <Label>Slug (URL) *</Label>
              <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="url-statyi" />
            </div>
            <div>
              <Label>Краткое описание</Label>
              <Textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="Краткое описание для карточки" rows={2} />
            </div>
            <div>
              <Label>Содержание *</Label>
              <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Полный текст статьи..." rows={10} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Категория</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>URL обложки</Label>
                <Input value={coverImageUrl} onChange={(e) => setCoverImageUrl(e.target.value)} placeholder="https://..." />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={isPublished} onCheckedChange={setIsPublished} />
              <Label>Опубликовать сразу</Label>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Отмена</Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Сохранение..." : editingArticle ? "Сохранить" : "Создать"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
