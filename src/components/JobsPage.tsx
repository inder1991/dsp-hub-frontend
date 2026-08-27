import { useMemo, useState } from "react";

import type { JobsData, JobState, KedroJobRun } from "../types/observability";
import { ArrowRightIcon, ChevronRightIcon, ComputeIcon, CubeIcon, SearchIcon } from "./Icons";

interface JobsPageProps {
  data: JobsData;
}

export function JobStateBadge({ state, status }: { state: JobState; status: string }) {
  return <span className={`job-state job-state--${state}`}><span />{status}</span>;
}

export function JobProgress({ job, compact = false }: { job: KedroJobRun; compact?: boolean }) {
  return (
    <div className={`job-progress ${compact ? "job-progress--compact" : ""}`}>
      <span><strong>{job.progressPercentage}%</strong><small>{job.nodesCompleted}/{job.nodesTotal} nodes</small></span>
      <span className="job-progress-track"><span style={{ width: `${job.progressPercentage}%` }} /></span>
    </div>
  );
}

export function JobsPage({ data }: JobsPageProps) {
  const [query, setQuery] = useState("");
  const [stateFilter, setStateFilter] = useState("all");
  const [pipelineFilter, setPipelineFilter] = useState("all");
  const [devspaceFilter, setDevspaceFilter] = useState("all");
  const [ownerFilter, setOwnerFilter] = useState("all");
  const [selectedId, setSelectedId] = useState(data.jobs[0]?.id ?? "");

  const pipelines = useMemo(() => [...new Set(data.jobs.map((item) => item.pipeline))].sort(), [data.jobs]);
  const devspaces = useMemo(() => [...new Map(data.jobs.map((item) => [item.devspaceId, item.devspaceName])).entries()].sort((a, b) => a[1].localeCompare(b[1])), [data.jobs]);
  const owners = useMemo(() => [...new Map(data.jobs.map((item) => [item.owner.id, item.owner])).values()].sort((a, b) => a.name.localeCompare(b.name)), [data.jobs]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return data.jobs.filter((item) => {
      const searchMatch = !normalized || [item.name, item.pipeline, item.project, item.devspaceName, item.vmName, item.owner.name]
        .some((value) => value.toLowerCase().includes(normalized));
      return searchMatch
        && (stateFilter === "all" || item.state === stateFilter)
        && (pipelineFilter === "all" || item.pipeline === pipelineFilter)
        && (devspaceFilter === "all" || item.devspaceId === devspaceFilter)
        && (ownerFilter === "all" || item.owner.id === ownerFilter);
    });
  }, [data.jobs, devspaceFilter, ownerFilter, pipelineFilter, query, stateFilter]);

  const selected = filtered.find((item) => item.id === selectedId) ?? filtered[0] ?? data.jobs[0];
  const failedJob = data.jobs.find((item) => item.state === "failed");

  return (
    <main className="main-content jobs-page" id="jobs">
      <div className="page-heading jobs-heading">
        <div>
          <div className="page-kicker">Local pipeline operations</div>
          <h1 className="page-title">Kedro jobs</h1>
          <p>Pipeline runs executing inside DSP devspaces, correlated with their users and host VMs.</p>
        </div>
        <div className="devspace-heading-meta"><span className="data-state data-state--live"><span />API snapshot</span><small>Last 24 hours</small></div>
      </div>

      <section className="jobs-summary-grid" aria-label="Kedro job summary">
        <article><small>Runs · 24 hours</small><strong>{data.summary.total24h}</strong><span>Across {devspaces.length} devspaces</span></article>
        <article className="jobs-summary-card--running"><small>Running</small><strong>{data.summary.running}</strong><span>Executing locally now</span></article>
        <article className="jobs-summary-card--success"><small>Succeeded</small><strong>{data.summary.succeeded}</strong><span>{data.summary.successRate}% completion success</span></article>
        <article className="jobs-summary-card--failed"><small>Failed</small><strong>{data.summary.failed}</strong><span>Requires investigation</span></article>
        <article><small>Queued</small><strong>{data.summary.queued}</strong><span>Waiting for a local runner</span></article>
      </section>

      {failedJob && (
        <div className="jobs-attention-strip">
          <span className="jobs-attention-state">Failed run</span>
          <span><strong>{failedJob.name}</strong><small>{failedJob.lastMessage}</small></span>
          <button type="button" onClick={() => { setStateFilter("failed"); setSelectedId(failedJob.id); }}>Inspect failed jobs <ArrowRightIcon /></button>
        </div>
      )}

      <section className="jobs-workbench">
        <div className="panel jobs-inventory-panel">
          <div className="jobs-inventory-heading"><div><h2>Pipeline runs</h2><p>{filtered.length} of {data.jobs.length} runs shown</p></div><span>Newest first</span></div>
          <div className="jobs-filterbar">
            <label className="devspace-search"><SearchIcon /><input aria-label="Search Kedro jobs" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search run, pipeline, devspace or user" /></label>
            <select aria-label="Filter jobs by state" value={stateFilter} onChange={(event) => setStateFilter(event.target.value)}><option value="all">All states</option><option value="running">Running</option><option value="failed">Failed</option><option value="succeeded">Succeeded</option><option value="queued">Queued</option></select>
            <select aria-label="Filter jobs by pipeline" value={pipelineFilter} onChange={(event) => setPipelineFilter(event.target.value)}><option value="all">All pipelines</option>{pipelines.map((pipeline) => <option value={pipeline} key={pipeline}>{pipeline}</option>)}</select>
            <select aria-label="Filter jobs by devspace" value={devspaceFilter} onChange={(event) => setDevspaceFilter(event.target.value)}><option value="all">All devspaces</option>{devspaces.map(([id, name]) => <option value={id} key={id}>{name}</option>)}</select>
            <select aria-label="Filter jobs by user" value={ownerFilter} onChange={(event) => setOwnerFilter(event.target.value)}><option value="all">All users</option>{owners.map((owner) => <option value={owner.id} key={owner.id}>{owner.name}</option>)}</select>
          </div>

          <div className="jobs-table" role="table" aria-label="Kedro pipeline runs">
            <div className="jobs-table-head" role="row"><span role="columnheader">Job run</span><span role="columnheader">State</span><span role="columnheader">Progress</span><span role="columnheader">Devspace</span><span role="columnheader">User</span><span role="columnheader">Host VM</span><span role="columnheader">Started</span><span role="columnheader">Duration</span></div>
            {filtered.map((item) => (
              <div className={`jobs-table-row ${selected?.id === item.id ? "jobs-table-row--selected" : ""}`} role="row" key={item.id} onClick={() => setSelectedId(item.id)}>
                <button className="job-name-cell" type="button" role="cell" onClick={() => setSelectedId(item.id)}><strong>{item.name}</strong><small>{item.pipeline}</small></button>
                <span role="cell"><JobStateBadge state={item.state} status={item.status} /></span>
                <span role="cell"><JobProgress job={item} compact /></span>
                <a className="jobs-resource-link" role="cell" href={`#devspace/${item.devspaceId}`}><CubeIcon /><span><strong>{item.devspaceName}</strong><small>{item.project}</small></span></a>
                <span className="jobs-owner-cell" role="cell"><span className="owner-avatar">{item.owner.initials}</span><span><strong>{item.owner.name}</strong><small>{item.owner.team}</small></span></span>
                <a className="jobs-vm-link" role="cell" href={`#vm/${item.vmId}`}><ComputeIcon /><span><strong>{item.vmName}</strong><small>View host</small></span></a>
                <span className="job-time-cell" role="cell"><strong>{item.startedAt}</strong><small>{item.trigger}</small></span>
                <span className="job-duration-cell" role="cell">{item.duration}</span>
              </div>
            ))}
          </div>
        </div>

        {selected && (
          <aside className="panel job-detail-panel" aria-label={`${selected.name} job details`}>
            <div className="job-detail-header"><div><small>Kedro run</small><h2>{selected.name}</h2><code>{selected.id}</code></div><JobStateBadge state={selected.state} status={selected.status} /></div>
            <div className={`job-message job-message--${selected.state}`}><strong>{selected.failedNode ? `Failed at ${selected.failedNode}` : selected.currentNode}</strong><span>{selected.lastMessage}</span></div>
            <section className="job-detail-section"><h3>Execution progress</h3><JobProgress job={selected} /><dl className="job-node-facts"><div><dt>Current node</dt><dd>{selected.currentNode}</dd></div><div><dt>Nodes</dt><dd>{selected.nodesCompleted} / {selected.nodesTotal}</dd></div><div><dt>Duration</dt><dd>{selected.duration}</dd></div><div><dt>Trigger</dt><dd>{selected.trigger}</dd></div></dl></section>
            <section className="job-detail-section"><h3>Resource relationship</h3><div className="job-resource-chain"><span><span className="owner-avatar">{selected.owner.initials}</span><span><small>User</small><strong>{selected.owner.name}</strong></span></span><ChevronRightIcon /><a href={`#devspace/${selected.devspaceId}`}><CubeIcon /><span><small>Devspace</small><strong>{selected.devspaceName}</strong></span></a><ChevronRightIcon /><a href={`#vm/${selected.vmId}`}><ComputeIcon /><span><small>Host VM</small><strong>{selected.vmName}</strong></span></a></div></section>
            <section className="job-detail-section"><h3>Observed peaks</h3><div className="job-peak-grid"><span><small>CPU peak</small><strong>{selected.cpuPeakPercentage}%</strong></span><span><small>Memory peak</small><strong>{selected.memoryPeakGb} GB</strong></span></div></section>
            <section className="job-detail-section"><h3>Run metadata</h3><dl className="job-run-metadata"><div><dt>Pipeline</dt><dd>{selected.pipeline}</dd></div><div><dt>Project</dt><dd>{selected.project}</dd></div><div><dt>Started</dt><dd>{selected.startedAt}</dd></div><div><dt>Owner</dt><dd>{selected.owner.name}</dd></div></dl></section>
            <div className="job-detail-actions"><a className="primary-action" href={`#devspace/${selected.devspaceId}`}>Open devspace dashboard</a><a className="secondary-action" href={`#vm/${selected.vmId}`}>Open VM <ChevronRightIcon /></a></div>
          </aside>
        )}
      </section>
    </main>
  );
}
