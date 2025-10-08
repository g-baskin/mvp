"use client";

import { useWizardStore } from "@/stores/wizard-store";
import { Progress } from "@/components/ui/progress";

interface ProgressBarProps {
  projectId: string;
}

const TOTAL_QUESTIONS = 405;

export function ProgressBar({ projectId }: ProgressBarProps) {
  const answers = useWizardStore((state) => state.answers);
  const currentSectionIndex = useWizardStore((state) => state.currentSectionIndex);

  const answeredCount = Object.keys(answers).filter((key) =>
    key.startsWith(`${projectId}-`)
  ).length;

  const overallProgress = Math.round((answeredCount / TOTAL_QUESTIONS) * 100);

  const answeredInCurrentSection = Object.keys(answers).filter((key) =>
    key.startsWith(`${projectId}-${currentSectionIndex}-`)
  ).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-foreground">Overall Progress</span>
        <span className="text-muted-foreground">
          {answeredCount} of {TOTAL_QUESTIONS} questions ({overallProgress}%)
        </span>
      </div>
      <Progress value={overallProgress} className="h-2" />

      <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
        <span>Section {currentSectionIndex + 1} of 18</span>
        <span>{answeredInCurrentSection} answered in this section</span>
      </div>
    </div>
  );
}
