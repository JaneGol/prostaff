import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AVATAR_BANK, encodeBankAvatar, type BankAvatar } from "@/lib/defaultAvatars";
import { Palette } from "lucide-react";
import { cn } from "@/lib/utils";

interface AvatarBankPickerProps {
  onSelect: (avatarUrl: string) => void;
  trigger?: React.ReactNode;
}

export function AvatarBankPicker({ onSelect, trigger }: AvatarBankPickerProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (avatar: BankAvatar) => {
    onSelect(encodeBankAvatar(avatar.id));
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <Palette className="h-3.5 w-3.5" />
            Выбрать иконку
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-base">Выберите аватарку</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Выберите иконку из нашего банка или загрузите своё фото
          </p>
        </DialogHeader>
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 max-h-[65vh] overflow-y-auto py-2">
          {AVATAR_BANK.map((avatar) => (
            <button
              key={avatar.id}
              onClick={() => handleSelect(avatar)}
              className={cn(
                "w-full aspect-square rounded-full overflow-hidden border-2 border-transparent",
                "hover:border-primary hover:scale-105 transition-all cursor-pointer",
                "bg-muted"
              )}
              title={avatar.label}
            >
              <img src={avatar.src} alt={avatar.label} className="w-full h-full object-cover rounded-full" />
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
