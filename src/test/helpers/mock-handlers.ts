import { vi } from "vitest";

/**
 * Type-safe mock for useCachedPromise return values
 */
export interface MockCachedPromiseReturn<T = unknown> {
  data: T | undefined;
  error: Error | undefined;
  isLoading: boolean;
  mutate: ReturnType<typeof vi.fn>;
  revalidate?: ReturnType<typeof vi.fn>;
  pagination?: {
    pageSize: number;
    hasMore: boolean;
    onLoadMore: () => void;
  };
}

/**
 * Creates a mock return value for useCachedPromise hooks
 * This is the base factory that all other helpers use
 */
export function createMockCachedPromise<T = unknown>(
  overrides: Partial<MockCachedPromiseReturn<T>> = {},
): MockCachedPromiseReturn<T> {
  const base: MockCachedPromiseReturn<T> = {
    data: undefined,
    error: undefined,
    isLoading: false,
    mutate: vi.fn(),
    revalidate: vi.fn(),
  };

  // Handle the specific return type structure that useCachedPromise expects
  if (overrides.isLoading) {
    return {
      ...base,
      isLoading: true,
      data: undefined,
      error: undefined,
      ...overrides,
    } as MockCachedPromiseReturn<T>;
  }

  if (overrides.error) {
    return {
      ...base,
      isLoading: false,
      data: undefined,
      error: overrides.error,
      ...overrides,
    } as MockCachedPromiseReturn<T>;
  }

  return {
    ...base,
    isLoading: false,
    ...overrides,
  } as MockCachedPromiseReturn<T>;
}

/**
 * Creates a successful data return
 */
export function mockCachedPromiseSuccess<T>(data: T): MockCachedPromiseReturn<T> {
  return createMockCachedPromise({ data, isLoading: false });
}

/**
 * Creates a loading state return
 */
export function mockCachedPromiseLoading<T>(): MockCachedPromiseReturn<T> {
  return createMockCachedPromise({ isLoading: true });
}

/**
 * Creates an error state return
 */
export function mockCachedPromiseError<T>(error: Error | string): MockCachedPromiseReturn<T> {
  const errorObj = typeof error === "string" ? new Error(error) : error;
  return createMockCachedPromise({ error: errorObj, isLoading: false });
}

/**
 * Creates a paginated data return
 */
export function mockCachedPromisePaginated<T>(
  data: T,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  page: number = 0,
  hasMore: boolean = false,
): MockCachedPromiseReturn<T> {
  return createMockCachedPromise({
    data,
    isLoading: false,
    pagination: {
      pageSize: 20,
      hasMore,
      onLoadMore: vi.fn(),
    },
  });
}
