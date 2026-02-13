import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, GraduationCap, Award } from "lucide-react";

export interface Education {
  id?: string;
  institution: string;
  degree: string;
  field_of_study: string;
  start_year: number | null;
  end_year: number | null;
  country: string;
  city: string;
  is_current: boolean;
}

export interface Certificate {
  id?: string;
  name: string;
  issuer: string;
  year: number | null;
  url: string;
}

interface EducationEditorProps {
  education: Education[];
  certificates: Certificate[];
  onEducationChange: (items: Education[]) => void;
  onCertificatesChange: (items: Certificate[]) => void;
}

const degreeOptions = [
  { value: "bachelor", label: "Бакалавр" },
  { value: "master", label: "Магистр" },
  { value: "phd", label: "Кандидат/Доктор наук" },
  { value: "specialist", label: "Специалист" },
  { value: "courses", label: "Курсы" },
  { value: "other", label: "Другое" },
];

const currentYear = new Date().getFullYear();

export function EducationEditor({ education, certificates, onEducationChange, onCertificatesChange }: EducationEditorProps) {
  const addEducation = () => {
    onEducationChange([...education, {
      institution: "", degree: "", field_of_study: "",
      start_year: null, end_year: null, country: "", city: "", is_current: false
    }]);
  };

  const updateEducation = (index: number, field: keyof Education, value: any) => {
    onEducationChange(education.map((e, i) => i === index ? { ...e, [field]: value } : e));
  };

  const removeEducation = (index: number) => {
    onEducationChange(education.filter((_, i) => i !== index));
  };

  const addCertificate = () => {
    onCertificatesChange([...certificates, { name: "", issuer: "", year: null, url: "" }]);
  };

  const updateCertificate = (index: number, field: keyof Certificate, value: any) => {
    onCertificatesChange(certificates.map((c, i) => i === index ? { ...c, [field]: value } : c));
  };

  const removeCertificate = (index: number) => {
    onCertificatesChange(certificates.filter((_, i) => i !== index));
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-display uppercase flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Образование
          </CardTitle>
          <Button variant="outline" size="sm" onClick={addEducation}>
            <Plus className="h-4 w-4 mr-2" />Добавить
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {education.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">Добавьте информацию об образовании</p>
          ) : (
            education.map((edu, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-start">
                  <h4 className="font-medium">Образование {index + 1}</h4>
                  <Button variant="ghost" size="sm" onClick={() => removeEducation(index)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Учебное заведение *</Label>
                    <Input value={edu.institution} onChange={(e) => updateEducation(index, "institution", e.target.value)} placeholder="МГУ им. Ломоносова" />
                  </div>
                  <div className="space-y-2">
                    <Label>Степень/уровень</Label>
                    <Select value={edu.degree} onValueChange={(v) => updateEducation(index, "degree", v)}>
                      <SelectTrigger><SelectValue placeholder="Выберите" /></SelectTrigger>
                      <SelectContent>
                        {degreeOptions.map(d => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Специальность</Label>
                  <Input value={edu.field_of_study} onChange={(e) => updateEducation(index, "field_of_study", e.target.value)} placeholder="Спортивная наука" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Год начала</Label>
                    <Input type="number" min={1970} max={currentYear} value={edu.start_year || ""} onChange={(e) => updateEducation(index, "start_year", parseInt(e.target.value) || null)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Год окончания</Label>
                    <Input type="number" min={1970} max={currentYear + 6} value={edu.end_year || ""} onChange={(e) => updateEducation(index, "end_year", parseInt(e.target.value) || null)} disabled={edu.is_current} />
                  </div>
                  <div className="space-y-2">
                    <Label>Город</Label>
                    <Input value={edu.city} onChange={(e) => updateEducation(index, "city", e.target.value)} placeholder="Москва" />
                  </div>
                  <div className="space-y-2">
                    <Label>Страна</Label>
                    <Input value={edu.country} onChange={(e) => updateEducation(index, "country", e.target.value)} placeholder="Россия" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={edu.is_current} onCheckedChange={(v) => updateEducation(index, "is_current", v)} />
                  <Label>Учусь сейчас</Label>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-display uppercase flex items-center gap-2">
            <Award className="h-5 w-5" />
            Сертификаты
          </CardTitle>
          <Button variant="outline" size="sm" onClick={addCertificate}>
            <Plus className="h-4 w-4 mr-2" />Добавить
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {certificates.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">Добавьте сертификаты и лицензии</p>
          ) : (
            certificates.map((cert, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-start">
                  <h4 className="font-medium">Сертификат {index + 1}</h4>
                  <Button variant="ghost" size="sm" onClick={() => removeCertificate(index)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Название *</Label>
                    <Input value={cert.name} onChange={(e) => updateCertificate(index, "name", e.target.value)} placeholder="UEFA Pro License" />
                  </div>
                  <div className="space-y-2">
                    <Label>Организация</Label>
                    <Input value={cert.issuer} onChange={(e) => updateCertificate(index, "issuer", e.target.value)} placeholder="UEFA" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Год</Label>
                    <Input type="number" min={1990} max={currentYear} value={cert.year || ""} onChange={(e) => updateCertificate(index, "year", parseInt(e.target.value) || null)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Ссылка на подтверждение</Label>
                    <Input value={cert.url} onChange={(e) => updateCertificate(index, "url", e.target.value)} placeholder="https://..." />
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </>
  );
}
