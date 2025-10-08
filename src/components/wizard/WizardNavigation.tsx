"use client";

import { useWizardStore } from "@/stores/wizard-store";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, Clock } from "lucide-react";

interface WizardNavigationProps {
  projectId: string;
}

const SECTIONS = [
  { number: 1, title: "Project Overview", totalQuestions: 25 },
  { number: 2, title: "Target Audience & Users", totalQuestions: 20 },
  { number: 3, title: "Core Features", totalQuestions: 30 },
  { number: 4, title: "User Experience & Design", totalQuestions: 25 },
  { number: 5, title: "Technical Stack", totalQuestions: 20 },
  { number: 6, title: "Data & Database", totalQuestions: 25 },
  { number: 7, title: "Authentication & Authorization", totalQuestions: 20 },
  { number: 8, title: "API & Integrations", totalQuestions: 20 },
  { number: 9, title: "Business Logic", totalQuestions: 25 },
  { number: 10, title: "Admin & Management", totalQuestions: 20 },
  { number: 11, title: "Testing Strategy", totalQuestions: 20 },
  { number: 12, title: "Performance & Scale", totalQuestions: 20 },
  { number: 13, title: "Security & Privacy", totalQuestions: 25 },
  { number: 14, title: "Deployment & DevOps", totalQuestions: 20 },
  { number: 15, title: "Monitoring & Analytics", totalQuestions: 20 },
  { number: 16, title: "Documentation", totalQuestions: 15 },
  { number: 17, title: "Launch Strategy", totalQuestions: 20 },
  { number: 18, title: "Future Roadmap", totalQuestions: 15 },
];

export function WizardNavigation({ projectId }: WizardNavigationProps) {
  const currentSectionIndex = useWizardStore((state) => state.currentSectionIndex);
  const setCurrentSection = useWizardStore((state) => state.setCurrentSection);
  const answers = useWizardStore((state) => state.answers);

  const getSectionStatus = (sectionIndex: number) => {
    const answeredInSection = Object.keys(answers).filter((key) =>
      key.startsWith(`${projectId}-${sectionIndex}-`)
    ).length;

    const section = SECTIONS[sectionIndex];
    if (!section) return "not-started";

    const totalQuestions = section.totalQuestions;
    const percentComplete = (answeredInSection / totalQuestions) * 100;

    if (percentComplete === 100) return "completed";
    if (percentComplete > 0) return "in-progress";
    return "not-started";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-success" />;
      case "in-progress":
        return <Clock className="h-5 w-5 text-primary" />;
      default:
        return <Circle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <aside className="w-80 border-r bg-card flex flex-col">
      <div className="p-6 border-b">
        <h2 className="font-heading text-lg font-semibold text-foreground">
          Questionnaire Wizard
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          18 sections, 405 questions
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4">
          {SECTIONS.map((section, index) => {
            const status = getSectionStatus(index);
            const isActive = currentSectionIndex === index;

            return (
              <button
                key={section.number}
                onClick={() => setCurrentSection(index)}
                className={cn(
                  "w-full flex items-start gap-4 p-4 rounded-md text-left transition-colors mb-2",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <div className="mt-0.5">{getStatusIcon(status)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium">
                      Section {section.number}
                    </span>
                    {status === "completed" && (
                      <Badge variant="secondary" className="text-xs">
                        Done
                      </Badge>
                    )}
                  </div>
                  <p
                    className={cn(
                      "text-sm font-medium mt-0.5",
                      isActive ? "text-primary-foreground" : "text-foreground"
                    )}
                  >
                    {section.title}
                  </p>
                  <p
                    className={cn(
                      "text-xs mt-0.5",
                      isActive
                        ? "text-primary-foreground/80"
                        : "text-muted-foreground"
                    )}
                  >
                    {section.totalQuestions} questions
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </aside>
  );
}
