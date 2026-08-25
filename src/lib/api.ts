import type { DashboardData } from "../types/dashboard";
import type { OnboardingData } from "../types/onboarding";
import type { SupportData } from "../types/support";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ?? "";

export async function fetchDashboard(signal?: AbortSignal): Promise<DashboardData> {
  const response = await fetch(`${API_BASE_URL}/api/v1/home`, {
    headers: { Accept: "application/json" },
    signal,
  });

  if (!response.ok) {
    throw new Error(`Dashboard request failed with status ${response.status}`);
  }

  return (await response.json()) as DashboardData;
}

export async function fetchSupport(signal?: AbortSignal): Promise<SupportData> {
  const response = await fetch(`${API_BASE_URL}/api/v1/support`, {
    headers: { Accept: "application/json" },
    signal,
  });

  if (!response.ok) {
    throw new Error(`Support request failed with status ${response.status}`);
  }

  return (await response.json()) as SupportData;
}

export async function fetchOnboarding(signal?: AbortSignal): Promise<OnboardingData> {
  const response = await fetch(`${API_BASE_URL}/api/v1/onboarding`, {
    headers: { Accept: "application/json" },
    signal,
  });

  if (!response.ok) {
    throw new Error(`Onboarding request failed with status ${response.status}`);
  }

  return (await response.json()) as OnboardingData;
}
