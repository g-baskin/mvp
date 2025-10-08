"use client"

import * as React from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreVertical, Play, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"

interface ProjectCardProps {
  id: string
  name: string
  description?: string | null
  completionPercentage: number
  lastEdited: Date
  onContinue: (id: string) => void
  onDelete: (id: string) => void
}

export function ProjectCard({
  id,
  name,
  description,
  completionPercentage,
  lastEdited,
  onContinue,
  onDelete,
}: ProjectCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="font-heading text-xl mb-1">{name}</CardTitle>
            {description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {description}
              </p>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => onDelete(id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <Badge variant={completionPercentage === 100 ? "default" : "secondary"}>
              {completionPercentage}%
            </Badge>
          </div>
          <Progress value={completionPercentage} className="h-2" />
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between pt-4 border-t">
        <span className="text-sm text-muted-foreground">
          {formatDistanceToNow(new Date(lastEdited), { addSuffix: true })}
        </span>
        <Button
          onClick={() => onContinue(id)}
          size="sm"
          className={cn(
            completionPercentage === 100 ? "bg-success hover:opacity-90" : ""
          )}
        >
          <Play className="h-4 w-4 mr-1" />
          {completionPercentage === 100 ? "Review" : "Continue"}
        </Button>
      </CardFooter>
    </Card>
  )
}
