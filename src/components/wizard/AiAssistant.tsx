"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sparkles, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import axios from "axios"

interface AiAssistantProps {
  projectId: string
  sectionNumber: number
  questionNumber: number
  questionText: string
  onSuggestionReceived?: (suggestion: string) => void
  className?: string
}

export function AiAssistant({
  projectId,
  sectionNumber,
  questionNumber,
  questionText,
  onSuggestionReceived,
  className,
}: AiAssistantProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [suggestion, setSuggestion] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleGetSuggestion() {
    setIsLoading(true)
    setError(null)
    setSuggestion(null)

    try {
      const response = await axios.post("/api/ai/suggest", {
        projectId,
        sectionNumber,
        questionNumber,
        questionText,
      })

      if (response.data.success && response.data.data?.suggestion) {
        const newSuggestion = response.data.data.suggestion
        setSuggestion(newSuggestion)
        onSuggestionReceived?.(newSuggestion)
      } else {
        setError("No suggestion received")
      }
    } catch (err) {
      console.error("AI suggestion error:", err)
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        setError(err.response.data.error)
      } else {
        setError("Failed to get AI suggestion. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("rounded-lg border border-border bg-card p-6", className)}>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="font-heading text-lg font-semibold text-card-foreground">
            AI Assistant
          </h3>
        </div>
        <Button
          onClick={handleGetSuggestion}
          disabled={isLoading}
          size="sm"
          variant="outline"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Thinking...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Get Suggestion
            </>
          )}
        </Button>
      </div>

      {suggestion && (
        <div className="rounded-md bg-muted p-4">
          <p className="font-body text-sm text-muted-foreground">{suggestion}</p>
        </div>
      )}

      {error && (
        <div className="rounded-md bg-destructive/10 p-4">
          <p className="font-body text-sm text-destructive">{error}</p>
        </div>
      )}

      {!suggestion && !error && !isLoading && (
        <p className="font-body text-sm text-muted-foreground">
          Click the button above to get an AI-powered suggestion for this question.
        </p>
      )}
    </div>
  )
}
