import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

// Standard API response format
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Project ID validation schema
export const projectIdSchema = z.string().min(1, "Project ID is required")

// Success response helper
export function apiSuccess<T>(data: T, message?: string): NextResponse<ApiResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    message,
  })
}

// Error response helper
export function apiError(error: string, status: number = 400): NextResponse<ApiResponse> {
  return NextResponse.json({
    success: false,
    error,
  }, { status })
}

// Request validation helper
export async function validateRequest<T>(
  request: NextRequest,
  schema: z.ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; error: string }> {
  try {
    const body = await request.json()
    const data = schema.parse(body)
    return { success: true, data }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: `Validation failed: ${error.errors.map(e => e.message).join(", ")}`,
      }
    }
    return { success: false, error: "Invalid request body" }
  }
}

// CORS headers helper
export function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  }
}

// Validate project ID from route params
export function validateProjectId(projectId: string): { success: true; data: string } | { success: false; error: string } {
  const result = projectIdSchema.safeParse(projectId)

  if (!result.success) {
    return {
      success: false,
      error: `Invalid project ID: ${result.error.errors.map(e => e.message).join(", ")}`,
    }
  }

  return { success: true, data: result.data }
}
