import { AnswerContext } from "./code-generator"

export interface TemplateData {
  projectName: string
  projectDescription: string
  answers: AnswerContext[]
  sections: SectionSummary[]
}

export interface SectionSummary {
  sectionNumber: number
  sectionTitle: string
  answeredCount: number
  totalQuestions: number
}

export function formatAnswerForMarkdown(answer: AnswerContext): string {
  return `**Q${answer.questionNumber}: ${answer.questionText}**\n\n${answer.answerText}\n\n`
}

export function groupAnswersBySection(answers: AnswerContext[]): Map<number, AnswerContext[]> {
  const grouped = new Map<number, AnswerContext[]>()

  for (const answer of answers) {
    const existing = grouped.get(answer.sectionNumber) || []
    existing.push(answer)
    grouped.set(answer.sectionNumber, existing)
  }

  return grouped
}

export function extractKeyInsights(answers: AnswerContext[]): {
  projectGoal: string
  targetAudience: string
  mvpTimeline: string
  technicalApproach: string
} {
  const projectGoal = answers.find(a => a.sectionNumber === 1 && a.questionNumber === 1)?.answerText || "Not specified"
  const targetAudience = answers.find(a => a.sectionNumber === 1 && a.questionNumber === 2)?.answerText || "Not specified"
  const mvpTimeline = answers.find(a => a.sectionNumber === 18 && a.questionNumber === 1)?.answerText || "Not specified"
  const technicalApproach = answers.find(a => a.sectionNumber === 11 && a.questionNumber === 1)?.answerText || "Not specified"

  return {
    projectGoal,
    targetAudience,
    mvpTimeline,
    technicalApproach,
  }
}

export function generateExecutiveSummary(answers: AnswerContext[], projectName: string): string {
  const insights = extractKeyInsights(answers)

  let content = `# ${projectName} - Executive Summary\n\n`
  content += "*Auto-generated from 405 questionnaire responses*\n\n"

  content += "## Project Goal\n\n"
  content += `${insights.projectGoal}\n\n`

  content += "## Target Audience\n\n"
  content += `${insights.targetAudience}\n\n`

  content += "## MVP Timeline\n\n"
  content += `${insights.mvpTimeline}\n\n`

  content += "## Technical Approach\n\n"
  content += `${insights.technicalApproach}\n\n`

  content += "## Documentation Index\n\n"
  content += "This specification package includes:\n\n"
  content += "1. **FEATURES.md** - Complete feature specifications\n"
  content += "2. **CODE_STRUCTURE.md** - Technical architecture and file structure\n"
  content += "3. **DATABASE_SCHEMA.md** - Data models and database design\n"
  content += "4. **API_SPEC.md** - API endpoints and authentication\n"
  content += "5. **UI_SPEC.md** - Design system and user interface components\n"
  content += "6. **TESTING_PLAN.md** - Testing strategy and quality assurance\n"
  content += "7. **DEPLOYMENT_PLAN.md** - Deployment and infrastructure setup\n"
  content += "8. **PROJECT_ROADMAP.md** - Development milestones and timeline\n\n"

  return content
}

export function generateReadme(answers: AnswerContext[], projectName: string, projectDescription: string): string {
  const insights = extractKeyInsights(answers)

  let content = `# ${projectName}\n\n`
  content += `${projectDescription}\n\n`

  content += "## Overview\n\n"
  content += `${insights.projectGoal}\n\n`

  content += "## Target Users\n\n"
  content += `${insights.targetAudience}\n\n`

  content += "## Tech Stack\n\n"
  content += `${insights.technicalApproach}\n\n`

  content += "## Getting Started\n\n"
  content += "```bash\n"
  content += "# Install dependencies\n"
  content += "npm install\n\n"
  content += "# Setup database\n"
  content += "npm run db:push\n\n"
  content += "# Start development server\n"
  content += "npm run dev\n"
  content += "```\n\n"

  content += "## Documentation\n\n"
  content += "See the `docs/` directory for complete specifications:\n\n"
  content += "- [Features](docs/FEATURES.md)\n"
  content += "- [Code Structure](docs/CODE_STRUCTURE.md)\n"
  content += "- [Database Schema](docs/DATABASE_SCHEMA.md)\n"
  content += "- [API Specification](docs/API_SPEC.md)\n"
  content += "- [UI/UX Design](docs/UI_SPEC.md)\n"
  content += "- [Testing Plan](docs/TESTING_PLAN.md)\n"
  content += "- [Deployment](docs/DEPLOYMENT_PLAN.md)\n"
  content += "- [Roadmap](docs/PROJECT_ROADMAP.md)\n\n"

  return content
}

export function calculateCompletionPercentage(sections: SectionSummary[]): number {
  const totalQuestions = sections.reduce((sum, s) => sum + s.totalQuestions, 0)
  const answeredQuestions = sections.reduce((sum, s) => sum + s.answeredCount, 0)

  if (totalQuestions === 0) return 0

  return Math.round((answeredQuestions / totalQuestions) * 100)
}

export function identifyMissingSections(sections: SectionSummary[]): SectionSummary[] {
  return sections.filter(s => s.answeredCount === 0)
}

export function identifyIncompleteSections(sections: SectionSummary[]): SectionSummary[] {
  return sections.filter(s => s.answeredCount > 0 && s.answeredCount < s.totalQuestions)
}
