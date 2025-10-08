"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWizardStore } from "@/stores/wizard-store";
import { WizardNavigation } from "./WizardNavigation";
import { QuestionCard } from "./QuestionCard";
import { ProgressBar } from "./ProgressBar";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Save, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { getQuestionnaire } from "@/lib/questionnaire-data";

interface WizardLayoutProps {
  projectId: string;
}

export function WizardLayout({ projectId }: WizardLayoutProps) {
  const router = useRouter();
  const currentSectionIndex = useWizardStore((state) => state.currentSectionIndex);
  const currentQuestionIndex = useWizardStore((state) => state.currentQuestionIndex);
  const setCurrentSection = useWizardStore((state) => state.setCurrentSection);
  const setCurrentQuestion = useWizardStore((state) => state.setCurrentQuestion);
  const lastSavedAt = useWizardStore((state) => state.lastSavedAt);
  const skipQuestion = useWizardStore((state) => state.skipQuestion);

  const [questionnaireType, setQuestionnaireType] = useState<"full" | "short" | "essential">("full");
  const [isLoadingProject, setIsLoadingProject] = useState(true);

  const currentQuestionId = `${projectId}-${currentSectionIndex}-${currentQuestionIndex}`;

  useEffect(() => {
    async function loadProject() {
      try {
        const response = await fetch(`/api/projects/${projectId}`);
        if (response.ok) {
          const data = await response.json();
          setQuestionnaireType(data.data.questionnaireType || "full");
        }
      } catch (error) {
        console.error("Failed to load project:", error);
      } finally {
        setIsLoadingProject(false);
      }
    }
    loadProject();
  }, [projectId]);

  const questionnaire = getQuestionnaire(questionnaireType);

  // Auto-correct invalid wizard position when project loads
  useEffect(() => {
    if (isLoadingProject) return;

    const currentSection = questionnaire[currentSectionIndex];
    const isValidPosition = currentSection && currentQuestionIndex < currentSection.questions.length;

    if (!isValidPosition) {
      console.log('[WizardLayout] Invalid position detected, resetting to first question', {
        currentSectionIndex,
        currentQuestionIndex,
        sectionExists: !!currentSection,
        sectionQuestionCount: currentSection?.questions.length,
      });
      setCurrentSection(0);
      setCurrentQuestion(0);
    }
  }, [isLoadingProject, questionnaireType, currentSectionIndex, currentQuestionIndex, questionnaire, setCurrentSection, setCurrentQuestion]);

  const findNextAvailableQuestion = (sectionIndex: number, questionIndex: number): { section: number; question: number } | null => {
    let currentSection = sectionIndex;
    let currentQuestion = questionIndex + 1;

    while (currentSection < questionnaire.length) {
      const section = questionnaire[currentSection];

      if (currentQuestion < section.questions.length) {
        return { section: currentSection, question: currentQuestion };
      }

      currentSection++;
      currentQuestion = 0;
    }

    return null;
  };

  const findPreviousAvailableQuestion = (sectionIndex: number, questionIndex: number): { section: number; question: number } | null => {
    let currentSection = sectionIndex;
    let currentQuestion = questionIndex - 1;

    while (currentSection >= 0) {
      if (currentQuestion >= 0) {
        return { section: currentSection, question: currentQuestion };
      }

      currentSection--;
      if (currentSection >= 0) {
        currentQuestion = questionnaire[currentSection].questions.length - 1;
      }
    }

    return null;
  };

  const handlePrevious = () => {
    const prev = findPreviousAvailableQuestion(currentSectionIndex, currentQuestionIndex);
    if (prev) {
      if (prev.section !== currentSectionIndex) {
        setCurrentSection(prev.section);
      }
      setCurrentQuestion(prev.question);
    }
  };

  const handleNext = () => {
    const next = findNextAvailableQuestion(currentSectionIndex, currentQuestionIndex);
    if (next) {
      if (next.section !== currentSectionIndex) {
        setCurrentSection(next.section);
      } else {
        setCurrentQuestion(next.question);
      }
    }
  };

  const handleBackToDashboard = () => {
    router.push("/");
  };

  const canGoPrevious = findPreviousAvailableQuestion(currentSectionIndex, currentQuestionIndex) !== null;
  const canGoNext = findNextAvailableQuestion(currentSectionIndex, currentQuestionIndex) !== null;

  return (
    <div className="flex min-h-screen bg-background">
      <WizardNavigation projectId={projectId} />

      <div className="flex-1 flex flex-col">
        <div className="border-b bg-card">
          <div className="container max-w-4xl mx-auto p-6">
            <div className="flex items-center justify-between gap-6 mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBackToDashboard}
                className="gap-2"
              >
                <Home className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </div>
            <ProgressBar projectId={projectId} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="container max-w-4xl mx-auto p-8 space-y-6">
            <QuestionCard
              projectId={projectId}
              questionId={currentQuestionId}
            />

            <div className="border-t pt-6 flex items-center justify-between">
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
                {canGoNext ? (
                  <Button onClick={handleNext}>
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button onClick={handleBackToDashboard} variant="default">
                    Complete Wizard
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
