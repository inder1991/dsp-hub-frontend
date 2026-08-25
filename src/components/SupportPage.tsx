import { useMemo, useState, type ComponentType, type FormEvent, type SVGProps } from "react";

import type { SupportData, SupportServiceItem } from "../types/support";
import { ExternalAction } from "./ExternalAction";
import {
  ArrowRightIcon,
  ChatIcon,
  ComputeIcon,
  CubeIcon,
  DatabaseIcon,
  GuideIcon,
  LockIcon,
  NetworkIcon,
  PackageIcon,
  SearchIcon,
  SigmaIcon,
  TicketIcon,
} from "./Icons";

interface SupportPageProps {
  data: SupportData;
  onPlanned: (label: string) => void;
}

const serviceIcons: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  "dev-container": CubeIcon,
  cyberark: LockIcon,
  nexus: PackageIcon,
  compute: ComputeIcon,
  cdp: DatabaseIcon,
  trino: NetworkIcon,
  sas: SigmaIcon,
};

export function SupportPage({ data, onPlanned }: SupportPageProps) {
  const [selectedServiceId, setSelectedServiceId] = useState("cyberark");
  const [query, setQuery] = useState("");

  const selectedService = data.services.find((service) => service.id === selectedServiceId) ?? data.services[0];
  const visibleIssues = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return selectedService.issues.map((issue) => ({ issue, service: selectedService }));
    }
    return data.services.flatMap((service) => service.issues
      .filter((issue) => `${issue.title} ${issue.description} ${service.name}`.toLowerCase().includes(normalizedQuery))
      .map((issue) => ({ issue, service })));
  }, [data.services, query, selectedService]);

  function handleSearch(event: FormEvent) {
    event.preventDefault();
  }

  function selectService(serviceId: string) {
    setSelectedServiceId(serviceId);
    setQuery("");
  }

  if (!selectedService) return null;

  return (
    <main className="main-content support-page" id="support">
      <div className="page-heading support-page-heading">
        <div>
          <div className="page-kicker">Support</div>
          <h1 className="page-title">Troubleshooting &amp; support</h1>
          <p>Find a known solution, contact the right specialist, or raise a formal ticket.</p>
        </div>
        <ExternalAction
          ariaLabel={`Open Teams chat with DSP support, ${data.dspSupport.name}`}
          className="support-header-contact"
          href={data.dspSupport.teamsUrl}
          onUnavailable={() => onPlanned("DSP support Teams chat")}
        >
          <span className="support-header-icon"><ChatIcon /></span>
          <span className="support-header-copy"><small>DSP support</small><strong>{data.dspSupport.name}</strong></span>
          <span className="support-header-roster"><i className={`roster-dot roster-dot--${data.dspSupport.rosterStatus}`} />On roster</span>
          <span className="support-header-action">Open Teams <ArrowRightIcon /></span>
        </ExternalAction>
      </div>

      <section className="panel support-discovery" aria-labelledby="service-selector-title">
        <form className="support-search" role="search" onSubmit={handleSearch}>
          <SearchIcon />
          <input
            aria-label="Search troubleshooting guides"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Describe the issue or enter an error code"
            value={query}
          />
          {query && <span>{visibleIssues.length} {visibleIssues.length === 1 ? "result" : "results"}</span>}
        </form>
        <div className="service-selector-heading">
          <div><h2 id="service-selector-title">Which service has the issue?</h2><p>Select a service to see relevant guides and support routes.</p></div>
        </div>
        <div className="service-selector" role="list" aria-label="DSP services">
          {data.services.map((service) => {
            const Icon = serviceIcons[service.id] ?? ComputeIcon;
            const isSelected = service.id === selectedService.id && !query;
            return (
              <button
                aria-pressed={isSelected}
                className={`service-option ${isSelected ? "service-option--selected" : ""}`}
                key={service.id}
                onClick={() => selectService(service.id)}
                type="button"
              >
                <Icon />
                <span>{service.name}</span>
              </button>
            );
          })}
        </div>
      </section>

      <div className="support-workspace">
        <section className="panel self-help-panel" aria-labelledby="self-help-title">
          <div className="support-panel-header">
            <div>
              <h2 id="self-help-title">{query ? "Search results" : `${selectedService.name} troubleshooting`}</h2>
              <p>{query ? "Guides across all DSP services." : selectedService.description}</p>
            </div>
            <span className="guide-count">{visibleIssues.length} guides</span>
          </div>
          <div className="issue-list">
            {visibleIssues.map(({ issue, service }) => (
              <ExternalAction
                ariaLabel={`Open guide: ${issue.title}`}
                className="issue-row"
                href={issue.guideUrl}
                key={`${service.id}-${issue.id}`}
                onUnavailable={() => onPlanned(`${issue.title} guide`)}
              >
                <span className="issue-guide-icon"><GuideIcon /></span>
                <span className="issue-copy">
                  <strong>{issue.title}</strong>
                  <span>{query && <b>{service.name} · </b>}{issue.description}</span>
                </span>
                <span className="guide-time">{issue.estimatedMinutes} min</span>
                <span className="guide-action">View guide <ArrowRightIcon /></span>
              </ExternalAction>
            ))}
            {visibleIssues.length === 0 && (
              <div className="support-empty-state">No matching guide. Choose a service or contact DSP support.</div>
            )}
          </div>
        </section>

        <aside className="panel support-route-panel" aria-labelledby="support-route-title">
          <div className="support-panel-header">
            <div><h2 id="support-route-title">Get support for {selectedService.name}</h2><p>Choose live guidance or a formal incident.</p></div>
          </div>
          <div className="specialist-card">
            <span className="specialist-avatar">{initials(selectedService.specialist.name)}</span>
            <span className="specialist-copy">
              <small>Current specialist</small>
              <strong>{selectedService.specialist.name}</strong>
              <span><i className={`roster-dot roster-dot--${selectedService.specialist.rosterStatus}`} />{rosterLabel(selectedService)}</span>
            </span>
          </div>
          <div className="support-route-actions">
            <ExternalAction
              className="support-action support-action--teams"
              href={selectedService.specialist.teamsUrl}
              onUnavailable={() => onPlanned(`${selectedService.name} Teams support`)}
            >
              <ChatIcon /><span><strong>Chat with {selectedService.name} specialist</strong><small>Live help from the service owner</small></span><ArrowRightIcon />
            </ExternalAction>
            <ExternalAction
              className="support-action support-action--remedy"
              href={selectedService.remedyUrl}
              onUnavailable={() => onPlanned(`${selectedService.name} Remedy ticket`)}
            >
              <TicketIcon /><span><strong>Create Remedy ticket</strong><small>Route a formal incident to {selectedService.name}</small></span><ArrowRightIcon />
            </ExternalAction>
          </div>
          <p className="support-route-note">Teams chat and Remedy are separate support routes. Starting a chat does not create a ticket.</p>
        </aside>
      </div>

      <section className="panel specialist-directory" aria-labelledby="specialist-directory-title">
        <div className="directory-header">
          <div><h2 id="specialist-directory-title">Service support directory</h2><p>Direct ownership for each DSP service.</p></div>
        </div>
        <div className="directory-table" role="table" aria-label="DSP service support directory">
          <div className="directory-row directory-row--header" role="row">
            <span role="columnheader">Service</span><span role="columnheader">Current specialist</span><span role="columnheader">Availability</span><span role="columnheader">Live support</span><span role="columnheader">Formal ticket</span>
          </div>
          {data.services.map((service) => (
            <div className="directory-row" role="row" key={service.id}>
              <strong role="cell">{service.name}</strong>
              <span role="cell">{service.specialist.name}</span>
              <span className="directory-availability" role="cell"><i className={`roster-dot roster-dot--${service.specialist.rosterStatus}`} />{rosterLabel(service)}</span>
              <ExternalAction className="directory-action" href={service.specialist.teamsUrl} onUnavailable={() => onPlanned(`${service.name} Teams support`)}><ChatIcon />Open Teams</ExternalAction>
              <ExternalAction className="directory-action" href={service.remedyUrl} onUnavailable={() => onPlanned(`${service.name} Remedy ticket`)}><TicketIcon />Create ticket</ExternalAction>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function initials(name: string) {
  return name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

function rosterLabel(service: SupportServiceItem) {
  if (service.specialist.rosterStatus === "available") return "On roster now";
  if (service.specialist.rosterStatus === "busy") return "Currently assisting a user";
  return "Offline";
}
