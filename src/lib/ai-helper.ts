import Anthropic from "@anthropic-ai/sdk"

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
})

export interface AnswerContext {
  sectionNumber: number
  questionNumber: number
  questionText: string
  previousAnswers?: Array<{
    questionNumber: number
    questionText: string
    answerText: string | null
  }>
}

export async function generateAiSuggestion(context: AnswerContext): Promise<string> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not configured")
  }

  const systemPrompt = buildSystemPrompt()
  const userPrompt = buildUserPrompt(context)

  try {
    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: userPrompt,
        },
      ],
    })

    const textContent = message.content.find((block) => block.type === "text")
    if (!textContent || textContent.type !== "text") {
      throw new Error("No text content in AI response")
    }

    return textContent.text
  } catch (error) {
    console.error("AI suggestion failed:", error)
    throw new Error("Failed to generate AI suggestion")
  }
}

function buildSystemPrompt(): string {
  return `You are a helpful assistant that provides thoughtful suggestions for questionnaire answers.

Your role is to:
- Analyze the question and any previous answers for context
- Provide relevant, actionable suggestions
- Keep suggestions concise (2-4 sentences)
- Be specific and practical
- Maintain a professional, helpful tone

Do not:
- Make assumptions about the user's business or goals
- Provide generic advice
- Use marketing jargon
- Give overly long responses`
}

function buildUserPrompt(context: AnswerContext): string {
  let prompt = `Section ${context.sectionNumber}, Question ${context.questionNumber}:\n${context.questionText}\n\n`

  if (context.previousAnswers && context.previousAnswers.length > 0) {
    prompt += "Previous answers in this section:\n"
    context.previousAnswers.forEach((answer) => {
      if (answer.answerText) {
        prompt += `Q${answer.questionNumber}: ${answer.questionText}\nA: ${answer.answerText}\n\n`
      }
    })
    prompt += "\n"
  }

  prompt += "Based on this context, provide a helpful suggestion for answering the current question."

  return prompt
}
