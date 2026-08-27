import type { JobsData, VmDetailData } from "../types/observability";
import { ArrowLeftIcon, ChevronRightIcon, ComputeIcon, CubeIcon, SystemsIcon } from "./Icons";
import { HealthBadge, ResourceMeter } from "./DevspacesPage";

interface VmDashboardProps {
  data: VmDetailData;
  jobs: JobsData;
}

export function VmDashboard({ data, jobs }: VmDashboardProps) {
  const activeIssues = data.issues.filter((issue) => issue.status === "active");
  const runningJobs = jobs.jobs.filter((job) => job.vmId === data.vm.id && job.state === "running");

  return (
    <main className="main-content resource-dashboard vm-dashboard" id="vm-dashboard">
      <nav className="resource-breadcrumbs" aria-label="Breadcrumb"><a href="#vms">VMs</a><ChevronRightIcon /><span>{data.vm.name}</span></nav>
      <div className="resource-dashboard-heading">
        <div className="resource-title-group"><span className="resource-title-icon resource-title-icon--vm"><ComputeIcon /></span><div><div className="page-kicker">VM observability</div><h1>{data.vm.name}</h1><p>{data.vm.tenant} tenant · {data.vm.hostGroup} · {data.facts.environment}</p></div></div>
        <div className="resource-heading-actions"><HealthBadge state={data.state} status={data.status} /></div>
      </div>

      <section className="vm-facts-bar" aria-label="VM system facts">
        <span><small>Operating system</small><strong>{data.facts.operatingSystem}</strong></span>
        <span><small>Kernel</small><strong>{data.facts.kernel}</strong></span>
        <span><small>Container runtime</small><strong>{data.facts.containerRuntime}</strong></span>
        <span><small>Running age</small><strong>{data.facts.runningAge}</strong></span>
        <span><small>Last patched</small><strong>{data.facts.lastPatch}</strong></span>
        <span><small>Load average</small><strong>{data.facts.loadAverage}</strong></span>
      </section>

      {activeIssues.length > 0 && <div className="resource-alert resource-alert--attention"><span><strong>{data.status}</strong><small>{data.statusDetail}</small></span><span className="active-issue-count">{activeIssues.length} active {activeIssues.length === 1 ? "issue" : "issues"}</span></div>}

      <section className="vm-capacity-grid" aria-label="VM capacity">
        {[{ label: "CPU", resource: data.cpu }, { label: "Memory", resource: data.memory }, { label: "Storage", resource: data.disk }].map((metric) => <article className="vm-capacity-card" key={metric.label}><div><small>{metric.label}</small><strong>{metric.resource.percentage}%</strong></div><ResourceMeter resource={metric.resource} /><footer><span>{metric.resource.used} of {metric.resource.limit} {metric.resource.unit}</span><small>Host utilisation</small></footer></article>)}
        <article className="vm-workload-card"><span><small>Devspaces</small><strong>{data.devspaces.length}</strong></span><span><small>Users</small><strong>{data.users.length}</strong></span><span><small>Running jobs</small><strong>{runningJobs.length}</strong></span><span><small>Processes</small><strong>{data.topProcesses.length}</strong></span></article>
      </section>

      <section className="vm-primary-grid">
        <article className="panel dashboard-section vm-devspaces-panel">
          <header><div><h2>Hosted devspaces</h2><p>Runtime health and allocation on this VM.</p></div><a href="#vms">VM inventory <ChevronRightIcon /></a></header>
          <div className="vm-devspace-table" role="table" aria-label={`Devspaces on ${data.vm.name}`}>
            <div className="vm-devspace-head" role="row"><span role="columnheader">Devspace</span><span role="columnheader">User</span><span role="columnheader">Health</span><span role="columnheader">Jobs</span><span role="columnheader">CPU</span><span role="columnheader">Memory</span><span role="columnheader">Storage</span><span role="columnheader">Age</span></div>
            {data.devspaces.map((runtime) => {
              const runtimeJobs = jobs.jobs.filter((job) => job.devspaceId === runtime.id && (job.state === "running" || job.state === "queued"));
              return <div className="vm-devspace-row" role="row" key={runtime.id}><a className="vm-devspace-name" role="cell" href={`#devspace/${runtime.id}`}><CubeIcon /><span><strong>{runtime.name}</strong><small>{runtime.image}</small></span></a><span className="jobs-owner-cell" role="cell"><span className="owner-avatar">{runtime.owner.initials}</span><span><strong>{runtime.owner.name}</strong><small>{runtime.owner.team}</small></span></span><span role="cell"><HealthBadge state={runtime.state} status={runtime.status} /></span><span role="cell" className="vm-job-count"><strong>{runtimeJobs.length}</strong><small>active</small></span><span role="cell"><ResourceMeter resource={runtime.cpu} compact /></span><span role="cell"><ResourceMeter resource={runtime.memory} compact /></span><span role="cell"><ResourceMeter resource={runtime.disk} compact /></span><span role="cell" className="vm-age-cell"><strong>{runtime.uptime}</strong><small>{runtime.lastActivity}</small></span></div>;
            })}
          </div>
        </article>

        <article className="panel dashboard-section vm-users-panel">
          <header><div><h2>Associated users</h2><p>Owners of devspaces hosted here.</p></div><span>{data.users.length} users</span></header>
          <div className="vm-user-list">{data.users.map((user) => {
            const userSpaces = data.devspaces.filter((runtime) => runtime.owner.id === user.id);
            return <div className="vm-user-row" key={user.id}><span className="owner-avatar">{user.initials}</span><span><strong>{user.name}</strong><small>{user.team}</small></span><span>{userSpaces.map((runtime) => <a href={`#devspace/${runtime.id}`} key={runtime.id}>{runtime.name}</a>)}</span></div>;
          })}</div>
        </article>
      </section>

      <section className="vm-secondary-grid">
        <article className="panel dashboard-section vm-issues-panel">
          <header><div><h2>VM issue history</h2><p>Current issues first, followed by the latest resolved events.</p></div><span>Current + last 10</span></header>
          <div className="vm-history-table" role="table" aria-label={`${data.vm.name} issue history`}>
            <div className="vm-history-head" role="row"><span role="columnheader">Issue</span><span role="columnheader">Status</span><span role="columnheader">Affected</span><span role="columnheader">Detected</span><span role="columnheader">Resolved</span></div>
            {data.issues.map((issue) => <div className={`vm-history-row vm-history-row--${issue.severity}`} role="row" key={issue.id}><span role="cell"><i /><span><strong>{issue.title}</strong><small>{issue.summary}</small></span></span><span role="cell"><em className={`vm-issue-status vm-issue-status--${issue.status}`}>{issue.status}</em></span><span role="cell">{issue.affectedDevspaces} {issue.affectedDevspaces === 1 ? "devspace" : "devspaces"}</span><span role="cell">{issue.occurredAt}</span><span role="cell">{issue.resolvedAt ?? "—"}</span></div>)}
          </div>
        </article>

        <article className="panel dashboard-section vm-processes-panel">
          <header><div><h2>Top processes</h2><p>Highest CPU consumers across hosted devspaces.</p></div><SystemsIcon /></header>
          <div className="vm-process-list">{data.topProcesses.map((process) => <div className={`vm-process-row vm-process-row--${process.category}`} key={`${process.devspaceId}-${process.pid}`}><span><strong>{process.name}</strong><small>PID {process.pid} · {process.command}</small></span><a href={`#devspace/${process.devspaceId}`}>{process.devspaceId}</a><span><strong>{process.cpuPercentage}%</strong><small>CPU</small></span><span><strong>{process.memoryPercentage}%</strong><small>Memory</small></span></div>)}</div>
        </article>
      </section>

      <a className="dashboard-back-link" href="#vms"><ArrowLeftIcon />Back to VM inventory</a>
    </main>
  );
}
