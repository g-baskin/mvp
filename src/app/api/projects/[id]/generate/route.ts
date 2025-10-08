import { NextRequest } from "next/server"
import { apiSuccess, apiError, validateProjectId } from "@/lib/api-utils"
import { generateAllOutputs } from "@/lib/code-generator"
import { prisma } from "@/lib/prisma"

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

    const project = await prisma.project.findUnique({
      where: { id: validation.data },
    })

    if (!project) {
      return apiError("Project not found", 404)
    }

    const outputs = await generateAllOutputs(validation.data)

    return apiSuccess({
      generated: outputs.length,
      outputs: outputs.map(o => ({
        type: o.type,
        filename: o.filename,
      })),
      message: `Generated ${outputs.length} specification documents`,
    })
  } catch (error) {
    console.error("Generation error:", error)
    return apiError(
      error instanceof Error ? error.message : "Failed to generate outputs",
      500
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params

    const validation = validateProjectId(projectId)
    if (!validation.success) {
      return apiError(validation.error, 400)
    }

    const outputs = await prisma.output.findMany({
      where: { projectId: validation.data },
      select: {
        id: true,
        type: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    })

    return apiSuccess({
      outputs,
      total: outputs.length,
    })
  } catch (error) {
    console.error("Fetch outputs error:", error)
    return apiError(
      error instanceof Error ? error.message : "Failed to fetch outputs",
      500
    )
  }
}
