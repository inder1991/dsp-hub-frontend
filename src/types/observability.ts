import type { Devspace, DevspaceOwner, HostVm, ResourceUtilization, VmIssue } from "./devspaces";

export type JobState = "running" | "succeeded" | "failed" | "queued" | "cancelled";
export type ProcessState = "running" | "sleeping" | "waiting" | "stopped";

export interface KedroJobRun {
  id: string;
  name: string;
  pipeline: string;
  project: string;
  devspaceId: string;
  devspaceName: string;
  vmId: string;
  vmName: string;
  owner: DevspaceOwner;
  state: JobState;
  status: string;
  startedAt: string;
  duration: string;
  progressPercentage: number;
  nodesCompleted: number;
  nodesTotal: number;
  currentNode: string;
  trigger: string;
  cpuPeakPercentage: number;
  memoryPeakGb: number;
  lastMessage: string;
  failedNode?: string;
}

export interface JobSummary {
  total24h: number;
  running: number;
  succeeded: number;
  failed: number;
  queued: number;
  successRate: number;
}

export interface JobsData {
  generatedAt: string;
  summary: JobSummary;
  jobs: KedroJobRun[];
}

export interface DevspaceProcess {
  pid: number;
  name: string;
  command: string;
  category: "kedro" | "editor" | "notebook" | "system";
  state: ProcessState;
  status: string;
  cpuPercentage: number;
  memoryPercentage: number;
  runningAge: string;
  jobId?: string;
  devspaceId?: string;
}

export interface MetricSeries {
  id: "cpu" | "memory" | "disk";
  label: string;
  resource: ResourceUtilization;
  window: string;
  samples: number[];
}

export interface DevspaceDetailData {
  generatedAt: string;
  devspace: Devspace;
  metrics: MetricSeries[];
  jobs: KedroJobRun[];
  processes: DevspaceProcess[];
  vmIssues: VmIssue[];
}

export interface VmFacts {
  operatingSystem: string;
  kernel: string;
  containerRuntime: string;
  environment: string;
  runningAge: string;
  lastPatch: string;
  loadAverage: string;
}

export interface VmInventoryItem {
  vm: HostVm;
  state: "healthy" | "attention" | "critical";
  status: string;
  statusDetail: string;
  environment: string;
  runningAge: string;
  cpu: ResourceUtilization;
  memory: ResourceUtilization;
  disk: ResourceUtilization;
  devspaceCount: number;
  activeDevspaces: number;
  userCount: number;
  users: DevspaceOwner[];
  activeJobs: number;
  activeIssueCount: number;
  lastEvent: string;
}

export interface VmInventorySummary {
  total: number;
  online: number;
  healthy: number;
  attention: number;
  critical: number;
  devspaces: number;
  users: number;
  activeJobs: number;
  activeIssues: number;
}

export interface VmInventoryData {
  generatedAt: string;
  summary: VmInventorySummary;
  vms: VmInventoryItem[];
}

export interface VmDetailData {
  generatedAt: string;
  vm: HostVm;
  state: "healthy" | "attention" | "critical";
  status: string;
  statusDetail: string;
  facts: VmFacts;
  cpu: ResourceUtilization;
  memory: ResourceUtilization;
  disk: ResourceUtilization;
  devspaces: Devspace[];
  users: DevspaceOwner[];
  issues: VmIssue[];
  topProcesses: DevspaceProcess[];
}
