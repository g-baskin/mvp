// Questionnaire data based on Universal_MVP_Onboarding_Template_v2.md

export interface QuestionnaireSection {
  id: number;
  title: string;
  questions: string[];
}

// Short version: ~50 essential questions covering all 18 sections
export const SHORT_QUESTIONNAIRE: QuestionnaireSection[] = [
  {
    id: 1,
    title: "Product/Service Fundamentals",
    questions: [
      "What exactly is your product or service? (Describe in one sentence)",
      "What is the core functionality or primary feature?",
      "What makes this product/service unique or different from alternatives?",
    ],
  },
  {
    id: 2,
    title: "Target Market & Customer",
    questions: [
      "Who is your primary target customer? (Be specific: demographics, role, industry)",
      "What are their biggest frustrations related to your solution space?",
      "What would make them switch from their current solution to yours?",
    ],
  },
  {
    id: 3,
    title: "Problem & Solution Validation",
    questions: [
      "What specific problem are you solving? (One sentence)",
      "How painful is this problem? (Scale: minor inconvenience to business-critical)",
      "How does your solution address the problem better than alternatives?",
    ],
  },
  {
    id: 4,
    title: "Value Proposition & Differentiation",
    questions: [
      "What is your core value proposition? (One sentence)",
      "What are the top 3 benefits customers get from your product?",
      "What is your unfair advantage or competitive moat?",
    ],
  },
  {
    id: 5,
    title: "Business Model & Revenue",
    questions: [
      "How will you make money? (subscription, transaction, license, ads, etc.)",
      "What will you charge? (specific pricing tiers)",
      "What is the customer lifetime value (LTV) vs customer acquisition cost (CAC)?",
    ],
  },
  {
    id: 6,
    title: "Technical Architecture & Development",
    questions: [
      "What technologies will you use for frontend? (React, Vue, native mobile, etc.)",
      "What technologies for backend? (Node.js, Python, Ruby, etc.)",
      "What database will you use? (PostgreSQL, MongoDB, etc.)",
      "What is your MVP development timeline? (weeks/months)",
    ],
  },
  {
    id: 7,
    title: "User Experience & Design",
    questions: [
      "What is the core user journey or workflow?",
      "How many steps does it take for a user to get value?",
      "What is your onboarding flow?",
    ],
  },
  {
    id: 8,
    title: "Go-to-Market Strategy",
    questions: [
      "What is your launch date or target timeframe?",
      "What are your top 3 customer acquisition channels?",
      "Who are your early adopters or lighthouse customers?",
    ],
  },
  {
    id: 9,
    title: "Marketing & Brand",
    questions: [
      "What is your company/product name? Why did you choose it?",
      "What is your tagline or positioning statement?",
      "What types of content will you create? (blog, video, podcast, etc.)",
    ],
  },
  {
    id: 10,
    title: "Sales Strategy",
    questions: [
      "Will you use self-service, sales-assisted, or enterprise sales?",
      "What is your sales cycle length?",
      "What is your lead generation strategy?",
    ],
  },
  {
    id: 11,
    title: "Operations & Infrastructure",
    questions: [
      "Where will your company be located? (physical office, remote, hybrid)",
      "What channels will you offer for customer support? (email, chat, phone)",
      "What is your target response time for support?",
    ],
  },
  {
    id: 12,
    title: "Team & Organization",
    questions: [
      "Who are the founders? What are their backgrounds?",
      "What are the first 3-5 hires you need to make?",
      "When will you make these hires? (pre-launch, post-launch, post-funding)",
    ],
  },
  {
    id: 13,
    title: "Financial Planning",
    questions: [
      "What are your initial startup costs?",
      "How much capital do you need to reach MVP launch?",
      "What are your revenue projections for years 1-3?",
    ],
  },
  {
    id: 14,
    title: "Legal & Compliance",
    questions: [
      "What is your legal entity type? (LLC, C-Corp, etc.)",
      "What regulations apply to your business? (GDPR, HIPAA, SOC 2, etc.)",
    ],
  },
  {
    id: 15,
    title: "Risk Management",
    questions: [
      "What could cause the market to shrink or disappear?",
      "What if customers don't adopt your product?",
      "What is your plan for each major risk?",
    ],
  },
  {
    id: 16,
    title: "Metrics & KPIs",
    questions: [
      "What is your customer acquisition cost (CAC)?",
      "What is your churn rate target?",
      "What are your daily/monthly active users (DAU/MAU) goals?",
    ],
  },
  {
    id: 17,
    title: "Timeline & Milestones",
    questions: [
      "What is your MVP development start date?",
      "What is your target MVP completion date?",
      "When will you reach your first 10 customers? 100? 1,000?",
    ],
  },
  {
    id: 18,
    title: "Long-term Vision & Scale",
    questions: [
      "What is your company's long-term vision (5-10 years)?",
      "What is your ultimate exit strategy (IPO, acquisition, sustainable business)?",
      "What is your revenue target for year 5?",
    ],
  },
];

// Calculate total questions for short version
export const SHORT_TOTAL_QUESTIONS = SHORT_QUESTIONNAIRE.reduce(
  (sum, section) => sum + section.questions.length,
  0
);

// Full version: All 405 questions from the template
// TODO: Populate with all 405 questions from Universal_MVP_Onboarding_Template_v2.md
// For now, using SHORT_QUESTIONNAIRE as a placeholder
export const FULL_QUESTIONNAIRE: QuestionnaireSection[] = SHORT_QUESTIONNAIRE;

export const FULL_TOTAL_QUESTIONS = SHORT_TOTAL_QUESTIONS;

export function getQuestionnaire(type: "full" | "short"): QuestionnaireSection[] {
  return type === "short" ? SHORT_QUESTIONNAIRE : FULL_QUESTIONNAIRE;
}

export function getTotalQuestions(type: "full" | "short"): number {
  return type === "short" ? SHORT_TOTAL_QUESTIONS : FULL_TOTAL_QUESTIONS;
}
