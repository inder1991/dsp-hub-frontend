import { useMemo, useState } from "react";

import type { AdminControlPlaneData, IngestionState } from "../types/data-platform";
import { DatabaseIcon, NetworkIcon, SearchIcon, WarningIcon } from "./Icons";
import { IngestionBadge, YarnQueueCard } from "./DataAccessPage";

interface AdminDataPlatformPageProps {
  data: AdminControlPlaneData;
}

export function AdminDataPlatformPage({ data }: AdminDataPlatformPageProps) {
  const [query, setQuery] = useState("");
  const [teamFilter, setTeamFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const teams = useMemo(() => [...new Set(data.hiveTables.flatMap((item) => item.teams))].sort(), [data.hiveTables]);
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const order: Record<IngestionState, number> = { failed: 0, not_received: 1, late: 2, pending: 3, succeeded: 4 };
    return data.hiveTables.filter((item) => {
      const searchMatch = !normalized || [item.fullyQualifiedName, item.ownerTeam, ...item.ldapGroups, ...item.teams]
        .some((value) => value.toLowerCase().includes(normalized));
      return searchMatch
        && (teamFilter === "all" || item.teams.includes(teamFilter))
        && (statusFilter === "all" || item.ingestion.status === statusFilter);
    }).sort((left, right) => order[left.ingestion.status] - order[right.ingestion.status]);
  }, [data.hiveTables, query, statusFilter, teamFilter]);

  return (
    <main className="main-content admin-page admin-data-page" id="admin-data">
      <div className="page-heading admin-page-heading">
        <div><div className="page-kicker">Platform governance</div><h1 className="page-title">Data platform operations</h1><p>Hive entitlements and morning ingestion correlated with LDAP groups, teams and YARN queues.</p></div>
        <a className="admin-back-link" href="#admin">← Admin overview</a>
      </div>

      <section className="admin-data-summary" aria-label="Data platform operations summary">
        <article><DatabaseIcon /><span><small>Governed tables</small><strong>{data.summary.governedTables}</strong></span></article>
        <article className="admin-data-summary--danger"><WarningIcon /><span><small>Ingestion attention</small><strong>{data.summary.ingestionAttention}</strong></span></article>
        <article><NetworkIcon /><span><small>Teams with queues</small><strong>{new Set(data.yarnQueues.map((queue) => queue.team)).size}</strong></span></article>
        <article className="admin-data-summary--warning"><WarningIcon /><span><small>YARN queue attention</small><strong>{data.summary.yarnQueueAttention}</strong></span></article>
        <article><span><small>Business date</small><strong>26 Aug 2026</strong><em>Morning operational snapshot</em></span></article>
      </section>

      <section className="panel admin-hive-panel">
        <header><div><h2>Hive access & morning ingestion</h2><p>{filtered.length} of {data.hiveTables.length} governed table entitlements shown</p></div><span>LDAP / Ranger catalogue</span></header>
        <div className="admin-hive-filters">
          <label><SearchIcon /><input aria-label="Search governed Hive access" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search table, team, owner or LDAP group" /></label>
          <select aria-label="Filter Hive access by team" value={teamFilter} onChange={(event) => setTeamFilter(event.target.value)}><option value="all">All teams</option>{teams.map((team) => <option value={team} key={team}>{team}</option>)}</select>
          <select aria-label="Filter Hive access by ingestion status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="all">All ingestion states</option><option value="failed">Failed</option><option value="not_received">Not received</option><option value="late">Late</option><option value="pending">In progress</option><option value="succeeded">Complete</option></select>
        </div>
        <div className="admin-hive-table" role="table" aria-label="Hive access and morning ingestion across teams">
          <div role="row"><span role="columnheader">Hive table</span><span role="columnheader">Owner</span><span role="columnheader">Teams</span><span role="columnheader">LDAP groups</span><span role="columnheader">Users</span><span role="columnheader">Privilege</span><span role="columnheader">Morning ingestion</span><span role="columnheader">SLA / completion</span></div>
          {filtered.map((item) => <div role="row" key={item.id} className={`admin-hive-row--${item.ingestion.status}`}>
            <span role="cell"><DatabaseIcon /><span><strong>{item.fullyQualifiedName}</strong><small>{item.database}</small></span></span>
            <span role="cell"><strong>{item.ownerTeam}</strong></span>
            <span role="cell">{item.teams.map((team) => <i key={team}>{team}</i>)}</span>
            <span role="cell">{item.ldapGroups.map((group) => <code key={group}>{group}</code>)}</span>
            <span role="cell"><strong>{item.userCount}</strong><small>entitled</small></span>
            <span role="cell"><code>{item.privileges.join(", ")}</code></span>
            <span role="cell"><IngestionBadge state={item.ingestion.status} label={item.ingestion.statusLabel} /><small>{item.ingestion.summary}</small></span>
            <span role="cell"><strong>{item.ingestion.completedAt ?? item.ingestion.scheduledFor}</strong><small>{item.ingestion.slaState.replace("_", " ")}</small></span>
          </div>)}
        </div>
      </section>

      <section className="admin-yarn-section">
        <header><div><h2>YARN queue status by team</h2><p>Capacity and application pressure correlated with owning LDAP groups.</p></div><span>{data.yarnQueues.filter((queue) => queue.state !== "healthy").length} queues need attention</span></header>
        <div className="admin-yarn-grid">{data.yarnQueues.map((queue) => <YarnQueueCard queue={queue} key={queue.id} />)}</div>
      </section>
    </main>
  );
}
