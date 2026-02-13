import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, FolderOpen } from "lucide-react";
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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-display uppercase flex items-center gap-2">
          <FolderOpen className="h-5 w-5" />
          Портфолио
        </CardTitle>
        <Button variant="outline" size="sm" onClick={addItem}>
          <Plus className="h-4 w-4 mr-2" />Добавить
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-muted-foreground">
          Добавьте примеры работ: видеоразборы, дашборды, публикации, презентации
        </p>
        {items.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">Нет элементов портфолио</p>
        ) : (
          items.map((item, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-4">
              <div className="flex justify-between items-start">
                <h4 className="font-medium">Элемент {index + 1}</h4>
                <Button variant="ghost" size="sm" onClick={() => removeItem(index)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Тип</Label>
                  <Select value={item.type} onValueChange={(v) => updateItem(index, "type", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {typeOptions.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Видимость</Label>
                  <Select value={item.visibility} onValueChange={(v) => updateItem(index, "visibility", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {visibilityOptions.map(v => <SelectItem key={v.value} value={v.value}>{v.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Название *</Label>
                <Input value={item.title} onChange={(e) => updateItem(index, "title", e.target.value)} placeholder="Разбор матча ФК Зенит vs ЦСКА" />
              </div>
              <div className="space-y-2">
                <Label>Ссылка *</Label>
                <Input value={item.url} onChange={(e) => updateItem(index, "url", e.target.value)} placeholder="https://..." />
              </div>
              <div className="space-y-2">
                <Label>Описание (до 300 знаков)</Label>
                <Textarea value={item.description} onChange={(e) => updateItem(index, "description", e.target.value.slice(0, 300))} placeholder="Краткое описание..." rows={2} />
                <p className="text-xs text-muted-foreground text-right">{item.description.length}/300</p>
              </div>
              <div className="space-y-2">
                <Label>Теги</Label>
                <div className="flex gap-2">
                  <Input
                    value={tagInput[index] || ""}
                    onChange={(e) => setTagInput(prev => ({ ...prev, [index]: e.target.value }))}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag(index))}
                    placeholder="Добавить тег..."
                    className="flex-1"
                  />
                  <Button variant="outline" size="sm" onClick={() => addTag(index)} type="button">+</Button>
                </div>
                {item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {item.tags.map((tag, ti) => (
                      <Badge key={ti} variant="secondary" className="cursor-pointer" onClick={() => removeTag(index, ti)}>
                        {tag} ×
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
