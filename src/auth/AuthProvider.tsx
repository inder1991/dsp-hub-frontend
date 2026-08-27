import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";

import {
  completePasswordAction,
  exchangePingCode,
  fetchAuthConfig,
  loginWithLocalAccount,
  logoutSession,
  refreshSession,
  restoreSession,
  setSessionInvalidHandler,
  startPingLogin,
} from "./auth-api";
import { clearAccessToken } from "./token-store";
import type { AuthConfig, AuthSession, AuthState } from "./types";

interface AuthContextValue {
  state: AuthState;
  signInWithPing: () => void;
  signInLocally: (username: string, password: string) => Promise<void>;
  setLocalPassword: (actionCode: string, newPassword: string) => Promise<void>;
  signOut: () => Promise<void>;
  retry: () => void;
}

interface BrowserAuthInput {
  tokenId?: string;
  errorCode?: string;
  correlationId?: string;
}

const AuthContext = createContext<AuthContextValue | null>(null);
let retainedBrowserInput: BrowserAuthInput | null = null;
let exchangeRequest: Promise<AuthSession> | null = null;
let exchangeTokenId: string | null = null;

function captureBrowserAuthInput(): BrowserAuthInput | null {
  if (retainedBrowserInput) return retainedBrowserInput;
  const hash = window.location.hash.replace(/^#/, "");
  const [route, query = ""] = hash.split("?", 2);
  if (route !== "auth/callback" && route !== "login") return null;
  const params = new URLSearchParams(query);
  const tokenId = params.get("token_id") || undefined;
  const errorCode = params.get("authError") || undefined;
  const correlationId = params.get("correlationId") || undefined;
  if (!tokenId && !errorCode) return null;
  retainedBrowserInput = { tokenId, errorCode, correlationId };
  const safeHash = tokenId ? "#auth/callback" : "#login";
  window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}${safeHash}`);
  return retainedBrowserInput;
}

function exchangeOnce(tokenId: string): Promise<AuthSession> {
  if (!exchangeRequest || exchangeTokenId !== tokenId) {
    exchangeTokenId = tokenId;
    exchangeRequest = exchangePingCode(tokenId).finally(() => {
      retainedBrowserInput = null;
    });
  }
  return exchangeRequest;
}

function pingErrorMessage(input: BrowserAuthInput): string {
  const messages: Record<string, string> = {
    PING_UNAVAILABLE: "Enterprise sign-in is temporarily unavailable. You can still use a local DSP account.",
    LOGIN_EXPIRED: "The enterprise sign-in request expired. Start Ping sign-in again.",
    PING_RESPONSE_REJECTED: "Ping could not validate this sign-in response.",
    PING_RESPONSE_EXPIRED: "The Ping sign-in response expired. Start sign-in again.",
    PING_SESSION_EXPIRED: "Your Ping session has expired. Start sign-in again.",
    PING_RESPONSE_REUSED: "This Ping sign-in response has already been used.",
    ACCESS_NOT_APPROVED: "Your enterprise account is not in an approved DSP access group.",
  };
  const message = messages[input.errorCode || ""] || "Enterprise sign-in could not be completed.";
  return input.correlationId ? `${message} Reference: ${input.correlationId}` : message;
}

function authenticatedState(config: AuthConfig, session: AuthSession): AuthState {
  return {
    status: "authenticated",
    config,
    principal: session.principal,
    mustChangePassword: session.mustChangePassword,
    expiresIn: session.expiresIn,
  };
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<AuthState>({ status: "checking", config: null });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    const browserInput = captureBrowserAuthInput();
    setState({
      status: browserInput?.tokenId ? "exchanging" : "checking",
      config: null,
    });

    fetchAuthConfig()
      .then(async (config) => {
        if (browserInput?.errorCode) {
          retainedBrowserInput = null;
          if (active) {
            clearAccessToken();
            setState({ status: "anonymous", config, message: pingErrorMessage(browserInput) });
          }
          return;
        }
        if (browserInput?.tokenId) {
          try {
            const session = await exchangeOnce(browserInput.tokenId);
            if (active) {
              setState(authenticatedState(config, session));
              window.location.hash = session.returnPath || "#home";
            }
          } catch (error) {
            if (active) {
              clearAccessToken();
              setState({
                status: "anonymous",
                config,
                message: error instanceof Error ? error.message : "Ping sign-in could not be completed.",
              });
            }
          }
          return;
        }
        try {
          const session = await restoreSession();
          if (active) setState(authenticatedState(config, session));
        } catch {
          if (active) {
            clearAccessToken();
            setState({ status: "anonymous", config });
          }
        }
      })
      .catch((error: unknown) => {
        if (!active || (error instanceof DOMException && error.name === "AbortError")) return;
        clearAccessToken();
        setState({
          status: "error",
          config: null,
          message: "The DSP authentication service is currently unavailable.",
        });
      });
    return () => {
      active = false;
    };
  }, [attempt]);

  useEffect(() => {
    setSessionInvalidHandler((message) => {
      clearAccessToken();
      setState((current) => current.config
        ? { status: "anonymous", config: current.config, message }
        : { status: "error", config: null, message });
    });
    return () => setSessionInvalidHandler(null);
  }, []);

  useEffect(() => {
    if (state.status !== "authenticated") return;
    const refreshAfterMs = Math.max(5_000, (state.expiresIn - 60) * 1_000);
    const timer = window.setTimeout(() => {
      refreshSession()
        .then((session) => {
          setState((current) => current.status === "authenticated"
            ? authenticatedState(current.config, session)
            : current);
        })
        .catch(() => {
          clearAccessToken();
          setState({
            status: "anonymous",
            config: state.config,
            message: "Your DSP session has expired. Sign in again.",
          });
        });
    }, refreshAfterMs);
    return () => window.clearTimeout(timer);
  }, [state]);

  const signInLocally = useCallback(async (username: string, password: string) => {
    if (!state.config) return;
    const config = state.config;
    setState({ status: "checking", config, message: "Signing in…" });
    try {
      const session = await loginWithLocalAccount(username, password, window.location.hash || "#home");
      setState(authenticatedState(config, session));
      window.location.hash = session.returnPath || "#home";
    } catch (error) {
      clearAccessToken();
      setState({
        status: "anonymous",
        config,
        message: error instanceof Error ? error.message : "Local sign-in failed.",
      });
    }
  }, [state.config]);

  const setLocalPassword = useCallback(async (actionCode: string, newPassword: string) => {
    if (!state.config) return;
    const config = state.config;
    setState({ status: "checking", config, message: "Updating password…" });
    try {
      await completePasswordAction(actionCode, newPassword);
      setState({
        status: "anonymous",
        config,
        message: "Password updated. Sign in with your local DSP account.",
      });
    } catch (error) {
      setState({
        status: "anonymous",
        config,
        message: error instanceof Error ? error.message : "Password could not be updated.",
      });
    }
  }, [state.config]);

  const value = useMemo<AuthContextValue>(() => ({
    state,
    signInWithPing: () => startPingLogin(window.location.hash || "#home"),
    signInLocally,
    setLocalPassword,
    signOut: async () => {
      const serverRevoked = await logoutSession();
      if (state.config) {
        setState({
          status: "anonymous",
          config: state.config,
          message: serverRevoked
            ? "You have signed out of DSP."
            : "You are signed out in this browser. DSP could not confirm server sign-out.",
        });
      }
    },
    retry: () => setAttempt((value) => value + 1),
  }), [setLocalPassword, signInLocally, state]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
