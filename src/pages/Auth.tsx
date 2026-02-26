import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { trackEvent } from "@/hooks/useAnalytics";
import { z } from "zod";
import { User, Building2, Mail, Lock, UserCircle, Loader2 } from "lucide-react";

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
  
  // Form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [companyName, setCompanyName] = useState("");
  
  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user && !loading) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    try {
      emailSchema.parse(email);
    } catch (e) {
      if (e instanceof z.ZodError) {
        newErrors.email = e.errors[0].message;
      }
    }
    
    try {
      passwordSchema.parse(password);
    } catch (e) {
      if (e instanceof z.ZodError) {
        newErrors.password = e.errors[0].message;
      }
    }
    
    if (isSignUp) {
      if (userType === "specialist") {
        if (!firstName.trim()) newErrors.firstName = "Введите имя";
        if (!lastName.trim()) newErrors.lastName = "Введите фамилию";
      } else {
        if (!companyName.trim()) newErrors.companyName = "Введите название компании";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      if (isSignUp) {
        const { error } = await signUp(
          email, 
          password, 
          userType,
          userType === "specialist" 
            ? { firstName, lastName }
            : { companyName }
        );
        
        if (error) {
          if (error.message.includes("already registered")) {
            toast({
              title: "Ошибка",
              description: "Пользователь с таким email уже зарегистрирован",
              variant: "destructive"
            });
          } else {
            toast({
              title: "Ошибка регистрации",
              description: error.message,
              variant: "destructive"
            });
          }
        } else {
          trackEvent("signup", "auth", userType, email);
          toast({
            title: "Регистрация успешна!",
            description: "Добро пожаловать на платформу ProStaff"
          });
          navigate("/dashboard");
        }
      } else {
        const { error } = await signIn(email, password);
        
        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast({
              title: "Ошибка входа",
              description: "Неверный email или пароль",
              variant: "destructive"
            });
          } else {
            toast({
              title: "Ошибка входа",
              description: error.message,
              variant: "destructive"
            });
          }
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

  return (
    <Layout>
      <div className="min-h-[80vh] bg-gradient-to-b from-primary/5 to-background py-12 md:py-20">
        <div className="container max-w-md">
          <div className="bg-card rounded-2xl shadow-xl border border-border p-6 md:p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground uppercase">
                {isSignUp ? "Регистрация" : "Вход"}
              </h1>
              <p className="text-muted-foreground mt-2">
                {isSignUp 
                  ? "Создайте аккаунт на платформе" 
                  : "Войдите в свой аккаунт"
                }
              </p>
            </div>

            {/* Toggle Login/Signup */}
            <div className="flex gap-2 mb-6">
              <Button
                variant={!isSignUp ? "default" : "outline"}
                className="flex-1"
                onClick={() => setIsSignUp(false)}
              >
                Вход
              </Button>
              <Button
                variant={isSignUp ? "default" : "outline"}
                className="flex-1"
                onClick={() => setIsSignUp(true)}
              >
                Регистрация
              </Button>
            </div>

            {/* User Type Tabs (only for signup) */}
            {isSignUp && (
              <Tabs value={userType} onValueChange={(v) => setUserType(v as "specialist" | "employer")} className="mb-6">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="specialist" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Специалист
                  </TabsTrigger>
                  <TabsTrigger value="employer" className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Работодатель
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name fields for specialist signup */}
              {isSignUp && userType === "specialist" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Имя</Label>
                    <div className="relative">
                      <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Иван"
                        className={`pl-10 ${errors.firstName ? "border-destructive" : ""}`}
                      />
                    </div>
                    {errors.firstName && (
                      <p className="text-sm text-destructive">{errors.firstName}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Фамилия</Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Иванов"
                      className={errors.lastName ? "border-destructive" : ""}
                    />
                    {errors.lastName && (
                      <p className="text-sm text-destructive">{errors.lastName}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Company name for employer signup */}
              {isSignUp && userType === "employer" && (
                <div className="space-y-2">
                  <Label htmlFor="companyName">Название компании/клуба</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="companyName"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="ФК Спартак"
                      className={`pl-10 ${errors.companyName ? "border-destructive" : ""}`}
                    />
                  </div>
                  {errors.companyName && (
                    <p className="text-sm text-destructive">{errors.companyName}</p>
                  )}
                </div>
              )}

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ivan@example.com"
                    className={`pl-10 ${errors.email ? "border-destructive" : ""}`}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Пароль</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`pl-10 ${errors.password ? "border-destructive" : ""}`}
                  />
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
              </div>

              {/* Submit */}
              <Button 
                type="submit" 
                className="w-full" 
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isSignUp ? "Регистрация..." : "Вход..."}
                  </>
                ) : (
                  isSignUp ? "Зарегистрироваться" : "Войти"
                )}
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-6 text-center text-sm text-muted-foreground">
              {isSignUp ? (
                <>
                  Уже есть аккаунт?{" "}
                  <button 
                    onClick={() => setIsSignUp(false)}
                    className="text-accent hover:underline font-medium"
                  >
                    Войти
                  </button>
                </>
              ) : (
                <>
                  Нет аккаунта?{" "}
                  <button 
                    onClick={() => setIsSignUp(true)}
                    className="text-accent hover:underline font-medium"
                  >
                    Зарегистрироваться
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
