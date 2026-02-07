import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Camera, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  currentImageUrl: string | null;
  onImageUploaded: (url: string) => void;
  bucket: "avatars" | "logos";
  userId: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  shape?: "circle" | "square";
  placeholder?: React.ReactNode;
}

const sizeClasses = {
  sm: "w-16 h-16",
  md: "w-24 h-24",
  lg: "w-32 h-32"
};

export function ImageUpload({
  currentImageUrl,
  onImageUploaded,
  bucket,
  userId,
  className,
  size = "lg",
  shape = "circle",
  placeholder
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, выберите изображение",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Ошибка",
        description: "Размер файла не должен превышать 5 МБ",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);

    try {
      // Generate unique filename
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      onImageUploaded(publicUrl);

      toast({
        title: "Успешно",
        description: "Изображение загружено"
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Ошибка загрузки",
        description: "Не удалось загрузить изображение",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn("relative group", className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />

      <div
        className={cn(
          sizeClasses[size],
          shape === "circle" ? "rounded-full" : "rounded-xl",
          "bg-muted flex items-center justify-center overflow-hidden border-2 border-dashed border-border transition-colors",
          "hover:border-accent cursor-pointer"
        )}
        onClick={handleClick}
      >
        {uploading ? (
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        ) : currentImageUrl ? (
          <img
            src={currentImageUrl}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          placeholder || <Camera className="h-8 w-8 text-muted-foreground" />
        )}
      </div>

      {/* Overlay on hover */}
      {!uploading && (
        <div
          className={cn(
            sizeClasses[size],
            shape === "circle" ? "rounded-full" : "rounded-xl",
            "absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity",
            "flex items-center justify-center cursor-pointer"
          )}
          onClick={handleClick}
        >
          <Camera className="h-6 w-6 text-white" />
        </div>
      )}
    </div>
  );
}