"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ProjectCard } from "@/components/dashboard/ProjectCard"
import { NewProjectDialog } from "@/components/dashboard/NewProjectDialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, FolderOpen } from "lucide-react"

interface Project {
  id: string
  name: string
  description: string | null
  createdAt: string
  updatedAt: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [projects, setProjects] = React.useState<Project[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [isCreating, setIsCreating] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    loadProjects()
  }, [])

  async function loadProjects() {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch("/api/projects")

      if (!response.ok) {
        throw new Error("Failed to load projects")
      }

      const data = await response.json()
      setProjects(data.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load projects")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleCreateProject(data: { name: string; description?: string }) {
    try {
      setIsCreating(true)
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Failed to create project")
      }

      const result = await response.json()
      await loadProjects()
      router.push(`/projects/${result.data.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project")
    } finally {
      setIsCreating(false)
    }
  }

  async function handleDeleteProject(id: string) {
    if (!confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
      return
    }

    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete project")
      }

      await loadProjects()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete project")
    }
  }

  function handleContinueProject(id: string) {
    router.push(`/projects/${id}`)
  }

  function calculateCompletionPercentage(project: Project): number {
    return 0
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10">
            <div className="h-10 bg-muted rounded w-64 mb-2 animate-pulse" />
            <div className="h-6 bg-muted rounded w-96 animate-pulse" />
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-heading text-4xl font-semibold text-foreground mb-2">
                My Projects
              </h1>
              <p className="text-muted-foreground font-body">
                Create and manage your MVP specification projects
              </p>
            </div>
            <NewProjectDialog onCreateProject={handleCreateProject} isLoading={isCreating} />
          </div>

          {error && (
            <Alert variant="destructive" className="mb-8">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-6">
              <FolderOpen className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="font-heading text-2xl font-semibold mb-2">No projects yet</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Get started by creating your first MVP project. You will answer 405 questions to generate complete specifications.
            </p>
            <NewProjectDialog onCreateProject={handleCreateProject} isLoading={isCreating} />
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                id={project.id}
                name={project.name}
                description={project.description}
                completionPercentage={calculateCompletionPercentage(project)}
                lastEdited={new Date(project.updatedAt)}
                onContinue={handleContinueProject}
                onDelete={handleDeleteProject}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
