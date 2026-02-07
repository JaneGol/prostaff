import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/specialists", label: "Банк специалистов" },
  { href: "/jobs", label: "Вакансии" },
  { href: "/content", label: "Контент" },
  { href: "/about", label: "О нас" },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
              <div className="flex items-center gap-1">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-white font-display font-bold text-xl">T</span>
                </div>
                <span className="font-display text-xl md:text-2xl font-bold text-foreground uppercase tracking-tight">
                  Talent<span className="text-accent">Pool</span>
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
            isMenuOpen ? "max-h-96" : "max-h-0"
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
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
