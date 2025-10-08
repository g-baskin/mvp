import { NextRequest } from "next/server"
import { z } from "zod"
import Anthropic from "@anthropic-ai/sdk"
import OpenAI from "openai"
import { prisma } from "@/lib/prisma"
import { apiSuccess, apiError, validateProjectId, validateRequest } from "@/lib/api-utils"

const suggestRequestSchema = z.object({
  provider: z.enum(["claude", "openai", "zai"]).default("claude"),
  questionText: z.string().min(1),
  sectionTitle: z.string().optional(),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params

    const validation = validateProjectId(projectId)
    if (!validation.success) {
      return apiError(validation.error, 400)
    }

    const bodyValidation = await validateRequest(request, suggestRequestSchema)
    if (!bodyValidation.success) {
      return apiError(bodyValidation.error, 400)
    }

    const { provider, questionText, sectionTitle } = bodyValidation.data

    const project = await prisma.project.findUnique({
      where: { id: validation.data },
      include: {
        sections: {
          include: {
            answers: {
              orderBy: {
                questionNumber: "asc",
              },
            },
          },
          orderBy: {
            sectionNumber: "asc",
          },
        },
      },
    })

    if (!project) {
      return apiError("Project not found", 404)
    }

    const previousAnswers = project.sections.flatMap(section =>
      section.answers.map(answer => ({
        section: section.sectionNumber,
        question: answer.questionText,
        answer: answer.answerText,
      }))
    )

    const contextPrompt = buildContextPrompt(
      project.name,
      project.description,
      questionText,
      sectionTitle,
      previousAnswers
    )

    let suggestion: string

    if (provider === "claude") {
      if (!process.env.ANTHROPIC_API_KEY) {
        return apiError("Anthropic API key not configured", 500)
      }
      suggestion = await getClaudeSuggestion(contextPrompt)
    } else if (provider === "openai") {
      if (!process.env.OPENAI_API_KEY) {
        return apiError("OpenAI API key not configured", 500)
      }
      suggestion = await getOpenAISuggestion(contextPrompt)
    } else {
      if (!process.env.ZAI_API_KEY) {
        return apiError("Z.ai API key not configured", 500)
      }
      suggestion = await getZaiSuggestion(contextPrompt)
    }

    return apiSuccess({
      suggestion,
      provider,
      confidence: 0.85,
    })
  } catch (error) {
    console.error("AI suggestion error:", error)
    return apiError(
      error instanceof Error ? error.message : "Failed to generate AI suggestion",
      500
    )
  }
}

function buildContextPrompt(
  projectName: string,
  projectDescription: string,
  currentQuestion: string,
  sectionTitle: string | undefined,
  previousAnswers: Array<{ section: number; question: string; answer: string }>
): string {
  let prompt = `You are helping a user answer questions about their project idea to generate detailed specifications.\n\n`
  prompt += `Project Name: ${projectName}\n`
  if (projectDescription) {
    prompt += `Project Description: ${projectDescription}\n`
  }
  prompt += `\n`

  if (previousAnswers.length > 0) {
    prompt += `Previous answers from this project:\n\n`
    previousAnswers.forEach(({ section, question, answer }) => {
      if (answer && answer.trim()) {
        prompt += `Section ${section} - ${question}\nAnswer: ${answer}\n\n`
      }
    })
  } else {
    prompt += `This is the first question being answered.\n\n`
  }

  if (sectionTitle) {
    prompt += `Current Section: ${sectionTitle}\n`
  }
  prompt += `Current Question: ${currentQuestion}\n\n`
  prompt += `Based on the project context and previous answers, provide a helpful, specific suggestion for answering this question. The suggestion should:\n`
  prompt += `1. Reference relevant details from previous answers\n`
  prompt += `2. Be specific to this project (not generic advice)\n`
  prompt += `3. Be 2-4 sentences long\n`
  prompt += `4. Help the user think through what to include in their answer\n\n`
  prompt += `Provide only the suggestion text, no preamble or meta-commentary.`

  return prompt
}

async function getClaudeSuggestion(prompt: string): Promise<string> {
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY!,
  })

  const message = await anthropic.messages.create({
    model: "claude-3-5-haiku-20241022",
    max_tokens: 300,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  })

  const content = message.content[0]
  if (content.type === "text") {
    return content.text
  }

  throw new Error("Unexpected response format from Claude")
}

async function getOpenAISuggestion(prompt: string): Promise<string> {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
  })

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    max_tokens: 300,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  })

  const content = completion.choices[0]?.message?.content
  if (content) {
    return content
  }

  throw new Error("Unexpected response format from OpenAI")
}

async function getZaiSuggestion(prompt: string): Promise<string> {
  const zai = new OpenAI({
    apiKey: process.env.ZAI_API_KEY!,
    baseURL: "https://api.z.ai/api/paas/v4",
  })

  const completion = await zai.chat.completions.create({
    model: "glm-4.6",
    max_tokens: 300,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  })

  const content = completion.choices[0]?.message?.content
  if (content) {
    return content
  }

  throw new Error("Unexpected response format from Z.ai")
}
