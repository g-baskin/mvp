"use client";

import { useState, useEffect } from "react";
import { useWizardStore } from "@/stores/wizard-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sparkles, Loader2, SkipForward, Lightbulb, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { debounce } from "@/lib/utils";
import { getQuestionnaire, getQuestionText, getQuestionExamples } from "@/lib/questionnaire-data";

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

  const [questionnaireType, setQuestionnaireType] = useState<"full" | "short" | "essential">("full");
  const [isLoadingProject, setIsLoadingProject] = useState(true);
  const [aiProvider, setAiProvider] = useState<"claude" | "openai" | "zai">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("aiProvider");
      return (saved as "claude" | "openai" | "zai") || "claude";
    }
    return "claude";
  });

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
  const currentQuestion = currentSection?.questions[currentQuestionIndex];
  const questionText = currentQuestion ? getQuestionText(currentQuestion) : "Question not available";
  const questionExamples = currentQuestion ? getQuestionExamples(currentQuestion) : undefined;
  const isQuestionAvailable = questionText !== "Question not available";

  const [showExamples, setShowExamples] = useState(false);

  console.log('[QuestionCard Debug]', {
    questionnaireType,
    currentSectionIndex,
    currentQuestionIndex,
    questionnaireLength: questionnaire.length,
    currentSectionTitle: currentSection?.title,
    currentSectionQuestionsCount: currentSection?.questions.length,
    questionText: questionText.substring(0, 50),
    hasExamples: !!questionExamples,
  });

  const debouncedSave = debounce((value: unknown, qText: string) => {
    saveAnswer(questionId, value as string, qText);
  }, 2000);

  useEffect(() => {
    const existingAnswer = getAnswer(questionId);
    setAnswer(existingAnswer?.answer?.toString() || "");
    setShowAISuggestion(false);
  }, [questionId, getAnswer]);

  const handleAnswerChange = (value: string) => {
    setAnswer(value);
    debouncedSave(value, questionText);
  };

  const handleGetAIHelp = async () => {
    setIsLoadingAI(true);
    setShowAISuggestion(true);

    try {
      const response = await fetch(`/api/projects/${projectId}/ai-suggest`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          provider: aiProvider,
          questionText,
          sectionTitle: currentSection?.title,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get AI suggestion");
      }

      const result = await response.json();
      if (result.success) {
        addAISuggestion(questionId, result.data.suggestion, result.data.confidence);
      }
    } catch (error) {
      console.error("AI suggestion error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to get AI suggestion. Please try again.";
      addAISuggestion(questionId, `Error: ${errorMessage}`, 0);
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleProviderChange = (provider: "claude" | "openai" | "zai") => {
    setAiProvider(provider);
    localStorage.setItem("aiProvider", provider);
  };

  const getProviderLabel = (provider: string) => {
    const labels = {
      claude: "Claude (Anthropic)",
      openai: "GPT-4 (OpenAI)",
      zai: "GLM-4.6 (Z.ai)",
    };
    return labels[provider as keyof typeof labels] || provider;
  };

  const handleUseSuggestion = () => {
    if (existingSuggestion) {
      setAnswer(existingSuggestion.suggestion);
      saveAnswer(questionId, existingSuggestion.suggestion, questionText);
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
                <>
                  {questionExamples && questionExamples.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowExamples(true)}
                      className="gap-2 text-amber-600 hover:text-amber-700 border-amber-300 hover:border-amber-400"
                    >
                      <Lightbulb className="h-4 w-4" />
                      Examples
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSkip}
                    className="gap-2"
                  >
                    <SkipForward className="h-4 w-4" />
                    Skip
                  </Button>
                  <div className="flex items-center gap-1">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1 px-2"
                        >
                          {getProviderLabel(aiProvider).split("(")[0].trim()}
                          <ChevronDown className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleProviderChange("claude")}
                          className={aiProvider === "claude" ? "bg-accent" : ""}
                        >
                          Claude (Anthropic)
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleProviderChange("openai")}
                          className={aiProvider === "openai" ? "bg-accent" : ""}
                        >
                          GPT-4 (OpenAI)
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleProviderChange("zai")}
                          className={aiProvider === "zai" ? "bg-accent" : ""}
                        >
                          GLM-4.6 (Z.ai)
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleGetAIHelp}
                      disabled={isLoadingAI}
                      className="gap-1"
                    >
                      {isLoadingAI ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Sparkles className="h-4 w-4" />
                      )}
                      Get Help
                    </Button>
                  </div>
                </>
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
                <span>{getProviderLabel(aiProvider).split("(")[0].trim()} is thinking...</span>
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

      <Dialog open={showExamples} onOpenChange={setShowExamples}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <Lightbulb className="h-6 w-6 text-amber-500" />
              <DialogTitle className="font-heading text-xl">Example Answers</DialogTitle>
            </div>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Here are some example answers to help guide your response:
            </p>
            {questionExamples?.map((example, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200">
                  <span className="text-sm font-semibold text-amber-700 mt-0.5">
                    {index + 1}.
                  </span>
                  <p className="text-sm font-body text-foreground flex-1">
                    {example}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setAnswer(example);
                    saveAnswer(questionId, example, questionText);
                    setShowExamples(false);
                  }}
                  className="ml-8"
                >
                  Use this example
                </Button>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
