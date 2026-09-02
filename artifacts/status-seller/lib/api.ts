import { setBaseUrl, setAuthTokenGetter } from "@workspace/api-client-react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const configuredApiUrl = process.env["EXPO_PUBLIC_API_BASE_URL"]?.replace(/\/$/, "");
export const API_BASE_URL = configuredApiUrl
  ? (configuredApiUrl.endsWith("/api") ? configuredApiUrl : `${configuredApiUrl}/api`)
  : process.env["EXPO_PUBLIC_DOMAIN"]
    ? `https://${process.env["EXPO_PUBLIC_DOMAIN"]}/api`
    : "http://localhost:8080/api";

const ACCESS_TOKEN_KEY = "ss_access_token";
const REFRESH_TOKEN_KEY = "ss_refresh_token";

// Configure the shared API client base URL
setBaseUrl(API_BASE_URL);

// Configure auth token getter so all generated hooks send Authorization header
setAuthTokenGetter(async () => {
  return AsyncStorage.getItem(ACCESS_TOKEN_KEY);
});

export async function getAccessToken(): Promise<string | null> {
  return AsyncStorage.getItem(ACCESS_TOKEN_KEY);
}

export async function getRefreshToken(): Promise<string | null> {
  return AsyncStorage.getItem(REFRESH_TOKEN_KEY);
}

export async function saveTokens(accessToken: string, refreshToken: string): Promise<void> {
  await AsyncStorage.multiSet([
    [ACCESS_TOKEN_KEY, accessToken],
    [REFRESH_TOKEN_KEY, refreshToken],
  ]);
}

export async function clearTokens(): Promise<void> {
  await AsyncStorage.multiRemove([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY]);
}

// Thin wrapper around fetch that automatically attaches auth headers
// and refreshes the access token when a 401 is received
export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = await getAccessToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });

  if (response.status === 401) {
    // Try to refresh
    const refreshToken = await getRefreshToken();
    if (refreshToken) {
      const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
      if (refreshRes.ok) {
        const { accessToken: newAccessToken } = (await refreshRes.json()) as { accessToken: string };
        await AsyncStorage.setItem(ACCESS_TOKEN_KEY, newAccessToken);
        headers["Authorization"] = `Bearer ${newAccessToken}`;
        response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
      }
    }
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? `API error ${response.status}`);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
