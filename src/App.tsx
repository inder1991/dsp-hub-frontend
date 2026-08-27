import { useEffect, useRef, useState } from "react";

import { useAuth } from "./auth/AuthProvider";
import { AuthStatusPage, LoginPage } from "./auth/LoginPage";
import type { AuthPrincipal } from "./auth/types";
import { Dashboard } from "./components/Dashboard";
import { AdminDataPlatformPage } from "./components/AdminDataPlatformPage";
import { AdminOverviewPage } from "./components/AdminOverviewPage";
import { AdminSidebar } from "./components/AdminSidebar";
import { DataAccessPage } from "./components/DataAccessPage";
import { DevspaceDashboard } from "./components/DevspaceDashboard";
import { DevspacesPage } from "./components/DevspacesPage";
import { GuidePage } from "./components/GuidePage";
import { OnboardingPage } from "./components/OnboardingPage";
import { JobsPage } from "./components/JobsPage";
import { Sidebar } from "./components/Sidebar";
import { SupportPage } from "./components/SupportPage";
import { Topbar } from "./components/Topbar";
import { VmDashboard } from "./components/VmDashboard";
import { VmsPage } from "./components/VmsPage";
import { fetchAdminControlPlane, fetchDashboard, fetchDevspaceDetail, fetchDevspaces, fetchJobs, fetchOnboarding, fetchSupport, fetchUserDataAccess, fetchVmDetail, fetchVms } from "./lib/api";
import type { DashboardData } from "./types/dashboard";
import type { AdminControlPlaneData, UserDataAccessData } from "./types/data-platform";
import type { DevspacesData } from "./types/devspaces";
import type { PortalPage } from "./types/navigation";
import type { OnboardingData } from "./types/onboarding";
import type { DevspaceDetailData, JobsData, VmDetailData, VmInventoryData } from "./types/observability";
import type { SupportData } from "./types/support";

interface PortalRoute {
  page: PortalPage;
  resourceId?: string;
}

function routeFromHash(): PortalRoute {
  const hash = window.location.hash.replace(/^#/, "");
  if (hash.startsWith("guide/")) return { page: "guide" };
  if (hash.startsWith("devspace/")) return { page: "devspace-detail", resourceId: decodeURIComponent(hash.slice("devspace/".length)) };
  if (hash.startsWith("vm/")) return { page: "vm-detail", resourceId: decodeURIComponent(hash.slice("vm/".length)) };
  if (hash === "onboarding") return { page: "onboarding" };
  if (hash === "data-access") return { page: "data-access" };
  if (hash === "jobs") return { page: "jobs" };
  if (hash === "devspaces") return { page: "devspaces" };
  if (hash === "vms") return { page: "vms" };
  if (hash === "support") return { page: "support" };
  if (hash === "admin/data") return { page: "admin-data" };
  if (hash === "admin") return { page: "admin" };
  return { page: "home" };
}

export default function App() {
  const auth = useAuth();

  if (auth.state.status === "checking" || auth.state.status === "exchanging") {
    return <AuthStatusPage />;
  }
  if (auth.state.status !== "authenticated") {
    return <LoginPage />;
  }
  return (
    <PortalApplication
      principal={auth.state.principal}
      mustChangePassword={auth.state.mustChangePassword}
      onSignOut={auth.signOut}
    />
  );
}

interface PortalApplicationProps {
  principal: AuthPrincipal;
  mustChangePassword: boolean;
  onSignOut: () => Promise<void>;
}

function PortalApplication({ principal, mustChangePassword, onSignOut }: PortalApplicationProps) {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [devspaces, setDevspaces] = useState<DevspacesData | null>(null);
  const [jobs, setJobs] = useState<JobsData | null>(null);
  const [vms, setVms] = useState<VmInventoryData | null>(null);
  const [devspaceDetail, setDevspaceDetail] = useState<DevspaceDetailData | null>(null);
  const [vmDetail, setVmDetail] = useState<VmDetailData | null>(null);
  const [onboarding, setOnboarding] = useState<OnboardingData | null>(null);
  const [support, setSupport] = useState<SupportData | null>(null);
  const [userDataAccess, setUserDataAccess] = useState<UserDataAccessData | null>(null);
  const [adminControlPlane, setAdminControlPlane] = useState<AdminControlPlaneData | null>(null);
  const [loadErrors, setLoadErrors] = useState<Record<string, string>>({});
  const [route, setRoute] = useState<PortalRoute>(routeFromHash);
  const [notice, setNotice] = useState<string | null>(null);
  const noticeTimer = useRef<number | undefined>(undefined);

  function recordLoadError(key: string, error: unknown) {
    setLoadErrors((current) => ({
      ...current,
      [key]: error instanceof Error ? error.message : "This information is currently unavailable.",
    }));
  }

  useEffect(() => {
    const controller = new AbortController();
    fetchDashboard(controller.signal)
      .then(setDashboard)
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        recordLoadError("dashboard", error);
      });
    fetchSupport(controller.signal)
      .then(setSupport)
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        recordLoadError("support", error);
      });
    fetchOnboarding(controller.signal)
      .then(setOnboarding)
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        recordLoadError("onboarding", error);
      });
    fetchDevspaces(controller.signal)
      .then(setDevspaces)
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        recordLoadError("devspaces", error);
      });
    fetchJobs(controller.signal)
      .then(setJobs)
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        recordLoadError("jobs", error);
      });
    fetchVms(controller.signal)
      .then(setVms)
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        recordLoadError("vms", error);
      });
    fetchUserDataAccess(controller.signal)
      .then(setUserDataAccess)
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        recordLoadError("data-access", error);
      });
    if (principal.role === "ADMIN") {
      fetchAdminControlPlane(controller.signal)
        .then(setAdminControlPlane)
        .catch((error: unknown) => {
          if (error instanceof DOMException && error.name === "AbortError") return;
          recordLoadError("admin", error);
        });
    }
    return () => controller.abort();
  }, [principal.role]);

  useEffect(() => {
    const handleHashChange = () => setRoute(routeFromHash());
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    if (route.page === "devspace-detail" && route.resourceId) {
      setDevspaceDetail(null);
      fetchDevspaceDetail(route.resourceId, controller.signal).then(setDevspaceDetail).catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        recordLoadError("devspace-detail", error);
      });
    }
    if (route.page === "vm-detail" && route.resourceId) {
      setVmDetail(null);
      fetchVmDetail(route.resourceId, controller.signal).then(setVmDetail).catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        recordLoadError("vm-detail", error);
      });
    }
    return () => controller.abort();
  }, [route.page, route.resourceId]);

  useEffect(() => () => window.clearTimeout(noticeTimer.current), []);

  function showPlannedNotice(label: string) {
    window.clearTimeout(noticeTimer.current);
    setNotice(`${label} is visible in release one and will be connected in phase two.`);
    noticeTimer.current = window.setTimeout(() => setNotice(null), 3600);
  }

  const requestedAdminMode = route.page === "admin" || route.page === "admin-data";
  const adminMode = requestedAdminMode && principal.role === "ADMIN";

  if (!dashboard) {
    return (
      <main className="portal-data-state" role={loadErrors.dashboard ? "alert" : "status"}>
        <span>{loadErrors.dashboard ? "Operational data unavailable" : "Loading DSP"}</span>
        <h1>{loadErrors.dashboard ? "DSP could not load the homepage" : "Loading your operational view"}</h1>
        <p>{loadErrors.dashboard || "Retrieving current platform health and your DSP resources."}</p>
        {loadErrors.dashboard && <button type="button" onClick={() => window.location.reload()}>Try again</button>}
      </main>
    );
  }

  return (
    <div className={`app-shell ${adminMode ? "app-shell--admin" : ""}`}>
      <Topbar
        health={dashboard.health}
        links={dashboard.externalLinks}
        onPlanned={showPlannedNotice}
        adminMode={adminMode}
        principal={principal}
        onSignOut={onSignOut}
      />
      {adminMode
        ? <AdminSidebar activePage={route.page} onPlanned={showPlannedNotice} />
        : <Sidebar activePage={route.page} links={dashboard.externalLinks} onPlanned={showPlannedNotice} role={principal.role} />}
      {mustChangePassword && (
        <div className="password-change-banner" role="alert">
          Your local password must be changed. Contact a DSP administrator to complete the reset.
        </div>
      )}
      {requestedAdminMode && principal.role !== "ADMIN" ? (
        <main className="access-denied-page">
          <span>403</span>
          <h1>Administrator access required</h1>
          <p>Your account is signed in with read-only access.</p>
          <a href="#home">Return to DSP home</a>
        </main>
      ) : null}
      {!requestedAdminMode && route.page === "home" && <Dashboard data={dashboard} onPlanned={showPlannedNotice} />}
      {!requestedAdminMode && route.page === "support" && (support
        ? <SupportPage data={support} onPlanned={showPlannedNotice} />
        : <PortalDataState label="support information" error={loadErrors.support} />)}
      {!requestedAdminMode && route.page === "guide" && (support
        ? <GuidePage data={support} onPlanned={showPlannedNotice} />
        : <PortalDataState label="troubleshooting guide" error={loadErrors.support} />)}
      {!requestedAdminMode && route.page === "onboarding" && (onboarding
        ? <OnboardingPage data={onboarding} onPlanned={showPlannedNotice} />
        : <PortalDataState label="onboarding information" error={loadErrors.onboarding} />)}
      {!requestedAdminMode && route.page === "data-access" && (userDataAccess
        ? <DataAccessPage data={userDataAccess} />
        : <PortalDataState label="data access metadata" error={loadErrors["data-access"]} />)}
      {!requestedAdminMode && route.page === "jobs" && (jobs
        ? <JobsPage data={jobs} />
        : <PortalDataState label="Kedro jobs" error={loadErrors.jobs} />)}
      {!requestedAdminMode && route.page === "devspaces" && (devspaces
        ? <DevspacesPage data={devspaces} />
        : <PortalDataState label="devspaces" error={loadErrors.devspaces} />)}
      {!requestedAdminMode && route.page === "vms" && (vms
        ? <VmsPage data={vms} />
        : <PortalDataState label="virtual machines" error={loadErrors.vms} />)}
      {!requestedAdminMode && route.page === "devspace-detail" && (devspaceDetail
        ? <DevspaceDashboard data={devspaceDetail} onPlanned={showPlannedNotice} />
        : <PortalDataState label="devspace observability" error={loadErrors["devspace-detail"]} />)}
      {!requestedAdminMode && route.page === "vm-detail" && (vmDetail && jobs
        ? <VmDashboard data={vmDetail} jobs={jobs} />
        : <PortalDataState label="VM observability" error={loadErrors["vm-detail"] || loadErrors.jobs} />)}
      {adminMode && route.page === "admin" && (adminControlPlane
        ? <AdminOverviewPage data={adminControlPlane} onPlanned={showPlannedNotice} />
        : <PortalDataState label="admin control plane" error={loadErrors.admin} />)}
      {adminMode && route.page === "admin-data" && (adminControlPlane
        ? <AdminDataPlatformPage data={adminControlPlane} />
        : <PortalDataState label="data platform operations" error={loadErrors.admin} />)}
      {notice && <div className="phase-notice" role="status">{notice}</div>}
    </div>
  );
}

function PortalDataState({ label, error }: { label: string; error?: string }) {
  return (
    <main className="portal-data-state portal-data-state--inside" role={error ? "alert" : "status"}>
      <span>{error ? "Information unavailable" : "Loading"}</span>
      <h1>{error ? `Could not load ${label}` : `Loading ${label}`}</h1>
      <p>{error || "Retrieving the latest DSP information."}</p>
    </main>
  );
}
