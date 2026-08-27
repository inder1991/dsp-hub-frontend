export type IngestionState = "succeeded" | "late" | "failed" | "pending" | "not_received";
export type QueueState = "healthy" | "attention" | "critical";

export interface PortalPrincipal {
  id: string;
  enterpriseUserId: string;
  name: string;
  team: string;
  ldapGroups: string[];
}

export interface AccessPath {
  ldapGroup: string;
  team: string;
  privilege: string;
  policyName: string;
}

export interface MorningIngestionStatus {
  businessDate: string;
  status: IngestionState;
  statusLabel: string;
  scheduledFor: string;
  completedAt?: string | null;
  lastSuccessfulBusinessDate?: string | null;
  slaState: "within_sla" | "at_risk" | "breached" | "awaiting";
  summary: string;
}

export interface AccessibleHiveTable {
  id: string;
  database: string;
  table: string;
  fullyQualifiedName: string;
  platform: "Hive";
  ownerTeam: string;
  access: AccessPath;
  ingestion: MorningIngestionStatus;
}

export interface YarnQueueStatus {
  id: string;
  queuePath: string;
  team: string;
  ldapGroup: string;
  state: QueueState;
  status: string;
  usedCapacityPercentage: number;
  configuredCapacityPercentage: number;
  runningApplications: number;
  pendingApplications: number;
  allocatedMemoryGb: number;
  pendingMemoryGb: number;
  observedAt: string;
}

export interface UserDataAccessData {
  generatedAt: string;
  principal: PortalPrincipal;
  summary: {
    accessibleTables: number;
    ingested: number;
    late: number;
    failed: number;
    pending: number;
    businessDate: string;
  };
  tables: AccessibleHiveTable[];
  yarnQueues: YarnQueueStatus[];
  sourceFreshness: Array<{
    source: string;
    status: "current" | "stale" | "unavailable";
    lastSyncedAt: string;
    summary: string;
  }>;
}

export interface AdminHiveAccessItem {
  id: string;
  database: string;
  table: string;
  fullyQualifiedName: string;
  ownerTeam: string;
  teams: string[];
  ldapGroups: string[];
  userCount: number;
  privileges: string[];
  ingestion: MorningIngestionStatus;
}

export interface AdminControlPlaneData {
  generatedAt: string;
  summary: {
    totalVms: number;
    unhealthyVms: number;
    activeDevspaces: number;
    activeJobs: number;
    governedTables: number;
    ingestionAttention: number;
    yarnQueueAttention: number;
    activeIncidents: number;
    pendingApprovals: number;
  };
  attentionItems: Array<{
    id: string;
    type: "ingestion" | "yarn_queue" | "vm" | "incident" | "allocation";
    severity: "information" | "warning" | "critical";
    title: string;
    summary: string;
    owner: string;
    occurredAt: string;
    href: string;
  }>;
  hiveTables: AdminHiveAccessItem[];
  yarnQueues: YarnQueueStatus[];
  integrations: Array<{
    id: string;
    name: string;
    status: "healthy" | "degraded" | "failed" | "stale";
    lastSuccessfulSync: string;
    objectsSynced: number;
    summary: string;
  }>;
  allocations: Array<{
    id: string;
    vmName: string;
    tenant: string;
    targetTeam: string;
    ldapGroup: string;
    status: "draft" | "pending_approval" | "applying" | "active" | "failed";
    requestedBy: string;
    requestedAt: string;
    approver?: string | null;
    summary: string;
  }>;
  updates: Array<{
    id: string;
    type: "maintenance" | "support" | "troubleshooting" | "documentation";
    title: string;
    service: string;
    state: "draft" | "in_review" | "published" | "scheduled";
    owner: string;
    effectiveAt: string;
    audience: string;
  }>;
  capabilities: {
    readOnlyPreview: boolean;
    allocationWorkflowEnabled: boolean;
    contentWorkflowEnabled: boolean;
    requiresEnterpriseSso: boolean;
  };
}
