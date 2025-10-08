"use client";

import { useState, useEffect } from "react";
import { useWizardStore } from "@/stores/wizard-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { debounce } from "@/lib/utils";

interface QuestionCardProps {
  projectId: string;
  questionId: string;
}

const MOCK_QUESTIONS: Record<number, string[]> = {
  0: [
    "What is the name of your project?",
    "Provide a brief description of your project (1-2 sentences)",
    "What is the primary problem your project solves?",
    "Who is your target audience?",
    "What makes your project unique or different from existing solutions?",
  ],
  1: [
    "Describe your primary user persona in detail",
    "What are the main pain points your users experience?",
    "How tech-savvy is your target audience?",
  ],
};

export function QuestionCard({ projectId, questionId }: QuestionCardProps) {
  const currentSectionIndex = useWizardStore((state) => state.currentSectionIndex);
  const currentQuestionIndex = useWizardStore((state) => state.currentQuestionIndex);
  const saveAnswer = useWizardStore((state) => state.saveAnswer);
  const getAnswer = useWizardStore((state) => state.getAnswer);
  const getAISuggestion = useWizardStore((state) => state.getAISuggestion);
  const addAISuggestion = useWizardStore((state) => state.addAISuggestion);

  const existingAnswer = getAnswer(questionId);
  const existingSuggestion = getAISuggestion(questionId);

  const [answer, setAnswer] = useState<string>(
    existingAnswer?.answer?.toString() || ""
  );
  const [showAISuggestion, setShowAISuggestion] = useState(false);
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  const questions = MOCK_QUESTIONS[currentSectionIndex] || ["Question not available"];
  const questionText = questions[currentQuestionIndex] || "Question not available";

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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              <div className="text-sm text-muted-foreground mb-2">
                Question {currentQuestionIndex + 1}
              </div>
              <CardTitle className="font-heading text-xl">
                {questionText}
              </CardTitle>
            </div>
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
          </div>
        </CardHeader>
        <CardContent>
          <Textarea
            value={answer}
            onChange={(e) => handleAnswerChange(e.target.value)}
            placeholder="Type your answer here..."
            className={cn(
              "min-h-[200px] font-body resize-none",
              "focus-visible:ring-2 focus-visible:ring-primary"
            )}
          />
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
