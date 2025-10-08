// Questionnaire data based on Universal_MVP_Onboarding_Template_v2.md

export interface Question {
  text: string;
  examples?: string[];
}

export interface QuestionnaireSection {
  id: number;
  title: string;
  questions: (string | Question)[];
}

// Short version: ~50 essential questions covering all 18 sections
export const SHORT_QUESTIONNAIRE: QuestionnaireSection[] = [
  {
    id: 1,
    title: "Product/Service Fundamentals",
    questions: [
      {
        text: "What exactly is your product or service? (Describe in one sentence)",
        examples: [
          "A mobile app that connects local dog walkers with busy pet owners",
          "An AI-powered code review tool that catches security vulnerabilities before deployment",
          "A subscription box service delivering curated snacks from around the world"
        ]
      },
      {
        text: "What is the core functionality or primary feature?",
        examples: [
          "Real-time GPS tracking so pet owners can see their dog's walk route",
          "Automated scanning of pull requests with instant security alerts",
          "Monthly delivery of 15-20 unique snacks with tasting notes and origin stories"
        ]
      },
      {
        text: "What makes this product/service unique or different from alternatives?",
        examples: [
          "We verify all walkers with background checks and require pet first-aid certification",
          "Our AI is trained on 10M+ security incidents, not just basic pattern matching",
          "Every box includes a cultural guide and video content from local producers"
        ]
      },
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

// Essential version: 20 most critical questions for AI code agencies to build an MVP
export const ESSENTIAL_QUESTIONNAIRE: QuestionnaireSection[] = [
  {
    id: 1,
    title: "Product Core (5 questions)",
    questions: [
      {
        text: "What exactly is your product or service? (Describe in one sentence)",
        examples: [
          "A mobile app that connects local dog walkers with busy pet owners",
          "An AI-powered code review tool that catches security vulnerabilities before deployment",
          "A subscription box service delivering curated snacks from around the world"
        ]
      },
      {
        text: "What is the core functionality or primary feature?",
        examples: [
          "Real-time GPS tracking so pet owners can see their dog's walk route",
          "Automated scanning of pull requests with instant security alerts",
          "Monthly delivery of 15-20 unique snacks with tasting notes and origin stories"
        ]
      },
      {
        text: "Who is your primary target customer? (Be specific: demographics, role, industry)",
        examples: [
          "Urban professionals aged 25-45 who work long hours and own dogs",
          "Engineering managers at Series A-C startups with 10-100 developers",
          "Food enthusiasts aged 30-55 with disposable income who love trying new things"
        ]
      },
      {
        text: "What specific problem are you solving? (One sentence)",
        examples: [
          "Busy pet owners can't walk their dogs during work hours and don't trust random strangers",
          "Security vulnerabilities slip into production because manual code review misses subtle bugs",
          "People want to discover authentic international snacks but can't travel or find them locally"
        ]
      },
      {
        text: "What is the core user journey or workflow?",
        examples: [
          "Pet owner books walker → Walker picks up dog → Real-time GPS tracking → Photo/report after walk → Payment processed",
          "Developer creates PR → AI scans code → Security issues flagged → Developer fixes → Approved for merge",
          "Subscribe → Receive box monthly → Scan QR code for info → Rate snacks → Get personalized next box"
        ]
      },
    ],
  },
  {
    id: 2,
    title: "Technical Specifications (5 questions)",
    questions: [
      {
        text: "What technologies will you use for frontend? (React, Vue, native mobile, etc.)",
        examples: [
          "React Native for iOS and Android mobile apps",
          "Next.js 14 with TypeScript for web dashboard",
          "Vue.js 3 with Composition API for admin panel"
        ]
      },
      {
        text: "What technologies for backend? (Node.js, Python, Ruby, etc.)",
        examples: [
          "Node.js with Express and TypeScript",
          "Python with FastAPI for ML model serving",
          "Ruby on Rails for rapid MVP development"
        ]
      },
      {
        text: "What database will you use? (PostgreSQL, MongoDB, etc.)",
        examples: [
          "PostgreSQL for relational data with PostGIS extension for location features",
          "MongoDB for flexible document storage of code analysis results",
          "PostgreSQL with Redis for caching and real-time features"
        ]
      },
      {
        text: "What is your MVP development timeline? (weeks/months)",
        examples: [
          "8 weeks to first working prototype, 12 weeks to public beta",
          "4 weeks for core features, 8 weeks for polish and testing",
          "6 weeks development, 2 weeks testing, 10 weeks total to launch"
        ]
      },
      {
        text: "What regulations apply to your business? (GDPR, HIPAA, SOC 2, etc.)",
        examples: [
          "GDPR for EU users, background check compliance for walker verification",
          "SOC 2 Type II for enterprise customers, GDPR for code repository access",
          "GDPR for customer data, FDA food safety labeling requirements"
        ]
      },
    ],
  },
  {
    id: 3,
    title: "Features & Scope (4 questions)",
    questions: [
      {
        text: "What makes this product/service unique or different from alternatives?",
        examples: [
          "We verify all walkers with background checks and require pet first-aid certification",
          "Our AI is trained on 10M+ security incidents, not just basic pattern matching",
          "Every box includes a cultural guide and video content from local producers"
        ]
      },
      {
        text: "How many steps does it take for a user to get value?",
        examples: [
          "3 steps: Sign up → Book walker → Get walk report",
          "2 steps: Connect GitHub → See first security scan",
          "1 step: Subscribe and wait for first box delivery"
        ]
      },
      {
        text: "What is your onboarding flow?",
        examples: [
          "Download app → Create profile → Add dog details → Verify ID → Book first walk",
          "Connect GitHub → Select repos to scan → Configure notification preferences → Done",
          "Enter shipping address → Select dietary preferences → Choose payment plan → Subscribe"
        ]
      },
      {
        text: "What are the top 3 benefits customers get from your product?",
        examples: [
          "1) Peace of mind with certified walkers, 2) Real-time GPS tracking, 3) Happy, exercised dogs",
          "1) Catch vulnerabilities before production, 2) Save 4+ hours/week on code review, 3) Sleep better at night",
          "1) Discover authentic snacks, 2) Learn about different cultures, 3) Convenient monthly delivery"
        ]
      },
    ],
  },
  {
    id: 4,
    title: "Business Model (3 questions)",
    questions: [
      {
        text: "How will you make money? (subscription, transaction, license, ads, etc.)",
        examples: [
          "Transaction fee: 20% commission on each walk booking",
          "Subscription: $49/month per team for unlimited scans",
          "Subscription: $29/month for monthly box delivery"
        ]
      },
      {
        text: "What will you charge? (specific pricing tiers)",
        examples: [
          "$15-30 per 30-minute walk depending on area, we take $3-6 per walk",
          "Starter: $49/month (1-5 devs), Team: $199/month (6-25 devs), Enterprise: Custom pricing",
          "Monthly: $29, Quarterly: $79 ($26/month), Annual: $299 ($25/month)"
        ]
      },
      {
        text: "What is your launch date or target timeframe?",
        examples: [
          "Private beta in 8 weeks (March 2024), public launch in 12 weeks (April 2024)",
          "Soft launch to 10 beta customers in 4 weeks, full launch in 8 weeks",
          "Launch in time for holiday season (October 2024), 6 months from now"
        ]
      },
    ],
  },
  {
    id: 5,
    title: "Success Metrics (3 questions)",
    questions: [
      {
        text: "What is your target MVP completion date?",
        examples: [
          "March 15, 2024 for beta version with core booking and tracking features",
          "End of Q1 2024 with GitHub integration and basic scanning",
          "August 1, 2024 ready for first batch of 100 subscribers"
        ]
      },
      {
        text: "What is your customer acquisition cost (CAC)?",
        examples: [
          "$30 per pet owner (Facebook/Instagram ads + referral program)",
          "$500 per team (content marketing + sales outreach)",
          "$15 per subscriber (influencer partnerships + Instagram ads)"
        ]
      },
      {
        text: "What are your daily/monthly active users (DAU/MAU) goals?",
        examples: [
          "Year 1: 500 MAU, Year 2: 2,000 MAU with 30% DAU/MAU ratio",
          "Year 1: 100 teams (500 developers), Year 2: 500 teams (2,500 developers)",
          "Year 1: 1,000 active subscribers, Year 2: 5,000 active subscribers"
        ]
      },
    ],
  },
];

export const ESSENTIAL_TOTAL_QUESTIONS = ESSENTIAL_QUESTIONNAIRE.reduce(
  (sum, section) => sum + section.questions.length,
  0
);

// Full version: All 405 questions from the template
// TODO: Populate with all 405 questions from Universal_MVP_Onboarding_Template_v2.md
// For now, using SHORT_QUESTIONNAIRE as a placeholder
export const FULL_QUESTIONNAIRE: QuestionnaireSection[] = SHORT_QUESTIONNAIRE;

export const FULL_TOTAL_QUESTIONS = SHORT_TOTAL_QUESTIONS;

export function getQuestionnaire(type: "full" | "short" | "essential"): QuestionnaireSection[] {
  if (type === "essential") return ESSENTIAL_QUESTIONNAIRE;
  if (type === "short") return SHORT_QUESTIONNAIRE;
  return FULL_QUESTIONNAIRE;
}

export function getTotalQuestions(type: "full" | "short" | "essential"): number {
  if (type === "essential") return ESSENTIAL_TOTAL_QUESTIONS;
  if (type === "short") return SHORT_TOTAL_QUESTIONS;
  return FULL_TOTAL_QUESTIONS;
}

export function getQuestionText(question: string | Question): string {
  return typeof question === "string" ? question : question.text;
}

export function getQuestionExamples(question: string | Question): string[] | undefined {
  return typeof question === "string" ? undefined : question.examples;
}
