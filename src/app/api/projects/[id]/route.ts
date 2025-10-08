import { NextRequest } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { apiSuccess, apiError, validateRequest, validateProjectId } from "@/lib/api-utils"

const updateProjectSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
})

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
          orderBy: { sectionNumber: "asc" },
        },
      },
    })

    if (!project) {
      return apiError("Project not found", 404)
    }

    return apiSuccess(project)
  } catch (error) {
    console.error("Failed to fetch project:", error)
    return apiError("Failed to fetch project", 500)
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const projectIdValidation = validateProjectId(id)
  if (!projectIdValidation.success) {
    return apiError(projectIdValidation.error, 400)
  }

  const validation = await validateRequest(request, updateProjectSchema)

  if (!validation.success) {
    return apiError(validation.error, 400)
  }

  try {
    const project = await prisma.project.update({
      where: { id: projectIdValidation.data },
      data: validation.data,
    })

    return apiSuccess(project, "Project updated successfully")
  } catch (error) {
    console.error("Failed to update project:", error)
    return apiError("Failed to update project", 500)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const validation = validateProjectId(id)
  if (!validation.success) {
    return apiError(validation.error, 400)
  }

  try {
    await prisma.project.delete({
      where: { id: validation.data },
    })

    return apiSuccess(null, "Project deleted successfully")
  } catch (error) {
    console.error("Failed to delete project:", error)
    return apiError("Failed to delete project", 500)
  }
}
