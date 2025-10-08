import { NextRequest } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { apiSuccess, apiError, validateRequest } from "@/lib/api-utils"

const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  questionnaireType: z.enum(["full", "short"]).default("full"),
})

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        sections: {
          include: {
            answers: true,
          },
        },
      },
    })

    const projectsWithStats = projects.map((project) => {
      const totalQuestions = 405
      const answeredQuestions = project.sections.reduce(
        (sum, section) => sum + section.answers.filter((a) => a.answerText).length,
        0
      )
      const completionPercentage = Math.round((answeredQuestions / totalQuestions) * 100)

      return {
        id: project.id,
        name: project.name,
        description: project.description,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        completionPercentage,
        answeredQuestions,
        totalQuestions,
      }
    })

    return apiSuccess(projectsWithStats)
  } catch (error) {
    console.error("Failed to fetch projects:", error)
    return apiError("Failed to fetch projects", 500)
  }
}

export async function POST(request: NextRequest) {
  const validation = await validateRequest(request, createProjectSchema)

  if (!validation.success) {
    return apiError(validation.error, 400)
  }

  try {
    const project = await prisma.project.create({
      data: {
        name: validation.data.name,
        description: validation.data.description || "",
        questionnaireType: validation.data.questionnaireType,
      },
    })

    return apiSuccess(project, "Project created successfully")
  } catch (error) {
    console.error("Failed to create project:", error)
    return apiError("Failed to create project", 500)
  }
}
