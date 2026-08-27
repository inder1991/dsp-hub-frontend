import { useMemo, useState } from "react";

import type { IngestionState, UserDataAccessData, YarnQueueStatus } from "../types/data-platform";
import { ClockIcon, DatabaseIcon, NetworkIcon, SearchIcon, WarningIcon } from "./Icons";

interface DataAccessPageProps {
  data: UserDataAccessData;
}

export function IngestionBadge({ state, label }: { state: IngestionState; label: string }) {
  return <span className={`ingestion-badge ingestion-badge--${state}`}><span />{label}</span>;
}

export function YarnQueueCard({ queue, compact = false }: { queue: YarnQueueStatus; compact?: boolean }) {
  return (
    <article className={`yarn-queue-card yarn-queue-card--${queue.state} ${compact ? "yarn-queue-card--compact" : ""}`}>
      <header>
        <span><small>{queue.team}</small><strong>{queue.queuePath}</strong></span>
        <span className={`queue-state queue-state--${queue.state}`}><span />{queue.status}</span>
      </header>
      <div className="queue-capacity-heading"><span>Used capacity</span><strong>{queue.usedCapacityPercentage}%</strong></div>
      <div className="queue-capacity-track"><span style={{ width: `${Math.min(queue.usedCapacityPercentage, 100)}%` }} /></div>
      <dl>
        <div><dt>Applications</dt><dd>{queue.runningApplications} running</dd></div>
        <div><dt>Pending</dt><dd>{queue.pendingApplications}</dd></div>
        <div><dt>Memory</dt><dd>{queue.allocatedMemoryGb} GB</dd></div>
      </dl>
      <footer><span>{queue.ldapGroup}</span><small>{queue.observedAt}</small></footer>
    </article>
  );
}

export function DataAccessPage({ data }: DataAccessPageProps) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [databaseFilter, setDatabaseFilter] = useState("all");

  const databases = useMemo(() => [...new Set(data.tables.map((item) => item.database))].sort(), [data.tables]);
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const order: Record<IngestionState, number> = { failed: 0, not_received: 1, late: 2, pending: 3, succeeded: 4 };
    return data.tables.filter((item) => {
      const searchMatch = !normalized || [item.fullyQualifiedName, item.ownerTeam, item.access.ldapGroup]
        .some((value) => value.toLowerCase().includes(normalized));
      return searchMatch
        && (statusFilter === "all" || item.ingestion.status === statusFilter)
        && (databaseFilter === "all" || item.database === databaseFilter);
    }).sort((left, right) => order[left.ingestion.status] - order[right.ingestion.status]
      || left.fullyQualifiedName.localeCompare(right.fullyQualifiedName));
  }, [data.tables, databaseFilter, query, statusFilter]);

  const attentionCount = data.summary.late + data.summary.failed + data.summary.pending;

  return (
    <main className="main-content data-access-page" id="data-access">
      <div className="page-heading data-access-heading">
        <div>
          <div className="page-kicker">Governed data access</div>
          <h1 className="page-title">My data access</h1>
          <p>Hive tables available through your team and LDAP memberships, with today&apos;s morning ingestion status.</p>
        </div>
        <div className="data-access-context">
          <span className="user-avatar">AM</span>
          <span><strong>{data.principal.name}</strong><small>{data.principal.enterpriseUserId} · {data.principal.team}</small></span>
        </div>
      </div>

      <section className="data-access-summary" aria-label="Morning data access summary">
        <article><span className="summary-icon"><DatabaseIcon /></span><span><small>Accessible tables</small><strong>{data.summary.accessibleTables}</strong><em>Across {databases.length} databases</em></span></article>
        <article className="data-summary--success"><small>Morning complete</small><strong>{data.summary.ingested}</strong><span>Within SLA</span></article>
        <article className="data-summary--warning"><small>Late</small><strong>{data.summary.late}</strong><span>Completed after SLA</span></article>
        <article className="data-summary--danger"><small>Failed</small><strong>{data.summary.failed}</strong><span>Owner investigating</span></article>
        <article className="data-summary--pending"><small>Awaiting</small><strong>{data.summary.pending}</strong><span>Running or not received</span></article>
        <article className="data-summary-date"><ClockIcon /><span><small>Business date</small><strong>{data.summary.businessDate}</strong></span></article>
      </section>

      {attentionCount > 0 && (
        <div className="data-access-attention">
          <span><WarningIcon /></span>
          <span><strong>{attentionCount} accessible tables need attention this morning</strong><small>Failed, late and awaiting deliveries are listed first below.</small></span>
          <button type="button" onClick={() => setStatusFilter(data.summary.failed ? "failed" : "pending")}>Review attention items</button>
        </div>
      )}

      <section className="data-access-workbench">
        <div className="panel data-catalogue-panel">
          <header className="data-catalogue-header">
            <div><h2>Accessible Hive tables</h2><p>{filtered.length} of {data.tables.length} entitlements shown</p></div>
            <span>Morning status · {data.summary.businessDate}</span>
          </header>
          <div className="data-catalogue-filters">
            <label><SearchIcon /><input aria-label="Search accessible tables" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search table, owner or LDAP group" /></label>
            <select aria-label="Filter tables by ingestion status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="all">All ingestion states</option><option value="failed">Failed</option><option value="not_received">Not received</option><option value="late">Late</option><option value="pending">In progress</option><option value="succeeded">Complete</option>
            </select>
            <select aria-label="Filter tables by database" value={databaseFilter} onChange={(event) => setDatabaseFilter(event.target.value)}>
              <option value="all">All databases</option>{databases.map((database) => <option value={database} key={database}>{database}</option>)}
            </select>
          </div>
          <div className="data-catalogue-scroll">
            <div className="data-catalogue-table" role="table" aria-label="Accessible Hive table ingestion status">
              <div className="data-catalogue-table-head" role="row">
                <span role="columnheader">Hive table</span><span role="columnheader">Data owner</span><span role="columnheader">Access through</span><span role="columnheader">Privilege</span><span role="columnheader">Morning ingestion</span><span role="columnheader">Completion / SLA</span>
              </div>
              {filtered.map((item) => (
                <div className={`data-catalogue-row data-catalogue-row--${item.ingestion.status}`} role="row" key={item.id}>
                  <span role="cell"><DatabaseIcon /><span><strong>{item.fullyQualifiedName}</strong><small>{item.platform} · {item.database}</small></span></span>
                  <span role="cell"><strong>{item.ownerTeam}</strong><small>Dataset owner</small></span>
                  <span role="cell"><strong>{item.access.ldapGroup}</strong><small>{item.access.team}</small></span>
                  <span role="cell"><code>{item.access.privilege}</code><small>{item.access.policyName}</small></span>
                  <span role="cell"><IngestionBadge state={item.ingestion.status} label={item.ingestion.statusLabel} /><small>{item.ingestion.summary}</small></span>
                  <span role="cell"><strong>{item.ingestion.completedAt ?? item.ingestion.scheduledFor}</strong><small className={`sla-state sla-state--${item.ingestion.slaState}`}>{item.ingestion.slaState.replace("_", " ")}</small></span>
                </div>
              ))}
              {filtered.length === 0 && <div className="data-catalogue-empty">No accessible tables match these filters.</div>}
            </div>
          </div>
        </div>

        <aside className="data-access-rail">
          <section className="panel data-rail-panel">
            <header><span><NetworkIcon /></span><div><h2>Your YARN queues</h2><p>Queue status for {data.principal.team}</p></div></header>
            <div className="data-yarn-list">{data.yarnQueues.map((queue) => <YarnQueueCard queue={queue} compact key={queue.id} />)}</div>
          </section>
          <section className="panel data-rail-panel data-source-panel">
            <header><div><h2>Source freshness</h2><p>Operational metadata used by this view</p></div></header>
            <div>{data.sourceFreshness.map((source) => (
              <article key={source.source}><span className={`source-state source-state--${source.status}`} /><span><strong>{source.source}</strong><small>{source.lastSyncedAt}</small></span><em>{source.status}</em></article>
            ))}</div>
          </section>
        </aside>
      </section>
    </main>
  );
}
