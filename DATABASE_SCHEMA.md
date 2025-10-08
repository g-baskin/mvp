# Database Schema Documentation

## Overview

SQLite database with 4 core models for MVP Questionnaire Wizard:
- **Project**: Top-level container for each MVP planning session
- **Section**: 18 predefined sections containing questions
- **Answer**: Individual question responses with AI assistance
- **Output**: Generated specification files (FEATURES.md, CODE_STRUCTURE.md, etc.)

## Models

### Project
```prisma
model Project {
  id          String    @id @default(cuid())
  name        String
  description String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  sections    Section[]
  outputs     Output[]

  @@index([createdAt])
}
```

**Purpose**: Container for MVP planning project
**Relationships**:
- Has many Sections (1:N)
- Has many Outputs (1:N)
**Constraints**:
- name: required, 1-100 characters
- Cascade delete sections and outputs when project deleted

### Section
```prisma
model Section {
  id             String   @id @default(cuid())
  projectId      String
  sectionNumber  Int
  title          String
  totalQuestions Int      @default(0)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  project        Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  answers        Answer[]

  @@unique([projectId, sectionNumber])
  @@index([projectId])
}
```

**Purpose**: One of 18 predefined questionnaire sections
**Relationships**:
- Belongs to Project (N:1)
- Has many Answers (1:N)
**Constraints**:
- Unique combination of projectId + sectionNumber
- sectionNumber: 1-18 only
- Cascade delete answers when section deleted

**18 Sections**:
1. Project Vision & Purpose
2. Target Audience & Market
3. Core Features & Functionality
4. User Experience & Interface
5. Technical Architecture
6. Data & Database Design
7. Authentication & Security
8. API Design & Integration
9. Frontend Framework & Styling
10. State Management
11. Form Handling & Validation
12. File Upload & Storage
13. Search & Filtering
14. Notifications & Messaging
15. Analytics & Monitoring
16. Testing Strategy
17. Deployment & DevOps
18. Future Roadmap

### Answer
```prisma
model Answer {
  id             String   @id @default(cuid())
  sectionId      String
  questionNumber Int
  questionText   String
  answerText     String?
  aiSuggestion   String?
  isAiGenerated  Boolean  @default(false)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  section        Section  @relation(fields: [sectionId], references: [id], onDelete: Cascade)

  @@unique([sectionId, questionNumber])
  @@index([sectionId])
}
```

**Purpose**: Single question-answer pair within a section
**Relationships**:
- Belongs to Section (N:1)
**Constraints**:
- Unique combination of sectionId + questionNumber
- answerText: max 5000 characters
- questionNumber: 1-30 (varies per section)

### Output
```prisma
model Output {
  id        String   @id @default(cuid())
  projectId String
  type      String
  content   String
  createdAt DateTime @default(now())
  project   Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@unique([projectId, type])
  @@index([projectId])
}
```

**Purpose**: Generated specification file from AI processing
**Relationships**:
- Belongs to Project (N:1)
**Constraints**:
- Unique combination of projectId + type
- type: enum (features_md, code_structure, database_schema, api_spec, etc.)

**Output Types**:
- `features_md`: Complete feature specification
- `code_structure`: File/folder layout
- `database_schema`: Prisma models
- `api_spec`: API endpoint documentation
- `ui_components`: Component specifications
- `state_management`: State architecture
- `testing_plan`: Testing strategy
- `deployment_guide`: Deployment instructions

## Relationships Diagram

```
Project (1)
  ├─ Sections (N) [18 sections per project]
  │    └─ Answers (N) [varies per section, ~405 total]
  └─ Outputs (N) [8 output types]
```

## Indexes

- **Project.createdAt**: List projects by creation date
- **Section.projectId**: Fetch all sections for project
- **Answer.sectionId**: Fetch all answers for section
- **Output.projectId**: Fetch all outputs for project

## Data Flow

1. **Create Project**: User creates project → Creates 18 sections automatically
2. **Answer Questions**: User answers questions → Upsert Answer records
3. **AI Suggestions**: User requests help → Store in Answer.aiSuggestion
4. **Generate Outputs**: Parse all answers → Create Output records
5. **Export**: Zip all Output.content files

## Query Patterns

### Get Project with All Data
```typescript
const project = await prisma.project.findUnique({
  where: { id: projectId },
  include: {
    sections: {
      include: {
        answers: true,
      },
    },
    outputs: true,
  },
})
```

### Calculate Progress
```typescript
const sections = await prisma.section.findMany({
  where: { projectId },
  include: {
    _count: {
      select: { answers: true },
    },
  },
})

const totalQuestions = sections.reduce((sum, s) => sum + s.totalQuestions, 0)
const answeredQuestions = sections.reduce((sum, s) => sum + s._count.answers, 0)
const percentage = (answeredQuestions / totalQuestions) * 100
```

### Save Answer with Auto-Update
```typescript
await prisma.answer.upsert({
  where: {
    sectionId_questionNumber: {
      sectionId,
      questionNumber,
    },
  },
  create: {
    sectionId,
    questionNumber,
    questionText,
    answerText,
  },
  update: {
    answerText,
    updatedAt: new Date(),
  },
})
```

## Migration Commands

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Open database GUI
npm run db:studio
```

## Notes

- SQLite used for development (easy local setup)
- Can switch to PostgreSQL for production (update DATABASE_URL)
- All IDs use cuid() for URL-safe identifiers
- Cascade deletes prevent orphaned records
- Timestamps track creation and updates
- Unique constraints prevent duplicate data
