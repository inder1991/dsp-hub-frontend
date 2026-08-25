import { useEffect, useRef, useState, type FormEvent } from "react";

import type { ExternalLinks, HealthSummary } from "../types/dashboard";
import { ArrowRightIcon, BellIcon, ChevronDownIcon, SearchIcon } from "./Icons";
import { StatusMark } from "./StatusMark";
import { ExternalAction } from "./ExternalAction";

interface TopbarProps {
  health: HealthSummary;
  links: ExternalLinks;
  onPlanned: (label: string) => void;
}

export function Topbar({ health, links, onPlanned }: TopbarProps) {
  const [healthOpen, setHealthOpen] = useState(false);
  const [query, setQuery] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function closeOnOutsideClick(event: PointerEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setHealthOpen(false);
      }
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setHealthOpen(false);
    }
    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  function handleSearch(event: FormEvent) {
    event.preventDefault();
    if (query.trim()) onPlanned(`Global search for “${query.trim()}”`);
  }

  const orderedServices = [...health.services].sort((left, right) => {
    const priority = { major_issue: 0, degraded: 1, operational: 2 } as const;
    return (priority[left.state as keyof typeof priority] ?? 2) - (priority[right.state as keyof typeof priority] ?? 2);
  });
  const hasAffectedSystems = health.affectedSystems > 0;
  const healthSummary = hasAffectedSystems
    ? `${health.affectedSystems} ${health.affectedSystems === 1 ? "system needs" : "systems need"} attention`
    : "All monitored systems operational";
  const healthDetail = hasAffectedSystems
    ? "Service owners are investigating the current disruption."
    : "No widespread DSP issues are currently reported.";

  return (
    <header className="topbar">
      <a className="brand" href="#home" aria-label="DSP home">DSP</a>
      <div className="topbar-workspace">
        <form className="global-search" role="search" onSubmit={handleSearch}>
          <SearchIcon />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search DSP..." aria-label="Search DSP" />
        </form>
        <div className="topbar-actions">
          <button className="icon-button notification-button" type="button" aria-label="Notifications" onClick={() => onPlanned("Notifications")}>
            <BellIcon />
          </button>
          <span className="topbar-action-divider" aria-hidden="true" />
          <div className="health-control" ref={menuRef}>
            <button
              className="health-button"
              type="button"
              aria-label={`DSP HEALTH: ${health.label}`}
              aria-expanded={healthOpen}
              aria-haspopup="menu"
              onClick={() => setHealthOpen((value) => !value)}
            >
              <span className={`health-dot health-dot--${health.state}`} />
              <span className="health-button-label">DSP health</span>
              <strong className="health-button-value">{health.label}</strong>
              <ChevronDownIcon />
            </button>
            {healthOpen && (
              <div className="health-menu" role="menu" aria-label="DSP health summary">
                <div className="health-menu-header">
                  <div><small>Platform health</small><strong>DSP health</strong></div>
                  <span className={`health-menu-state health-menu-state--${health.state}`}><span />{health.label}</span>
                </div>
                <div className={`health-summary-card health-summary-card--${health.state}`}>
                  <StatusMark state={health.state} size="medium" />
                  <span><strong>{healthSummary}</strong><small>{healthDetail}</small></span>
                </div>
                <div className="health-menu-section-label"><span>Service status</span><small>{health.services.length} monitored</small></div>
                <div className="health-service-list">
                  {orderedServices.map((service) => (
                    <div className={`health-service health-service--${service.state}`} key={service.id}>
                      <StatusMark state={service.state} />
                      <span className="health-service-copy"><strong>{service.name}</strong><small>{service.summary ?? "No known issues"}</small></span>
                      <span className="health-service-state">{service.status}</span>
                    </div>
                  ))}
                </div>
                <ExternalAction
                  href={links.confluenceStatus}
                  className="menu-footer-link"
                  onUnavailable={() => onPlanned("System status")}
                >
                  View system status <ArrowRightIcon />
                </ExternalAction>
              </div>
            )}
          </div>
          <span className="topbar-action-divider" aria-hidden="true" />
          <button
            className="user-control"
            type="button"
            aria-label="Open account menu for Alex Morgan"
            onClick={() => onPlanned("User account")}
          >
            <span className="user-avatar" aria-hidden="true">AM</span>
            <span className="user-name">Alex Morgan</span>
            <ChevronDownIcon />
          </button>
        </div>
      </div>
    </header>
  );
}
