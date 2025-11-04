import axios, { isAxiosError } from "axios";

const apiClient = axios.create({
  // 기본값을 '/api'로 설정하여 Hono [[...hono]] 라우트로 프록시되도록 함
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

type ErrorPayload = {
  error?: {
    message?: string;
  };
  message?: string;
};

export const extractApiErrorMessage = (
  error: unknown,
  fallbackMessage = "API request failed."
) => {
  if (isAxiosError(error)) {
    const payload = error.response?.data as ErrorPayload | undefined;

    if (typeof payload?.error?.message === "string") {
      return payload.error.message;
    }

    if (typeof payload?.message === "string") {
      return payload.message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallbackMessage;
};

export { apiClient, isAxiosError };

// 브라우저에서 요청 시, 로그인된 사용자의 ID를 자동으로 헤더에 포함
if (typeof window !== "undefined") {
  apiClient.interceptors.request.use(async (config) => {
    try {
      const { getSupabaseBrowserClient } = await import("@/lib/supabase/browser-client");
      const supabase = getSupabaseBrowserClient();
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth.user?.id;
      if (userId) {
        config.headers = config.headers ?? {};
        (config.headers as Record<string, string>)["x-user-id"] = userId;
      }
      // DEBUG: 요청 로깅
      // eslint-disable-next-line no-console
      console.info(`[API:REQ] ${config.method?.toUpperCase()} ${config.baseURL ?? ''}${config.url}`);
    } catch {
      // noop - 인증 정보가 없을 수 있음
    }
    return config;
  });

  apiClient.interceptors.response.use(
    (response) => {
      // eslint-disable-next-line no-console
      console.info(`[API:RES] ${response.status} ${response.config.url}`);
      return response;
    },
    (error) => {
      // eslint-disable-next-line no-console
      console.error(`[API:ERR] ${error?.response?.status ?? 'NO_STATUS'} ${error?.config?.url}`, error?.response?.data ?? error?.message);
      return Promise.reject(error);
    }
  );
}
