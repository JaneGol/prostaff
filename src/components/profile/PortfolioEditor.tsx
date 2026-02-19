import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

export interface PortfolioItem {
  id?: string;
  type: string;
  title: string;
  url: string;
  description: string;
  tags: string[];
  visibility: string;
}

interface PortfolioEditorProps {
  items: PortfolioItem[];
  onChange: (items: PortfolioItem[]) => void;
}

const LABEL = "text-[13px] font-medium text-muted-foreground";
const HINT = "text-[12px] text-muted-foreground/60";
const FIELD_TEXT = "text-[14px]";

const typeOptions = [
  { value: "video", label: "Видео" },
  { value: "pdf", label: "PDF" },
  { value: "presentation", label: "Презентация" },
  { value: "github", label: "GitHub" },
  { value: "tableau", label: "Tableau / PowerBI" },
  { value: "publication", label: "Публикация" },
  { value: "other", label: "Другое" },
];

const visibilityOptions = [
  { value: "public", label: "Всем клубам" },
  { value: "clubs_only", label: "Только зарегистрированным" },
  { value: "on_request", label: "По запросу" },
];

export function PortfolioEditor({ items, onChange }: PortfolioEditorProps) {
  const [tagInput, setTagInput] = useState<Record<number, string>>({});

  const addItem = () => {
    onChange([...items, { type: "other", title: "", url: "", description: "", tags: [], visibility: "public" }]);
  };

  const updateItem = (index: number, field: keyof PortfolioItem, value: any) => {
    onChange(items.map((item, i) => i === index ? { ...item, [field]: value } : item));
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const addTag = (index: number) => {
    const tag = (tagInput[index] || "").trim();
    if (tag && !items[index].tags.includes(tag)) {
      updateItem(index, "tags", [...items[index].tags, tag]);
      setTagInput(prev => ({ ...prev, [index]: "" }));
    }
  };

  const removeTag = (index: number, tagIndex: number) => {
    updateItem(index, "tags", items[index].tags.filter((_, i) => i !== tagIndex));
  };

  return (
    <div className="bg-card rounded-xl p-5 md:p-6 shadow-card space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-[16px] font-semibold text-foreground">Портфолио</h2>
        <Button variant="outline" size="sm" onClick={addItem} className="text-[13px]">
          <Plus className="h-4 w-4 mr-1.5" />Добавить
        </Button>
      </div>

      <p className={HINT}>
        Добавьте примеры работ: видеоразборы, дашборды, публикации, презентации
      </p>

      {items.length === 0 ? (
        <p className="text-muted-foreground/60 text-center py-6 text-[14px]">Нет элементов портфолио</p>
      ) : (
        items.map((item, index) => (
          <div key={index} className="border border-border/40 rounded-lg p-4 space-y-4">
            <div className="flex justify-between items-start">
              <h4 className="text-[14px] font-medium text-foreground">Элемент {index + 1}</h4>
              <Button variant="ghost" size="sm" onClick={() => removeItem(index)}>
                <Trash2 className="h-4 w-4 text-muted-foreground/40 hover:text-destructive" />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className={LABEL}>Тип</Label>
                <Select value={item.type} onValueChange={(v) => updateItem(index, "type", v)}>
                  <SelectTrigger className={FIELD_TEXT}><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {typeOptions.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className={LABEL}>Видимость</Label>
                <Select value={item.visibility} onValueChange={(v) => updateItem(index, "visibility", v)}>
                  <SelectTrigger className={FIELD_TEXT}><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {visibilityOptions.map(v => <SelectItem key={v.value} value={v.value}>{v.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <Label className={LABEL}>Название</Label>
              <Input className={FIELD_TEXT} value={item.title} onChange={(e) => updateItem(index, "title", e.target.value)} placeholder="Разбор матча ФК Зенит vs ЦСКА" />
            </div>
            <div className="space-y-1">
              <Label className={LABEL}>Ссылка</Label>
              <Input className={FIELD_TEXT} value={item.url} onChange={(e) => updateItem(index, "url", e.target.value)} placeholder="https://..." />
            </div>
            <div className="space-y-1">
              <Label className={LABEL}>Описание</Label>
              <Textarea className={FIELD_TEXT} value={item.description} onChange={(e) => updateItem(index, "description", e.target.value.slice(0, 300))} placeholder="Краткое описание..." rows={2} />
              <p className={`${HINT} text-right`}>{item.description.length}/300</p>
            </div>
            <div className="space-y-1">
              <Label className={LABEL}>Теги</Label>
              <div className="flex gap-2">
                <Input
                  className={`flex-1 ${FIELD_TEXT}`}
                  value={tagInput[index] || ""}
                  onChange={(e) => setTagInput(prev => ({ ...prev, [index]: e.target.value }))}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag(index))}
                  placeholder="Добавить тег..."
                />
                <Button variant="outline" size="sm" onClick={() => addTag(index)} type="button">+</Button>
              </div>
              {item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {item.tags.map((tag, ti) => (
                    <Badge key={ti} variant="secondary" className="cursor-pointer text-[11px]" onClick={() => removeTag(index, ti)}>
                      {tag} ×
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
