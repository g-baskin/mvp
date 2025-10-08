import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { apiSuccess, apiError, validateProjectId } from "@/lib/api-utils"

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

    const project = await prisma.project.findUnique({
      where: { id: validation.data },
      include: {
        outputs: true,
      },
    })

    if (!project) {
      return apiError("Project not found", 404)
    }

    if (project.outputs.length === 0) {
      return apiError("No outputs generated yet. Generate outputs first.", 400)
    }

    const outputsData = project.outputs.map(output => ({
      filename: getFilenameForType(output.type),
      type: output.type,
      content: output.content,
    }))

    return apiSuccess({
      projectName: project.name,
      projectDescription: project.description,
      generatedAt: new Date().toISOString(),
      outputs: outputsData,
    })
  } catch (error) {
    console.error("Download error:", error)
    return apiError(
      error instanceof Error ? error.message : "Failed to fetch outputs",
      500
    )
  }
}

function getFilenameForType(type: string): string {
  const filenameMap: Record<string, string> = {
    features_md: "FEATURES.md",
    code_structure: "CODE_STRUCTURE.md",
    database_schema: "DATABASE_SCHEMA.md",
    api_spec: "API_SPEC.md",
    ui_spec: "UI_SPEC.md",
    testing_plan: "TESTING_PLAN.md",
    deployment_plan: "DEPLOYMENT_PLAN.md",
    project_roadmap: "PROJECT_ROADMAP.md",
  }

  return filenameMap[type] || `${type}.md`
}
