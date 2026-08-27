import type { AdminControlPlaneData } from "../types/data-platform";
import { ArrowRightIcon, ChangesIcon, ComputeIcon, DatabaseIcon, NetworkIcon, WarningIcon } from "./Icons";

interface AdminOverviewPageProps {
  data: AdminControlPlaneData;
  onPlanned: (label: string) => void;
}

function titleCase(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (character) => character.toUpperCase());
}

export function AdminOverviewPage({ data, onPlanned }: AdminOverviewPageProps) {
  return (
    <main className="main-content admin-page" id="admin">
      <div className="page-heading admin-page-heading">
        <div><div className="page-kicker">DSP operations</div><h1 className="page-title">Admin control plane</h1><p>Cross-platform attention, capacity, integrations and governed operational workflows.</p></div>
        <div className="admin-heading-actions"><span><i />Production</span><button type="button" onClick={() => onPlanned("New VM allocation")}>New VM allocation</button></div>
      </div>

      <div className="admin-preview-boundary"><span>Release 1 control boundary</span><strong>Read-only operational preview</strong><small>Allocation and publishing actions require enterprise SSO, approvals and integration adapters.</small></div>

      <section className="admin-summary-grid" aria-label="Platform administration summary">
        <article><ComputeIcon /><span><small>VM fleet</small><strong>{data.summary.totalVms}</strong><em>{data.summary.unhealthyVms} need attention</em></span></article>
        <article><NetworkIcon /><span><small>Running workloads</small><strong>{data.summary.activeDevspaces}</strong><em>{data.summary.activeJobs} active jobs</em></span></article>
        <article><DatabaseIcon /><span><small>Governed Hive tables</small><strong>{data.summary.governedTables}</strong><em>{data.summary.ingestionAttention} ingestion alerts</em></span></article>
        <article className="admin-summary--warning"><WarningIcon /><span><small>Operational attention</small><strong>{data.summary.activeIncidents + data.summary.yarnQueueAttention}</strong><em>Incidents & YARN queues</em></span></article>
        <article className="admin-summary--approval"><ChangesIcon /><span><small>Pending approvals</small><strong>{data.summary.pendingApprovals}</strong><em>Allocation workflows</em></span></article>
      </section>

      <section className="admin-overview-grid">
        <div className="panel admin-attention-panel">
          <header><div><h2>Attention queue</h2><p>Prioritised signals across data, compute and support</p></div><span>{data.attentionItems.length} open</span></header>
          <div className="admin-attention-list">{data.attentionItems.map((item) => (
            <a className={`admin-attention-item admin-attention-item--${item.severity}`} href={item.href} key={item.id}>
              <span className="admin-attention-indicator"><WarningIcon /></span>
              <span><small>{titleCase(item.type)} · {item.occurredAt}</small><strong>{item.title}</strong><em>{item.summary}</em></span>
              <span><small>Owner</small><strong>{item.owner}</strong></span><ArrowRightIcon />
            </a>
          ))}</div>
        </div>

        <aside className="panel admin-integrations-panel">
          <header><div><h2>Integration health</h2><p>Control-plane source freshness</p></div><span>{data.integrations.filter((item) => item.status !== "healthy").length} attention</span></header>
          <div>{data.integrations.map((integration) => (
            <article key={integration.id}><span className={`integration-state integration-state--${integration.status}`} /><span><strong>{integration.name}</strong><small>{integration.summary}</small></span><span><strong>{titleCase(integration.status)}</strong><small>{integration.lastSuccessfulSync}</small></span></article>
          ))}</div>
        </aside>
      </section>

      <section className="admin-bottom-grid">
        <div className="panel admin-workflow-panel">
          <header><div><h2>VM allocation workflows</h2><p>Team and LDAP assignments awaiting or applying governance</p></div><button type="button" onClick={() => onPlanned("VM allocation workflow")}>Create request</button></header>
          <div className="admin-workflow-table" role="table" aria-label="VM allocation workflows">
            <div role="row"><span role="columnheader">VM / tenant</span><span role="columnheader">Team</span><span role="columnheader">LDAP group</span><span role="columnheader">Status</span><span role="columnheader">Requested</span></div>
            {data.allocations.map((item) => <div role="row" key={item.id}><span role="cell"><strong>{item.vmName}</strong><small>{item.tenant}</small></span><span role="cell"><strong>{item.targetTeam}</strong><small>{item.requestedBy}</small></span><span role="cell"><code>{item.ldapGroup}</code></span><span role="cell"><i className={`workflow-state workflow-state--${item.status}`}>{titleCase(item.status)}</i></span><span role="cell"><strong>{item.requestedAt}</strong><small>{item.summary}</small></span></div>)}
          </div>
        </div>

        <div className="panel admin-publishing-panel">
          <header><div><h2>Operational publishing</h2><p>Maintenance, support and guidance updates</p></div><button type="button" onClick={() => onPlanned("Operational update publishing")}>Add update</button></header>
          <div>{data.updates.map((item) => <article key={item.id}><span className={`publish-type publish-type--${item.type}`}><ChangesIcon /></span><span><small>{titleCase(item.type)} · {item.service}</small><strong>{item.title}</strong><em>{item.audience} · {item.effectiveAt}</em></span><i className={`publish-state publish-state--${item.state}`}>{titleCase(item.state)}</i></article>)}</div>
        </div>
      </section>
    </main>
  );
}
