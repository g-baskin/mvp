# Feature 1: MVP Questionnaire Wizard

**Purpose**: Enable solo developers and teams to plan, document, and generate AI-buildable specifications for any MVP by answering a comprehensive 405-question questionnaire across 18 strategic categories.

**User Flow**:
1. User creates new project or selects existing project from dashboard
2. User navigates through 18 sections via multi-step wizard with sidebar navigation
3. User answers questions with AI assistance suggesting context-aware answers
4. Progress auto-saves and tracks completion percentage per section and overall
5. User generates complete AI-buildable specification (FEATURES.md, CODE_STRUCTURE.md, DATABASE_SCHEMA.md, API_SPEC.md, etc.)
6. User exports or downloads specification package for Claude Code or other AI builders

## Frontend Requirements

**UI Components**:
- Dashboard: Project cards showing name, completion %, last edited date, continue button
- Multi-step wizard: Sidebar with 18 sections (✅ completed, 🔄 in-progress, ⚪ not-started icons)
- Question cards: Question text, textarea/input for answer, AI suggestion panel
- Progress indicators: Section progress (X/Y questions), overall progress bar
- AI assistant dialog: Context-aware suggestions, regenerate, use/customize buttons
- Export screen: Checklist of outputs to generate, missing sections warning, generate button
- Navigation: Previous/Next buttons, Skip option, Save indicator

**Pages/Layout**:
- `/` - Main dashboard listing all projects with "New Project" button
- `/projects/[id]` - Wizard interface with sidebar navigation
- `/projects/[id]/export` - Export/generate specification screen
- Responsive layout with fixed sidebar (desktop) or collapsible menu (mobile)

**State Management** (Zustand):
- Current project data
- Current section/question position
- All answers (auto-save on blur)
- AI suggestions cache
- Generation status and output files

**User Experience**:
- Auto-save answers every 2 seconds after typing stops
- Visual feedback for save status (saving... / saved ✓)
- AI suggestions appear below question when "Get Help from Claude" clicked
- Keyboard shortcuts: Enter to next question, Ctrl+S to save
- Loading states for AI generation and page transitions
- Success toast when specification generated
- Error handling for failed saves, AI timeouts, generation errors

## Backend Requirements

**API Endpoints**:
- `GET /api/projects` - List all projects with completion stats
- `POST /api/projects` - Create new project (name, description)
- `GET /api/projects/:id` - Get project with all sections and answers
- `PUT /api/projects/:id` - Update project metadata
- `DELETE /api/projects/:id` - Delete project and all related data
- `GET /api/projects/:id/sections` - Get all 18 sections with progress
- `GET /api/projects/:id/sections/:number` - Get specific section (1-18) with questions/answers
- `POST /api/projects/:id/answers` - Save/update answer for specific question
- `GET /api/projects/:id/progress` - Calculate completion percentage
- `POST /api/ai/suggest` - Generate AI suggestion for question (requires: projectId, sectionNumber, questionNumber, questionText, previousAnswers)
- `POST /api/projects/:id/generate` - Generate all specification outputs (FEATURES.md, CODE_STRUCTURE.md, etc.)
- `GET /api/projects/:id/outputs` - List all generated outputs
- `GET /api/projects/:id/download` - Download ZIP of all outputs

**Database Models** (Prisma):
- `Project`: id, name, description, createdAt, updatedAt
- `Section`: id, projectId, sectionNumber (1-18), title, totalQuestions, createdAt, updatedAt
- `Answer`: id, sectionId, questionNumber, questionText, answerText, aiSuggestion, isAiGenerated, createdAt, updatedAt
- `Output`: id, projectId, type (features_md, code_structure, database_schema, etc.), content, createdAt

**Authentication**: None required for MVP (single-user local app)

**Data Validation**:
- Project name: required, 1-100 characters
- Answer text: max 5000 characters per answer
- Section number: 1-18 only
- Question number: 1-30 (varies per section)
- Output type: enum of allowed types

**External APIs**:
- Anthropic Claude API for AI suggestions and code generation
- Uses streaming for real-time AI responses

## Integration & Flow

**Data Flow**:
1. Frontend fetches project → API queries Prisma → Returns project with sections/answers
2. User types answer → Debounced save → POST /api/projects/:id/answers → Prisma upserts answer
3. User clicks "Get Help" → POST /api/ai/suggest with context → Claude analyzes previous answers → Returns contextual suggestion
4. User clicks "Generate" → POST /api/projects/:id/generate → Claude parses all 405 answers → Generates 8 output files → Stores in Output table → Returns file contents

**Real-time Updates**:
- Optimistic UI updates for answer saves
- Polling for generation status (every 2s) with progress percentage

**Error Handling**:
- API errors: Show toast notification with error message, retry button
- AI timeouts: "Claude is taking longer than usual, try again"
- Missing critical sections: Warn before generation, allow "Generate Anyway"
- Network failures: Queue saves locally, sync when online

**Success Indicators**:
- User can create project and navigate wizard
- User can answer questions and see auto-save confirmation
- AI suggestions are contextually relevant (reference previous answers)
- Generated FEATURES.md contains complete feature specification derived from answers
- Generated CODE_STRUCTURE.md contains file/folder layout matching technical answers
- Generated DATABASE_SCHEMA.md contains Prisma models based on data needs
- All outputs can be downloaded as ZIP file
- End-to-end: Answer 405 questions → Generate outputs → Feed to Claude Code → Claude Code can build the MVP
