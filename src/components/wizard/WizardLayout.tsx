"use client";

import { useWizardStore } from "@/stores/wizard-store";
import { WizardNavigation } from "./WizardNavigation";
import { QuestionCard } from "./QuestionCard";
import { ProgressBar } from "./ProgressBar";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Save } from "lucide-react";
import { cn } from "@/lib/utils";

interface WizardLayoutProps {
  projectId: string;
}

export function WizardLayout({ projectId }: WizardLayoutProps) {
  const currentSectionIndex = useWizardStore((state) => state.currentSectionIndex);
  const currentQuestionIndex = useWizardStore((state) => state.currentQuestionIndex);
  const nextQuestion = useWizardStore((state) => state.nextQuestion);
  const previousQuestion = useWizardStore((state) => state.previousQuestion);
  const lastSavedAt = useWizardStore((state) => state.lastSavedAt);

  const currentQuestionId = `${projectId}-${currentSectionIndex}-${currentQuestionIndex}`;

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      previousQuestion();
    }
  };

  const handleNext = () => {
    nextQuestion();
  };

  const canGoPrevious = currentQuestionIndex > 0 || currentSectionIndex > 0;

  return (
    <div className="flex min-h-screen bg-background">
      <WizardNavigation projectId={projectId} />

      <div className="flex-1 flex flex-col">
        <div className="border-b bg-card">
          <div className="container max-w-4xl mx-auto p-6">
            <ProgressBar projectId={projectId} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="container max-w-4xl mx-auto p-8">
            <QuestionCard
              projectId={projectId}
              questionId={currentQuestionId}
            />
          </div>
        </div>

        <div className="border-t bg-card">
          <div className="container max-w-4xl mx-auto p-6 flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <Save className="h-4 w-4" />
              {lastSavedAt ? (
                <span>Saved at {new Date(lastSavedAt).toLocaleTimeString()}</span>
              ) : (
                <span>Not saved yet</span>
              )}
            </div>

            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={!canGoPrevious}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button onClick={handleNext}>
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
