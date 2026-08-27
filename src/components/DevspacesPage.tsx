import { useMemo, useState } from "react";

import type { Devspace, DevspaceState, DevspacesData, ResourceUtilization } from "../types/devspaces";
import { ArrowRightIcon, ChevronRightIcon, ComputeIcon, CubeIcon, SearchIcon, SystemsIcon } from "./Icons";

interface DevspacesPageProps {
  data: DevspacesData;
}

export function ResourceMeter({ resource, compact = false }: { resource: ResourceUtilization; compact?: boolean }) {
  const tone = resource.percentage >= 90 ? "critical" : resource.percentage >= 80 ? "warning" : "normal";
  return (
    <div className={`resource-meter resource-meter--${tone} ${compact ? "resource-meter--compact" : ""}`}>
      <div className="resource-meter-label">
        {!compact && <span>{resource.used} / {resource.limit} {resource.unit}</span>}
        <strong>{resource.percentage}%</strong>
      </div>
      <span className="resource-meter-track"><span style={{ width: `${resource.percentage}%` }} /></span>
    </div>
  );
}

export function HealthBadge({ state, status }: { state: DevspaceState; status: string }) {
  return <span className={`devspace-health devspace-health--${state}`}><span />{status}</span>;
}

export function DevspacesPage({ data }: DevspacesPageProps) {
  const [query, setQuery] = useState("");
  const [stateFilter, setStateFilter] = useState("all");
  const [ownerFilter, setOwnerFilter] = useState("all");
  const [vmFilter, setVmFilter] = useState("all");
  const [imageFilter, setImageFilter] = useState("all");
  const [resourceFilter, setResourceFilter] = useState("all");
  const [selectedId, setSelectedId] = useState(data.devspaces[0]?.id ?? "");

  const owners = useMemo(() => [...new Map(data.devspaces.map((item) => [item.owner.id, item.owner])).values()].sort((a, b) => a.name.localeCompare(b.name)), [data.devspaces]);
  const vms = useMemo(() => [...new Map(data.devspaces.map((item) => [item.vm.id, item.vm])).values()].sort((a, b) => a.name.localeCompare(b.name)), [data.devspaces]);
  const images = useMemo(() => [...new Set(data.devspaces.map((item) => item.image))].sort(), [data.devspaces]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return data.devspaces.filter((item) => {
      const searchMatch = !normalized || [item.name, item.owner.name, item.owner.team, item.vm.name, item.image]
        .some((value) => value.toLowerCase().includes(normalized));
      const stateMatch = stateFilter === "all" || item.state === stateFilter || (stateFilter === "attention" && item.state === "critical");
      const resourceMatch = resourceFilter === "all"
        || (resourceFilter === "cpu" && item.cpu.percentage >= 80)
        || (resourceFilter === "memory" && item.memory.percentage >= 80)
        || (resourceFilter === "disk" && item.disk.percentage >= 80);
      return searchMatch
        && stateMatch
        && resourceMatch
        && (ownerFilter === "all" || item.owner.id === ownerFilter)
        && (vmFilter === "all" || item.vm.id === vmFilter)
        && (imageFilter === "all" || item.image === imageFilter);
    });
  }, [data.devspaces, imageFilter, ownerFilter, query, resourceFilter, stateFilter, vmFilter]);

  const selected = filtered.find((item) => item.id === selectedId) ?? filtered[0] ?? data.devspaces[0];
  const selectedVmIssues = selected ? data.vmIssues.filter((issue) => issue.vmId === selected.vm.id).slice(0, 10) : [];
  const activeFilters = [stateFilter, ownerFilter, vmFilter, imageFilter, resourceFilter].filter((value) => value !== "all").length + (query ? 1 : 0);

  function currentVmIssueCount(item: Devspace) {
    return data.vmIssues.filter((issue) => issue.vmId === item.vm.id && issue.status === "active").length;
  }

  function clearFilters() {
    setQuery("");
    setStateFilter("all");
    setOwnerFilter("all");
    setVmFilter("all");
    setImageFilter("all");
    setResourceFilter("all");
  }

  return (
    <main className="main-content devspaces-page" id="devspaces">
      <div className="page-heading devspaces-heading">
        <div>
          <div className="page-kicker">Runtime operations</div>
          <h1 className="page-title">Devspaces</h1>
          <p>Health, ownership, VM placement and capacity for managed DSP development environments.</p>
        </div>
        <div className="devspace-heading-meta">
          <span className="data-state data-state--live"><span />API snapshot</span>
          <small>Updated just now</small>
        </div>
      </div>

      <section className="devspace-summary-grid" aria-label="Devspace fleet summary">
        <article className="devspace-summary-card"><small>Total devspaces</small><strong>{data.summary.total}</strong><span>{data.summary.active} currently active</span></article>
        <article className="devspace-summary-card devspace-summary-card--healthy"><small>Healthy</small><strong>{data.summary.healthy}</strong><span>Operating normally</span></article>
        <article className="devspace-summary-card devspace-summary-card--attention"><small>Needs attention</small><strong>{data.summary.needsAttention}</strong><span>Capacity or health risk</span></article>
        <article className="devspace-summary-card"><small>Stopped</small><strong>{data.summary.stopped}</strong><span>Not consuming compute</span></article>
        <article className="fleet-capacity-card">
          <div className="fleet-capacity-heading"><span><SystemsIcon /><strong>VM fleet capacity</strong></span><small>{data.fleet.onlineVms}/{data.fleet.vmCount} VMs online</small></div>
          <div className="fleet-capacity-meters">
            <span><small>CPU allocated</small><ResourceMeter resource={{ used: data.fleet.cpuPercentage, limit: 100, unit: "%", percentage: data.fleet.cpuPercentage }} compact /></span>
            <span><small>Memory allocated</small><ResourceMeter resource={{ used: data.fleet.memoryPercentage, limit: 100, unit: "%", percentage: data.fleet.memoryPercentage }} compact /></span>
            <span><small>Storage allocated</small><ResourceMeter resource={{ used: data.fleet.storagePercentage, limit: 100, unit: "%", percentage: data.fleet.storagePercentage }} compact /></span>
          </div>
        </article>
      </section>

      <div className="devspace-attention-strip">
        <span className="devspace-attention-icon"><ComputeIcon /></span>
        <span><strong>{data.fleet.atRiskVms} VM requires attention</strong><small>One or more hosted devspaces are approaching their assigned resource limits.</small></span>
        <button type="button" onClick={() => setStateFilter("attention")}>Show affected devspaces <ArrowRightIcon /></button>
      </div>

      <section className="devspace-workbench">
        <div className="panel devspace-inventory-panel">
          <div className="devspace-inventory-header">
            <div><h2>Devspace inventory</h2><p>{filtered.length} of {data.devspaces.length} environments shown</p></div>
            {activeFilters > 0 && <button className="clear-filter-button" type="button" onClick={clearFilters}>Clear {activeFilters} {activeFilters === 1 ? "filter" : "filters"}</button>}
          </div>
          <div className="devspace-filterbar">
            <label className="devspace-search"><SearchIcon /><input aria-label="Search devspaces" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search devspace, user, VM or image" /></label>
            <select aria-label="Filter by health" value={stateFilter} onChange={(event) => setStateFilter(event.target.value)}>
              <option value="all">All health states</option><option value="healthy">Healthy</option><option value="attention">Needs attention</option><option value="stopped">Stopped</option>
            </select>
            <select aria-label="Filter by user" value={ownerFilter} onChange={(event) => setOwnerFilter(event.target.value)}>
              <option value="all">All users</option>{owners.map((owner) => <option value={owner.id} key={owner.id}>{owner.name}</option>)}
            </select>
            <select aria-label="Filter by VM" value={vmFilter} onChange={(event) => setVmFilter(event.target.value)}>
              <option value="all">All VMs</option>{vms.map((vm) => <option value={vm.id} key={vm.id}>{vm.name}</option>)}
            </select>
            <select aria-label="Filter by image" value={imageFilter} onChange={(event) => setImageFilter(event.target.value)}>
              <option value="all">All images</option>{images.map((image) => <option value={image} key={image}>{image}</option>)}
            </select>
            <select aria-label="Filter by resource pressure" value={resourceFilter} onChange={(event) => setResourceFilter(event.target.value)}>
              <option value="all">Resource risk</option><option value="cpu">High CPU (80%+)</option><option value="memory">High memory (80%+)</option><option value="disk">Low disk space (80%+ used)</option>
            </select>
          </div>

          <div className="devspace-table-scroll">
            <div className="devspace-table" role="table" aria-label="Devspaces running on DSP VMs">
              <div className="devspace-table-head" role="row">
                <span role="columnheader">Devspace</span><span role="columnheader">User</span><span role="columnheader">Host VM</span><span role="columnheader">Health</span><span role="columnheader">Running age</span><span role="columnheader">Image</span><span role="columnheader">CPU</span><span role="columnheader">Memory</span><span role="columnheader">Disk</span>
              </div>
              {filtered.map((item) => (
                <div className={`devspace-table-row ${selected?.id === item.id ? "devspace-table-row--selected" : ""}`} role="row" key={item.id} onClick={() => setSelectedId(item.id)}>
                  <span className="devspace-name-cell" role="cell"><CubeIcon /><span><a href={`#devspace/${item.id}`}>{item.name}</a><small>{item.kind}</small></span></span>
                  <span className="devspace-owner-cell" role="cell"><span className="owner-avatar">{item.owner.initials}</span><span><strong>{item.owner.name}</strong><small>{item.owner.team}</small></span></span>
                  <a className="devspace-vm-cell" role="cell" href={`#vm/${item.vm.id}`}><strong>{item.vm.name}</strong><small className={currentVmIssueCount(item) > 0 ? "vm-current-issue-count" : undefined}>{currentVmIssueCount(item) > 0 ? `${currentVmIssueCount(item)} current ${currentVmIssueCount(item) === 1 ? "issue" : "issues"}` : item.vm.tenant}</small></a>
                  <span role="cell"><HealthBadge state={item.state} status={item.status} /></span>
                  <span className="devspace-age-cell" role="cell"><strong>{item.uptime}</strong><small>{item.state === "stopped" ? `Last active ${item.lastActivity}` : `Active ${item.lastActivity}`}</small></span>
                  <span className="devspace-image-cell" role="cell"><strong>{item.image.split(":")[0]}</strong><small>{item.image.split(":")[1]}</small></span>
                  <span role="cell"><ResourceMeter resource={item.cpu} compact /></span>
                  <span role="cell"><ResourceMeter resource={item.memory} compact /></span>
                  <span role="cell"><ResourceMeter resource={item.disk} compact /></span>
                </div>
              ))}
              {filtered.length === 0 && <div className="devspace-empty"><strong>No devspaces match these filters</strong><span>Clear filters or broaden your search.</span><button type="button" onClick={clearFilters}>Clear all filters</button></div>}
            </div>
          </div>
        </div>

        {selected && (
          <aside className="panel devspace-detail-panel" aria-label={`${selected.name} details`}>
            <div className="devspace-detail-header">
              <span className="devspace-detail-icon"><CubeIcon /></span>
              <div><small>{selected.kind}</small><h2>{selected.name}</h2><span className="devspace-header-image">{selected.image}</span></div>
              <HealthBadge state={selected.state} status={selected.status} />
            </div>
            <p className={`devspace-health-note devspace-health-note--${selected.state}`}>{selected.statusDetail}</p>

            <section className="devspace-detail-section">
              <h3>Resource relationship</h3>
              <div className="resource-relationship">
                <span><span className="owner-avatar">{selected.owner.initials}</span><span><small>User</small><strong>{selected.owner.name}</strong></span></span>
                <ChevronRightIcon />
                <a href={`#vm/${selected.vm.id}`}><ComputeIcon /><span><small>Host VM</small><strong>{selected.vm.name}</strong></span></a>
                <ChevronRightIcon />
                <span><CubeIcon /><span><small>Runtime</small><strong>{selected.name}</strong></span></span>
              </div>
            </section>

            <section className="devspace-detail-section vm-issues-section">
              <div className="detail-section-heading"><h3>Host VM issues</h3><small>Current + last 10</small></div>
              <div className="vm-issue-list">
                {selectedVmIssues.map((issue) => (
                  <article className={`vm-issue vm-issue--${issue.severity}`} key={issue.id}>
                    <span className="vm-issue-mark" />
                    <span><strong>{issue.title}</strong><small>{issue.summary}</small><time>{issue.occurredAt}{issue.resolvedAt ? ` · Resolved ${issue.resolvedAt}` : ""}</time></span>
                    <span className={`vm-issue-status vm-issue-status--${issue.status}`}>{issue.status}</span>
                  </article>
                ))}
                {selectedVmIssues.length === 0 && <div className="vm-issue-empty"><strong>No recent VM issues</strong><span>No current or historical issues are associated with this host.</span></div>}
              </div>
            </section>

            <section className="devspace-detail-section">
              <h3>Current utilisation</h3>
              <div className="detail-utilisation">
                <div><span><strong>CPU</strong><small>{selected.cpu.used} of {selected.cpu.limit} {selected.cpu.unit}</small></span><ResourceMeter resource={selected.cpu} /></div>
                <div><span><strong>Memory</strong><small>{selected.memory.used} of {selected.memory.limit} {selected.memory.unit}</small></span><ResourceMeter resource={selected.memory} /></div>
                <div><span><strong>Disk</strong><small>{selected.disk.used} of {selected.disk.limit} {selected.disk.unit}</small></span><ResourceMeter resource={selected.disk} /></div>
              </div>
            </section>

            <section className="devspace-detail-section">
              <h3>Runtime details</h3>
              <dl className="devspace-runtime-details">
                <div className="runtime-image-detail"><dt>Base image</dt><dd>{selected.image}</dd></div>
                <div><dt>Python</dt><dd>{selected.pythonVersion}</dd></div>
                <div><dt>Running age</dt><dd>{selected.uptime}</dd></div>
                <div><dt>Restarts</dt><dd>{selected.restartCount}</dd></div>
                <div><dt>Last activity</dt><dd>{selected.lastActivity}</dd></div>
                <div><dt>Host group</dt><dd>{selected.vm.hostGroup}</dd></div>
              </dl>
            </section>

            <section className="devspace-detail-section">
              <h3>Service connections</h3>
              <div className="devspace-connections">
                {selected.connections.map((connection) => <span className={`connection-state connection-state--${connection.state}`} key={connection.name}><span /><strong>{connection.name}</strong><small>{connection.status}</small></span>)}
              </div>
            </section>

            <div className="devspace-detail-actions">
              <a className="primary-action" href={`#devspace/${selected.id}`}>Full dashboard</a>
              <a className="secondary-action" href="#support">Get support</a>
            </div>
          </aside>
        )}
      </section>
    </main>
  );
}
