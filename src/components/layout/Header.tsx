import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Search, User, LogOut, Send, Users, BarChart3, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { trackEvent } from "@/hooks/useAnalytics";
import { useAuth } from "@/hooks/useAuth";
import { useClubAccess } from "@/hooks/useClubAccess";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navLinks = [
  { href: "/specialists", label: "Банк специалистов" },
  { href: "/jobs", label: "Вакансии" },
  { href: "/content", label: "Контент" },
  { href: "/about", label: "О нас" },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, userRole, signOut } = useAuth();
  const { access } = useClubAccess();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Top bar */}
      <div className="bg-primary-darker text-white py-2 text-center text-sm">
        <span className="font-medium">
          🏆 Найди работу мечты в спорте — присоединяйся к платформе!
        </span>
      </div>

      {/* Main navigation */}
      <nav className="bg-white border-b border-border">
        <div className="container">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                  <span className="text-white font-display font-bold text-xl">P</span>
                </div>
                <span className="font-display text-xl md:text-2xl font-bold text-foreground uppercase tracking-tight">
                  Pro<span className="text-accent">Staff</span>
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="text-foreground/80 hover:text-accent font-medium transition-colors"
                  onClick={() => trackEvent("nav_click", "navigation", link.label, link.href)}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-4">
              <Button variant="ghost" size="icon">
                <Search className="h-5 w-5" />
              </Button>
              
              {user && userRole === "employer" && access && (
                <Link to="/pricing" className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  <Eye className="h-4 w-4" />
                  <span>{access.free_views_remaining}</span>
                </Link>
              )}

              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <User className="h-4 w-4" />
                      {userRole === "specialist" ? "Профиль" : "Кабинет"}
                    </Button>
                  </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                    {userRole === "specialist" && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link to="/profile/edit">Мой профиль</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to="/my-applications">
                            <Send className="h-4 w-4 mr-2" />
                            Мои отклики
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    {userRole === "employer" && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link to="/company/edit">Моя компания</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to="/employer/applications">
                            <Users className="h-4 w-4 mr-2" />
                            Отклики кандидатов
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    {userRole === "admin" && (
                      <DropdownMenuItem asChild>
                        <Link to="/admin">
                          <BarChart3 className="h-4 w-4 mr-2" />
                          Панель управления
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                      <LogOut className="h-4 w-4 mr-2" />
                      Выйти
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Link to="/auth">
                    <Button variant="outline" size="sm">
                      Войти
                    </Button>
                  </Link>
                  <Link to="/auth?mode=signup">
                    <Button size="sm">
                      Регистрация
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 text-foreground"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div
          className={cn(
            "lg:hidden overflow-hidden transition-all duration-300 border-t border-border",
            isMenuOpen ? "max-h-[400px]" : "max-h-0"
          )}
        >
          <div className="container py-4 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="block py-2 text-foreground/80 hover:text-accent font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex flex-col gap-3 pt-4 border-t border-border">
              {user ? (
                <>
                  {userRole === "specialist" && (
                    <>
                      <Link to="/profile/edit" onClick={() => setIsMenuOpen(false)}>
                        <Button variant="outline" className="w-full">
                          Мой профиль
                        </Button>
                      </Link>
                      <Link to="/my-applications" onClick={() => setIsMenuOpen(false)}>
                        <Button variant="ghost" className="w-full">
                          <Send className="h-4 w-4 mr-2" />
                          Мои отклики
                        </Button>
                      </Link>
                    </>
                  )}
                  {userRole === "employer" && (
                    <>
                      {access && (
                        <Link to="/pricing" onClick={() => setIsMenuOpen(false)}>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground px-4 py-2">
                            <Eye className="h-4 w-4" />
                            Осталось просмотров: {access.free_views_remaining}
                          </div>
                        </Link>
                      )}
                      <Link to="/company/edit" onClick={() => setIsMenuOpen(false)}>
                        <Button variant="outline" className="w-full">
                          Моя компания
                        </Button>
                      </Link>
                      <Link to="/employer/applications" onClick={() => setIsMenuOpen(false)}>
                        <Button variant="ghost" className="w-full">
                          <Users className="h-4 w-4 mr-2" />
                          Отклики кандидатов
                        </Button>
                      </Link>
                    </>
                   )}
                   {userRole === "admin" && (
                     <Link to="/admin" onClick={() => setIsMenuOpen(false)}>
                       <Button variant="ghost" className="w-full">
                         <BarChart3 className="h-4 w-4 mr-2" />
                         Панель управления
                       </Button>
                     </Link>
                   )}
                   <Button variant="ghost" className="w-full text-destructive" onClick={handleSignOut}>
                     <LogOut className="h-4 w-4 mr-2" />
                     Выйти
                   </Button>
                </>
              ) : (
                <>
                  <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" className="w-full">
                      Войти
                    </Button>
                  </Link>
                  <Link to="/auth?mode=signup" onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full">
                      Регистрация
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
