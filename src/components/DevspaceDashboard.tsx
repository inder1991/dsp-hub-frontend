import type { DevspaceDetailData, MetricSeries } from "../types/observability";
import { ArrowLeftIcon, ChevronRightIcon, ComputeIcon, CubeIcon } from "./Icons";
import { HealthBadge, ResourceMeter } from "./DevspacesPage";
import { JobProgress, JobStateBadge } from "./JobsPage";

interface DevspaceDashboardProps {
  data: DevspaceDetailData;
  onPlanned: (label: string) => void;
}

function MetricSparkline({ metric }: { metric: MetricSeries }) {
  const points = metric.samples.map((value, index) => {
    const x = metric.samples.length === 1 ? 0 : (index / (metric.samples.length - 1)) * 160;
    const y = 42 - (Math.min(100, Math.max(0, value)) / 100) * 36;
    return `${x},${y}`;
  }).join(" ");
  const tone = metric.resource.percentage >= 90 ? "critical" : metric.resource.percentage >= 80 ? "warning" : "normal";
  return (
    <svg className={`metric-sparkline metric-sparkline--${tone}`} viewBox="0 0 160 46" preserveAspectRatio="none" aria-label={`${metric.label} utilisation trend`}>
      <path d="M0 42H160" />
      <polyline points={points} />
    </svg>
  );
}

export function DevspaceDashboard({ data, onPlanned }: DevspaceDashboardProps) {
  const runtime = data.devspace;
  const activeIssues = data.vmIssues.filter((issue) => issue.status === "active");
  const activeJobs = data.jobs.filter((job) => job.state === "running" || job.state === "queued");

  return (
    <main className="main-content resource-dashboard devspace-dashboard" id="devspace-dashboard">
      <nav className="resource-breadcrumbs" aria-label="Breadcrumb"><a href="#devspaces">Devspaces</a><ChevronRightIcon /><span>{runtime.name}</span></nav>
      <div className="resource-dashboard-heading">
        <div className="resource-title-group"><span className="resource-title-icon"><CubeIcon /></span><div><div className="page-kicker">{runtime.kind} observability</div><h1>{runtime.name}</h1><p>{runtime.image} · Python {runtime.pythonVersion}</p></div></div>
        <div className="resource-heading-actions"><HealthBadge state={runtime.state} status={runtime.status} /><button type="button" onClick={() => onPlanned(`Open ${runtime.name}`)}>Open devspace</button></div>
      </div>

      <section className="resource-context-bar" aria-label="Devspace relationships">
        <span><span className="owner-avatar">{runtime.owner.initials}</span><span><small>Owner</small><strong>{runtime.owner.name}</strong><em>{runtime.owner.team}</em></span></span>
        <ChevronRightIcon />
        <a href={`#vm/${runtime.vm.id}`}><ComputeIcon /><span><small>Host VM</small><strong>{runtime.vm.name}</strong><em>{runtime.vm.tenant}</em></span></a>
        <ChevronRightIcon />
        <span><CubeIcon /><span><small>Runtime</small><strong>{runtime.name}</strong><em>Running {runtime.uptime}</em></span></span>
        <span className="resource-context-meta"><small>Last activity</small><strong>{runtime.lastActivity}</strong></span>
      </section>

      {(runtime.state === "attention" || runtime.state === "critical" || activeIssues.length > 0) && (
        <div className={`resource-alert resource-alert--${runtime.state}`}><span><strong>{runtime.status}</strong><small>{runtime.statusDetail}</small></span><a href={`#vm/${runtime.vm.id}`}>{activeIssues.length} active VM {activeIssues.length === 1 ? "issue" : "issues"}<ChevronRightIcon /></a></div>
      )}

      <section className="observability-metric-grid" aria-label="Devspace resource metrics">
        {data.metrics.map((metric) => (
          <article className={`observability-metric-card observability-metric-card--${metric.id}`} key={metric.id}>
            <div><span><small>{metric.label}</small><strong>{metric.resource.percentage}%</strong></span><span><small>Current allocation</small><strong>{metric.resource.used} / {metric.resource.limit} {metric.resource.unit}</strong></span></div>
            <MetricSparkline metric={metric} />
            <footer><span>{metric.window}</span><ResourceMeter resource={metric.resource} compact /></footer>
          </article>
        ))}
        <article className="observability-runtime-card"><span><small>Running age</small><strong>{runtime.uptime}</strong></span><span><small>Restarts</small><strong>{runtime.restartCount}</strong></span><span><small>Active jobs</small><strong>{activeJobs.length}</strong></span><span><small>Processes</small><strong>{data.processes.length}</strong></span></article>
      </section>

      <section className="devspace-observability-grid">
        <article className="panel dashboard-section jobs-on-devspace">
          <header><div><h2>Kedro jobs</h2><p>Pipeline runs executed locally in this devspace.</p></div><a href="#jobs">View all jobs <ChevronRightIcon /></a></header>
          <div className="embedded-jobs-table" role="table" aria-label={`Kedro jobs in ${runtime.name}`}>
            <div className="embedded-jobs-head" role="row"><span role="columnheader">Job</span><span role="columnheader">State</span><span role="columnheader">Progress</span><span role="columnheader">Started</span><span role="columnheader">Duration</span></div>
            {data.jobs.map((job) => <div className="embedded-job-row" role="row" key={job.id}><span role="cell"><strong>{job.name}</strong><small>{job.pipeline}</small></span><span role="cell"><JobStateBadge state={job.state} status={job.status} /></span><span role="cell"><JobProgress job={job} compact /></span><span role="cell"><strong>{job.startedAt}</strong><small>{job.currentNode}</small></span><span role="cell">{job.duration}</span></div>)}
            {data.jobs.length === 0 && <div className="embedded-empty">No Kedro jobs have run in this devspace.</div>}
          </div>
        </article>

        <article className="panel dashboard-section processes-panel">
          <header><div><h2>Processes</h2><p>Current processes inside the devspace.</p></div><span>{data.processes.length} visible</span></header>
          <div className="process-table" role="table" aria-label={`Processes in ${runtime.name}`}>
            <div className="process-table-head" role="row"><span role="columnheader">PID / Process</span><span role="columnheader">State</span><span role="columnheader">CPU</span><span role="columnheader">Memory</span><span role="columnheader">Age</span></div>
            {data.processes.map((process) => <div className={`process-row process-row--${process.category}`} role="row" key={process.pid}><span role="cell"><strong>{process.name}</strong><small>{process.pid} · {process.command}</small></span><span role="cell"><i />{process.status}</span><span role="cell">{process.cpuPercentage}%</span><span role="cell">{process.memoryPercentage}%</span><span role="cell">{process.runningAge}</span></div>)}
            {data.processes.length === 0 && <div className="embedded-empty">The devspace is stopped and has no running processes.</div>}
          </div>
        </article>
      </section>

      <section className="devspace-lower-grid">
        <article className="panel dashboard-section runtime-configuration-panel"><header><div><h2>Runtime configuration</h2><p>Image, runtime and service dependencies.</p></div></header><div className="runtime-configuration-content"><dl><div><dt>Base image</dt><dd>{runtime.image}</dd></div><div><dt>Python</dt><dd>{runtime.pythonVersion}</dd></div><div><dt>Host group</dt><dd>{runtime.vm.hostGroup}</dd></div><div><dt>Running age</dt><dd>{runtime.uptime}</dd></div></dl><div className="devspace-connections">{runtime.connections.map((connection) => <span className={`connection-state connection-state--${connection.state}`} key={connection.name}><span /><strong>{connection.name}</strong><small>{connection.status}</small></span>)}</div></div></article>
        <article className="panel dashboard-section host-issues-panel"><header><div><h2>Host VM issues</h2><p>Current and recent issues from {runtime.vm.name}.</p></div><a href={`#vm/${runtime.vm.id}`}>Open VM <ChevronRightIcon /></a></header><div className="host-issue-rows">{data.vmIssues.slice(0, 4).map((issue) => <div className={`host-issue-row host-issue-row--${issue.severity}`} key={issue.id}><span /><div><strong>{issue.title}</strong><small>{issue.summary}</small></div><span><em>{issue.status}</em><time>{issue.occurredAt}</time></span></div>)}{data.vmIssues.length === 0 && <div className="embedded-empty">No current or recent issues on this VM.</div>}</div></article>
      </section>

      <a className="dashboard-back-link" href="#devspaces"><ArrowLeftIcon />Back to devspace inventory</a>
    </main>
  );
}
