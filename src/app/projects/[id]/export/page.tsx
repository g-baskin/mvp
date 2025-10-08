"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Download, FileText, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react"

interface OutputFile {
  filename: string
  type: string
  content: string
}

interface DownloadData {
  projectName: string
  projectDescription: string
  generatedAt: string
  outputs: OutputFile[]
}

export default function ExportPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string

  const [isGenerating, setIsGenerating] = useState(false)
  const [hasGenerated, setHasGenerated] = useState(false)
  const [downloadData, setDownloadData] = useState<DownloadData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [generationProgress, setGenerationProgress] = useState(0)

  const checkExistingOutputs = useCallback(async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/download`)
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data.outputs.length > 0) {
          setDownloadData(data.data)
          setHasGenerated(true)
        }
      }
    } catch (err) {
      console.error("Failed to check outputs:", err)
    }
  }, [projectId])

  useEffect(() => {
    checkExistingOutputs()
  }, [checkExistingOutputs])

  async function handleGenerate() {
    setIsGenerating(true)
    setError(null)
    setGenerationProgress(0)

    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => Math.min(prev + 10, 90))
    }, 200)

    try {
      const response = await fetch(`/api/projects/${projectId}/generate`, {
        method: "POST",
      })

      clearInterval(progressInterval)
      setGenerationProgress(100)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Generation failed")
      }

      const result = await response.json()

      if (result.success) {
        setHasGenerated(true)
        await checkExistingOutputs()
      }
    } catch (err) {
      clearInterval(progressInterval)
      setError(err instanceof Error ? err.message : "Failed to generate outputs")
    } finally {
      setIsGenerating(false)
    }
  }

  function downloadFile(filename: string, content: string) {
    const blob = new Blob([content], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  function downloadAllFiles() {
    if (!downloadData) return

    downloadData.outputs.forEach(output => {
      setTimeout(() => {
        downloadFile(output.filename, output.content)
      }, 100)
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => router.push(`/projects/${projectId}`)}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Wizard
        </Button>

        <div className="mb-8">
          <h1 className="font-heading text-4xl font-semibold text-foreground mb-2">
            Export Specifications
          </h1>
          <p className="text-muted-foreground font-body">
            Generate and download AI-buildable specification documents
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="font-heading">Generation Status</CardTitle>
            <CardDescription className="font-body">
              {hasGenerated
                ? "Specifications are ready for download"
                : "Generate complete specification package from your answers"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isGenerating && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground font-body">
                  Generating specifications...
                </p>
                <Progress value={generationProgress} />
              </div>
            )}

            {!hasGenerated && !isGenerating && (
              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full"
              >
                <FileText className="mr-2 h-4 w-4" />
                Generate Specifications
              </Button>
            )}

            {hasGenerated && downloadData && (
              <div className="space-y-4">
                <div className="flex items-center gap-2" style={{ color: "hsl(var(--success))" }}>
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-body font-medium">
                    {downloadData.outputs.length} documents generated
                  </span>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h3 className="font-heading font-semibold">Available Documents</h3>
                  <div className="grid gap-2">
                    {downloadData.outputs.map((output, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 rounded-md bg-secondary/50"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="font-body text-sm">{output.filename}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => downloadFile(output.filename, output.content)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="flex gap-2">
                  <Button onClick={downloadAllFiles} className="flex-1">
                    <Download className="mr-2 h-4 w-4" />
                    Download All
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleGenerate}
                    disabled={isGenerating}
                  >
                    Regenerate
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-heading">What You&apos;ll Get</CardTitle>
            <CardDescription className="font-body">
              Complete AI-buildable specification package
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {[
                { name: "FEATURES.md", desc: "Complete feature specifications" },
                { name: "CODE_STRUCTURE.md", desc: "Technical architecture and file structure" },
                { name: "DATABASE_SCHEMA.md", desc: "Data models and database design" },
                { name: "API_SPEC.md", desc: "API endpoints and authentication" },
                { name: "UI_SPEC.md", desc: "Design system and UI components" },
                { name: "TESTING_PLAN.md", desc: "Testing strategy and quality assurance" },
                { name: "DEPLOYMENT_PLAN.md", desc: "Deployment and infrastructure" },
                { name: "PROJECT_ROADMAP.md", desc: "Development milestones" },
              ].map((doc, index) => (
                <div key={index} className="flex items-start gap-2">
                  <Badge variant="outline" className="mt-1">
                    {index + 1}
                  </Badge>
                  <div>
                    <p className="font-body font-medium">{doc.name}</p>
                    <p className="font-body text-sm text-muted-foreground">{doc.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
