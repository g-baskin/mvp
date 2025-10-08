import { describe, it, expect, vi, beforeEach } from "vitest"
import { POST } from "../route"
import { NextRequest } from "next/server"

vi.mock("@/lib/prisma", () => ({
  prisma: {
    project: {
      findUnique: vi.fn(),
    },
    section: {
      findUnique: vi.fn(),
    },
  },
}))

vi.mock("@/lib/ai-helper", () => ({
  generateAiSuggestion: vi.fn(),
}))

const { prisma } = await import("@/lib/prisma")
const { generateAiSuggestion } = await import("@/lib/ai-helper")

describe("POST /api/ai/suggest", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should validate request body", async () => {
    const request = new NextRequest("http://localhost/api/ai/suggest", {
      method: "POST",
      body: JSON.stringify({}),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error).toContain("Validation failed")
  })

  it("should return 404 for non-existent project", async () => {
    vi.mocked(prisma.project.findUnique).mockResolvedValue(null)

    const request = new NextRequest("http://localhost/api/ai/suggest", {
      method: "POST",
      body: JSON.stringify({
        projectId: "non-existent",
        sectionNumber: 1,
        questionNumber: 1,
        questionText: "What is your project name?",
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.success).toBe(false)
    expect(data.error).toBe("Project not found")
  })

  it("should generate AI suggestion successfully", async () => {
    const mockProject = {
      id: "project-123",
      name: "Test Project",
      description: "Test",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const mockSection = {
      id: "section-123",
      projectId: "project-123",
      sectionNumber: 1,
      title: "Section 1",
      totalQuestions: 5,
      createdAt: new Date(),
      updatedAt: new Date(),
      answers: [
        {
          id: "answer-1",
          sectionId: "section-123",
          questionNumber: 1,
          questionText: "What is your project name?",
          answerText: "My Awesome Project",
          aiSuggestion: null,
          isAiGenerated: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    }

    vi.mocked(prisma.project.findUnique).mockResolvedValue(mockProject)
    vi.mocked(prisma.section.findUnique).mockResolvedValue(mockSection)
    vi.mocked(generateAiSuggestion).mockResolvedValue(
      "Consider describing your project goals and target audience for better clarity."
    )

    const request = new NextRequest("http://localhost/api/ai/suggest", {
      method: "POST",
      body: JSON.stringify({
        projectId: "project-123",
        sectionNumber: 1,
        questionNumber: 2,
        questionText: "What problem does your project solve?",
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data.suggestion).toBeTruthy()
    expect(typeof data.data.suggestion).toBe("string")
  })

  it("should handle AI service configuration error", async () => {
    const mockProject = {
      id: "project-123",
      name: "Test Project",
      description: "Test",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    vi.mocked(prisma.project.findUnique).mockResolvedValue(mockProject)
    vi.mocked(prisma.section.findUnique).mockResolvedValue(null)
    vi.mocked(generateAiSuggestion).mockRejectedValue(
      new Error("ANTHROPIC_API_KEY is not configured")
    )

    const request = new NextRequest("http://localhost/api/ai/suggest", {
      method: "POST",
      body: JSON.stringify({
        projectId: "project-123",
        sectionNumber: 1,
        questionNumber: 1,
        questionText: "What is your project name?",
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(503)
    expect(data.success).toBe(false)
    expect(data.error).toContain("AI service not configured")
  })
})
