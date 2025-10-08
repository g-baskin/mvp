"use client";

import { useParams } from "next/navigation";
import { useEffect } from "react";
import { useWizardStore } from "@/stores/wizard-store";
import { WizardLayout } from "@/components/wizard/WizardLayout";

export default function WizardPage() {
  const params = useParams();
  const projectId = params.id as string;
  const setCurrentProject = useWizardStore((state) => state.setCurrentProject);

  useEffect(() => {
    if (projectId) {
      setCurrentProject(projectId);
    }
  }, [projectId, setCurrentProject]);

  return <WizardLayout projectId={projectId} />;
}
