import type { PortalPage } from "../types/navigation";
import { ChangesIcon, ComputeIcon, DatabaseIcon, HomeIcon, MyDspIcon, NetworkIcon, SupportIcon, SystemsIcon } from "./Icons";

interface AdminSidebarProps {
  activePage: PortalPage;
  onPlanned: (label: string) => void;
}

export function AdminSidebar({ activePage, onPlanned }: AdminSidebarProps) {
  return (
    <aside className="sidebar admin-sidebar" aria-label="Platform administration navigation">
      <div className="admin-sidebar-heading"><small>Operating mode</small><strong>Platform admin</strong><span>Production</span></div>
      <nav className="admin-nav">
        <small className="admin-nav-label">Control plane</small>
        <a className={activePage === "admin" ? "admin-nav-item admin-nav-item--active" : "admin-nav-item"} href="#admin"><HomeIcon /><span><strong>Overview</strong><small>Platform attention</small></span></a>
        <button className="admin-nav-item" type="button" onClick={() => onPlanned("Operations centre")}><SystemsIcon /><span><strong>Operations</strong><small>Incidents & health</small></span></button>

        <small className="admin-nav-label">Resources</small>
        <a className="admin-nav-item" href="#vms"><ComputeIcon /><span><strong>Virtual machines</strong><small>Fleet & allocation</small></span></a>
        <a className="admin-nav-item" href="#devspaces"><MyDspIcon /><span><strong>Devspaces</strong><small>Users & workloads</small></span></a>

        <small className="admin-nav-label">Governance</small>
        <a className={activePage === "admin-data" ? "admin-nav-item admin-nav-item--active" : "admin-nav-item"} href="#admin/data"><DatabaseIcon /><span><strong>Data platform</strong><small>Hive & ingestion</small></span></a>
        <button className="admin-nav-item" type="button" onClick={() => onPlanned("Team and LDAP management")}><NetworkIcon /><span><strong>Teams & LDAP</strong><small>Membership mapping</small></span></button>

        <small className="admin-nav-label">Experience</small>
        <button className="admin-nav-item" type="button" onClick={() => onPlanned("Change publishing")}><ChangesIcon /><span><strong>Changes</strong><small>Maintenance updates</small></span></button>
        <button className="admin-nav-item" type="button" onClick={() => onPlanned("Support content management")}><SupportIcon /><span><strong>Support content</strong><small>Guides & contacts</small></span></button>
      </nav>
      <a className="admin-return-link" href="#home">← Return to user portal</a>
    </aside>
  );
}
