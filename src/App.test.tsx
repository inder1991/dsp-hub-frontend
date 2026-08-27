import { StrictMode } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import App from "./App";
import { AuthProvider } from "./auth/AuthProvider";
import type { PortalRole } from "./auth/types";
import { fallbackDashboard } from "./data/fallback-dashboard";
import { fallbackAdminControlPlane, fallbackUserDataAccess } from "./data/fallback-data-platform";
import { fallbackDevspaces } from "./data/fallback-devspaces";
import {
  fallbackDevspaceDetail,
  fallbackJobs,
  fallbackVmDetail,
  fallbackVms,
} from "./data/fallback-observability";
import { fallbackOnboarding } from "./data/fallback-onboarding";
import { fallbackSupport } from "./data/fallback-support";

function responseJson(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

async function renderAuthenticatedApp(role: PortalRole = "ADMIN") {
  vi.spyOn(globalThis, "fetch").mockImplementation((input) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    if (url.endsWith("/auth/config")) {
      return Promise.resolve(responseJson({
        providers: { pingSso: true, localAccount: true },
        pingStatus: "configured",
        pingLoginUrl: "/auth/login",
        localLoginUrl: "/auth/local/login",
      }));
    }
    if (url.endsWith("/auth/refresh")) {
      return Promise.resolve(responseJson({
        accessToken: "test-access-token",
        tokenType: "Bearer",
        expiresIn: 600,
        returnPath: "#home",
        mustChangePassword: false,
        principal: {
          id: "user-1048",
          username: "alex.morgan",
          displayName: "Alex Morgan",
          email: "alex.morgan@example.test",
          enterpriseUserId: "alex.morgan",
          role,
          authenticationProvider: "PING_SAML",
          authorizationVersion: 1,
          permissions: role === "ADMIN" ? ["portal:read", "portal:admin"] : ["portal:read"],
        },
      }));
    }
    if (url.endsWith("/api/v1/home")) return Promise.resolve(responseJson(fallbackDashboard));
    if (url.endsWith("/api/v1/support")) return Promise.resolve(responseJson(fallbackSupport));
    if (url.endsWith("/api/v1/onboarding")) return Promise.resolve(responseJson(fallbackOnboarding));
    if (url.endsWith("/api/v1/devspaces")) return Promise.resolve(responseJson(fallbackDevspaces));
    if (url.endsWith("/api/v1/jobs")) return Promise.resolve(responseJson(fallbackJobs));
    if (url.endsWith("/api/v1/vms")) return Promise.resolve(responseJson(fallbackVms));
    if (url.endsWith("/api/v1/data-access")) return Promise.resolve(responseJson(fallbackUserDataAccess));
    if (url.endsWith("/api/v1/admin/control-plane")) return Promise.resolve(responseJson(fallbackAdminControlPlane));
    if (url.includes("/api/v1/devspaces/")) {
      return Promise.resolve(responseJson(fallbackDevspaceDetail(decodeURIComponent(url.split("/").at(-1) || "analytics-dev"))));
    }
    if (url.includes("/api/v1/vms/")) {
      return Promise.resolve(responseJson(fallbackVmDetail(decodeURIComponent(url.split("/").at(-1) || "vm-021"))));
    }
    return Promise.reject(new Error("offline"));
  });
  render(<AuthProvider><App /></AuthProvider>);
  await screen.findByRole("button", { name: "Open account menu for Alex Morgan" });
}

describe("DSP Portal homepage", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    window.history.replaceState(null, "", "#home");
  });

  it("renders the four operational homepage sections", async () => {
    await renderAuthenticatedApp();

    expect(screen.getByRole("heading", { name: /system status/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /my dsp/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /recent activity/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /upcoming changes/i })).toBeInTheDocument();
    expect(screen.getByText("GitHub Actions")).toBeInTheDocument();
    expect(screen.queryByText("OpenShift")).not.toBeInTheDocument();
  });

  it("opens the persistent DSP health summary", async () => {
    await renderAuthenticatedApp();

    fireEvent.click(screen.getByRole("button", { name: /DSP HEALTH: DEGRADED/i }));

    expect(screen.getByRole("menu", { name: "DSP health summary" })).toBeInTheDocument();
    expect(screen.getByText("2 systems need attention")).toBeInTheDocument();
    expect(screen.getByText("Query performance degraded")).toBeInTheDocument();
  });

  it("explains that deferred options arrive in phase two", async () => {
    await renderAuthenticatedApp();

    fireEvent.click(screen.getByRole("button", { name: "Repositories" }));

    expect(screen.getByRole("status")).toHaveTextContent("Repositories is visible in release one");
  });

  it("provides read-only troubleshooting and separate support routes", async () => {
    window.history.replaceState(null, "", "#support");
    await renderAuthenticatedApp();

    expect(screen.getByRole("heading", { name: "Troubleshooting & support" })).toBeInTheDocument();
    expect(screen.getByText("CyberArk troubleshooting")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Chat with DSP support/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Create Remedy ticket/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open guide: CyberArk session is unavailable" })).toHaveAttribute("href", "#guide/cyberark/session-unavailable");
    expect(screen.queryByText(/Run checks/i)).not.toBeInTheDocument();
  });

  it("renders the in-portal CyberArk demo guide", async () => {
    window.history.replaceState(null, "", "#guide/cyberark/session-unavailable");
    await renderAuthenticatedApp();

    expect(screen.getByRole("heading", { name: "Unable to start a CyberArk session" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Step-by-step fix" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Back to all CyberArk issues/i })).toHaveAttribute("href", "#support");
  });

  it("renders onboarding and bootcamp without executable checks or a target", async () => {
    window.history.replaceState(null, "", "#onboarding");
    await renderAuthenticatedApp();

    expect(screen.getByRole("heading", { name: "Onboarding & bootcamp" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Upcoming bootcamp" })).toBeInTheDocument();
    expect(screen.getByText(/Sep 15–16, 2026/)).toBeInTheDocument();
    expect(screen.queryByText(/Target 300/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Run readiness check|Run connectivity check/i)).not.toBeInTheDocument();
  });

  it("shows devspace health, ownership, VM placement, images and filters", async () => {
    window.history.replaceState(null, "", "#devspaces");
    await renderAuthenticatedApp();

    expect(screen.getByRole("heading", { name: "Devspaces" })).toBeInTheDocument();
    expect(screen.getByRole("table", { name: "Devspaces running on DSP VMs" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Image" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Disk" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Running age" })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Filter by image" })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Filter by resource pressure" })).toBeInTheDocument();
    expect(screen.getAllByText("python-3.11-dsp:2026.08").length).toBeGreaterThan(1);
    expect(screen.getAllByText("dsp-vm-021").length).toBeGreaterThan(1);
    expect(screen.getByRole("heading", { name: "Host VM issues" })).toBeInTheDocument();
    expect(screen.getByText("Sustained memory pressure")).toBeInTheDocument();

    fireEvent.change(screen.getByRole("combobox", { name: "Filter by health" }), { target: { value: "attention" } });
    expect(screen.getByText("2 of 7 environments shown")).toBeInTheDocument();
    expect(screen.getByText("risk-research")).toBeInTheDocument();
  });

  it("correlates Kedro jobs with users, devspaces and VMs", async () => {
    window.history.replaceState(null, "", "#jobs");
    await renderAuthenticatedApp();

    expect(screen.getByRole("heading", { name: "Kedro jobs" })).toBeInTheDocument();
    expect(screen.getByRole("table", { name: "Kedro pipeline runs" })).toBeInTheDocument();
    expect(screen.getAllByText("Customer churn training").length).toBeGreaterThan(1);
    expect(screen.getAllByRole("link", { name: /customer-model/i })[0]).toHaveAttribute("href", "#devspace/customer-model");
    expect(screen.getAllByRole("link", { name: /dsp-vm-021/i })[0]).toHaveAttribute("href", "#vm/vm-021");
  });

  it("renders a complete devspace observability dashboard", async () => {
    window.history.replaceState(null, "", "#devspace/customer-model");
    await renderAuthenticatedApp();

    expect(await screen.findByRole("heading", { name: "customer-model" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Kedro jobs" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Processes" })).toBeInTheDocument();
    expect(screen.getByRole("table", { name: "Processes in customer-model" })).toBeInTheDocument();
    expect(screen.getAllByText("python-3.11-dsp:2026.08").length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: /dsp-vm-021/i })[0]).toHaveAttribute("href", "#vm/vm-021");
  });

  it("renders VM capacity, hosted devspaces, users, issues and processes", async () => {
    window.history.replaceState(null, "", "#vm/vm-021");
    await renderAuthenticatedApp();

    expect(screen.getByRole("heading", { name: "dsp-vm-021" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Hosted devspaces" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Associated users" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "VM issue history" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Top processes" })).toBeInTheDocument();
    expect(screen.getAllByText("Alex Morgan").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Priya Nair").length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: /analytics-dev/i })[0]).toHaveAttribute("href", "#devspace/analytics-dev");
  });

  it("opens a VM inventory from the sidebar and links every host to its dashboard", async () => {
    window.history.replaceState(null, "", "#vms");
    await renderAuthenticatedApp();

    expect(screen.getByRole("heading", { name: "Virtual machines" })).toBeInTheDocument();
    expect(screen.getByRole("table", { name: "DSP virtual machines" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Associated users" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open dsp-vm-021 dashboard" })).toHaveAttribute("href", "#vm/vm-021");
    expect(screen.getByRole("link", { name: "VMs" })).toHaveAttribute("href", "#vms");
  });

  it("shows only governed Hive access metadata, morning ingestion and the user's YARN queues", async () => {
    window.history.replaceState(null, "", "#data-access");
    await renderAuthenticatedApp();

    expect(screen.getByRole("heading", { name: "My data access" })).toBeInTheDocument();
    expect(screen.getByRole("table", { name: "Accessible Hive table ingestion status" })).toBeInTheDocument();
    expect(screen.getAllByText("customer.customer_features").length).toBeGreaterThan(0);
    expect(screen.getAllByText("DSP-CUSTOMER-ANALYTICS").length).toBeGreaterThan(0);
    expect(screen.getByRole("heading", { name: "Your YARN queues" })).toBeInTheDocument();
    expect(screen.getByText("root.analytics.customer_models")).toBeInTheDocument();
    expect(screen.queryByText(/sample rows|data preview|download data/i)).not.toBeInTheDocument();
  });

  it("renders a distinct platform admin control plane with governed workflows", async () => {
    window.history.replaceState(null, "", "#admin");
    await renderAuthenticatedApp();

    expect(screen.getByRole("heading", { name: "Admin control plane" })).toBeInTheDocument();
    expect(screen.getByText("Read-only operational preview")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Attention queue" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Integration health" })).toBeInTheDocument();
    expect(screen.getByRole("table", { name: "VM allocation workflows" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Return to user portal/i })).toHaveAttribute("href", "#home");
  });

  it("shows cross-team Hive entitlements, morning ingestion and YARN status to admins", async () => {
    window.history.replaceState(null, "", "#admin/data");
    await renderAuthenticatedApp();

    expect(screen.getByRole("heading", { name: "Data platform operations" })).toBeInTheDocument();
    expect(screen.getByRole("table", { name: "Hive access and morning ingestion across teams" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "YARN queue status by team" })).toBeInTheDocument();
    expect(screen.getAllByText("Finance Insights").length).toBeGreaterThan(0);
    expect(screen.getAllByText("DSP-FINANCE-ANALYTICS").length).toBeGreaterThan(0);
    expect(screen.getByText("root.finance.insights")).toBeInTheDocument();
  });

  it("shows enterprise and governed local sign-in routes", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation((input) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
      if (url.endsWith("/auth/config")) {
        return Promise.resolve(responseJson({
          providers: { pingSso: true, localAccount: true },
          pingStatus: "configured",
          pingLoginUrl: "/auth/login",
          localLoginUrl: "/auth/local/login",
        }));
      }
      if (url.endsWith("/auth/refresh")) {
        return Promise.resolve(responseJson({ detail: "Session could not be refreshed" }, 401));
      }
      return Promise.reject(new Error("offline"));
    });
    render(<AuthProvider><App /></AuthProvider>);

    expect(await screen.findByRole("heading", { name: "Sign in to DSP" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign in with Ping SSO" })).toBeEnabled();
    fireEvent.click(screen.getByRole("button", { name: "Use a local DSP account" }));
    expect(screen.getByLabelText("Username")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toHaveAttribute("type", "password");
  });

  it("keeps platform administration unavailable to read-only users", async () => {
    window.history.replaceState(null, "", "#admin");
    await renderAuthenticatedApp("READ_ONLY");

    expect(screen.getByRole("heading", { name: "Administrator access required" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Platform admin/i })).not.toBeInTheDocument();
  });

  it("shows the authenticated user, role, and provider in the account menu", async () => {
    await renderAuthenticatedApp();

    fireEvent.click(screen.getByRole("button", { name: "Open account menu for Alex Morgan" }));
    expect(screen.getByRole("menu", { name: "Account menu" })).toBeInTheDocument();
    expect(screen.getByText("Ping SSO")).toBeInTheDocument();
    expect(screen.getAllByText("Administrator").length).toBeGreaterThan(0);
    expect(screen.getByRole("menuitem", { name: "Sign out" })).toBeInTheDocument();
  });

  it("exchanges a Ping callback only once under React StrictMode", async () => {
    window.history.replaceState(null, "", "#auth/callback?token_id=single-use-browser-code-1234567890");
    let exchanges = 0;
    vi.spyOn(globalThis, "fetch").mockImplementation((input) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
      if (url.endsWith("/auth/config")) {
        return Promise.resolve(responseJson({
          providers: { pingSso: true, localAccount: true },
          pingStatus: "configured",
          pingLoginUrl: "/auth/login",
          localLoginUrl: "/auth/local/login",
        }));
      }
      if (url.endsWith("/auth/exchange")) {
        exchanges += 1;
        return Promise.resolve(responseJson({
          accessToken: "ping-access-token",
          tokenType: "Bearer",
          expiresIn: 600,
          returnPath: "#home",
          mustChangePassword: false,
          principal: {
            id: "user-1048",
            username: "alex.morgan",
            displayName: "Alex Morgan",
            role: "ADMIN",
            authenticationProvider: "PING_SAML",
            authorizationVersion: 1,
            permissions: ["portal:read", "portal:admin"],
          },
        }));
      }
      if (url.endsWith("/api/v1/home")) return Promise.resolve(responseJson(fallbackDashboard));
      return Promise.reject(new Error("not required by this test"));
    });

    render(<StrictMode><AuthProvider><App /></AuthProvider></StrictMode>);

    await screen.findByRole("button", { name: "Open account menu for Alex Morgan" });
    expect(exchanges).toBe(1);
    expect(window.location.hash).toBe("#home");
  });

  it("does not render demo dashboard data when the production API is unavailable", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation((input) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
      if (url.endsWith("/auth/config")) {
        return Promise.resolve(responseJson({
          providers: { pingSso: false, localAccount: true },
          pingStatus: "not_configured",
          pingLoginUrl: "/auth/login",
          localLoginUrl: "/auth/local/login",
        }));
      }
      if (url.endsWith("/auth/refresh")) {
        return Promise.resolve(responseJson({
          accessToken: "test-access-token",
          tokenType: "Bearer",
          expiresIn: 600,
          returnPath: "#home",
          mustChangePassword: false,
          principal: {
            id: "user-1048",
            username: "alex.morgan",
            displayName: "Alex Morgan",
            role: "READ_ONLY",
            authenticationProvider: "LOCAL",
            authorizationVersion: 1,
            permissions: ["portal:read"],
          },
        }));
      }
      if (url.endsWith("/api/v1/home")) {
        return Promise.resolve(responseJson({ detail: "Unavailable" }, 503));
      }
      return Promise.reject(new Error("offline"));
    });

    render(<AuthProvider><App /></AuthProvider>);

    expect(await screen.findByRole("heading", { name: "DSP could not load the homepage" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /System status/i })).not.toBeInTheDocument();
  });
});
