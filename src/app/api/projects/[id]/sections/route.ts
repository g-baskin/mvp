import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { apiSuccess, apiError, validateProjectId } from "@/lib/api-utils"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const validation = validateProjectId(id)
  if (!validation.success) {
    return apiError(validation.error, 400)
  }

  try {
    const sections = await prisma.section.findMany({
      where: { projectId: validation.data },
      include: {
        answers: true,
      },
      orderBy: { sectionNumber: "asc" },
    })

    const sectionsWithProgress = sections.map((section) => {
      const answeredCount = section.answers.filter((a) => a.answerText).length
      const completionPercentage = section.totalQuestions > 0
        ? Math.round((answeredCount / section.totalQuestions) * 100)
        : 0

      return {
        id: section.id,
        sectionNumber: section.sectionNumber,
        title: section.title,
        totalQuestions: section.totalQuestions,
        answeredQuestions: answeredCount,
        completionPercentage,
        createdAt: section.createdAt,
        updatedAt: section.updatedAt,
      }
    })

    return apiSuccess(sectionsWithProgress)
  } catch (error) {
    console.error("Failed to fetch sections:", error)
    return apiError("Failed to fetch sections", 500)
  }
}
