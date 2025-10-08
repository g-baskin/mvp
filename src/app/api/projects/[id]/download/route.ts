import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { apiError, validateProjectId } from "@/lib/api-utils"
import JSZip from "jszip"

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

    const zip = new JSZip()

    project.outputs.forEach(output => {
      const filename = getFilenameForType(output.type)
      zip.file(filename, output.content)
    })

    const zipBuffer = await zip.generateAsync({ type: "nodebuffer" })

    const sanitizedProjectName = project.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")
    const zipFilename = `${sanitizedProjectName}-specs.zip`

    return new NextResponse(zipBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${zipFilename}"`,
        "Content-Length": zipBuffer.length.toString(),
      },
    })
  } catch (error) {
    console.error("Download error:", error)
    return apiError(
      error instanceof Error ? error.message : "Failed to generate ZIP file",
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
