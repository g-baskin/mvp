import { NextRequest } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { apiSuccess, apiError, validateRequest } from "@/lib/api-utils"
import { generateAiSuggestion } from "@/lib/ai-helper"

const suggestSchema = z.object({
  projectId: z.string().min(1),
  sectionNumber: z.number().int().min(1).max(18),
  questionNumber: z.number().int().min(1).max(30),
  questionText: z.string().min(1),
})

export async function POST(request: NextRequest) {
  const validation = await validateRequest(request, suggestSchema)

  if (!validation.success) {
    return apiError(validation.error, 400)
  }

  const { projectId, sectionNumber, questionNumber, questionText } = validation.data

  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    })

    if (!project) {
      return apiError("Project not found", 404)
    }

    const section = await prisma.section.findUnique({
      where: {
        projectId_sectionNumber: {
          projectId,
          sectionNumber,
        },
      },
      include: {
        answers: {
          where: {
            questionNumber: {
              lt: questionNumber,
            },
          },
          orderBy: {
            questionNumber: "asc",
          },
        },
      },
    })

    const previousAnswers = section?.answers.map((answer) => ({
      questionNumber: answer.questionNumber,
      questionText: answer.questionText,
      answerText: answer.answerText,
    }))

    const suggestion = await generateAiSuggestion({
      sectionNumber,
      questionNumber,
      questionText,
      previousAnswers: previousAnswers || [],
    })

    return apiSuccess(
      { suggestion },
      "AI suggestion generated successfully"
    )
  } catch (error) {
    console.error("AI suggestion error:", error)

    if (error instanceof Error && error.message.includes("ANTHROPIC_API_KEY")) {
      return apiError("AI service not configured. Please add ANTHROPIC_API_KEY to environment variables.", 503)
    }

    return apiError("Failed to generate AI suggestion", 500)
  }
}
