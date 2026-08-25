import type { OnboardingData, RequirementState } from "../types/onboarding";
import { ExternalAction } from "./ExternalAction";
import {
  ArrowRightIcon,
  CalendarIcon,
  CheckIcon,
  ChevronRightIcon,
  ClockIcon,
  CubeIcon,
  DatabaseIcon,
  GuideIcon,
  LockIcon,
  PackageIcon,
  PlayIcon,
  SupportIcon,
} from "./Icons";

interface OnboardingPageProps {
  data: OnboardingData;
  onPlanned: (label: string) => void;
}

export function OnboardingPage({ data, onPlanned }: OnboardingPageProps) {
  return (
    <main className="main-content onboarding-page" id="onboarding">
      <div className="page-heading onboarding-page-heading">
        <div>
          <div className="page-kicker">Getting started</div>
          <h1 className="page-title">Onboarding &amp; bootcamp</h1>
          <p>Get access, prepare your workspace, and become DSP-ready.</p>
        </div>
      </div>

      <div className="onboarding-layout">
        <div className="onboarding-main-column">
          <section className="panel onboarding-journey" aria-labelledby="onboarding-journey-title">
            <div className="journey-header">
              <span className="journey-header-icon"><CubeIcon /></span>
              <div><h2 id="onboarding-journey-title">Your onboarding</h2><p>{data.completedSteps} of {data.totalSteps} steps complete</p></div>
              <ExternalAction className="journey-continue" href={data.links.setupGuideUrl} onUnavailable={() => onPlanned("Onboarding setup guide")}>Continue setup <ArrowRightIcon /></ExternalAction>
            </div>

            <ol className="journey-steps">
              {data.steps.map((step) => (
                <li className={`journey-step journey-step--${step.state}`} key={step.id}>
                  <span className="journey-step-number">{step.state === "complete" ? <CheckIcon /> : step.number}</span>
                  <strong>{step.title}</strong>
                  <small>{step.state === "complete" ? "Complete" : step.state === "current" ? "In progress" : "Upcoming"}</small>
                </li>
              ))}
            </ol>

            <div className="current-step-card">
              <div className="current-step-tasks">
                <h3>{data.currentStepTitle}</h3>
                <div className="setup-task-list">
                  {data.tasks.map((task) => (
                    <ExternalAction className="setup-task" href={task.guideUrl} key={task.id} onUnavailable={() => onPlanned(`${task.title} guide`)}>
                      <span className={`task-state task-state--${task.state}`}><GuideIcon /></span>
                      <span className="task-copy"><strong>{task.title}</strong><small>{task.description}</small></span>
                      <span className="task-label">{task.state === "optional" ? "Optional" : "Open guide"}</span>
                      <ChevronRightIcon />
                    </ExternalAction>
                  ))}
                </div>
              </div>
              <div className="onboarding-benefits">
                <div className="benefits-heading"><span><PackageIcon /></span><h3>What you will receive</h3></div>
                <ul>
                  {data.benefits.map((benefit, index) => {
                    const BenefitIcon = [CubeIcon, PackageIcon, LockIcon, DatabaseIcon][index] ?? CubeIcon;
                    return <li key={benefit}><BenefitIcon /><span>{benefit}</span></li>;
                  })}
                </ul>
              </div>
            </div>
          </section>

          <div className="onboarding-learning-grid">
            <section className="panel bootcamp-panel" aria-labelledby="bootcamp-title">
              <div className="onboarding-card-header"><CalendarIcon /><h2 id="bootcamp-title">Upcoming bootcamp</h2></div>
              <div className="bootcamp-content">
                <span className="bootcamp-date"><strong>15–16</strong><small>SEP 2026</small></span>
                <div className="bootcamp-copy"><strong>{data.bootcamp.title}</strong><span>{data.bootcamp.dateLabel} · {data.bootcamp.format}</span><em>{data.bootcamp.availability}</em></div>
              </div>
              <div className="bootcamp-actions">
                <ExternalAction href={data.bootcamp.agendaUrl} onUnavailable={() => onPlanned("Bootcamp agenda")}>View agenda</ExternalAction>
                <ExternalAction className="bootcamp-register" href={data.bootcamp.registerUrl} onUnavailable={() => onPlanned("Bootcamp registration")}>Register <ArrowRightIcon /></ExternalAction>
              </div>
            </section>

            <section className="panel training-panel" aria-labelledby="training-title">
              <div className="onboarding-card-header"><PlayIcon /><h2 id="training-title">Training library</h2></div>
              <div className="training-list">
                {data.trainingVideos.map((video) => (
                  <ExternalAction className="training-row" href={video.url} key={video.id} onUnavailable={() => onPlanned(video.title)}>
                    <PlayIcon /><span>{video.title}</span><time><ClockIcon />{video.duration}</time><ChevronRightIcon />
                  </ExternalAction>
                ))}
              </div>
              <ExternalAction className="training-library-link" href={data.links.trainingLibraryUrl} onUnavailable={() => onPlanned("Training library")}>View all training videos <ArrowRightIcon /></ExternalAction>
            </section>
          </div>

          <section className="panel cohort-panel" aria-labelledby="cohort-title">
            <div className="cohort-heading"><h2 id="cohort-title">Current cohort progress</h2><p>Operational stage of the active onboarding cohort.</p></div>
            <ol className="cohort-stages">
              {data.cohortStages.map((stage) => (
                <li className={`cohort-stage cohort-stage--${stage.state}`} key={stage.id}>
                  <span>{stage.state === "complete" ? <CheckIcon /> : stage.state === "current" ? <ClockIcon /> : <span />}</span>
                  <strong>{stage.label}</strong>
                  <small>{stage.status}</small>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <aside className="onboarding-side-column">
          <section className="panel access-panel" aria-labelledby="access-title">
            <div className="side-card-header"><h2 id="access-title">Access requirements</h2><p>Current onboarding access state.</p></div>
            <div className="access-list">
              {data.accessRequirements.map((requirement) => <AccessRow key={requirement.id} label={requirement.label} state={requirement.state} />)}
            </div>
            <ExternalAction className="side-card-link" href={data.links.accessMatrixUrl} onUnavailable={() => onPlanned("Access matrix")}>View access matrix <ArrowRightIcon /></ExternalAction>
          </section>

          <section className="panel onboarding-help-panel" aria-labelledby="onboarding-help-title">
            <div className="side-card-header"><h2 id="onboarding-help-title">Need help?</h2><p>Guidance and live DSP support.</p></div>
            <ExternalAction className="onboarding-help-link" href={data.links.troubleshootingUrl} onUnavailable={() => onPlanned("Onboarding troubleshooting")}><SupportIcon /><span><strong>Troubleshoot setup</strong><small>Browse known onboarding issues</small></span><ArrowRightIcon /></ExternalAction>
            <ExternalAction className="onboarding-help-link" href={data.links.setupGuideUrl} onUnavailable={() => onPlanned("Onboarding Confluence guide")}><GuideIcon /><span><strong>Read setup guide</strong><small>Open the full onboarding reference</small></span><ArrowRightIcon /></ExternalAction>
            <ExternalAction className="onboarding-help-link" href={data.links.supportTeamsUrl} onUnavailable={() => onPlanned("DSP support Teams chat")}><SupportIcon /><span><strong>Contact DSP support</strong><small>Chat with the duty engineer</small></span><ArrowRightIcon /></ExternalAction>
          </section>
        </aside>
      </div>
    </main>
  );
}

function AccessRow({ label, state }: { label: string; state: RequirementState }) {
  return (
    <div className="access-row">
      <span>{label}</span>
      <strong className={`access-state access-state--${state}`}>
        {state === "complete" ? <CheckIcon /> : state === "pending" ? <ClockIcon /> : <span>−</span>}
        {state}
      </strong>
    </div>
  );
}
