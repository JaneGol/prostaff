import { cn } from "@/lib/utils";
import { User, MapPin, Wrench, Trophy, Briefcase, GraduationCap, FolderOpen, Phone, Settings, FileText } from "lucide-react";

interface ProfileSidebarProps {
  activeSection: string;
  onSectionClick: (section: string) => void;
}

const sections = [
  { id: "basic", label: "Основное", icon: User },
  { id: "about", label: "О себе", icon: FileText },
  { id: "status", label: "Статус и приватность", icon: Settings },
  { id: "skills", label: "Навыки", icon: Wrench },
  { id: "sports", label: "Виды спорта", icon: Trophy },
  { id: "experience", label: "Опыт работы", icon: Briefcase },
  { id: "education", label: "Образование", icon: GraduationCap },
  { id: "portfolio", label: "Портфолио", icon: FolderOpen },
  { id: "contacts", label: "Контакты", icon: Phone },
];

export function ProfileSidebar({ activeSection, onSectionClick }: ProfileSidebarProps) {
  return (
    <nav className="hidden lg:block sticky top-24 space-y-1 w-48">
      {sections.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onSectionClick(id)}
          className={cn(
            "flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
            activeSection === id
              ? "bg-primary/10 text-primary font-medium"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          )}
        >
          <Icon className="h-4 w-4 flex-shrink-0" />
          {label}
        </button>
      ))}
    </nav>
  );
}
