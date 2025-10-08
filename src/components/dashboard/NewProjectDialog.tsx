"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Plus, FileText, Zap, Target } from "lucide-react"

const projectSchema = z.object({
  name: z.string().min(1, "Project name is required").max(100, "Name too long"),
  description: z.string().max(500, "Description too long").optional(),
  questionnaireType: z.enum(["full", "short", "essential"]).default("full"),
})

type ProjectFormData = z.infer<typeof projectSchema>

interface NewProjectDialogProps {
  onCreateProject: (data: ProjectFormData) => Promise<void>
  isLoading?: boolean
}

export function NewProjectDialog({ onCreateProject, isLoading }: NewProjectDialogProps) {
  const [open, setOpen] = React.useState(false)

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      description: "",
      questionnaireType: "full",
    },
  })

  async function handleSubmit(data: ProjectFormData) {
    try {
      await onCreateProject(data)
      form.reset()
      setOpen(false)
    } catch (error) {
      console.error("Failed to create project:", error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="gap-2">
          <Plus className="h-5 w-5" />
          New Project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl">Create New Project</DialogTitle>
          <DialogDescription>
            Start a new MVP project. Choose from 20 essential, 52 short, or 405 comprehensive questions.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="My Awesome MVP"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Brief description of your project..."
                      className="resize-none"
                      rows={3}
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="questionnaireType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Questionnaire Type</FormLabel>
                  <div className="grid grid-cols-3 gap-3">
                    <Button
                      type="button"
                      variant={field.value === "essential" ? "default" : "outline"}
                      className="h-auto flex-col gap-2 p-4"
                      onClick={() => field.onChange("essential")}
                      disabled={isLoading}
                    >
                      <Target className="h-6 w-6" />
                      <div className="text-center">
                        <div className="font-semibold">Essential</div>
                        <div className="text-xs opacity-80">20 questions</div>
                      </div>
                    </Button>
                    <Button
                      type="button"
                      variant={field.value === "short" ? "default" : "outline"}
                      className="h-auto flex-col gap-2 p-4"
                      onClick={() => field.onChange("short")}
                      disabled={isLoading}
                    >
                      <Zap className="h-6 w-6" />
                      <div className="text-center">
                        <div className="font-semibold">Short</div>
                        <div className="text-xs opacity-80">52 questions</div>
                      </div>
                    </Button>
                    <Button
                      type="button"
                      variant={field.value === "full" ? "default" : "outline"}
                      className="h-auto flex-col gap-2 p-4"
                      onClick={() => field.onChange("full")}
                      disabled={isLoading}
                    >
                      <FileText className="h-6 w-6" />
                      <div className="text-center">
                        <div className="font-semibold">Full</div>
                        <div className="text-xs opacity-80">405 questions</div>
                      </div>
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Project"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
