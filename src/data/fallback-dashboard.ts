import type { DashboardData } from "../types/dashboard";

export const fallbackDashboard: DashboardData = {
  generatedAt: "preview",
  health: {
    state: "degraded",
    label: "DEGRADED",
    affectedSystems: 2,
    services: [
      { id: "hadoop", name: "Hadoop", state: "degraded", status: "Degraded", summary: "Elevated latency" },
      { id: "trino", name: "Trino", state: "degraded", status: "Degraded", summary: "Query performance degraded" },
      { id: "nexus", name: "Nexus", state: "operational", status: "Operational" },
      { id: "vm-platform", name: "VM Platform", state: "operational", status: "Operational" },
      { id: "github", name: "GitHub", state: "operational", status: "Operational" },
    ],
  },
  systems: [
    { id: "vm-platform", name: "VM Platform", state: "operational", status: "Operational" },
    { id: "hadoop", name: "Hadoop", state: "degraded", status: "Degraded", summary: "Elevated latency" },
    { id: "trino", name: "Trino", state: "degraded", status: "Degraded", summary: "Query performance" },
    { id: "nexus", name: "Nexus", state: "operational", status: "Operational" },
    { id: "github-actions", name: "GitHub Actions", state: "operational", status: "Operational" },
  ],
  incident: {
    message: "Hadoop and Trino are experiencing elevated latency.",
  },
  myDsp: {
    metrics: [
      { value: 12, label: "Jobs" },
      { value: 3, label: "Workspaces" },
      { value: 2, label: "Warnings" },
      { value: 1, label: "Failed" },
    ],
    activeResources: [
      { id: "analytics-dev", name: "analytics-dev", type: "Workspace", state: "running", status: "Running" },
      { id: "model-training", name: "model-training", type: "Job", state: "completed", status: "Completed" },
      { id: "customer-model", name: "customer-model", type: "Job", state: "needs_attention", status: "Needs attention" },
      { id: "data-observability", name: "data-observability", type: "Monitor", state: "healthy", status: "Healthy" },
    ],
  },
  recentActivity: [
    { id: "build-182", name: "customer-model", activity: "Build #182", state: "completed", status: "Passed", occurredAt: "1h ago" },
    { id: "workspace-analytics-dev", name: "analytics-dev", activity: "Workspace", state: "running", status: "Running", occurredAt: "2h ago" },
    { id: "commit-8f21a", name: "risk-model", activity: "Commit 8f21a", state: "informational", status: "2h ago", occurredAt: "2h ago" },
    { id: "image-python-311", name: "python-3.11-image", activity: "Released", state: "informational", status: "Yesterday", occurredAt: "Yesterday" },
  ],
  upcomingChanges: [
    { id: "vm-maintenance", dateLabel: "Sep 02", title: "VM maintenance", impact: "Affects 2 of your workspaces", state: "needs_attention", status: "Impact" },
    { id: "python-image-upgrade", dateLabel: "Sep 04", title: "Python image upgrade", impact: "Action required", state: "action_required", status: "Action required" },
    { id: "hadoop-maintenance", dateLabel: "Sep 12", title: "Hadoop maintenance", impact: "No action required", state: "no_action", status: "No action" },
  ],
  externalLinks: {},
};
