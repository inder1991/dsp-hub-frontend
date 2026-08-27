import { useState, type FormEvent } from "react";

import { useAuth } from "./AuthProvider";

export function LoginPage() {
  const { state, setLocalPassword, signInLocally, signInWithPing, retry } = useAuth();
  const [localOpen, setLocalOpen] = useState(false);
  const [passwordActionOpen, setPasswordActionOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [actionCode, setActionCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const busy = state.status === "checking" || state.status === "exchanging";
  const config = state.config;
  const message = "message" in state ? state.message : undefined;

  function submitLocal(event: FormEvent) {
    event.preventDefault();
    void signInLocally(username, password);
  }

  function submitPasswordAction(event: FormEvent) {
    event.preventDefault();
    if (newPassword !== confirmPassword) return;
    void setLocalPassword(actionCode, newPassword);
  }

  return (
    <main className="login-page">
      <header className="login-header">
        <a href="#home" aria-label="DSP home">DSP</a>
        <span>Data Science Platform</span>
      </header>
      <section className="login-stage" aria-labelledby="login-title">
        <div className="login-context">
          <span className="login-context-kicker">Enterprise platform access</span>
          <h1 id="login-title">Sign in to DSP</h1>
          <p>Access your devspaces, data entitlements, jobs, platform health, and operational support.</p>
          <div className="login-context-list" aria-label="DSP access scope">
            <span><i />Managed development environments</span>
            <span><i />Operational and ingestion status</span>
            <span><i />Support and troubleshooting routes</span>
          </div>
        </div>
        <div className="login-card">
          <div className="login-card-heading">
            <small>DSP authentication</small>
            <h2>Continue to the portal</h2>
            <p>Use your enterprise identity or a provisioned local DSP account.</p>
          </div>
          {message && <div className="login-message" role="alert">{message}</div>}
          {state.status === "error" ? (
            <button className="login-primary" type="button" onClick={retry}>Try again</button>
          ) : (
            <>
              <button
                className="login-primary"
                type="button"
                aria-label="Sign in with Ping SSO"
                disabled={busy || !config?.providers.pingSso}
                onClick={signInWithPing}
              >
                <span className="login-provider-mark">P</span>
                Sign in with Ping SSO
              </button>
              {!config?.providers.pingSso && config && (
                <p className="login-provider-note">
                  {config.pingStatus === "incomplete"
                    ? "Enterprise SSO is temporarily unavailable. Local DSP accounts remain available."
                    : "Enterprise SSO is not currently available. Local DSP accounts remain available."}
                </p>
              )}
              <div className="login-divider"><span>or</span></div>
              {!localOpen && !passwordActionOpen ? (
                <button className="login-secondary" type="button" onClick={() => setLocalOpen(true)}>
                  Use a local DSP account
                </button>
              ) : localOpen ? (
                <form className="local-login-form" onSubmit={submitLocal}>
                  <label>
                    Username
                    <input autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} required />
                  </label>
                  <label>
                    Password
                    <input autoComplete="current-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
                  </label>
                  <div>
                    <button className="login-primary" type="submit" disabled={busy}>Sign in</button>
                    <button className="login-text-button" type="button" onClick={() => setLocalOpen(false)}>Cancel</button>
                  </div>
                </form>
              ) : (
                <form className="local-login-form" onSubmit={submitPasswordAction}>
                  <label>
                    Setup or reset code
                    <input autoComplete="one-time-code" value={actionCode} onChange={(event) => setActionCode(event.target.value)} required />
                  </label>
                  <label>
                    New password
                    <input autoComplete="new-password" type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} required />
                  </label>
                  <label>
                    Confirm new password
                    <input autoComplete="new-password" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required />
                  </label>
                  {confirmPassword && newPassword !== confirmPassword && (
                    <span className="login-field-error" role="alert">Passwords do not match.</span>
                  )}
                  <div>
                    <button className="login-primary" type="submit" disabled={busy || newPassword !== confirmPassword}>Update password</button>
                    <button className="login-text-button" type="button" onClick={() => setPasswordActionOpen(false)}>Cancel</button>
                  </div>
                </form>
              )}
              {!passwordActionOpen && (
                <button
                  className="login-text-button login-password-action"
                  type="button"
                  onClick={() => {
                    setLocalOpen(false);
                    setPasswordActionOpen(true);
                  }}
                >
                  Set or reset a local password
                </button>
              )}
            </>
          )}
          <footer>
            Local accounts are provisioned and managed by DSP administrators.
            {config?.preauthSupportUrl && <a href={config.preauthSupportUrl}>Authentication support</a>}
          </footer>
        </div>
      </section>
    </main>
  );
}

export function AuthStatusPage() {
  return (
    <main className="login-page login-page--status">
      <section className="auth-status" role="status">
        <span className="auth-status-spinner" />
        <h1>Completing sign in</h1>
        <p>DSP is validating your enterprise session.</p>
      </section>
    </main>
  );
}
