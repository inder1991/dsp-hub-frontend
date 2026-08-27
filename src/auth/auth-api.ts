import type { AuthConfig, AuthSession } from "./types";
import { clearAccessToken, getAccessToken, setAccessToken } from "./token-store";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ?? "";

function csrfCookie(): string {
  const cookieName = "__Host-dsp_csrf=";
  const item = document.cookie
    .split(";")
    .map((value) => value.trim())
    .find((value) => value.startsWith(cookieName));
  return item ? decodeURIComponent(item.slice(cookieName.length)) : "";
}

async function jsonRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (init.body) headers.set("Content-Type", "application/json");
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
    credentials: "include",
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { detail?: string } | null;
    throw new Error(body?.detail || `Authentication request failed with status ${response.status}`);
  }
  return (await response.json()) as T;
}

function retainSession(session: AuthSession): AuthSession {
  setAccessToken(session.accessToken);
  return session;
}

export function fetchAuthConfig(signal?: AbortSignal): Promise<AuthConfig> {
  return jsonRequest<AuthConfig>("/auth/config", { signal });
}

export function loginWithLocalAccount(
  username: string,
  password: string,
  returnTo: string,
): Promise<AuthSession> {
  return jsonRequest<AuthSession>("/auth/local/login", {
    method: "POST",
    body: JSON.stringify({ username, password, returnTo }),
  }).then(retainSession);
}

export function exchangePingCode(tokenId: string): Promise<AuthSession> {
  return jsonRequest<AuthSession>("/auth/exchange", {
    method: "POST",
    body: JSON.stringify({ tokenId }),
  }).then(retainSession);
}

let refreshRequest: Promise<AuthSession> | null = null;
let sessionInvalidHandler: ((message: string) => void) | null = null;

export function setSessionInvalidHandler(handler: ((message: string) => void) | null): void {
  sessionInvalidHandler = handler;
}

export function refreshSession(signal?: AbortSignal): Promise<AuthSession> {
  if (refreshRequest) return refreshRequest;
  refreshRequest = jsonRequest<AuthSession>("/auth/refresh", {
    method: "POST",
    headers: { "X-CSRF-Token": csrfCookie() },
    signal,
  }).then(retainSession).finally(() => {
    refreshRequest = null;
  });
  return refreshRequest;
}

export function restoreSession(signal?: AbortSignal): Promise<AuthSession> {
  return refreshSession(signal);
}

export async function logoutSession(): Promise<boolean> {
  try {
    await jsonRequest<{ message: string }>("/auth/logout", {
      method: "POST",
      headers: { "X-CSRF-Token": csrfCookie() },
    });
    return true;
  } catch {
    return false;
  } finally {
    clearAccessToken();
  }
}

export async function authorizedFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const send = () => {
    const headers = new Headers(init.headers);
    headers.set("Accept", "application/json");
    const token = getAccessToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers,
      credentials: "include",
    });
  };
  let response = await send();
  if (response.status !== 401) return response;
  try {
    await refreshSession();
    response = await send();
    if (response.status === 401) throw new Error("Session is no longer valid");
    return response;
  } catch {
    clearAccessToken();
    sessionInvalidHandler?.("Your DSP session has expired. Sign in again.");
    return response;
  }
}

export function completePasswordAction(actionCode: string, newPassword: string): Promise<void> {
  return jsonRequest<{ message: string }>("/auth/local/password-action", {
    method: "POST",
    body: JSON.stringify({ actionCode, newPassword }),
  }).then(() => undefined);
}

export function startPingLogin(returnPath: string): void {
  window.location.assign(
    `${API_BASE_URL}/auth/login?returnTo=${encodeURIComponent(returnPath)}`,
  );
}
