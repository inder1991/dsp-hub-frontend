import { afterEach, expect, it, vi } from "vitest";

import { authorizedFetch, setSessionInvalidHandler } from "./auth-api";
import { clearAccessToken, setAccessToken } from "./token-store";

function responseJson(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

afterEach(() => {
  clearAccessToken();
  setSessionInvalidHandler(null);
  vi.restoreAllMocks();
});

it("refreshes once and retries an API request after an expired access token", async () => {
  setAccessToken("expired-access-token");
  let apiAttempts = 0;
  const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation((input, init) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    if (url.endsWith("/auth/refresh")) {
      return Promise.resolve(responseJson({
        accessToken: "rotated-access-token",
        tokenType: "Bearer",
        expiresIn: 600,
        returnPath: "#home",
        mustChangePassword: false,
        principal: {
          id: "user-1",
          username: "reader",
          displayName: "Reader",
          role: "READ_ONLY",
          authenticationProvider: "LOCAL",
          authorizationVersion: 1,
          permissions: ["portal:read"],
        },
      }));
    }
    apiAttempts += 1;
    const authorization = new Headers(init?.headers).get("Authorization");
    if (apiAttempts === 1) {
      expect(authorization).toBe("Bearer expired-access-token");
      return Promise.resolve(responseJson({ detail: "Invalid access token" }, 401));
    }
    expect(authorization).toBe("Bearer rotated-access-token");
    return Promise.resolve(responseJson({ ok: true }));
  });

  const response = await authorizedFetch("/api/v1/home");

  expect(response.status).toBe(200);
  expect(apiAttempts).toBe(2);
  expect(fetchMock).toHaveBeenCalledTimes(3);
});
