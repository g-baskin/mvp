"use client";

import { useState, useEffect } from "react";
import { useWizardStore } from "@/stores/wizard-store";
import { Progress } from "@/components/ui/progress";
import { getTotalQuestions } from "@/lib/questionnaire-data";

interface ProgressBarProps {
  projectId: string;
}

export function ProgressBar({ projectId }: ProgressBarProps) {
  const answers = useWizardStore((state) => state.answers);
  const skippedQuestions = useWizardStore((state) => state.skippedQuestions);
  const currentSectionIndex = useWizardStore((state) => state.currentSectionIndex);
  const [totalQuestions, setTotalQuestions] = useState(405);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProjectType() {
      try {
        const response = await fetch(`/api/projects/${projectId}`);
        if (response.ok) {
          const data = await response.json();
          const questionnaireType = data.data.questionnaireType || "full";
          setTotalQuestions(getTotalQuestions(questionnaireType));
        }
      } catch (error) {
        console.error("Failed to load project type:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadProjectType();
  }, [projectId]);

  const answeredCount = Object.keys(answers).filter((key) =>
    key.startsWith(`${projectId}-`)
  ).length;

  const skippedCount = Array.from(skippedQuestions).filter((key) =>
    key.startsWith(`${projectId}-`)
  ).length;

  const completedCount = Math.min(answeredCount + skippedCount, totalQuestions);
  const overallProgress = Math.min(Math.round((completedCount / totalQuestions) * 100), 100);

  const answeredInCurrentSection = Object.keys(answers).filter((key) =>
    key.startsWith(`${projectId}-${currentSectionIndex}-`)
  ).length;

  const skippedInCurrentSection = Array.from(skippedQuestions).filter((key) =>
    key.startsWith(`${projectId}-${currentSectionIndex}-`)
  ).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-foreground">Overall Progress</span>
        <span className="text-muted-foreground">
          {isLoading ? "Loading..." : `${completedCount} of ${totalQuestions} questions (${overallProgress}%)`}
        </span>
      </div>
      <Progress value={overallProgress} className="h-2" />

      <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
        <span>Section {currentSectionIndex + 1} of 18</span>
        <span>{answeredInCurrentSection} answered, {skippedInCurrentSection} skipped in this section</span>
      </div>
    </div>
  );
}
