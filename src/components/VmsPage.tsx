import { useMemo, useState } from "react";

import type { VmInventoryData } from "../types/observability";
import { ArrowRightIcon, ChevronRightIcon, ComputeIcon, SearchIcon, SystemsIcon } from "./Icons";
import { HealthBadge, ResourceMeter } from "./DevspacesPage";

interface VmsPageProps {
  data: VmInventoryData;
}

export function VmsPage({ data }: VmsPageProps) {
  const [query, setQuery] = useState("");
  const [stateFilter, setStateFilter] = useState("all");
  const [environmentFilter, setEnvironmentFilter] = useState("all");
  const [hostGroupFilter, setHostGroupFilter] = useState("all");
  const [resourceFilter, setResourceFilter] = useState("all");

  const environments = useMemo(() => [...new Set(data.vms.map((item) => item.environment))].sort(), [data.vms]);
  const hostGroups = useMemo(() => [...new Set(data.vms.map((item) => item.vm.hostGroup))].sort(), [data.vms]);
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const stateOrder = { critical: 0, attention: 1, healthy: 2 };
    return data.vms.filter((item) => {
      const searchMatch = !normalized || [
        item.vm.name,
        item.vm.tenant,
        item.vm.hostGroup,
        item.environment,
        ...item.users.flatMap((user) => [user.name, user.team]),
      ].some((value) => value.toLowerCase().includes(normalized));
      const resourceMatch = resourceFilter === "all"
        || (resourceFilter === "cpu" && item.cpu.percentage >= 80)
        || (resourceFilter === "memory" && item.memory.percentage >= 80)
        || (resourceFilter === "disk" && item.disk.percentage >= 75);
      return searchMatch
        && (stateFilter === "all" || item.state === stateFilter)
        && (environmentFilter === "all" || item.environment === environmentFilter)
        && (hostGroupFilter === "all" || item.vm.hostGroup === hostGroupFilter)
        && resourceMatch;
    }).sort((a, b) => stateOrder[a.state] - stateOrder[b.state] || b.activeIssueCount - a.activeIssueCount || a.vm.name.localeCompare(b.vm.name));
  }, [data.vms, environmentFilter, hostGroupFilter, query, resourceFilter, stateFilter]);

  const activeFilters = [stateFilter, environmentFilter, hostGroupFilter, resourceFilter]
    .filter((value) => value !== "all").length + (query ? 1 : 0);

  function clearFilters() {
    setQuery("");
    setStateFilter("all");
    setEnvironmentFilter("all");
    setHostGroupFilter("all");
    setResourceFilter("all");
  }

  return (
    <main className="main-content vms-page" id="vms">
      <div className="page-heading vms-heading">
        <div>
          <div className="page-kicker">Infrastructure observability</div>
          <h1 className="page-title">Virtual machines</h1>
          <p>Host health, capacity and the users, devspaces and Kedro jobs running across the DSP VM fleet.</p>
        </div>
        <div className="devspace-heading-meta"><span className="data-state data-state--live"><span />API snapshot</span><small>Updated just now</small></div>
      </div>

      <section className="vm-inventory-summary" aria-label="VM fleet summary">
        <article className="vm-inventory-summary-card"><small>VM fleet</small><strong>{data.summary.total}</strong><span>{data.summary.online} online</span></article>
        <article className="vm-inventory-summary-card vm-inventory-summary-card--healthy"><small>Healthy</small><strong>{data.summary.healthy}</strong><span>Within thresholds</span></article>
        <article className="vm-inventory-summary-card vm-inventory-summary-card--attention"><small>Needs attention</small><strong>{data.summary.attention}</strong><span>Active warning</span></article>
        <article className="vm-inventory-summary-card vm-inventory-summary-card--critical"><small>Critical</small><strong>{data.summary.critical}</strong><span>Immediate review</span></article>
        <article className="vm-inventory-workload-card">
          <span><small>Devspaces</small><strong>{data.summary.devspaces}</strong></span>
          <span><small>Users</small><strong>{data.summary.users}</strong></span>
          <span><small>Active jobs</small><strong>{data.summary.activeJobs}</strong></span>
          <span><small>Active issues</small><strong>{data.summary.activeIssues}</strong></span>
        </article>
      </section>

      {data.summary.activeIssues > 0 && (
        <div className="vm-fleet-attention">
          <span className="vm-fleet-attention-icon"><SystemsIcon /></span>
          <span><strong>{data.summary.activeIssues} active host {data.summary.activeIssues === 1 ? "issue" : "issues"}</strong><small>Open an affected VM to correlate incidents with its users, devspaces, jobs and processes.</small></span>
          <button type="button" onClick={() => setStateFilter("critical")}>Show critical hosts <ArrowRightIcon /></button>
        </div>
      )}

      <section className="panel vm-inventory-panel">
        <header className="vm-inventory-header">
          <div><h2>VM inventory</h2><p>{filtered.length} of {data.vms.length} hosts shown</p></div>
          {activeFilters > 0 && <button type="button" onClick={clearFilters}>Clear {activeFilters} {activeFilters === 1 ? "filter" : "filters"}</button>}
        </header>
        <div className="vm-inventory-filters">
          <label className="vm-inventory-search"><SearchIcon /><input aria-label="Search VMs" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search VM, tenant, host group or user" /></label>
          <select aria-label="Filter VMs by health" value={stateFilter} onChange={(event) => setStateFilter(event.target.value)}>
            <option value="all">All health states</option><option value="healthy">Healthy</option><option value="attention">Needs attention</option><option value="critical">Critical</option>
          </select>
          <select aria-label="Filter VMs by environment" value={environmentFilter} onChange={(event) => setEnvironmentFilter(event.target.value)}>
            <option value="all">All environments</option>{environments.map((environment) => <option value={environment} key={environment}>{environment}</option>)}
          </select>
          <select aria-label="Filter VMs by host group" value={hostGroupFilter} onChange={(event) => setHostGroupFilter(event.target.value)}>
            <option value="all">All host groups</option>{hostGroups.map((group) => <option value={group} key={group}>{group}</option>)}
          </select>
          <select aria-label="Filter VMs by resource pressure" value={resourceFilter} onChange={(event) => setResourceFilter(event.target.value)}>
            <option value="all">Resource pressure</option><option value="cpu">High CPU (80%+)</option><option value="memory">High memory (80%+)</option><option value="disk">Storage risk (75%+)</option>
          </select>
        </div>

        <div className="vm-inventory-table-scroll">
          <div className="vm-inventory-table" role="table" aria-label="DSP virtual machines">
            <div className="vm-inventory-table-head" role="row">
              <span role="columnheader">Virtual machine</span><span role="columnheader">Health</span><span role="columnheader">Devspaces</span><span role="columnheader">Associated users</span><span role="columnheader">Jobs</span><span role="columnheader">CPU</span><span role="columnheader">Memory</span><span role="columnheader">Storage</span><span role="columnheader">Host age</span><span role="columnheader">Issues</span><span role="columnheader">Dashboard</span>
            </div>
            {filtered.map((item) => (
              <div className={`vm-inventory-row vm-inventory-row--${item.state}`} role="row" key={item.vm.id}>
                <span role="cell"><a className="vm-inventory-name" href={`#vm/${item.vm.id}`}><span className="vm-inventory-icon"><ComputeIcon /></span><span><strong>{item.vm.name}</strong><small>{item.vm.tenant} · {item.vm.hostGroup}</small></span></a></span>
                <span role="cell"><HealthBadge state={item.state} status={item.status} /><small className="vm-environment-label">{item.environment}</small></span>
                <span className="vm-inventory-count" role="cell"><strong>{item.devspaceCount}</strong><small>{item.activeDevspaces} active</small></span>
                <span className="vm-associated-users" role="cell"><span>{item.users.slice(0, 3).map((user) => <i title={user.name} key={user.id}>{user.initials}</i>)}</span><small>{item.userCount} {item.userCount === 1 ? "user" : "users"}</small></span>
                <span className="vm-inventory-count" role="cell"><strong>{item.activeJobs}</strong><small>active</small></span>
                <span role="cell"><ResourceMeter resource={item.cpu} compact /></span>
                <span role="cell"><ResourceMeter resource={item.memory} compact /></span>
                <span role="cell"><ResourceMeter resource={item.disk} compact /></span>
                <span className="vm-host-age" role="cell"><strong>{item.runningAge}</strong><small>running</small></span>
                <span className={`vm-inventory-issues ${item.activeIssueCount ? "vm-inventory-issues--active" : ""}`} role="cell"><strong>{item.activeIssueCount}</strong><small>{item.activeIssueCount ? `Latest ${item.lastEvent}` : "No active issues"}</small></span>
                <span role="cell"><a className="vm-row-open" href={`#vm/${item.vm.id}`} aria-label={`Open ${item.vm.name} dashboard`}>Open <ChevronRightIcon /></a></span>
              </div>
            ))}
            {filtered.length === 0 && <div className="devspace-empty"><strong>No VMs match these filters</strong><span>Clear filters or broaden your search.</span><button type="button" onClick={clearFilters}>Clear all filters</button></div>}
          </div>
        </div>
      </section>
    </main>
  );
}
