export type DevspaceState = "healthy" | "attention" | "critical" | "stopped";
export type ConnectionState = "connected" | "degraded" | "not_configured";

export interface DevspaceOwner {
  id: string;
  name: string;
  initials: string;
  team: string;
}

export interface HostVm {
  id: string;
  name: string;
  tenant: string;
  hostGroup: string;
}

export interface ResourceUtilization {
  used: number;
  limit: number;
  unit: string;
  percentage: number;
}

export interface DevspaceConnection {
  name: string;
  state: ConnectionState;
  status: string;
}

export interface Devspace {
  id: string;
  name: string;
  kind: "Devspace" | "Dev container";
  owner: DevspaceOwner;
  vm: HostVm;
  state: DevspaceState;
  status: string;
  statusDetail: string;
  cpu: ResourceUtilization;
  memory: ResourceUtilization;
  disk: ResourceUtilization;
  uptime: string;
  lastActivity: string;
  image: string;
  pythonVersion: string;
  restartCount: number;
  connections: DevspaceConnection[];
}

export interface DevspaceSummary {
  total: number;
  active: number;
  healthy: number;
  needsAttention: number;
  stopped: number;
}

export interface FleetCapacity {
  vmCount: number;
  onlineVms: number;
  cpuPercentage: number;
  memoryPercentage: number;
  storagePercentage: number;
  atRiskVms: number;
}

export interface VmIssue {
  id: string;
  vmId: string;
  title: string;
  summary: string;
  severity: "critical" | "warning" | "informational";
  status: "active" | "resolved";
  occurredAt: string;
  resolvedAt?: string;
  affectedDevspaces: number;
}

export interface DevspacesData {
  generatedAt: string;
  summary: DevspaceSummary;
  fleet: FleetCapacity;
  devspaces: Devspace[];
  vmIssues: VmIssue[];
}
