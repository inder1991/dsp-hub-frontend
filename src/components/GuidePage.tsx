import type { SupportData } from "../types/support";
import { ExternalAction } from "./ExternalAction";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ChatIcon,
  ClockIcon,
  GuideIcon,
  LockIcon,
  TicketIcon,
  WarningIcon,
} from "./Icons";

interface GuidePageProps {
  data: SupportData;
  onPlanned: (label: string) => void;
}

export function GuidePage({ data, onPlanned }: GuidePageProps) {
  const service = data.services.find((item) => item.id === "cyberark") ?? data.services[0];
  const issue = service?.issues.find((item) => item.id === "session-unavailable");

  if (!service || !issue) return null;

  return (
    <main className="main-content guide-page" id="guide">
      <nav className="guide-breadcrumb" aria-label="Breadcrumb">
        <a href="#support">Troubleshooting</a><span>/</span><a href="#support">CyberArk</a><span>/</span><span>Session unavailable</span>
      </nav>

      <div className="guide-layout">
        <article className="guide-article">
          <header className="guide-title-block">
            <div className="page-kicker">CyberArk guide</div>
            <h1>Unable to start a CyberArk session</h1>
            <p>Use these steps when authentication succeeds but the session does not open, closes immediately, or times out.</p>
            <div className="guide-metadata">
              <span><LockIcon />CyberArk</span>
              <span><ClockIcon />{issue.estimatedMinutes} min read</span>
              <span><GuideIcon />Owner: CyberArk support</span>
              <span>Reviewed: Aug 2026</span>
            </div>
          </header>

          <div className="guide-incident-note">
            <span><WarningIcon /></span>
            <div><strong>Check service status first</strong><button type="button" onClick={() => onPlanned("Current CyberArk incident")}>View current CyberArk incident</button></div>
          </div>

          <section className="article-section">
            <h2>Symptoms</h2>
            <ul>
              <li>The authentication page times out.</li>
              <li>The session closes immediately after opening.</li>
              <li>Login succeeds but the target connection does not open.</li>
            </ul>
          </section>

          <section className="article-section">
            <h2>Before you start</h2>
            <label className="guide-check"><input type="checkbox" />Confirm you are connected to the corporate network or VPN.</label>
            <label className="guide-check"><input type="checkbox" />Confirm your CyberArk account has been activated.</label>
            <label className="guide-check"><input type="checkbox" />Close any existing CyberArk browser sessions.</label>
          </section>

          <section className="article-section">
            <h2>Step-by-step fix</h2>
            <ol className="guide-steps">
              <li><span>1</span><div><strong>Close the existing session</strong><p>Sign out of CyberArk and close all CyberArk browser tabs.</p></div></li>
              <li><span>2</span><div><strong>Clear the session cookie</strong><p>Follow the approved browser instructions for clearing the CyberArk session cookie.</p></div></li>
              <li><span>3</span><div><strong>Start a new session</strong><p>Open CyberArk from the approved DSP link and authenticate again.</p></div></li>
              <li><span>4</span><div><strong>Retry the target connection</strong><p>Select the required DSP account and retry the connection once.</p></div></li>
            </ol>
          </section>

          <section className="article-section expected-result">
            <h2>Expected result</h2>
            <p>CyberArk opens a new session and the target connection is available.</p>
          </section>

          <div className="guide-feedback">
            <span>Did this solve the issue?</span>
            <button type="button" onClick={() => onPlanned("Guide feedback: yes")}>Yes</button>
            <button type="button" onClick={() => onPlanned("Guide feedback: no")}>No</button>
          </div>

          <a className="guide-back-link" href="#support"><ArrowLeftIcon />Back to all CyberArk issues</a>
        </article>

        <aside className="guide-aside">
          <section className="panel guide-support-card">
            <h2>CyberArk specialist</h2>
            <div className="guide-specialist">
              <span className="specialist-avatar">{initials(service.specialist.name)}</span>
              <span><strong>{service.specialist.name}</strong><small>{service.specialist.role}</small><em><i className={`roster-dot roster-dot--${service.specialist.rosterStatus}`} />On roster now</em></span>
            </div>
            <ExternalAction className="guide-primary-action" href={service.specialist.teamsUrl} onUnavailable={() => onPlanned("CyberArk Teams support")}><ChatIcon />Open Teams chat<ArrowRightIcon /></ExternalAction>
            <p>Use Teams for live guidance from the service specialist.</p>
          </section>

          <section className="panel guide-remedy-card">
            <h2>Still not working?</h2>
            <p>Raise a formal ticket with the issue details.</p>
            <ExternalAction className="guide-primary-action guide-primary-action--remedy" href={service.remedyUrl} onUnavailable={() => onPlanned("CyberArk Remedy ticket")}><TicketIcon />Create Remedy ticket<ArrowRightIcon /></ExternalAction>
            <ul><li>Include the error message.</li><li>Include the approximate failure time.</li><li>Do not include passwords or secrets.</li></ul>
          </section>

          <section className="panel related-guides-card">
            <h2>Related guides</h2>
            {service.issues.filter((item) => item.id !== issue.id).map((related) => (
              <ExternalAction className="related-guide" href={related.guideUrl} key={related.id} onUnavailable={() => onPlanned(`${related.title} guide`)}><GuideIcon />{related.title}<ArrowRightIcon /></ExternalAction>
            ))}
          </section>
        </aside>
      </div>
    </main>
  );
}

function initials(name: string) {
  return name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}
