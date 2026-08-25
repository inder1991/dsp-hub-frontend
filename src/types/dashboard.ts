export type HealthLevel = "operational" | "degraded" | "major_issue";

export type ItemState =
  | "operational"
  | "degraded"
  | "major_issue"
  | "running"
  | "completed"
  | "healthy"
  | "needs_attention"
  | "informational"
  | "action_required"
  | "no_action";

export interface HealthService {
  id: string;
  name: string;
  state: ItemState;
  status: string;
  summary?: string;
}

export interface HealthSummary {
  state: HealthLevel;
  label: string;
  affectedSystems: number;
  services: HealthService[];
}

export interface SystemStatus extends HealthService {
  detailsUrl?: string;
}

export interface IncidentSummary {
  message: string;
  url?: string;
}

export interface Metric {
  label: string;
  value: number;
}

export interface ResourceItem {
  id: string;
  name: string;
  type: string;
  state: ItemState;
  status: string;
}

export interface MyDspSummary {
  metrics: Metric[];
  activeResources: ResourceItem[];
}

export interface ActivityItem {
  id: string;
  name: string;
  activity: string;
  state: ItemState;
  status: string;
  occurredAt: string;
}

export interface UpcomingChange {
  id: string;
  dateLabel: string;
  title: string;
  impact: string;
  state: ItemState;
  status: string;
  url?: string;
}

export interface ExternalLinks {
  confluenceDsp?: string;
  confluenceStatus?: string;
  confluenceReleases?: string;
  remedyTickets?: string;
  remedyRequests?: string;
}

export interface DashboardData {
  generatedAt: string;
  health: HealthSummary;
  systems: SystemStatus[];
  incident: IncidentSummary;
  myDsp: MyDspSummary;
  recentActivity: ActivityItem[];
  upcomingChanges: UpcomingChange[];
  externalLinks: ExternalLinks;
}
