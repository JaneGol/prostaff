import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, X, Building2 } from "lucide-react";
import { ImageUpload } from "@/components/shared/ImageUpload";

export default function CompanyEdit() {
  const navigate = useNavigate();
  const { user, userRole, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [companyId, setCompanyId] = useState<string | null>(null);

  // Form data
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [website, setWebsite] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("Россия");
  const [league, setLeague] = useState("");
  const [foundedYear, setFoundedYear] = useState("");

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate("/auth");
        return;
      }
      if (userRole && userRole !== "employer") {
        navigate("/");
        return;
      }
      fetchCompany();
    }
  }, [user, userRole, authLoading]);

  const fetchCompany = async () => {
    try {
      const { data: company } = await supabase
        .from("companies")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();

      if (company) {
        setCompanyId(company.id);
        setName(company.name);
        setDescription(company.description || "");
        setLogoUrl(company.logo_url || "");
        setWebsite(company.website || "");
        setCity(company.city || "");
        setCountry(company.country || "Россия");
        setLeague(company.league || "");
        setFoundedYear(company.founded_year?.toString() || "");
      }
    } catch (err) {
      console.error("Error fetching company:", err);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить данные компании",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast({
        title: "Ошибка",
        description: "Введите название компании",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);

    try {
      const companyData = {
        user_id: user!.id,
        name: name.trim(),
        description: description.trim() || null,
        logo_url: logoUrl.trim() || null,
        website: website.trim() || null,
        city: city.trim() || null,
        country: country.trim() || null,
        league: league.trim() || null,
        founded_year: foundedYear ? parseInt(foundedYear) : null
      };

      if (companyId) {
        const { error } = await supabase
          .from("companies")
          .update(companyData)
          .eq("id", companyId);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("companies")
          .insert(companyData)
          .select("id")
          .single();

        if (error) throw error;
        setCompanyId(data.id);
      }

      toast({
        title: "Сохранено",
        description: "Данные компании успешно обновлены"
      });
    } catch (err) {
      console.error("Error saving company:", err);
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить данные",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-6xl py-8 md:py-12">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="font-display text-2xl md:text-3xl font-bold uppercase">
              {companyId ? "Редактирование компании" : "Регистрация компании"}
            </h1>
            <Button variant="outline" onClick={() => navigate("/")}>
              <X className="h-4 w-4 mr-2" />
              Отмена
            </Button>
          </div>

          {/* Logo Upload */}
          <Card>
            <CardContent className="py-6">
              <div className="flex items-center gap-6">
                <ImageUpload
                  currentImageUrl={logoUrl}
                  onImageUploaded={setLogoUrl}
                  bucket="logos"
                  userId={user!.id}
                  size="lg"
                  shape="square"
                  placeholder={<Building2 className="h-10 w-10 text-muted-foreground" />}
                />
                <div>
                  <h3 className="font-semibold mb-1">Логотип компании</h3>
                  <p className="text-sm text-muted-foreground">
                    Нажмите на изображение, чтобы загрузить логотип.<br />
                    Рекомендуемый размер: 400×400 пикселей.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display uppercase">Основная информация</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Название компании / клуба *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ФК Спартак"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Описание</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Расскажите о вашей организации, её истории и достижениях..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Веб-сайт</Label>
                <Input
                  id="website"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://example.com"
                />
              </div>
            </CardContent>
          </Card>

          {/* Location & Details */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display uppercase">Локация и детали</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">Город</Label>
                  <Input
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Москва"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Страна</Label>
                  <Input
                    id="country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="Россия"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="league">Лига / Дивизион</Label>
                  <Input
                    id="league"
                    value={league}
                    onChange={(e) => setLeague(e.target.value)}
                    placeholder="РПЛ"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="foundedYear">Год основания</Label>
                  <Input
                    id="foundedYear"
                    type="number"
                    value={foundedYear}
                    onChange={(e) => setFoundedYear(e.target.value)}
                    placeholder="1922"
                    min="1800"
                    max={new Date().getFullYear()}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={() => navigate("/")}>
              Отмена
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Сохранение...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Сохранить
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
