import { NextRequest } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { apiSuccess, apiError, validateRequest, validateProjectId } from "@/lib/api-utils"

const saveAnswerSchema = z.object({
  sectionNumber: z.number().int().min(1).max(18),
  questionNumber: z.number().int().min(1).max(30),
  questionText: z.string().min(1),
  answerText: z.string().max(5000).nullable(),
  aiSuggestion: z.string().optional(),
  isAiGenerated: z.boolean().optional(),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const projectIdValidation = validateProjectId(id)
  if (!projectIdValidation.success) {
    return apiError(projectIdValidation.error, 400)
  }

  const validation = await validateRequest(request, saveAnswerSchema)

  if (!validation.success) {
    return apiError(validation.error, 400)
  }

  const { sectionNumber, questionNumber, questionText, answerText, aiSuggestion, isAiGenerated } = validation.data
  const validatedProjectId = projectIdValidation.data

  try {
    let section = await prisma.section.findUnique({
      where: {
        projectId_sectionNumber: {
          projectId: validatedProjectId,
          sectionNumber,
        },
      },
    })

    if (!section) {
      section = await prisma.section.create({
        data: {
          projectId: validatedProjectId,
          sectionNumber,
          title: `Section ${sectionNumber}`,
          totalQuestions: 0,
        },
      })
    }

    const answer = await prisma.answer.upsert({
      where: {
        sectionId_questionNumber: {
          sectionId: section.id,
          questionNumber,
        },
      },
      update: {
        answerText,
        aiSuggestion: aiSuggestion || undefined,
        isAiGenerated: isAiGenerated || false,
      },
      create: {
        sectionId: section.id,
        questionNumber,
        questionText,
        answerText,
        aiSuggestion: aiSuggestion || undefined,
        isAiGenerated: isAiGenerated || false,
      },
    })

    await prisma.project.update({
      where: { id: validatedProjectId },
      data: { updatedAt: new Date() },
    })

    return apiSuccess(answer, "Answer saved successfully")
  } catch (error) {
    console.error("Failed to save answer:", error)
    return apiError("Failed to save answer", 500)
  }
}
