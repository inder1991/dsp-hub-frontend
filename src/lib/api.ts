import type { DashboardData } from "../types/dashboard";
import type { AdminControlPlaneData, UserDataAccessData } from "../types/data-platform";
import type { DevspacesData } from "../types/devspaces";
import type { OnboardingData } from "../types/onboarding";
import type { DevspaceDetailData, JobsData, VmDetailData, VmInventoryData } from "../types/observability";
import type { SupportData } from "../types/support";
import { authorizedFetch } from "../auth/auth-api";

export async function fetchDashboard(signal?: AbortSignal): Promise<DashboardData> {
  const response = await authorizedFetch("/api/v1/home", {
    signal,
  });

  if (!response.ok) {
    throw new Error(`Dashboard request failed with status ${response.status}`);
  }

  return (await response.json()) as DashboardData;
}

export async function fetchSupport(signal?: AbortSignal): Promise<SupportData> {
  const response = await authorizedFetch("/api/v1/support", {
    signal,
  });

  if (!response.ok) {
    throw new Error(`Support request failed with status ${response.status}`);
  }

  return (await response.json()) as SupportData;
}

export async function fetchOnboarding(signal?: AbortSignal): Promise<OnboardingData> {
  const response = await authorizedFetch("/api/v1/onboarding", {
    signal,
  });

  if (!response.ok) {
    throw new Error(`Onboarding request failed with status ${response.status}`);
  }

  return (await response.json()) as OnboardingData;
}

export async function fetchDevspaces(signal?: AbortSignal): Promise<DevspacesData> {
  const response = await authorizedFetch("/api/v1/devspaces", {
    signal,
  });

  if (!response.ok) {
    throw new Error(`Devspace inventory request failed with status ${response.status}`);
  }

  return (await response.json()) as DevspacesData;
}

export async function fetchJobs(signal?: AbortSignal): Promise<JobsData> {
  const response = await authorizedFetch("/api/v1/jobs", {
    signal,
  });
  if (!response.ok) throw new Error(`Jobs request failed with status ${response.status}`);
  return (await response.json()) as JobsData;
}

export async function fetchDevspaceDetail(devspaceId: string, signal?: AbortSignal): Promise<DevspaceDetailData> {
  const response = await authorizedFetch(`/api/v1/devspaces/${encodeURIComponent(devspaceId)}`, {
    signal,
  });
  if (!response.ok) throw new Error(`Devspace detail request failed with status ${response.status}`);
  return (await response.json()) as DevspaceDetailData;
}

export async function fetchVmDetail(vmId: string, signal?: AbortSignal): Promise<VmDetailData> {
  const response = await authorizedFetch(`/api/v1/vms/${encodeURIComponent(vmId)}`, {
    signal,
  });
  if (!response.ok) throw new Error(`VM detail request failed with status ${response.status}`);
  return (await response.json()) as VmDetailData;
}

export async function fetchVms(signal?: AbortSignal): Promise<VmInventoryData> {
  const response = await authorizedFetch("/api/v1/vms", {
    signal,
  });
  if (!response.ok) throw new Error(`VM inventory request failed with status ${response.status}`);
  return (await response.json()) as VmInventoryData;
}

export async function fetchUserDataAccess(signal?: AbortSignal): Promise<UserDataAccessData> {
  const response = await authorizedFetch("/api/v1/data-access", {
    signal,
  });
  if (!response.ok) throw new Error(`Data access request failed with status ${response.status}`);
  return (await response.json()) as UserDataAccessData;
}

export async function fetchAdminControlPlane(signal?: AbortSignal): Promise<AdminControlPlaneData> {
  const response = await authorizedFetch("/api/v1/admin/control-plane", {
    signal,
  });
  if (!response.ok) throw new Error(`Admin control-plane request failed with status ${response.status}`);
  return (await response.json()) as AdminControlPlaneData;
}
