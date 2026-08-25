import type { DashboardData } from "../types/dashboard";
import { ArrowRightIcon, ChevronRightIcon, WarningIcon } from "./Icons";
import { ExternalAction } from "./ExternalAction";
import { StatusMark } from "./StatusMark";

interface DashboardProps {
  data: DashboardData;
  onPlanned: (label: string) => void;
}

export function Dashboard({ data, onPlanned }: DashboardProps) {
  const { externalLinks } = data;
  const isPreviewData = data.generatedAt === "preview";

  return (
    <main className="main-content" id="home">
      <div className="page-heading">
        <div>
          <div className="page-kicker">DSP Portal</div>
          <h1 className="page-title">Operational overview</h1>
          <p>Platform health, your active resources, recent work and upcoming impact.</p>
        </div>
        <div className={`data-state ${isPreviewData ? "data-state--preview" : "data-state--live"}`}>
          <span />
          {isPreviewData ? "Preview data" : "Live API data"}
        </div>
      </div>

      <section className="panel system-section" aria-labelledby="system-status-title">
        <div className="section-header section-header--major">
          <div>
            <h2 id="system-status-title">System status</h2>
            <p>Is DSP OK?</p>
          </div>
          <ExternalAction
            href={externalLinks.confluenceStatus}
            className="section-link"
            onUnavailable={() => onPlanned("System status")}
          >
            View system status <ArrowRightIcon />
          </ExternalAction>
        </div>
        <div className="system-grid">
          {data.systems.map((system) => (
            <ExternalAction
              key={system.id}
              href={system.detailsUrl}
              className={`system-card system-card--${system.state}`}
              onUnavailable={() => onPlanned(`${system.name} system page`)}
              ariaLabel={`Open ${system.name} system page`}
            >
              <div className="system-card-heading">
                <strong>{system.name}</strong>
                <span className="status-badge"><StatusMark state={system.state} />{system.status}</span>
              </div>
              <p>{system.summary ?? "No known issues"}</p>
              <span className="system-card-action">Open system <ArrowRightIcon /></span>
            </ExternalAction>
          ))}
        </div>
        <div className="incident-strip">
          <span className="incident-icon"><WarningIcon /></span>
          <span className="incident-copy"><strong>Active incident</strong><span>{data.incident.message}</span></span>
          <ExternalAction
            href={data.incident.url ?? externalLinks.confluenceStatus}
            className="incident-link"
            onUnavailable={() => onPlanned("Incident details")}
          >
            View incident <ArrowRightIcon />
          </ExternalAction>
        </div>
      </section>

      <div className="operational-grid">
        <section className="panel personal-panel" aria-labelledby="my-dsp-title">
          <div className="section-header compact">
            <div>
              <h2 id="my-dsp-title">My DSP</h2>
              <p>Is my stuff OK?</p>
            </div>
          </div>
          <div className="metric-row">
            {data.myDsp.metrics.map((metric) => (
              <button type="button" key={metric.label} onClick={() => onPlanned(`Filtered ${metric.label}`)}>
                <strong>{metric.value}</strong> {metric.label}
              </button>
            ))}
          </div>
          <h3 className="subheading">Active resources</h3>
          <div className="resource-list">
            {data.myDsp.activeResources.map((resource) => (
              <button className="resource-row" type="button" key={resource.id} onClick={() => onPlanned(resource.name)}>
                <span className="resource-name">{resource.name}</span>
                <span>{resource.type}</span>
                <span className="status-badge status-badge--row"><StatusMark state={resource.state} />{resource.status}</span>
                <ChevronRightIcon />
              </button>
            ))}
          </div>
          <button className="section-link bottom-link" type="button" onClick={() => onPlanned("All resources")}>
            View all resources <ArrowRightIcon />
          </button>
        </section>

        <section className="panel activity-panel" aria-labelledby="recent-activity-title">
          <div className="section-header compact">
            <div>
              <h2 id="recent-activity-title">Recent activity</h2>
              <p>What was I doing?</p>
            </div>
          </div>
          <div className="activity-list">
            {data.recentActivity.map((activity) => (
              <button className="activity-row" type="button" key={activity.id} onClick={() => onPlanned(activity.name)}>
                <StatusMark state={activity.state} size="medium" />
                <span className="activity-copy">
                  <strong>{activity.name}</strong>
                  <span>{activity.activity}<span className="activity-result"> · {activity.status}</span></span>
                </span>
                <time>{activity.occurredAt}</time>
              </button>
            ))}
          </div>
          <button className="section-link bottom-link" type="button" onClick={() => onPlanned("All activity")}>
            View all activity <ArrowRightIcon />
          </button>
        </section>

        <section className="panel changes-panel" aria-labelledby="upcoming-changes-title">
          <div className="section-header compact">
            <div>
              <h2 id="upcoming-changes-title">Upcoming changes</h2>
              <p>What is about to affect me?</p>
            </div>
            <ExternalAction
              href={externalLinks.confluenceReleases}
              className="section-link"
              onUnavailable={() => onPlanned("Release calendar")}
            >
              Calendar <ArrowRightIcon />
            </ExternalAction>
          </div>
          <div className="change-list">
            {data.upcomingChanges.map((change) => (
              <ExternalAction
                key={change.id}
                href={change.url ?? externalLinks.confluenceReleases}
                className={`change-row change-row--${change.state}`}
                onUnavailable={() => onPlanned(change.title)}
              >
                <time className="change-date">{change.dateLabel}</time>
                <span className="change-copy">
                  <strong>{change.title}</strong>
                  <span className={`change-impact change-impact--${change.state}`}>{change.impact}</span>
                </span>
                <ChevronRightIcon />
              </ExternalAction>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
