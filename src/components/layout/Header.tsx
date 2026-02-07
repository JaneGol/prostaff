import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Search, User, LogOut, Send, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
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
      <nav className="bg-white border-b border-border shadow-sm">
        <div className="container">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo - ProStaff */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 md:w-11 md:h-11 rounded-lg bg-primary flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                  <span className="text-white font-display text-2xl md:text-3xl">P</span>
                </div>
                <div className="flex flex-col -space-y-1">
                  <span className="font-display text-2xl md:text-3xl text-foreground tracking-wide">
                    PRO<span className="text-accent">STAFF</span>
                  </span>
                </div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="text-foreground/70 hover:text-accent font-medium transition-colors text-sm uppercase tracking-wide"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-4">
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                <Search className="h-5 w-5" />
              </Button>
              
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
                    <Button variant="ghost" size="sm" className="font-medium">
                      Войти
                    </Button>
                  </Link>
                  <Link to="/auth?mode=signup">
                    <Button size="sm" className="btn-premium font-medium">
                      Регистрация
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 text-foreground hover:bg-muted rounded-lg transition-colors"
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
            "lg:hidden overflow-hidden transition-all duration-300 border-t border-border bg-white",
            isMenuOpen ? "max-h-[500px]" : "max-h-0"
          )}
        >
          <div className="container py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="block py-3 px-4 text-foreground/80 hover:text-accent hover:bg-muted rounded-lg font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex flex-col gap-3 pt-4 mt-4 border-t border-border">
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
                    <Button className="w-full btn-premium">
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