export type PortalRole = "ADMIN" | "READ_ONLY";
export type AuthenticationProvider = "PING_SAML" | "LOCAL";

export interface AuthPrincipal {
  id: string;
  username: string;
  displayName: string;
  email?: string | null;
  enterpriseUserId?: string | null;
  role: PortalRole;
  authenticationProvider: AuthenticationProvider;
  authorizationVersion: number;
  permissions: string[];
}

export interface AuthConfig {
  providers: {
    pingSso: boolean;
    localAccount: boolean;
  };
  pingStatus: "configured" | "not_configured" | "incomplete";
  pingLoginUrl: string;
  localLoginUrl: string;
  preauthSupportUrl?: string | null;
}

export interface AuthSession {
  accessToken: string;
  tokenType: "Bearer";
  expiresIn: number;
  returnPath: string;
  principal: AuthPrincipal;
  mustChangePassword: boolean;
}

export type AuthState =
  | { status: "checking"; config: AuthConfig | null; message?: string }
  | { status: "anonymous"; config: AuthConfig; message?: string }
  | { status: "exchanging"; config: AuthConfig | null; message?: string }
  | { status: "authenticated"; config: AuthConfig; principal: AuthPrincipal; mustChangePassword: boolean; expiresIn: number }
  | { status: "error"; config: AuthConfig | null; message: string };
