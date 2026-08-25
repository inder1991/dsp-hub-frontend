import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import App from "./App";

describe("DSP Portal homepage", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    window.history.replaceState(null, "", "#home");
  });

  it("renders the four operational homepage sections", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("offline"));
    render(<App />);

    expect(screen.getByRole("heading", { name: /system status/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /my dsp/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /recent activity/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /upcoming changes/i })).toBeInTheDocument();
  });

  it("opens the persistent DSP health summary", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("offline"));
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: /DSP HEALTH: DEGRADED/i }));

    expect(screen.getByRole("menu", { name: "DSP health summary" })).toBeInTheDocument();
    expect(screen.getByText("2 systems need attention")).toBeInTheDocument();
    expect(screen.getByText("Query performance degraded")).toBeInTheDocument();
  });

  it("explains that deferred options arrive in phase two", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("offline"));
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "My Jobs" }));

    expect(screen.getByRole("status")).toHaveTextContent("My Jobs is visible in release one");
  });

  it("provides read-only troubleshooting and separate support routes", async () => {
    window.history.replaceState(null, "", "#support");
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("offline"));
    render(<App />);

    expect(screen.getByRole("heading", { name: "Troubleshooting & support" })).toBeInTheDocument();
    expect(screen.getByText("CyberArk troubleshooting")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Chat with DSP support/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Create Remedy ticket/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open guide: CyberArk session is unavailable" })).toHaveAttribute("href", "#guide/cyberark/session-unavailable");
    expect(screen.queryByText(/Run checks/i)).not.toBeInTheDocument();
  });

  it("renders the in-portal CyberArk demo guide", async () => {
    window.history.replaceState(null, "", "#guide/cyberark/session-unavailable");
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("offline"));
    render(<App />);

    expect(screen.getByRole("heading", { name: "Unable to start a CyberArk session" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Step-by-step fix" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Back to all CyberArk issues/i })).toHaveAttribute("href", "#support");
  });

  it("renders onboarding and bootcamp without executable checks or a target", async () => {
    window.history.replaceState(null, "", "#onboarding");
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("offline"));
    render(<App />);

    expect(screen.getByRole("heading", { name: "Onboarding & bootcamp" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Upcoming bootcamp" })).toBeInTheDocument();
    expect(screen.getByText(/Sep 15–16, 2026/)).toBeInTheDocument();
    expect(screen.queryByText(/Target 300/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Run readiness check|Run connectivity check/i)).not.toBeInTheDocument();
  });
});
