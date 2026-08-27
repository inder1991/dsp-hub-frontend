import { fallbackDevspaces } from "./fallback-devspaces";
import type { Devspace, ResourceUtilization } from "../types/devspaces";
import type {
  DevspaceDetailData,
  DevspaceProcess,
  JobsData,
  KedroJobRun,
  MetricSeries,
  VmDetailData,
  VmFacts,
  VmInventoryData,
} from "../types/observability";

const devspace = (id: string) => fallbackDevspaces.devspaces.find((item) => item.id === id)!;

function job(
  id: string,
  name: string,
  pipeline: string,
  project: string,
  devspaceId: string,
  state: KedroJobRun["state"],
  status: string,
  startedAt: string,
  duration: string,
  progressPercentage: number,
  nodesCompleted: number,
  nodesTotal: number,
  currentNode: string,
  trigger: string,
  cpuPeakPercentage: number,
  memoryPeakGb: number,
  lastMessage: string,
  failedNode?: string,
): KedroJobRun {
  const runtime = devspace(devspaceId);
  return {
    id,
    name,
    pipeline,
    project,
    devspaceId,
    devspaceName: runtime.name,
    vmId: runtime.vm.id,
    vmName: runtime.vm.name,
    owner: runtime.owner,
    state,
    status,
    startedAt,
    duration,
    progressPercentage,
    nodesCompleted,
    nodesTotal,
    currentNode,
    trigger,
    cpuPeakPercentage,
    memoryPeakGb,
    lastMessage,
    failedNode,
  };
}

const jobs: KedroJobRun[] = [
  job("run-churn-284", "Customer churn training", "model_training", "customer-model", "customer-model", "running", "Running", "23 min ago", "23m 14s", 75, 18, 24, "train_xgboost_model", "Manual", 87, 14.1, "Training fold 4 of 5"),
  job("run-fraud-118", "Fraud feature refresh", "feature_engineering", "fraud-detection", "fraud-lab", "running", "Running", "8 min ago", "8m 06s", 42, 8, 19, "build_velocity_features", "Schedule", 61, 9.8, "Processing transaction partition 17 of 41"),
  job("run-risk-912", "Credit risk calibration", "risk_calibration", "risk-research", "risk-research", "failed", "Failed", "31 min ago", "14m 52s", 68, 13, 19, "write_calibrated_scores", "Manual", 98, 7.7, "Process terminated after exceeding its memory allocation", "write_calibrated_scores"),
  job("run-features-410", "Customer feature build", "feature_store", "customer-analytics", "analytics-dev", "succeeded", "Succeeded", "1h 12m ago", "18m 40s", 100, 21, 21, "complete", "Manual", 54, 8.4, "Pipeline completed successfully"),
  job("run-observe-633", "Data quality snapshot", "data_quality", "data-observability", "data-observability", "succeeded", "Succeeded", "2h 04m ago", "11m 03s", 100, 14, 14, "complete", "Schedule", 38, 6.1, "All 126 checks completed"),
  job("run-price-207", "Pricing elasticity model", "elasticity_training", "pricing-experiment", "pricing-experiment", "succeeded", "Succeeded", "3h 18m ago", "26m 17s", 100, 17, 17, "complete", "Manual", 48, 5.8, "Model artefacts written to the experiment store"),
  job("run-segment-399", "Customer segmentation", "segmentation", "customer-analytics", "analytics-dev", "failed", "Failed", "5h 42m ago", "7m 51s", 36, 5, 14, "load_trino_features", "Manual", 32, 5.2, "Trino query exceeded the configured timeout", "load_trino_features"),
  job("run-fraud-117", "Fraud model scoring", "batch_scoring", "fraud-detection", "fraud-lab", "succeeded", "Succeeded", "7h 09m ago", "32m 06s", 100, 22, 22, "complete", "Schedule", 72, 12.6, "Scored 4.8 million transactions"),
  job("run-churn-285", "Customer churn backtest", "model_backtest", "customer-model", "customer-model", "queued", "Queued", "Queued 4 min ago", "—", 0, 0, 16, "Waiting for local runner", "Manual", 0, 0, "Waiting for the active training run to complete"),
  job("run-observe-632", "Schema drift detection", "schema_drift", "data-observability", "data-observability", "succeeded", "Succeeded", "10h 26m ago", "8m 44s", 100, 11, 11, "complete", "Schedule", 29, 4.9, "No breaking schema changes detected"),
];

export const fallbackJobs: JobsData = {
  generatedAt: "2026-08-25T17:30:00Z",
  summary: { total24h: 10, running: 2, succeeded: 5, failed: 2, queued: 1, successRate: 71 },
  jobs,
};

function metric(id: MetricSeries["id"], label: string, resource: ResourceUtilization, samples: number[]): MetricSeries {
  return { id, label, resource, window: "Last 6 hours", samples: [...samples.slice(0, -1), resource.percentage] };
}

function processesFor(runtime: Devspace): DevspaceProcess[] {
  if (runtime.state === "stopped") return [];
  const activeJob = jobs.find((item) => item.devspaceId === runtime.id && item.state === "running");
  const processes: DevspaceProcess[] = [
    { pid: 1284, name: "code-server", command: "code-server --host 0.0.0.0", category: "editor", state: "running", status: "Running", cpuPercentage: 2.8, memoryPercentage: 7.4, runningAge: runtime.uptime, devspaceId: runtime.id },
    { pid: 1432, name: "python-language-server", command: "pyright-langserver --stdio", category: "editor", state: "sleeping", status: "Sleeping", cpuPercentage: 0.6, memoryPercentage: 3.1, runningAge: "6h 18m", devspaceId: runtime.id },
    { pid: 1519, name: "jupyter-lab", command: "jupyter lab --no-browser", category: "notebook", state: "running", status: "Running", cpuPercentage: 4.2, memoryPercentage: 8.6, runningAge: "4h 52m", devspaceId: runtime.id },
    { pid: 702, name: "conmon", command: "conmon --runtime podman", category: "system", state: "sleeping", status: "Sleeping", cpuPercentage: 0.2, memoryPercentage: 0.8, runningAge: runtime.uptime, devspaceId: runtime.id },
  ];
  if (activeJob) processes.unshift({
    pid: 18422,
    name: "kedro",
    command: `kedro run --pipeline ${activeJob.pipeline}`,
    category: "kedro",
    state: "running",
    status: "Running",
    cpuPercentage: Math.min(82.4, activeJob.cpuPeakPercentage),
    memoryPercentage: Math.min(91, Math.round((activeJob.memoryPeakGb / runtime.memory.limit) * 1000) / 10),
    runningAge: activeJob.duration,
    jobId: activeJob.id,
    devspaceId: runtime.id,
  });
  return processes;
}

export function fallbackDevspaceDetail(devspaceId: string): DevspaceDetailData {
  const runtime = devspace(devspaceId) ?? fallbackDevspaces.devspaces[0];
  return {
    generatedAt: fallbackJobs.generatedAt,
    devspace: runtime,
    metrics: [
      metric("cpu", "CPU", runtime.cpu, [6, 8, 11, 9, 14, 18, 16, 21, 17, 20, 18, 18]),
      metric("memory", "Memory", runtime.memory, [18, 20, 21, 22, 22, 24, 25, 25, 26, 26, 26, 26]),
      metric("disk", "Storage", runtime.disk, [32, 32, 33, 34, 34, 35, 35, 36, 36, 37, 37, 38]),
    ],
    jobs: jobs.filter((item) => item.devspaceId === runtime.id),
    processes: processesFor(runtime),
    vmIssues: fallbackDevspaces.vmIssues.filter((issue) => issue.vmId === runtime.vm.id),
  };
}

const vmResources: Record<string, [ResourceUtilization, ResourceUtilization, ResourceUtilization]> = {
  "vm-021": [
    { used: 8.4, limit: 16, unit: "cores", percentage: 52 },
    { used: 18.3, limit: 64, unit: "GB", percentage: 29 },
    { used: 102, limit: 220, unit: "GB", percentage: 46 },
  ],
  "vm-034": [
    { used: 4, limit: 24, unit: "cores", percentage: 17 },
    { used: 12.5, limit: 96, unit: "GB", percentage: 13 },
    { used: 96, limit: 300, unit: "GB", percentage: 32 },
  ],
  "vm-041": [
    { used: 4.8, limit: 16, unit: "cores", percentage: 30 },
    { used: 11.2, limit: 64, unit: "GB", percentage: 18 },
    { used: 124, limit: 160, unit: "GB", percentage: 78 },
  ],
  "vm-052": [
    { used: 0.8, limit: 16, unit: "cores", percentage: 5 },
    { used: 3.1, limit: 48, unit: "GB", percentage: 6 },
    { used: 46, limit: 200, unit: "GB", percentage: 23 },
  ],
};

const vmFacts: Record<string, VmFacts> = {
  "vm-021": { operatingSystem: "RHEL 9.4", kernel: "5.14.0-427.31.1.el9_4", containerRuntime: "Podman 4.9.4", environment: "Production", runningAge: "21d 4h", lastPatch: "Aug 14, 2026", loadAverage: "2.18 / 1.94 / 1.72" },
  "vm-034": { operatingSystem: "RHEL 9.4", kernel: "5.14.0-427.31.1.el9_4", containerRuntime: "Podman 4.9.4", environment: "Production", runningAge: "12d 9h", lastPatch: "Aug 14, 2026", loadAverage: "1.12 / 0.94 / 0.82" },
  "vm-041": { operatingSystem: "RHEL 9.4", kernel: "5.14.0-427.31.1.el9_4", containerRuntime: "Podman 4.9.4", environment: "Production", runningAge: "18d 2h", lastPatch: "Aug 14, 2026", loadAverage: "3.81 / 3.12 / 2.72" },
  "vm-052": { operatingSystem: "RHEL 9.4", kernel: "5.14.0-427.31.1.el9_4", containerRuntime: "Podman 4.9.4", environment: "Non-production", runningAge: "7d 16h", lastPatch: "Aug 18, 2026", loadAverage: "0.42 / 0.38 / 0.31" },
};

export function fallbackVmDetail(vmId: string): VmDetailData {
  const hosted = fallbackDevspaces.devspaces.filter((item) => item.vm.id === vmId);
  const resources = vmResources[vmId] ?? vmResources["vm-021"];
  const selectedVm = hosted[0]?.vm ?? devspace("analytics-dev").vm;
  const issues = fallbackDevspaces.vmIssues.filter((issue) => issue.vmId === selectedVm.id);
  const activeIssues = issues.filter((issue) => issue.status === "active");
  const hasCriticalIssue = activeIssues.some((issue) => issue.severity === "critical");
  return {
    generatedAt: fallbackJobs.generatedAt,
    vm: selectedVm,
    state: hasCriticalIssue ? "critical" : activeIssues.length ? "attention" : "healthy",
    status: hasCriticalIssue ? "Critical issue" : activeIssues.length ? "Needs attention" : "Healthy",
    statusDetail: activeIssues.length ? `${activeIssues.length} active host ${activeIssues.length === 1 ? "issue" : "issues"} may affect hosted devspaces.` : "Host services and capacity are within operational thresholds.",
    facts: vmFacts[selectedVm.id] ?? vmFacts["vm-021"],
    cpu: resources[0],
    memory: resources[1],
    disk: resources[2],
    devspaces: hosted,
    users: [...new Map(hosted.map((item) => [item.owner.id, item.owner])).values()],
    issues,
    topProcesses: hosted.flatMap(processesFor).sort((a, b) => b.cpuPercentage - a.cpuPercentage).slice(0, 8),
  };
}

const fallbackVmIds = [...new Set(fallbackDevspaces.devspaces.map((item) => item.vm.id))];
const fallbackVmItems = fallbackVmIds.map((vmId) => {
  const detail = fallbackVmDetail(vmId);
  return {
    vm: detail.vm,
    state: detail.state,
    status: detail.status,
    statusDetail: detail.statusDetail,
    environment: detail.facts.environment,
    runningAge: detail.facts.runningAge,
    cpu: detail.cpu,
    memory: detail.memory,
    disk: detail.disk,
    devspaceCount: detail.devspaces.length,
    activeDevspaces: detail.devspaces.filter((item) => item.state !== "stopped").length,
    userCount: detail.users.length,
    users: detail.users,
    activeJobs: jobs.filter((item) => item.vmId === detail.vm.id && (item.state === "running" || item.state === "queued")).length,
    activeIssueCount: detail.issues.filter((item) => item.status === "active").length,
    lastEvent: detail.issues[0]?.occurredAt ?? "No recent events",
  };
});

export const fallbackVms: VmInventoryData = {
  generatedAt: fallbackJobs.generatedAt,
  summary: {
    total: fallbackVmItems.length,
    online: fallbackVmItems.length,
    healthy: fallbackVmItems.filter((item) => item.state === "healthy").length,
    attention: fallbackVmItems.filter((item) => item.state === "attention").length,
    critical: fallbackVmItems.filter((item) => item.state === "critical").length,
    devspaces: fallbackVmItems.reduce((total, item) => total + item.devspaceCount, 0),
    users: new Set(fallbackVmItems.flatMap((item) => item.users.map((user) => user.id))).size,
    activeJobs: fallbackVmItems.reduce((total, item) => total + item.activeJobs, 0),
    activeIssues: fallbackVmItems.reduce((total, item) => total + item.activeIssueCount, 0),
  },
  vms: fallbackVmItems,
};
