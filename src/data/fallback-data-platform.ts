import type {
  AdminControlPlaneData,
  AdminHiveAccessItem,
  IngestionState,
  MorningIngestionStatus,
  UserDataAccessData,
  YarnQueueStatus,
} from "../types/data-platform";

const businessDate = "26 Aug 2026";

function ingestion(status: IngestionState, statusLabel: string, summary: string, completedAt?: string): MorningIngestionStatus {
  return {
    businessDate,
    status,
    statusLabel,
    scheduledFor: "06:30 GST",
    completedAt,
    lastSuccessfulBusinessDate: status === "succeeded" ? businessDate : "25 Aug 2026",
    slaState: status === "succeeded" ? "within_sla" : status === "pending" ? "at_risk" : "breached",
    summary,
  };
}

const userTableDefinitions = [
  ["customer", "customer_features", "Customer Data Products", "DSP-CUSTOMER-ANALYTICS", "succeeded", "Complete", "06:18 GST"],
  ["customer", "customer_segments", "Customer Data Products", "DSP-CUSTOMER-ANALYTICS", "succeeded", "Complete", "06:22 GST"],
  ["risk", "customer_risk_scores", "Risk Data", "DSP-RISK-CONSUMERS", "late", "Late", "07:04 GST"],
  ["finance", "daily_transactions", "Finance Data", "DSP-FINANCE-READERS", "failed", "Failed", undefined],
  ["reference", "product_hierarchy", "Enterprise Reference Data", "DSP-REFERENCE-READERS", "succeeded", "Complete", "05:54 GST"],
  ["digital", "web_events", "Digital Analytics", "DSP-DIGITAL-CONSUMERS", "pending", "In progress", undefined],
  ["customer", "churn_features", "Customer Data Products", "DSP-CUSTOMER-ANALYTICS", "succeeded", "Complete", "06:09 GST"],
  ["marketing", "campaign_response", "Marketing Data", "DSP-MARKETING-CONSUMERS", "not_received", "Not received", undefined],
] as const;

const userTables = userTableDefinitions.map(([database, table, ownerTeam, ldapGroup, state, label, completedAt]) => ({
  id: `${database}-${table}`,
  database,
  table,
  fullyQualifiedName: `${database}.${table}`,
  platform: "Hive" as const,
  ownerTeam,
  access: {
    ldapGroup,
    team: "Customer Analytics",
    privilege: "SELECT",
    policyName: `ranger-${database}-customer-analytics`,
  },
  ingestion: ingestion(
    state,
    label,
    state === "succeeded"
      ? "Morning ingestion completed within SLA."
      : state === "pending"
        ? "Morning ingestion is still running."
        : state === "not_received"
          ? "No morning delivery has been received."
          : `Morning ingestion ${state}; the owning team is investigating.`,
    completedAt,
  ),
}));

const queues: YarnQueueStatus[] = [
  { id: "customer-models", queuePath: "root.analytics.customer_models", team: "Customer Analytics", ldapGroup: "DSP-CUSTOMER-ANALYTICS", state: "attention", status: "Capacity pressure", usedCapacityPercentage: 87, configuredCapacityPercentage: 30, runningApplications: 7, pendingApplications: 3, allocatedMemoryGb: 356, pendingMemoryGb: 96, observedAt: "26 Aug 2026, 08:12 GST" },
  { id: "customer-shared", queuePath: "root.analytics.shared", team: "Customer Analytics", ldapGroup: "DSP-CUSTOMER-ANALYTICS", state: "healthy", status: "Available", usedCapacityPercentage: 42, configuredCapacityPercentage: 20, runningApplications: 4, pendingApplications: 0, allocatedMemoryGb: 128, pendingMemoryGb: 0, observedAt: "26 Aug 2026, 08:12 GST" },
  { id: "risk-models", queuePath: "root.risk.models", team: "Risk Modelling", ldapGroup: "DSP-RISK-MODELLERS", state: "healthy", status: "Available", usedCapacityPercentage: 39, configuredCapacityPercentage: 25, runningApplications: 5, pendingApplications: 0, allocatedMemoryGb: 192, pendingMemoryGb: 0, observedAt: "26 Aug 2026, 08:12 GST" },
  { id: "finance-insights", queuePath: "root.finance.insights", team: "Finance Insights", ldapGroup: "DSP-FINANCE-ANALYTICS", state: "critical", status: "Queue saturated", usedCapacityPercentage: 99, configuredCapacityPercentage: 20, runningApplications: 11, pendingApplications: 8, allocatedMemoryGb: 508, pendingMemoryGb: 224, observedAt: "26 Aug 2026, 08:12 GST" },
  { id: "fraud-lab", queuePath: "root.risk.fraud_lab", team: "Fraud Analytics", ldapGroup: "DSP-FRAUD-ANALYTICS", state: "attention", status: "Pending applications", usedCapacityPercentage: 81, configuredCapacityPercentage: 15, runningApplications: 8, pendingApplications: 4, allocatedMemoryGb: 294, pendingMemoryGb: 120, observedAt: "26 Aug 2026, 08:12 GST" },
];

export const fallbackUserDataAccess: UserDataAccessData = {
  generatedAt: "2026-08-26T04:12:00Z",
  principal: {
    id: "user-1048",
    enterpriseUserId: "alex.morgan",
    name: "Alex Morgan",
    team: "Customer Analytics",
    ldapGroups: [...new Set(userTables.map((item) => item.access.ldapGroup))],
  },
  summary: { accessibleTables: 8, ingested: 4, late: 1, failed: 1, pending: 2, businessDate },
  tables: userTables,
  yarnQueues: queues.filter((queue) => queue.team === "Customer Analytics"),
  sourceFreshness: [
    { source: "LDAP and Ranger access catalogue", status: "current", lastSyncedAt: "26 Aug 2026, 07:55 GST", summary: "Access metadata is current." },
    { source: "Morning ingestion monitor", status: "current", lastSyncedAt: "26 Aug 2026, 08:12 GST", summary: "Latest ingestion states received." },
    { source: "YARN ResourceManager", status: "current", lastSyncedAt: "26 Aug 2026, 08:11 GST", summary: "Queue metrics updated one minute ago." },
  ],
};

const adminTables: AdminHiveAccessItem[] = userTables.map((item) => ({
  id: item.id,
  database: item.database,
  table: item.table,
  fullyQualifiedName: item.fullyQualifiedName,
  ownerTeam: item.ownerTeam,
  teams: [item.access.team],
  ldapGroups: [item.access.ldapGroup],
  userCount: 28,
  privileges: [item.access.privilege],
  ingestion: item.ingestion,
}));

adminTables.push({
  id: "risk-model-features",
  database: "risk",
  table: "model_features",
  fullyQualifiedName: "risk.model_features",
  ownerTeam: "Risk Data",
  teams: ["Risk Modelling", "Fraud Analytics"],
  ldapGroups: ["DSP-RISK-MODELLERS", "DSP-FRAUD-ANALYTICS"],
  userCount: 37,
  privileges: ["SELECT"],
  ingestion: ingestion("succeeded", "Complete", "Morning ingestion completed within SLA.", "06:11 GST"),
});

export const fallbackAdminControlPlane: AdminControlPlaneData = {
  generatedAt: "2026-08-26T04:12:00Z",
  summary: { totalVms: 18, unhealthyVms: 2, activeDevspaces: 41, activeJobs: 26, governedTables: adminTables.length, ingestionAttention: 4, yarnQueueAttention: 3, activeIncidents: 2, pendingApprovals: 3 },
  attentionItems: [
    { id: "attention-finance-ingestion", type: "ingestion", severity: "critical", title: "finance.daily_transactions ingestion failed", summary: "Morning delivery missed its SLA; Finance Data is investigating.", owner: "Finance Data", occurredAt: "07:02 GST", href: "#admin/data" },
    { id: "attention-finance-yarn", type: "yarn_queue", severity: "critical", title: "Finance Insights YARN queue is saturated", summary: "8 applications are pending and 224 GB memory is requested.", owner: "Compute Operations", occurredAt: "08:11 GST", href: "#admin/data" },
    { id: "attention-vm-031", type: "vm", severity: "warning", title: "dsp-vm-031 disk utilisation is critical", summary: "Three devspaces are at risk on the VM.", owner: "DSP DevOps", occurredAt: "08:09 GST", href: "#vm/vm-031" },
    { id: "attention-allocation", type: "allocation", severity: "information", title: "Three VM allocations require approval", summary: "Requests have validated LDAP groups and are ready for review.", owner: "Platform Administration", occurredAt: "07:45 GST", href: "#admin" },
  ],
  hiveTables: adminTables,
  yarnQueues: queues,
  integrations: [
    { id: "ldap", name: "Enterprise LDAP", status: "healthy", lastSuccessfulSync: "07:55 GST", objectsSynced: 42, summary: "Team and group mappings are current." },
    { id: "ranger", name: "Ranger access catalogue", status: "healthy", lastSuccessfulSync: "07:56 GST", objectsSynced: 184, summary: "Table entitlements are current." },
    { id: "ingestion", name: "Morning ingestion monitor", status: "degraded", lastSuccessfulSync: "08:12 GST", objectsSynced: 176, summary: "Four ingestion states require attention." },
    { id: "yarn", name: "YARN ResourceManager", status: "healthy", lastSuccessfulSync: "08:11 GST", objectsSynced: 15, summary: "Queue metrics are current." },
    { id: "monitoring", name: "VM monitoring", status: "degraded", lastSuccessfulSync: "08:10 GST", objectsSynced: 18, summary: "Two VMs require attention." },
    { id: "remedy", name: "Remedy", status: "healthy", lastSuccessfulSync: "08:06 GST", objectsSynced: 12, summary: "Incident summaries are current." },
    { id: "confluence", name: "Confluence", status: "stale", lastSuccessfulSync: "25 Aug, 18:30 GST", objectsSynced: 68, summary: "Content index refresh is delayed." },
  ],
  allocations: [
    { id: "alloc-1042", vmName: "dsp-vm-044", tenant: "Analytics", targetTeam: "Customer Analytics", ldapGroup: "DSP-CUSTOMER-ANALYTICS", status: "pending_approval", requestedBy: "Sara Khan", requestedAt: "26 Aug, 07:42 GST", summary: "Standard development VM allocation." },
    { id: "alloc-1041", vmName: "dsp-vm-045", tenant: "Risk", targetTeam: "Fraud Analytics", ldapGroup: "DSP-FRAUD-ANALYTICS", status: "applying", requestedBy: "Omar Rahman", requestedAt: "26 Aug, 07:21 GST", approver: "Maya Singh", summary: "Network and LDAP policies are being applied." },
    { id: "alloc-1038", vmName: "dsp-vm-040", tenant: "Finance", targetTeam: "Finance Insights", ldapGroup: "DSP-FINANCE-ANALYTICS", status: "failed", requestedBy: "Amal Joseph", requestedAt: "25 Aug, 15:06 GST", approver: "Maya Singh", summary: "IP allocation validation failed." },
  ],
  updates: [
    { id: "update-209", type: "maintenance", title: "Hadoop maintenance window", service: "Hadoop", state: "scheduled", owner: "Data Platform Operations", effectiveAt: "02 Sep, 22:00 GST", audience: "All Hadoop users" },
    { id: "update-208", type: "support", title: "Weekend support roster", service: "DSP Support", state: "published", owner: "DSP DevOps", effectiveAt: "30 Aug, 08:00 GST", audience: "All DSP users" },
    { id: "update-207", type: "troubleshooting", title: "Resolve expired CyberArk sessions", service: "CyberArk", state: "in_review", owner: "Identity Operations", effectiveAt: "28 Aug, 12:00 GST", audience: "CyberArk users" },
    { id: "update-205", type: "documentation", title: "Python 3.12 image migration guide", service: "Nexus", state: "draft", owner: "Developer Experience", effectiveAt: "04 Sep, 09:00 GST", audience: "Devspace owners" },
  ],
  capabilities: { readOnlyPreview: true, allocationWorkflowEnabled: false, contentWorkflowEnabled: false, requiresEnterpriseSso: true },
};
