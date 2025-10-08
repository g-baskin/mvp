# AI Integration - Contextual Suggestions

AI suggestion system using Claude API for intelligent questionnaire assistance.

## Files Created

### Backend
- **src/lib/ai-helper.ts** - Claude API client with context parsing
- **src/app/api/ai/suggest/route.ts** - POST endpoint for generating suggestions
- **src/app/api/ai/suggest/__tests__/route.test.ts** - Comprehensive test suite

### Frontend
- **src/components/wizard/AiAssistant.tsx** - UI component for AI suggestions

### Configuration
- **.env.local** - Added ANTHROPIC_API_KEY placeholder

## API Endpoint

### POST /api/ai/suggest

Request body:
```json
{
  "projectId": "string",
  "sectionNumber": 1-18,
  "questionNumber": 1-30,
  "questionText": "string"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "suggestion": "AI-generated suggestion text"
  },
  "message": "AI suggestion generated successfully"
}
```

## Context-Aware Suggestions

The AI analyzes:
- Current question text
- Section number and question number
- All previous answers in the same section
- Project context

## Error Handling

- Validates request schema with zod
- Returns 404 if project not found
- Returns 503 if ANTHROPIC_API_KEY not configured
- Returns 500 for general AI generation errors
- Client shows user-friendly error messages

## Usage Example

```tsx
import { AiAssistant } from "@/components/wizard/AiAssistant"

<AiAssistant
  projectId={projectId}
  sectionNumber={currentSection}
  questionNumber={currentQuestion}
  questionText="What problem does your project solve?"
  onSuggestionReceived={(suggestion) => {
    // Handle suggestion (e.g., prefill textarea)
    console.log(suggestion)
  }}
/>
```

## Configuration Required

Add to .env.local:
```
ANTHROPIC_API_KEY="your-anthropic-api-key-here"
```

Get your API key from: https://console.anthropic.com/

## Testing

All tests passing:
- Request validation
- Project not found handling
- Successful suggestion generation
- API key configuration error handling

Run tests:
```bash
npm test -- src/app/api/ai/suggest/__tests__/route.test.ts
```

## Architecture

1. Client requests suggestion via AiAssistant component
2. POST /api/ai/suggest validates request and fetches context
3. ai-helper.ts builds contextual prompt with previous answers
4. Claude API generates relevant suggestion
5. Response streamed back to client
6. UI displays suggestion with loading/error states

## Design System Compliance

- Uses design tokens (bg-primary, text-primary)
- Follows spacing system (p-ds-2, p-ds-3)
- Lucide icons (Sparkles, Loader2)
- Accessible color contrast
- Consistent typography (font-heading, font-body)
