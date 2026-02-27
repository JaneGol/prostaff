import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Loader2, CheckCircle } from "lucide-react";

export function ForgotPasswordDialog() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) {
      toast({ title: "Ошибка", description: "Введите корректный email", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) {
        toast({ title: "Ошибка", description: error.message, variant: "destructive" });
      } else {
        setSent(true);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (v: boolean) => {
    setOpen(v);
    if (!v) {
      setSent(false);
      setEmail("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button type="button" className="text-sm text-accent hover:underline font-medium">
          Забыли пароль?
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-center">Восстановление пароля</DialogTitle>
        </DialogHeader>

        {sent ? (
          <div className="text-center py-6 space-y-3">
            <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto" />
            <p className="font-medium">Письмо отправлено!</p>
            <p className="text-sm text-muted-foreground">
              Проверьте почту <strong>{email}</strong> и перейдите по ссылке для сброса пароля.
            </p>
            <Button variant="outline" onClick={() => handleOpenChange(false)} className="mt-2">
              Закрыть
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Введите email, на который зарегистрирован аккаунт. Мы отправим ссылку для сброса пароля.
            </p>
            <div className="space-y-2">
              <Label htmlFor="reset-email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="reset-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ivan@example.com"
                  className="pl-10"
                  autoFocus
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Отправка...</>
              ) : (
                "Отправить ссылку"
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
