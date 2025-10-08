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
  let content = "# Features Specification\n\n"
  content += "*Auto-generated from MVP Questionnaire responses*\n\n"

  const featureAnswers = answers.filter(a =>
    a.questionText.toLowerCase().includes("product") ||
    a.questionText.toLowerCase().includes("service") ||
    a.questionText.toLowerCase().includes("problem") ||
    a.questionText.toLowerCase().includes("solution") ||
    a.questionText.toLowerCase().includes("value") ||
    a.questionText.toLowerCase().includes("customer") ||
    a.questionText.toLowerCase().includes("unique") ||
    a.questionText.toLowerCase().includes("benefit") ||
    a.questionText.toLowerCase().includes("target") ||
    a.sectionNumber <= 5
  )

  if (featureAnswers.length > 0) {
    const bySection = featureAnswers.reduce((acc, answer) => {
      const key = `Section ${answer.sectionNumber}: ${answer.sectionTitle}`
      if (!acc[key]) {
        acc[key] = []
      }
      acc[key].push(answer)
      return acc
    }, {} as Record<string, AnswerContext[]>)

    for (const [sectionTitle, sectionAnswers] of Object.entries(bySection)) {
      content += `## ${sectionTitle}\n\n`
      for (const answer of sectionAnswers) {
        content += `**${answer.questionText}**\n\n`
        content += `${answer.answerText}\n\n`
      }
    }
  }

  return content
}

export function generateCodeStructureMd(answers: AnswerContext[]): string {
  let content = "# Code Structure\n\n"
  content += "*Auto-generated from technical architecture responses*\n\n"

  const techSections = answers.filter(a =>
    a.sectionTitle.includes("Technical") ||
    a.sectionTitle.includes("Architecture") ||
    a.sectionTitle.includes("Development")
  )

  if (techSections.length > 0) {
    content += "## Technology Stack\n\n"
    for (const answer of techSections) {
      content += `**${answer.questionText}**\n\n`
      content += `${answer.answerText}\n\n`
    }
  }

  content += "## Recommended Directory Structure\n\n"
  content += "```\n"
  content += "project/\n"
  content += "├── src/\n"
  content += "│   ├── app/           # Next.js pages and routes\n"
  content += "│   ├── components/    # Reusable UI components\n"
  content += "│   ├── lib/          # Utilities and helpers\n"
  content += "│   └── stores/       # State management\n"
  content += "├── prisma/\n"
  content += "│   └── schema.prisma # Database schema\n"
  content += "├── public/           # Static assets\n"
  content += "└── tests/            # Test files\n"
  content += "```\n\n"

  return content
}

export function generateDatabaseSchemaMd(answers: AnswerContext[]): string {
  let content = "# Database Schema\n\n"
  content += "*Auto-generated from questionnaire responses*\n\n"

  const relevantAnswers = answers.filter(a =>
    a.questionText.toLowerCase().includes("data") ||
    a.questionText.toLowerCase().includes("model") ||
    a.questionText.toLowerCase().includes("store") ||
    a.questionText.toLowerCase().includes("user") ||
    a.questionText.toLowerCase().includes("database")
  )

  if (relevantAnswers.length > 0) {
    content += "## Data Requirements\n\n"
    for (const answer of relevantAnswers) {
      content += `**${answer.questionText}**\n\n`
      content += `${answer.answerText}\n\n`
    }
  }

  content += "## Starter Prisma Schema\n\n"
  content += "Based on your questionnaire responses, here's a suggested starting schema:\n\n"
  content += "```prisma\n"
  content += "generator client {\n"
  content += "  provider = \"prisma-client-js\"\n"
  content += "}\n\n"
  content += "datasource db {\n"
  content += "  provider = \"postgresql\"\n"
  content += "  url      = env(\"DATABASE_URL\")\n"
  content += "}\n\n"
  content += "model User {\n"
  content += "  id        String   @id @default(cuid())\n"
  content += "  email     String   @unique\n"
  content += "  name      String?\n"
  content += "  createdAt DateTime @default(now())\n"
  content += "  updatedAt DateTime @updatedAt\n"
  content += "}\n\n"
  content += "// TODO: Add additional models based on your specific requirements\n"
  content += "```\n\n"

  return content
}

export function generateApiSpecMd(answers: AnswerContext[]): string {
  let content = "# API Specification\n\n"
  content += "*Auto-generated from questionnaire responses*\n\n"

  const techAnswers = answers.filter(a =>
    a.sectionTitle.includes("Technical") ||
    a.sectionTitle.includes("Architecture") ||
    a.questionText.toLowerCase().includes("api") ||
    a.questionText.toLowerCase().includes("backend") ||
    a.questionText.toLowerCase().includes("endpoint")
  )

  if (techAnswers.length > 0) {
    content += "## API Design Considerations\n\n"
    for (const answer of techAnswers) {
      content += `**${answer.questionText}**\n\n`
      content += `${answer.answerText}\n\n`
    }
  }

  content += "## Recommended API Structure\n\n"
  content += "### RESTful Endpoints\n\n"
  content += "```\n"
  content += "GET    /api/users          # List users\n"
  content += "POST   /api/users          # Create user\n"
  content += "GET    /api/users/:id      # Get user\n"
  content += "PUT    /api/users/:id      # Update user\n"
  content += "DELETE /api/users/:id      # Delete user\n"
  content += "```\n\n"

  content += "### Authentication\n\n"
  content += "Consider using NextAuth.js for authentication:\n\n"
  content += "- JWT-based sessions\n"
  content += "- OAuth providers (Google, GitHub)\n"
  content += "- Email/password authentication\n"
  content += "- Protected API routes with middleware\n\n"

  return content
}

export function generateUiSpecMd(answers: AnswerContext[]): string {
  let content = "# UI/UX Specification\n\n"
  content += "*Auto-generated from questionnaire responses*\n\n"

  const uiAnswers = answers.filter(a =>
    a.sectionTitle.includes("User Experience") ||
    a.sectionTitle.includes("Design") ||
    a.sectionTitle.includes("UX") ||
    a.sectionTitle.includes("UI") ||
    a.questionText.toLowerCase().includes("design") ||
    a.questionText.toLowerCase().includes("user") ||
    a.questionText.toLowerCase().includes("interface") ||
    a.questionText.toLowerCase().includes("flow") ||
    a.questionText.toLowerCase().includes("onboarding")
  )

  if (uiAnswers.length > 0) {
    content += "## User Experience Requirements\n\n"
    for (const answer of uiAnswers) {
      content += `**${answer.questionText}**\n\n`
      content += `${answer.answerText}\n\n`
    }
  }

  content += "## Design System Recommendations\n\n"
  content += "- Use Tailwind CSS for styling consistency\n"
  content += "- Leverage shadcn/ui components for rapid development\n"
  content += "- Implement a consistent color palette from DESIGN_SYSTEM.md\n"
  content += "- Follow accessibility guidelines (WCAG 2.1 AA)\n"
  content += "- Ensure responsive design for mobile, tablet, and desktop\n\n"

  return content
}

export function generateTestingPlanMd(answers: AnswerContext[]): string {
  let content = "# Testing Plan\n\n"
  content += "*Auto-generated from questionnaire responses*\n\n"

  const testingAnswers = answers.filter(a =>
    a.questionText.toLowerCase().includes("test") ||
    a.questionText.toLowerCase().includes("quality") ||
    a.questionText.toLowerCase().includes("validation")
  )

  if (testingAnswers.length > 0) {
    content += "## Testing Requirements\n\n"
    for (const answer of testingAnswers) {
      content += `**${answer.questionText}**\n\n`
      content += `${answer.answerText}\n\n`
    }
  }

  content += "## Recommended Testing Strategy\n\n"
  content += "### Unit Tests\n"
  content += "- Test individual functions and components in isolation\n"
  content += "- Use Jest or Vitest for testing framework\n"
  content += "- Aim for 80%+ code coverage on critical paths\n\n"

  content += "### Integration Tests\n"
  content += "- Test API endpoints with supertest\n"
  content += "- Test database operations with test database\n"
  content += "- Test authentication flows\n\n"

  content += "### End-to-End Tests\n"
  content += "- Use Playwright or Cypress\n"
  content += "- Test critical user journeys\n"
  content += "- Run in CI/CD pipeline before deployment\n\n"

  return content
}

export function generateDeploymentPlanMd(answers: AnswerContext[]): string {
  let content = "# Deployment Plan\n\n"
  content += "*Auto-generated from questionnaire responses*\n\n"

  const deploymentAnswers = answers.filter(a =>
    a.questionText.toLowerCase().includes("deploy") ||
    a.questionText.toLowerCase().includes("hosting") ||
    a.questionText.toLowerCase().includes("infrastructure") ||
    a.questionText.toLowerCase().includes("launch")
  )

  if (deploymentAnswers.length > 0) {
    content += "## Deployment Requirements\n\n"
    for (const answer of deploymentAnswers) {
      content += `**${answer.questionText}**\n\n`
      content += `${answer.answerText}\n\n`
    }
  }

  content += "## Recommended Deployment Strategy\n\n"
  content += "### Hosting Options\n\n"
  content += "**Vercel (Recommended for Next.js)**\n"
  content += "- Zero-config deployment\n"
  content += "- Automatic HTTPS and CDN\n"
  content += "- Serverless functions for API routes\n"
  content += "- Easy preview deployments for PRs\n\n"

  content += "**Alternative Options**\n"
  content += "- Netlify: Similar to Vercel\n"
  content += "- AWS: More control, higher complexity\n"
  content += "- Railway/Render: Good for full-stack apps with databases\n\n"

  content += "### CI/CD Pipeline\n\n"
  content += "1. Push code to GitHub\n"
  content += "2. Run tests automatically\n"
  content += "3. Deploy to staging environment\n"
  content += "4. Manual approval for production\n"
  content += "5. Deploy to production\n\n"

  content += "### Environment Variables\n"
  content += "- Configure in hosting platform dashboard\n"
  content += "- Never commit .env files to git\n"
  content += "- Use different values for staging/production\n\n"

  return content
}

export function generateProjectRoadmapMd(answers: AnswerContext[]): string {
  let content = "# Project Roadmap\n\n"
  content += "*Auto-generated from questionnaire responses*\n\n"

  const roadmapAnswers = answers.filter(a =>
    a.questionText.toLowerCase().includes("timeline") ||
    a.questionText.toLowerCase().includes("milestone") ||
    a.questionText.toLowerCase().includes("launch") ||
    a.questionText.toLowerCase().includes("roadmap") ||
    a.sectionTitle.includes("Go-to-Market") ||
    a.sectionTitle.includes("Strategy")
  )

  if (roadmapAnswers.length > 0) {
    content += "## Project Planning\n\n"
    for (const answer of roadmapAnswers) {
      content += `**${answer.questionText}**\n\n`
      content += `${answer.answerText}\n\n`
    }
  }

  content += "## Suggested Development Phases\n\n"
  content += "### Phase 1: MVP Development (Weeks 1-4)\n"
  content += "- Set up development environment\n"
  content += "- Build core features\n"
  content += "- Implement basic authentication\n"
  content += "- Create essential UI components\n\n"

  content += "### Phase 2: Testing & Refinement (Weeks 5-6)\n"
  content += "- Write and run tests\n"
  content += "- Fix bugs and edge cases\n"
  content += "- Gather feedback from beta users\n"
  content += "- Improve UX based on feedback\n\n"

  content += "### Phase 3: Launch Preparation (Weeks 7-8)\n"
  content += "- Set up production environment\n"
  content += "- Configure monitoring and analytics\n"
  content += "- Prepare marketing materials\n"
  content += "- Conduct security audit\n\n"

  content += "### Phase 4: Launch & Iterate (Week 9+)\n"
  content += "- Launch to target audience\n"
  content += "- Monitor performance and errors\n"
  content += "- Collect user feedback\n"
  content += "- Plan next features based on data\n\n"

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
