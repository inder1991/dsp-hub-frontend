import { useEffect, useState, type ComponentType, type SVGProps } from "react";

import type { ExternalLinks } from "../types/dashboard";
import type { PortalRole } from "../auth/types";
import type { PortalPage } from "../types/navigation";
import {
  ChangesIcon,
  ChevronDownIcon,
  DevelopIcon,
  DocumentationIcon,
  ExternalLinkIcon,
  HomeIcon,
  MyDspIcon,
  OnboardingIcon,
  SupportIcon,
  SystemsIcon,
} from "./Icons";

interface SidebarProps {
  activePage: PortalPage;
  links: ExternalLinks;
  onPlanned: (label: string) => void;
  role: PortalRole;
}

type NavItem = {
  label: string;
  linkKey?: keyof ExternalLinks;
  page?: PortalPage;
  href?: string;
  activeWhen?: PortalPage[];
};

type NavGroup = {
  id: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  items: NavItem[];
};

const navigation: NavGroup[] = [
  { id: "my-dsp", label: "My DSP", icon: MyDspIcon, items: [{ label: "My data access", page: "data-access" }, { label: "Kedro Jobs", page: "jobs" }, { label: "Devspaces", page: "devspaces", activeWhen: ["devspace-detail"] }, { label: "Repositories" }, { label: "Activity" }] },
  { id: "develop", label: "Develop", icon: DevelopIcon, items: [{ label: "Devspaces", page: "devspaces", activeWhen: ["devspace-detail"] }, { label: "Images" }, { label: "Packages" }, { label: "GitHub" }, { label: "Guides", linkKey: "confluenceDsp" }] },
  { id: "onboarding", label: "Onboarding & training", icon: OnboardingIcon, items: [{ label: "Getting started", page: "onboarding" }, { label: "Access requirements" }, { label: "Training library" }] },
  { id: "systems", label: "Systems", icon: SystemsIcon, items: [{ label: "VMs", page: "vms", activeWhen: ["vm-detail"] }, { label: "Nexus" }, { label: "Hadoop" }, { label: "Trino" }, { label: "Sybase" }, { label: "Oracle" }, { label: "PostgreSQL" }] },
  { id: "changes", label: "Changes", icon: ChangesIcon, items: [{ label: "Release Calendar", linkKey: "confluenceReleases" }, { label: "Maintenance", linkKey: "confluenceReleases" }, { label: "Notifications" }] },
  { id: "support", label: "Support", icon: SupportIcon, items: [{ label: "Troubleshooting", page: "support" }, { label: "System Status", linkKey: "confluenceStatus" }, { label: "My Tickets", linkKey: "remedyTickets" }, { label: "Requests", linkKey: "remedyRequests" }] },
  { id: "documentation", label: "Documentation", icon: DocumentationIcon, items: [{ label: "Guides", linkKey: "confluenceDsp" }, { label: "Reference", linkKey: "confluenceDsp" }, { label: "Standards", linkKey: "confluenceDsp" }] },
];

export function Sidebar({ activePage, links, onPlanned, role }: SidebarProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    "my-dsp": true,
    systems: true,
  });

  useEffect(() => {
    if (activePage === "support" || activePage === "guide") {
      setExpanded((current) => ({ ...current, support: true }));
    }
    if (activePage === "onboarding") {
      setExpanded((current) => ({ ...current, onboarding: true }));
    }
    if (activePage === "data-access" || activePage === "devspaces" || activePage === "devspace-detail" || activePage === "jobs") {
      setExpanded((current) => ({ ...current, "my-dsp": true }));
    }
    if (activePage === "vms" || activePage === "vm-detail") setExpanded((current) => ({ ...current, systems: true }));
  }, [activePage]);

  function toggleGroup(groupId: string) {
    setExpanded((current) => ({ ...current, [groupId]: !current[groupId] }));
  }

  return (
    <aside className="sidebar" aria-label="Primary navigation">
      <nav className="sidebar-nav">
        <a className={`nav-home ${activePage === "home" ? "nav-home--active" : ""}`} href="#home" aria-current={activePage === "home" ? "page" : undefined}>
          <HomeIcon />
          <span>Home</span>
        </a>

        <div className="nav-divider" />

        {navigation.map((group) => {
          const Icon = group.icon;
          const isExpanded = Boolean(expanded[group.id]);
          return (
            <section className={`nav-group ${isExpanded ? "nav-group--expanded" : ""}`} key={group.id}>
              <button className="nav-group-toggle" type="button" aria-expanded={isExpanded} onClick={() => toggleGroup(group.id)}>
                <span className="nav-group-icon"><Icon /></span>
                <span>{group.label}</span>
                <ChevronDownIcon className="nav-group-chevron" />
              </button>
              {isExpanded && (
                <div className="nav-group-items">
                  {group.items.map((item) => {
                    const href = item.linkKey ? links[item.linkKey] : undefined;
                    if (item.page || item.href) {
                      const isActive = item.page === activePage || item.activeWhen?.includes(activePage) || (item.page === "support" && activePage === "guide");
                      return (
                        <a
                          aria-current={isActive ? "page" : undefined}
                          className={`nav-item nav-item--internal ${isActive ? "nav-item--active" : ""}`}
                          href={item.href ?? `#${item.page}`}
                          key={item.label}
                        >
                          <span>{item.label}</span>
                        </a>
                      );
                    }
                    if (href) {
                      return (
                        <a key={item.label} className="nav-item nav-item--external" href={href} target="_blank" rel="noreferrer">
                          <span>{item.label}</span>
                          <ExternalLinkIcon />
                        </a>
                      );
                    }
                    return (
                      <button
                        key={item.label}
                        className="nav-item nav-item--planned"
                        type="button"
                        title={`${item.label} is planned for phase two`}
                        onClick={() => onPlanned(item.label)}
                      >
                        <span>{item.label}</span>
                        <span className="nav-item-meta" aria-hidden="true">Phase 2</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </section>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        {role === "ADMIN" && <a className="sidebar-admin-link" href="#admin"><SystemsIcon /><span><strong>Platform admin</strong><small>Open control plane</small></span></a>}
        <span className="release-context"><span className="release-dot" /><span><strong>Release 1</strong><small>Operational preview</small></span></span>
      </div>
    </aside>
  );
}
