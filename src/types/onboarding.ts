export type OnboardingState = "complete" | "current" | "upcoming";
export type RequirementState = "complete" | "pending" | "optional";

export interface OnboardingStep {
  id: string;
  number: number;
  title: string;
  state: OnboardingState;
}

export interface SetupTask {
  id: string;
  title: string;
  description: string;
  state: "complete" | "next" | "optional";
  guideUrl?: string;
}

export interface AccessRequirement {
  id: string;
  label: string;
  state: RequirementState;
}

export interface BootcampSession {
  title: string;
  dateLabel: string;
  format: string;
  availability: string;
  agendaUrl?: string;
  registerUrl?: string;
}

export interface TrainingVideo {
  id: string;
  title: string;
  duration: string;
  url?: string;
}

export interface CohortStage {
  id: string;
  label: string;
  status: string;
  state: OnboardingState;
}

export interface OnboardingLinks {
  accessMatrixUrl?: string;
  setupGuideUrl?: string;
  troubleshootingUrl: string;
  supportTeamsUrl?: string;
  trainingLibraryUrl?: string;
}

export interface OnboardingData {
  generatedAt: string;
  completedSteps: number;
  totalSteps: number;
  steps: OnboardingStep[];
  currentStepTitle: string;
  tasks: SetupTask[];
  benefits: string[];
  accessRequirements: AccessRequirement[];
  bootcamp: BootcampSession;
  trainingVideos: TrainingVideo[];
  cohortStages: CohortStage[];
  links: OnboardingLinks;
}
