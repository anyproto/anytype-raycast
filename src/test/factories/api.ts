import { Headers as FetchHeaders } from "node-fetch";

/**
 * Creates mock headers for API responses
 */
export function createHeaders(headers: Record<string, string> = {}): FetchHeaders {
  const fetchHeaders = new FetchHeaders();
  Object.entries(headers).forEach(([key, value]) => {
    fetchHeaders.set(key, value);
  });
  return fetchHeaders;
}

/**
 * Creates a mock API response with headers
 */
export function createApiResponse<T>(payload: T, headers: Record<string, string> = {}) {
  return {
    payload,
    headers: createHeaders(headers),
  };
}

/**
 * Creates a paginated API response
 */
export function createPaginatedResponse<T>(
  items: T[],
  options: {
    total?: number;
    offset?: number;
    limit?: number;
    hasMore?: boolean;
  } = {},
) {
  const { total = items.length, offset = 0, limit = 20, hasMore = false } = options;

  return {
    data: items,
    items, // For backward compatibility
    total,
    offset,
    limit,
    has_more: hasMore,
    pagination: { total, offset, limit, has_more: hasMore },
  };
}

/**
 * Creates a getTypes API response
 */
export function createTypesResponse<T = unknown>(
  types: T[],
  options: {
    total?: number;
    offset?: number;
    limit?: number;
    hasMore?: boolean;
  } = {},
) {
  const { total = types.length, offset = 0, limit = 1000, hasMore = false } = options;

  return {
    types,
    pagination: { total, offset, limit, has_more: hasMore },
  };
}

/**
 * Creates an API error with status code
 */
export function createApiError(message: string, status?: number): Error {
  const error = new Error(message) as Error & { status?: number };
  if (status !== undefined) {
    error.status = status;
  }
  return error;
}

/**
 * Common API error messages
 */
export const API_ERRORS = {
  NOT_FOUND: "Not found",
  UNAUTHORIZED: "Unauthorized",
  CONNECTION: "Connection error",
  ARCHIVED: "Object is archived",
} as const;
