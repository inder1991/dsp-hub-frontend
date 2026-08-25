import { useEffect, useRef, useState } from "react";

import { Dashboard } from "./components/Dashboard";
import { GuidePage } from "./components/GuidePage";
import { OnboardingPage } from "./components/OnboardingPage";
import { Sidebar } from "./components/Sidebar";
import { SupportPage } from "./components/SupportPage";
import { Topbar } from "./components/Topbar";
import { fallbackDashboard } from "./data/fallback-dashboard";
import { fallbackOnboarding } from "./data/fallback-onboarding";
import { fallbackSupport } from "./data/fallback-support";
import { fetchDashboard, fetchOnboarding, fetchSupport } from "./lib/api";
import type { DashboardData } from "./types/dashboard";
import type { PortalPage } from "./types/navigation";
import type { OnboardingData } from "./types/onboarding";
import type { SupportData } from "./types/support";

function pageFromHash(): PortalPage {
  if (window.location.hash.startsWith("#guide/")) return "guide";
  if (window.location.hash === "#onboarding") return "onboarding";
  return window.location.hash === "#support" ? "support" : "home";
}

export default function App() {
  const [dashboard, setDashboard] = useState<DashboardData>(fallbackDashboard);
  const [onboarding, setOnboarding] = useState<OnboardingData>(fallbackOnboarding);
  const [support, setSupport] = useState<SupportData>(fallbackSupport);
  const [activePage, setActivePage] = useState<PortalPage>(pageFromHash);
  const [notice, setNotice] = useState<string | null>(null);
  const noticeTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    const controller = new AbortController();
    fetchDashboard(controller.signal)
      .then(setDashboard)
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        console.info("DSP backend is unavailable; rendering phase-one preview data.");
      });
    fetchSupport(controller.signal)
      .then(setSupport)
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        console.info("DSP support API is unavailable; rendering the support preview catalog.");
      });
    fetchOnboarding(controller.signal)
      .then(setOnboarding)
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        console.info("DSP onboarding API is unavailable; rendering the onboarding preview catalog.");
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const handleHashChange = () => setActivePage(pageFromHash());
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => () => window.clearTimeout(noticeTimer.current), []);

  function showPlannedNotice(label: string) {
    window.clearTimeout(noticeTimer.current);
    setNotice(`${label} is visible in release one and will be connected in phase two.`);
    noticeTimer.current = window.setTimeout(() => setNotice(null), 3600);
  }

  return (
    <div className="app-shell">
      <Topbar health={dashboard.health} links={dashboard.externalLinks} onPlanned={showPlannedNotice} />
      <Sidebar activePage={activePage} links={dashboard.externalLinks} onPlanned={showPlannedNotice} />
      {activePage === "home" && <Dashboard data={dashboard} onPlanned={showPlannedNotice} />}
      {activePage === "support" && <SupportPage data={support} onPlanned={showPlannedNotice} />}
      {activePage === "guide" && <GuidePage data={support} onPlanned={showPlannedNotice} />}
      {activePage === "onboarding" && <OnboardingPage data={onboarding} onPlanned={showPlannedNotice} />}
      {notice && <div className="phase-notice" role="status">{notice}</div>}
    </div>
  );
}
