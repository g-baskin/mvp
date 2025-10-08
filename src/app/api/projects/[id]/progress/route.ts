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
    const project = await prisma.project.findUnique({
      where: { id: validation.data },
      include: {
        sections: {
          include: {
            answers: true,
          },
        },
      },
    })

    if (!project) {
      return apiError("Project not found", 404)
    }

    const totalQuestions = 405
    const answeredQuestions = project.sections.reduce(
      (sum, section) => sum + section.answers.filter((a) => a.answerText).length,
      0
    )
    const completionPercentage = Math.round((answeredQuestions / totalQuestions) * 100)

    const sectionProgress = project.sections.map((section) => {
      const sectionAnswered = section.answers.filter((a) => a.answerText).length
      const sectionPercentage = section.totalQuestions > 0
        ? Math.round((sectionAnswered / section.totalQuestions) * 100)
        : 0

      return {
        sectionNumber: section.sectionNumber,
        title: section.title,
        answeredQuestions: sectionAnswered,
        totalQuestions: section.totalQuestions,
        completionPercentage: sectionPercentage,
      }
    })

    return apiSuccess({
      projectId: project.id,
      projectName: project.name,
      totalQuestions,
      answeredQuestions,
      completionPercentage,
      sections: sectionProgress,
      lastUpdated: project.updatedAt,
    })
  } catch (error) {
    console.error("Failed to calculate progress:", error)
    return apiError("Failed to calculate progress", 500)
  }
}
