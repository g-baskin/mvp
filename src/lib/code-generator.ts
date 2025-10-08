import { prisma } from "./prisma"

export interface GeneratedOutput {
  type: string
  content: string
  filename: string
}

export interface AnswerContext {
  sectionNumber: number
  sectionTitle: string
  questionNumber: number
  questionText: string
  answerText: string
}

export async function parseProjectAnswers(projectId: string): Promise<AnswerContext[]> {
  const sections = await prisma.section.findMany({
    where: { projectId },
    include: {
      answers: {
        orderBy: { questionNumber: "asc" },
      },
    },
    orderBy: { sectionNumber: "asc" },
  })

  const contexts: AnswerContext[] = []

  for (const section of sections) {
    for (const answer of section.answers) {
      if (answer.answerText) {
        contexts.push({
          sectionNumber: section.sectionNumber,
          sectionTitle: section.title,
          questionNumber: answer.questionNumber,
          questionText: answer.questionText,
          answerText: answer.answerText,
        })
      }
    }
  }

  return contexts
}

export function generateFeaturesMd(answers: AnswerContext[]): string {
  const projectOverview = answers.find(a => a.sectionNumber === 1 && a.questionNumber === 1)
  const targetUsers = answers.find(a => a.sectionNumber === 1 && a.questionNumber === 2)
  const coreProblem = answers.find(a => a.sectionNumber === 1 && a.questionNumber === 3)

  let content = "# Features Specification\n\n"
  content += "*Auto-generated from MVP Questionnaire responses*\n\n"

  if (projectOverview) {
    content += "## Project Overview\n\n"
    content += `${projectOverview.answerText}\n\n`
  }

  if (targetUsers) {
    content += "## Target Users\n\n"
    content += `${targetUsers.answerText}\n\n`
  }

  if (coreProblem) {
    content += "## Problem Statement\n\n"
    content += `${coreProblem.answerText}\n\n`
  }

  const featuresBySection = answers
    .filter(a => a.sectionNumber >= 2 && a.sectionNumber <= 10)
    .reduce((acc, answer) => {
      const key = answer.sectionTitle
      if (!acc[key]) {
        acc[key] = []
      }
      acc[key].push(answer)
      return acc
    }, {} as Record<string, AnswerContext[]>)

  content += "## Core Features\n\n"
  for (const [sectionTitle, sectionAnswers] of Object.entries(featuresBySection)) {
    content += `### ${sectionTitle}\n\n`
    for (const answer of sectionAnswers) {
      content += `**${answer.questionText}**\n\n`
      content += `${answer.answerText}\n\n`
    }
  }

  return content
}

export function generateCodeStructureMd(answers: AnswerContext[]): string {
  const techStack = answers.filter(a => a.sectionNumber === 11)
  const architecture = answers.filter(a => a.sectionNumber === 12)

  let content = "# Code Structure\n\n"
  content += "*Auto-generated from technical architecture responses*\n\n"

  content += "## Technology Stack\n\n"
  for (const answer of techStack) {
    content += `**${answer.questionText}**\n\n`
    content += `${answer.answerText}\n\n`
  }

  content += "## Architecture Decisions\n\n"
  for (const answer of architecture) {
    content += `**${answer.questionText}**\n\n`
    content += `${answer.answerText}\n\n`
  }

  content += "## Directory Structure\n\n"
  content += "```\n"
  content += "project/\n"
  content += "├── src/\n"
  content += "│   ├── app/\n"
  content += "│   ├── components/\n"
  content += "│   ├── lib/\n"
  content += "│   └── stores/\n"
  content += "├── prisma/\n"
  content += "│   └── schema.prisma\n"
  content += "├── public/\n"
  content += "└── package.json\n"
  content += "```\n\n"

  return content
}

export function generateDatabaseSchemaMd(answers: AnswerContext[]): string {
  const dataModels = answers.filter(a => a.sectionNumber === 13)

  let content = "# Database Schema\n\n"
  content += "*Auto-generated from data modeling responses*\n\n"

  content += "## Data Models\n\n"
  for (const answer of dataModels) {
    content += `**${answer.questionText}**\n\n`
    content += `${answer.answerText}\n\n`
  }

  content += "## Prisma Schema\n\n"
  content += "```prisma\n"
  content += "generator client {\n"
  content += "  provider = \"prisma-client-js\"\n"
  content += "}\n\n"
  content += "datasource db {\n"
  content += "  provider = \"postgresql\"\n"
  content += "  url      = env(\"DATABASE_URL\")\n"
  content += "}\n\n"
  content += "// TODO: Define models based on data requirements\n"
  content += "```\n\n"

  return content
}

export function generateApiSpecMd(answers: AnswerContext[]): string {
  const apiAnswers = answers.filter(a => a.sectionNumber === 14)

  let content = "# API Specification\n\n"
  content += "*Auto-generated from API design responses*\n\n"

  content += "## API Endpoints\n\n"
  for (const answer of apiAnswers) {
    content += `**${answer.questionText}**\n\n`
    content += `${answer.answerText}\n\n`
  }

  content += "## Authentication\n\n"
  const authAnswers = answers.filter(a => a.sectionNumber === 15)
  for (const answer of authAnswers) {
    content += `**${answer.questionText}**\n\n`
    content += `${answer.answerText}\n\n`
  }

  return content
}

export function generateUiSpecMd(answers: AnswerContext[]): string {
  const uiAnswers = answers.filter(a => a.sectionNumber >= 7 && a.sectionNumber <= 9)

  let content = "# UI/UX Specification\n\n"
  content += "*Auto-generated from design and user experience responses*\n\n"

  content += "## Design System\n\n"
  const designAnswers = uiAnswers.filter(a => a.sectionNumber === 7)
  for (const answer of designAnswers) {
    content += `**${answer.questionText}**\n\n`
    content += `${answer.answerText}\n\n`
  }

  content += "## User Flows\n\n"
  const flowAnswers = uiAnswers.filter(a => a.sectionNumber === 8)
  for (const answer of flowAnswers) {
    content += `**${answer.questionText}**\n\n`
    content += `${answer.answerText}\n\n`
  }

  content += "## Components\n\n"
  const componentAnswers = uiAnswers.filter(a => a.sectionNumber === 9)
  for (const answer of componentAnswers) {
    content += `**${answer.questionText}**\n\n`
    content += `${answer.answerText}\n\n`
  }

  return content
}

export function generateTestingPlanMd(answers: AnswerContext[]): string {
  const testingAnswers = answers.filter(a => a.sectionNumber === 16)

  let content = "# Testing Plan\n\n"
  content += "*Auto-generated from testing strategy responses*\n\n"

  content += "## Testing Strategy\n\n"
  for (const answer of testingAnswers) {
    content += `**${answer.questionText}**\n\n`
    content += `${answer.answerText}\n\n`
  }

  return content
}

export function generateDeploymentPlanMd(answers: AnswerContext[]): string {
  const deploymentAnswers = answers.filter(a => a.sectionNumber === 17)

  let content = "# Deployment Plan\n\n"
  content += "*Auto-generated from deployment strategy responses*\n\n"

  content += "## Deployment Strategy\n\n"
  for (const answer of deploymentAnswers) {
    content += `**${answer.questionText}**\n\n`
    content += `${answer.answerText}\n\n`
  }

  return content
}

export function generateProjectRoadmapMd(answers: AnswerContext[]): string {
  const roadmapAnswers = answers.filter(a => a.sectionNumber === 18)

  let content = "# Project Roadmap\n\n"
  content += "*Auto-generated from project planning responses*\n\n"

  content += "## Milestones\n\n"
  for (const answer of roadmapAnswers) {
    content += `**${answer.questionText}**\n\n`
    content += `${answer.answerText}\n\n`
  }

  return content
}

export async function generateAllOutputs(projectId: string): Promise<GeneratedOutput[]> {
  const answers = await parseProjectAnswers(projectId)

  const outputs: GeneratedOutput[] = [
    {
      type: "features_md",
      filename: "FEATURES.md",
      content: generateFeaturesMd(answers),
    },
    {
      type: "code_structure",
      filename: "CODE_STRUCTURE.md",
      content: generateCodeStructureMd(answers),
    },
    {
      type: "database_schema",
      filename: "DATABASE_SCHEMA.md",
      content: generateDatabaseSchemaMd(answers),
    },
    {
      type: "api_spec",
      filename: "API_SPEC.md",
      content: generateApiSpecMd(answers),
    },
    {
      type: "ui_spec",
      filename: "UI_SPEC.md",
      content: generateUiSpecMd(answers),
    },
    {
      type: "testing_plan",
      filename: "TESTING_PLAN.md",
      content: generateTestingPlanMd(answers),
    },
    {
      type: "deployment_plan",
      filename: "DEPLOYMENT_PLAN.md",
      content: generateDeploymentPlanMd(answers),
    },
    {
      type: "project_roadmap",
      filename: "PROJECT_ROADMAP.md",
      content: generateProjectRoadmapMd(answers),
    },
  ]

  await prisma.$transaction(async (tx) => {
    for (const output of outputs) {
      await tx.output.upsert({
        where: {
          projectId_type: {
            projectId,
            type: output.type,
          },
        },
        update: {
          content: output.content,
        },
        create: {
          projectId,
          type: output.type,
          content: output.content,
        },
      })
    }
  })

  return outputs
}
