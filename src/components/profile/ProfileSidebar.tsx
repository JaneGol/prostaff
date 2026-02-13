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
    <nav className="space-y-0.5 w-full">
      {sections.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onSectionClick(id)}
          className={cn(
            "flex items-center gap-3 w-full text-left px-3 py-3 rounded-xl text-[14px] transition-all relative",
            activeSection === id
              ? "bg-primary/8 text-primary font-medium before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-[3px] before:h-5 before:bg-primary before:rounded-full"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
          )}
        >
          <Icon className="h-[18px] w-[18px] flex-shrink-0" />
          {label}
        </button>
      ))}
    </nav>
  );
}
