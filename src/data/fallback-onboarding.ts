import type { OnboardingData } from "../types/onboarding";

export const fallbackOnboarding: OnboardingData = {
  generatedAt: "preview",
  completedSteps: 2,
  totalSteps: 5,
  steps: [
    { id: "request-access", number: 1, title: "Request access", state: "complete" },
    { id: "cyberark", number: 2, title: "Set up CyberArk", state: "complete" },
    { id: "dev-container", number: 3, title: "Prepare dev container", state: "current" },
    { id: "data-sources", number: 4, title: "Connect data sources", state: "upcoming" },
    { id: "training", number: 5, title: "Complete training", state: "upcoming" },
  ],
  currentStepTitle: "Step 3 — Prepare your dev container",
  tasks: [
    { id: "nexus-access", title: "Verify Nexus package access", description: "Confirm the approved repositories available to your workspace.", state: "next" },
    { id: "python-environment", title: "Choose an approved Python environment", description: "Select the DSP base image that matches your workload.", state: "next" },
    { id: "compute-workspace", title: "Prepare your compute workspace", description: "Follow the workspace launch and dev-container setup guide.", state: "next" },
    { id: "data-connections", title: "Connect CDP, Trino, and SAS", description: "Use the approved connection patterns for required data services.", state: "optional" },
  ],
  benefits: ["Managed dev container", "Approved Python packages", "Secure enterprise credentials", "Access to CDP, Trino, and SAS"],
  accessRequirements: [
    { id: "manager-approval", label: "Manager approval", state: "complete" },
    { id: "dsp-user-group", label: "DSP user group", state: "complete" },
    { id: "cyberark-account", label: "CyberArk account", state: "complete" },
    { id: "cdp-access", label: "CDP access", state: "pending" },
    { id: "trino-access", label: "Trino access", state: "pending" },
    { id: "sas-access", label: "SAS access", state: "optional" },
  ],
  bootcamp: {
    title: "DSP Bootcamp — September cohort",
    dateLabel: "Sep 15–16, 2026",
    format: "2-day virtual session",
    availability: "Seats available",
  },
  trainingVideos: [
    { id: "platform-overview", title: "DSP platform overview", duration: "12 min" },
    { id: "dev-container", title: "Working in your dev container", duration: "18 min" },
    { id: "data-connections", title: "Connecting to CDP and Trino", duration: "22 min" },
    { id: "model-standards", title: "Model development standards", duration: "16 min" },
  ],
  cohortStages: [
    { id: "invited", label: "Invited", status: "Invitations underway", state: "complete" },
    { id: "approved", label: "Access approved", status: "Approvals in progress", state: "current" },
    { id: "workspace", label: "Workspace ready", status: "Workspace setup active", state: "upcoming" },
    { id: "trained", label: "Training complete", status: "Training underway", state: "upcoming" },
  ],
  links: { troubleshootingUrl: "#support" },
};
