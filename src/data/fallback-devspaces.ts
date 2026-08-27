import type { Devspace, DevspaceConnection, DevspaceOwner, DevspacesData, HostVm } from "../types/devspaces";

const alex: DevspaceOwner = { id: "alex-morgan", name: "Alex Morgan", initials: "AM", team: "Customer Analytics" };
const priya: DevspaceOwner = { id: "priya-nair", name: "Priya Nair", initials: "PN", team: "Customer Analytics" };
const omar: DevspaceOwner = { id: "omar-hassan", name: "Omar Hassan", initials: "OH", team: "Credit Risk" };
const leila: DevspaceOwner = { id: "leila-khan", name: "Leila Khan", initials: "LK", team: "Financial Crime" };
const daniel: DevspaceOwner = { id: "daniel-lee", name: "Daniel Lee", initials: "DL", team: "Data Platform" };
const sara: DevspaceOwner = { id: "sara-ali", name: "Sara Ali", initials: "SA", team: "Retail Pricing" };
const michael: DevspaceOwner = { id: "michael-ross", name: "Michael Ross", initials: "MR", team: "Treasury Analytics" };

const vm021: HostVm = { id: "vm-021", name: "dsp-vm-021", tenant: "Analytics", hostGroup: "vm-prod-a" };
const vm034: HostVm = { id: "vm-034", name: "dsp-vm-034", tenant: "Model Development", hostGroup: "vm-prod-a" };
const vm041: HostVm = { id: "vm-041", name: "dsp-vm-041", tenant: "Risk", hostGroup: "vm-prod-b" };
const vm052: HostVm = { id: "vm-052", name: "dsp-vm-052", tenant: "Sandbox", hostGroup: "vm-nonprod-a" };

const connected: DevspaceConnection[] = [
  { name: "Nexus", state: "connected", status: "Connected" },
  { name: "CDP", state: "connected", status: "Connected" },
  { name: "Trino", state: "connected", status: "Connected" },
];

function resource(
  id: string,
  name: string,
  kind: Devspace["kind"],
  owner: DevspaceOwner,
  vm: HostVm,
  overrides: Partial<Devspace>,
): Devspace {
  return {
    id,
    name,
    kind,
    owner,
    vm,
    state: "healthy",
    status: "Healthy",
    statusDetail: "Runtime and dependencies are responding normally.",
    cpu: { used: 1.4, limit: 8, unit: "cores", percentage: 18 },
    memory: { used: 4.2, limit: 16, unit: "GB", percentage: 26 },
    disk: { used: 38, limit: 100, unit: "GB", percentage: 38 },
    uptime: "2d 7h",
    lastActivity: "6 min ago",
    image: "python-3.11-dsp:2026.08",
    pythonVersion: "3.11.9",
    restartCount: 0,
    connections: connected,
    ...overrides,
  };
}

export const fallbackDevspaces: DevspacesData = {
  generatedAt: "2026-08-25T14:30:00Z",
  summary: { total: 7, active: 6, healthy: 4, needsAttention: 2, stopped: 1 },
  fleet: { vmCount: 4, onlineVms: 4, cpuPercentage: 47, memoryPercentage: 61, storagePercentage: 54, atRiskVms: 1 },
  devspaces: [
    resource("analytics-dev", "analytics-dev", "Devspace", alex, vm021, {}),
    resource("customer-model", "customer-model", "Dev container", priya, vm021, {
      state: "attention",
      status: "High memory",
      statusDetail: "Memory has remained above 85% for 18 minutes.",
      cpu: { used: 7, limit: 8, unit: "cores", percentage: 87 },
      memory: { used: 14.1, limit: 16, unit: "GB", percentage: 88 },
      disk: { used: 64, limit: 100, unit: "GB", percentage: 64 },
      uptime: "18h 42m",
      lastActivity: "2 min ago",
      restartCount: 1,
      connections: connected.map((item) => item.name === "Trino" ? { ...item, state: "degraded", status: "Elevated latency" } : item),
    }),
    resource("risk-research", "risk-research", "Devspace", omar, vm041, {
      state: "critical",
      status: "Unresponsive",
      statusDetail: "The container health probe has failed three consecutive times.",
      cpu: { used: 3.9, limit: 4, unit: "cores", percentage: 98 },
      memory: { used: 7.7, limit: 8, unit: "GB", percentage: 96 },
      disk: { used: 73, limit: 80, unit: "GB", percentage: 91 },
      uptime: "5d 3h",
      lastActivity: "21 min ago",
      image: "python-3.10-dsp:2026.06",
      pythonVersion: "3.10.14",
      restartCount: 4,
      connections: connected.map((item) => item.name === "Nexus" ? item : { ...item, state: "degraded", status: "Connection unavailable" }),
    }),
    resource("fraud-lab", "fraud-lab", "Devspace", leila, vm034, {
      cpu: { used: 2.2, limit: 8, unit: "cores", percentage: 28 },
      memory: { used: 6.8, limit: 24, unit: "GB", percentage: 28 },
      disk: { used: 52, limit: 120, unit: "GB", percentage: 43 },
      uptime: "1d 4h",
      lastActivity: "14 min ago",
    }),
    resource("data-observability", "data-observability", "Dev container", daniel, vm034, {
      cpu: { used: 1.8, limit: 8, unit: "cores", percentage: 23 },
      memory: { used: 5.7, limit: 16, unit: "GB", percentage: 36 },
      disk: { used: 44, limit: 100, unit: "GB", percentage: 44 },
      uptime: "9d 11h",
      lastActivity: "31 min ago",
    }),
    resource("pricing-experiment", "pricing-experiment", "Devspace", sara, vm052, {
      cpu: { used: 0.8, limit: 4, unit: "cores", percentage: 20 },
      memory: { used: 3.1, limit: 8, unit: "GB", percentage: 39 },
      disk: { used: 29, limit: 80, unit: "GB", percentage: 36 },
      uptime: "6h 18m",
      lastActivity: "1h ago",
      connections: connected.map((item) => item.name === "CDP" ? { ...item, state: "not_configured", status: "Not configured" } : item),
    }),
    resource("treasury-sandbox", "treasury-sandbox", "Devspace", michael, vm052, {
      state: "stopped",
      status: "Stopped",
      statusDetail: "Stopped by the owner. No compute resources are currently consumed.",
      cpu: { used: 0, limit: 4, unit: "cores", percentage: 0 },
      memory: { used: 0, limit: 8, unit: "GB", percentage: 0 },
      disk: { used: 17, limit: 80, unit: "GB", percentage: 21 },
      uptime: "—",
      lastActivity: "Yesterday",
      connections: connected.map((item) => ({ ...item, state: "not_configured", status: "Not running" })),
    }),
  ],
  vmIssues: [
    { id: "issue-vm041-runtime", vmId: "vm-041", title: "Container runtime health degraded", summary: "Health probes are timing out for one hosted devspace.", severity: "critical", status: "active", occurredAt: "12 min ago", affectedDevspaces: 1 },
    { id: "issue-vm021-memory", vmId: "vm-021", title: "Sustained memory pressure", summary: "Allocated memory has remained above the operational threshold.", severity: "warning", status: "active", occurredAt: "18 min ago", affectedDevspaces: 1 },
    { id: "issue-vm041-disk", vmId: "vm-041", title: "Low workspace disk capacity", summary: "Available workspace storage fell below 10 GB.", severity: "warning", status: "active", occurredAt: "34 min ago", affectedDevspaces: 1 },
    { id: "issue-vm034-nexus", vmId: "vm-034", title: "Nexus package retrieval latency", summary: "Package downloads were slower than the normal baseline.", severity: "warning", status: "resolved", occurredAt: "Yesterday, 14:10", resolvedAt: "Yesterday, 14:32", affectedDevspaces: 2 },
    { id: "issue-vm021-runtime-restart", vmId: "vm-021", title: "Container runtime restarted", summary: "Runtime service recovered automatically after a transient failure.", severity: "informational", status: "resolved", occurredAt: "Aug 23, 09:18", resolvedAt: "Aug 23, 09:21", affectedDevspaces: 2 },
    { id: "issue-vm052-network", vmId: "vm-052", title: "Intermittent Trino connectivity", summary: "Three short connection interruptions were detected.", severity: "warning", status: "resolved", occurredAt: "Aug 22, 16:44", resolvedAt: "Aug 22, 16:58", affectedDevspaces: 1 },
    { id: "issue-vm041-cdp", vmId: "vm-041", title: "CDP authentication latency", summary: "Kerberos authentication exceeded the expected response time.", severity: "warning", status: "resolved", occurredAt: "Aug 20, 11:06", resolvedAt: "Aug 20, 11:29", affectedDevspaces: 1 },
    { id: "issue-vm034-maintenance", vmId: "vm-034", title: "Scheduled host patching completed", summary: "The VM returned to service and all devspaces recovered.", severity: "informational", status: "resolved", occurredAt: "Aug 18, 01:00", resolvedAt: "Aug 18, 01:22", affectedDevspaces: 2 },
    { id: "issue-vm021-disk-cleanup", vmId: "vm-021", title: "Temporary storage threshold exceeded", summary: "Unused image layers were removed automatically.", severity: "warning", status: "resolved", occurredAt: "Aug 15, 17:30", resolvedAt: "Aug 15, 17:37", affectedDevspaces: 2 },
    { id: "issue-vm052-image-pull", vmId: "vm-052", title: "Base image pull retried", summary: "A transient registry timeout recovered on the second attempt.", severity: "informational", status: "resolved", occurredAt: "Aug 12, 08:51", resolvedAt: "Aug 12, 08:54", affectedDevspaces: 1 },
  ],
};
