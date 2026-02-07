import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Send } from "lucide-react";

const footerLinks = {
  platform: [
    { href: "/specialists", label: "Банк специалистов" },
    { href: "/jobs", label: "Вакансии" },
    { href: "/content", label: "Контент" },
    { href: "/about", label: "О платформе" },
  ],
  forSpecialists: [
    { href: "/auth?mode=signup&role=specialist", label: "Создать профиль" },
    { href: "/content/career-tips", label: "Советы по карьере" },
    { href: "/content/roles", label: "Обзор ролей" },
    { href: "/faq", label: "FAQ" },
  ],
  forClubs: [
    { href: "/auth?mode=signup&role=company", label: "Регистрация клуба" },
    { href: "/specialists", label: "Поиск специалистов" },
    { href: "/pricing", label: "Тарифы" },
    { href: "/contact", label: "Связаться с нами" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-primary-darker text-white">
      {/* Main footer */}
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center">
                <span className="text-primary font-display font-bold text-xl">P</span>
              </div>
              <span className="font-display text-xl font-bold uppercase tracking-tight">
                Pro<span className="text-accent">Staff</span>
              </span>
            </Link>
            <p className="text-white/70 text-sm mb-6">
              Нишевая платформа для поиска работы в спортивной индустрии. 
              Объединяем специалистов и клубы РФ, Беларуси и Казахстана.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://t.me/prostaff"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-accent flex items-center justify-center transition-colors"
              >
                <Send className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Platform links */}
          <div>
            <h4 className="font-display text-lg font-semibold uppercase tracking-wide mb-4">
              Платформа
            </h4>
            <ul className="space-y-3">
              {footerLinks.platform.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-white/70 hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Specialists */}
          <div>
            <h4 className="font-display text-lg font-semibold uppercase tracking-wide mb-4">
              Специалистам
            </h4>
            <ul className="space-y-3">
              {footerLinks.forSpecialists.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-white/70 hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Clubs */}
          <div>
            <h4 className="font-display text-lg font-semibold uppercase tracking-wide mb-4">
              Клубам
            </h4>
            <ul className="space-y-3">
              {footerLinks.forClubs.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-white/70 hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact info */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex flex-wrap items-center gap-6 text-sm text-white/70">
              <a href="mailto:hello@prostaff.ru" className="flex items-center gap-2 hover:text-white transition-colors">
                <Mail className="h-4 w-4" />
                hello@prostaff.ru
              </a>
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Россия, Беларусь, Казахстан
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-white/10">
        <div className="container py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white/50">
            <p>© 2024 ProStaff. Все права защищены.</p>
            <div className="flex items-center gap-6">
              <Link to="/privacy" className="hover:text-white transition-colors">
                Политика конфиденциальности
              </Link>
              <Link to="/terms" className="hover:text-white transition-colors">
                Условия использования
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
