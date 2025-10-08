"use client";

import { useState, useEffect } from "react";
import { useWizardStore } from "@/stores/wizard-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Sparkles, Loader2, SkipForward } from "lucide-react";
import { cn } from "@/lib/utils";
import { debounce } from "@/lib/utils";
import { getQuestionnaire } from "@/lib/questionnaire-data";

interface QuestionCardProps {
  projectId: string;
  questionId: string;
}

export function QuestionCard({ projectId, questionId }: QuestionCardProps) {
  const currentSectionIndex = useWizardStore((state) => state.currentSectionIndex);
  const currentQuestionIndex = useWizardStore((state) => state.currentQuestionIndex);
  const saveAnswer = useWizardStore((state) => state.saveAnswer);
  const getAnswer = useWizardStore((state) => state.getAnswer);
  const getAISuggestion = useWizardStore((state) => state.getAISuggestion);
  const addAISuggestion = useWizardStore((state) => state.addAISuggestion);
  const nextQuestion = useWizardStore((state) => state.nextQuestion);
  const skipQuestion = useWizardStore((state) => state.skipQuestion);

  const [questionnaireType, setQuestionnaireType] = useState<"full" | "short">("full");
  const [isLoadingProject, setIsLoadingProject] = useState(true);

  const existingAnswer = getAnswer(questionId);
  const existingSuggestion = getAISuggestion(questionId);

  const [answer, setAnswer] = useState<string>(
    existingAnswer?.answer?.toString() || ""
  );
  const [showAISuggestion, setShowAISuggestion] = useState(false);
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  // Load project to get questionnaire type
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
  const currentSection = questionnaire[currentSectionIndex];
  const questionText = currentSection?.questions[currentQuestionIndex] || "Question not available";
  const isQuestionAvailable = questionText !== "Question not available";

  console.log('[QuestionCard Debug]', {
    questionnaireType,
    currentSectionIndex,
    currentQuestionIndex,
    questionnaireLength: questionnaire.length,
    currentSectionTitle: currentSection?.title,
    currentSectionQuestionsCount: currentSection?.questions.length,
    questionText: questionText.substring(0, 50),
  });

  const debouncedSave = debounce((value: unknown) => {
    saveAnswer(questionId, value as string);
  }, 2000);

  useEffect(() => {
    const existingAnswer = getAnswer(questionId);
    setAnswer(existingAnswer?.answer?.toString() || "");
    setShowAISuggestion(false);
  }, [questionId, getAnswer]);

  const handleAnswerChange = (value: string) => {
    setAnswer(value);
    debouncedSave(value);
  };

  const handleGetAIHelp = async () => {
    setIsLoadingAI(true);
    setShowAISuggestion(true);

    setTimeout(() => {
      const mockSuggestion = `Based on your previous answers, here's a suggestion for "${questionText}":\n\nConsider focusing on the specific user needs and pain points you identified earlier. Your answer should align with the project goals and target audience.`;
      addAISuggestion(questionId, mockSuggestion, 0.85);
      setIsLoadingAI(false);
    }, 1500);
  };

  const handleUseSuggestion = () => {
    if (existingSuggestion) {
      setAnswer(existingSuggestion.suggestion);
      saveAnswer(questionId, existingSuggestion.suggestion);
    }
  };

  const handleSkip = () => {
    if (skipQuestion) {
      skipQuestion(questionId);
      nextQuestion();
    }
  };

  if (isLoadingProject) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center gap-4 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading question...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              <div className="text-sm text-muted-foreground mb-2">
                Section {currentSectionIndex + 1}: {currentSection?.title || "Loading..."}
              </div>
              <CardTitle className="font-heading text-xl">
                Question {currentQuestionIndex + 1}: {questionText}
              </CardTitle>
            </div>
            <div className="flex items-center gap-2">
              {!isQuestionAvailable ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSkip}
                  className="gap-2"
                >
                  <SkipForward className="h-4 w-4" />
                  Skip
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGetAIHelp}
                  disabled={isLoadingAI}
                >
                  {isLoadingAI ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  Get Help from Claude
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!isQuestionAvailable ? (
            <Alert>
              <AlertDescription>
                This question is not available in the {questionnaireType === "short" ? "short" : "full"} questionnaire. Click "Skip" to continue to the next question.
              </AlertDescription>
            </Alert>
          ) : (
            <Textarea
              value={answer}
              onChange={(e) => handleAnswerChange(e.target.value)}
              placeholder="Type your answer here..."
              className={cn(
                "min-h-[200px] font-body resize-none",
                "focus-visible:ring-2 focus-visible:ring-primary"
              )}
            />
          )}
        </CardContent>
      </Card>

      {showAISuggestion && (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Sparkles className="h-5 w-5 text-primary" />
              <CardTitle className="font-heading text-lg">
                AI Suggestion
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingAI ? (
              <div className="flex items-center gap-4 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Claude is thinking...</span>
              </div>
            ) : existingSuggestion ? (
              <div className="space-y-6">
                <Alert>
                  <AlertDescription className="font-body whitespace-pre-wrap">
                    {existingSuggestion.suggestion}
                  </AlertDescription>
                </Alert>
                <div className="flex items-center gap-4">
                  <Button onClick={handleUseSuggestion} size="sm">
                    Use This Suggestion
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleGetAIHelp}
                    size="sm"
                  >
                    Regenerate
                  </Button>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
