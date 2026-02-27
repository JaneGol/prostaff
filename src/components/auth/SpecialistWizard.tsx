import { useState } from "react";
import { Button } from "@/components/ui/button";
import { StepGroupSelect } from "./steps/StepGroupSelect";
import { StepRoleSelect } from "./steps/StepRoleSelect";
import { StepSportSelect } from "./steps/StepSportSelect";
import { StepLevelSelect } from "./steps/StepLevelSelect";
import { StepCredentials } from "./steps/StepCredentials";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface WizardData {
  groupId: string | null;
  roleId: string | null;
  customRoleTitle: string;
  sportIds: string[];
  level: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

interface Props {
  onComplete: (data: WizardData) => Promise<void>;
  isSubmitting: boolean;
}

const STEPS = ["Направление", "Роль", "Спорт", "Уровень", "Аккаунт"];

export function SpecialistWizard({ onComplete, isSubmitting }: Props) {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = back
  const [data, setData] = useState<WizardData>({
    groupId: null,
    roleId: null,
    customRoleTitle: "",
    sportIds: [],
    level: "middle",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const progress = ((step + 1) / STEPS.length) * 100;

  const canNext = (): boolean => {
    switch (step) {
      case 0: return !!data.groupId;
      case 1: return !!data.roleId || data.customRoleTitle.trim().length > 0;
      case 2: return data.sportIds.length > 0;
      case 3: return !!data.level;
      case 4: return data.firstName.trim().length > 0 && data.lastName.trim().length > 0 && data.email.includes("@") && data.password.length >= 6;
      default: return false;
    }
  };

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setDirection(1);
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setDirection(-1);
      setStep(step - 1);
    }
  };

  const handleSubmit = () => {
    if (canNext()) onComplete(data);
  };

  const update = (patch: Partial<WizardData>) => setData(prev => ({ ...prev, ...patch }));

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Шаг {step + 1} из {STEPS.length}</span>
          <span>{STEPS[step]}</span>
        </div>
        <Progress value={progress} className="h-1.5" />
      </div>

      {/* Step Content */}
      <div className="min-h-[280px] overflow-hidden relative">
        <AnimatePresence mode="wait" initial={false} custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            initial={{ opacity: 0, x: direction * 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -60 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            {step === 0 && (
              <StepGroupSelect
                selectedGroupId={data.groupId}
                onSelect={(groupId) => update({ groupId, roleId: null, customRoleTitle: "" })}
              />
            )}
            {step === 1 && (
              <StepRoleSelect
                groupId={data.groupId!}
                selectedRoleId={data.roleId}
                customRoleTitle={data.customRoleTitle}
                onSelectRole={(roleId) => update({ roleId, customRoleTitle: "" })}
                onCustomRole={(title) => update({ customRoleTitle: title, roleId: null })}
              />
            )}
            {step === 2 && (
              <StepSportSelect
                selectedSportIds={data.sportIds}
                onToggle={(id) =>
                  update({
                    sportIds: data.sportIds.includes(id)
                      ? data.sportIds.filter((s) => s !== id)
                      : [...data.sportIds, id],
                  })
                }
              />
            )}
            {step === 3 && (
              <StepLevelSelect
                selected={data.level}
                onSelect={(level) => update({ level })}
              />
            )}
            {step === 4 && (
              <StepCredentials
                data={data}
                onChange={update}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        {step > 0 && (
          <Button variant="outline" onClick={handleBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Назад
          </Button>
        )}
        <div className="flex-1" />
        {step < STEPS.length - 1 ? (
          <Button onClick={handleNext} disabled={!canNext()}>
            Далее
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={!canNext() || isSubmitting}>
            {isSubmitting ? "Регистрация..." : "Зарегистрироваться"}
          </Button>
        )}
      </div>
    </div>
  );
}
