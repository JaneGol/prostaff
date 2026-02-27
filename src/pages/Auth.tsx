import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { trackEvent } from "@/hooks/useAnalytics";
import { z } from "zod";
import { User, Building2, Mail, Lock, Loader2 } from "lucide-react";
import { SpecialistWizard, type WizardData } from "@/components/auth/SpecialistWizard";
import { ForgotPasswordDialog } from "@/components/auth/ForgotPasswordDialog";
import { supabase } from "@/integrations/supabase/client";

const emailSchema = z.string().email("Введите корректный email");
const passwordSchema = z.string().min(6, "Пароль должен содержать минимум 6 символов");

export default function Auth() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, signIn, signUp, loading } = useAuth();
  const { toast } = useToast();

  const [isSignUp, setIsSignUp] = useState(searchParams.get("mode") === "signup");
  const roleParam = searchParams.get("role");
  const [userType, setUserType] = useState<"specialist" | "employer">(
    roleParam === "employer" || roleParam === "company" ? "employer" : "specialist"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Login / employer signup fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user && !loading) navigate("/dashboard");
  }, [user, loading, navigate]);

  const validateLogin = () => {
    const newErrors: Record<string, string> = {};
    try { emailSchema.parse(email); } catch (e) { if (e instanceof z.ZodError) newErrors.email = e.errors[0].message; }
    try { passwordSchema.parse(password); } catch (e) { if (e instanceof z.ZodError) newErrors.password = e.errors[0].message; }
    if (isSignUp && userType === "employer" && !companyName.trim()) newErrors.companyName = "Введите название компании";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Specialist wizard complete handler
  const handleSpecialistComplete = async (data: WizardData) => {
    setIsSubmitting(true);
    try {
      const signUpResult = await signUp(data.email, data.password, "specialist", {
        firstName: data.firstName,
        lastName: data.lastName,
      });

      if (signUpResult.error) {
        const msg = signUpResult.error.message.includes("already registered")
          ? "Пользователь с таким email уже зарегистрирован"
          : signUpResult.error.message;
        toast({ title: "Ошибка регистрации", description: msg, variant: "destructive" });
        return;
      }

      // After successful signup, update profile with role_id, level, and save sports & custom_role
      const { data: { user: newUser } } = await supabase.auth.getUser();
      if (newUser) {
        const profileUpdate: Record<string, unknown> = { level: data.level };

        if (data.roleId) {
          profileUpdate.role_id = data.roleId;
        } else if (data.customRoleTitle.trim()) {
          // Create custom role
          const groupId = data.groupId;
          const { data: customRole } = await supabase
            .from("custom_roles")
            .insert({ user_id: newUser.id, title: data.customRoleTitle.trim(), group_id: groupId })
            .select("id")
            .single();
          if (customRole) {
            profileUpdate.custom_role_id = customRole.id;
          }
        }

        await supabase
          .from("profiles")
          .update(profileUpdate)
          .eq("user_id", newUser.id);

        // Save sports
        if (data.sportIds.length > 0) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("id")
            .eq("user_id", newUser.id)
            .single();
          if (profile) {
            const sportRows = data.sportIds.map((sportId) => ({
              profile_id: profile.id,
              sport_id: sportId,
            }));
            await supabase.from("profile_sports_experience").insert(sportRows);
          }
        }
      }

      trackEvent("signup", "auth", "specialist", data.email);
      toast({ title: "Регистрация успешна!", description: "Добро пожаловать на платформу ProStaff" });
      navigate("/dashboard");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Login / employer signup
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateLogin()) return;
    setIsSubmitting(true);
    try {
      if (isSignUp) {
        const { error } = await signUp(email, password, "employer", { companyName });
        if (error) {
          const msg = error.message.includes("already registered")
            ? "Пользователь с таким email уже зарегистрирован"
            : error.message;
          toast({ title: "Ошибка регистрации", description: msg, variant: "destructive" });
        } else {
          trackEvent("signup", "auth", "employer", email);
          toast({ title: "Регистрация успешна!", description: "Добро пожаловать на платформу ProStaff" });
          navigate("/dashboard");
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          const msg = error.message.includes("Invalid login credentials")
            ? "Неверный email или пароль"
            : error.message;
          toast({ title: "Ошибка входа", description: msg, variant: "destructive" });
        } else {
          trackEvent("login", "auth", "success", email);
          navigate("/dashboard");
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  const showWizard = isSignUp && userType === "specialist";

  return (
    <Layout>
      <div className="min-h-[80vh] bg-gradient-to-b from-primary/5 to-background py-12 md:py-20">
        <div className={`container ${showWizard ? "max-w-lg" : "max-w-md"}`}>
          <div className="bg-card rounded-2xl shadow-xl border border-border p-6 md:p-8">
            {/* Header */}
            <div className="text-center mb-6">
              <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground uppercase">
                {isSignUp ? "Регистрация" : "Вход"}
              </h1>
              <p className="text-muted-foreground mt-2 text-sm">
                {isSignUp ? "Создайте аккаунт на платформе" : "Войдите в свой аккаунт"}
              </p>
            </div>

            {/* Toggle Login/Signup */}
            <div className="flex gap-2 mb-6">
              <Button variant={!isSignUp ? "default" : "outline"} className="flex-1" onClick={() => setIsSignUp(false)}>
                Вход
              </Button>
              <Button variant={isSignUp ? "default" : "outline"} className="flex-1" onClick={() => setIsSignUp(true)}>
                Регистрация
              </Button>
            </div>

            {/* User Type Tabs (only for signup) */}
            {isSignUp && (
              <Tabs value={userType} onValueChange={(v) => setUserType(v as "specialist" | "employer")} className="mb-6">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="specialist" className="flex items-center gap-2">
                    <User className="h-4 w-4" /> Специалист
                  </TabsTrigger>
                  <TabsTrigger value="employer" className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" /> Работодатель
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            )}

            {/* Specialist Wizard */}
            {showWizard && (
              <SpecialistWizard onComplete={handleSpecialistComplete} isSubmitting={isSubmitting} />
            )}

            {/* Employer signup / Login form */}
            {!showWizard && (
              <>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {isSignUp && userType === "employer" && (
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Название компании/клуба</Label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="companyName" value={companyName} onChange={(e) => setCompanyName(e.target.value)}
                          placeholder="ФК Спартак" className={`pl-10 ${errors.companyName ? "border-destructive" : ""}`} />
                      </div>
                      {errors.companyName && <p className="text-sm text-destructive">{errors.companyName}</p>}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                        placeholder="ivan@example.com" className={`pl-10 ${errors.email ? "border-destructive" : ""}`} />
                    </div>
                    {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Пароль</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••" className={`pl-10 ${errors.password ? "border-destructive" : ""}`} />
                    </div>
                    {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                    {!isSignUp && (
                      <div className="text-right">
                        <ForgotPasswordDialog />
                      </div>
                    )}
                  </div>

                  <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{isSignUp ? "Регистрация..." : "Вход..."}</>
                    ) : (
                      isSignUp ? "Зарегистрироваться" : "Войти"
                    )}
                  </Button>
                </form>

                <div className="mt-6 text-center text-sm text-muted-foreground">
                  {isSignUp ? (
                    <>Уже есть аккаунт?{" "}
                      <button onClick={() => setIsSignUp(false)} className="text-accent hover:underline font-medium">Войти</button>
                    </>
                  ) : (
                    <>Нет аккаунта?{" "}
                      <button onClick={() => setIsSignUp(true)} className="text-accent hover:underline font-medium">Зарегистрироваться</button>
                    </>
                  )}
                </div>
              </>
            )}

            {/* Footer for wizard mode */}
            {showWizard && (
              <div className="mt-4 text-center text-sm text-muted-foreground">
                Уже есть аккаунт?{" "}
                <button onClick={() => setIsSignUp(false)} className="text-accent hover:underline font-medium">Войти</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
