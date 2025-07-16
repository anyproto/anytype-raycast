import { useCachedPromise } from "@raycast/utils";
import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getObject } from "../../api";
import { BodyFormat, SpaceObjectWithBody } from "../../models";
import { useObject } from "../useObject";

// Mock dependencies
vi.mock("../../api", () => ({
  getObject: vi.fn(),
}));

vi.mock("@raycast/utils", () => ({
  useCachedPromise: vi.fn(),
}));

// Helper to create properly typed mock returns
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createMockUseCachedPromiseReturn = (overrides: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error?: any;
  isLoading?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mutate?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}): any => {
  if (overrides.isLoading) {
    return {
      isLoading: true as const,
      error: undefined,
      data: undefined,
    };
  }
  if (overrides.error) {
    return {
      isLoading: false as const,
      error: overrides.error,
      data: undefined,
    };
  }
  return {
    isLoading: false as const,
    error: undefined,
    data: overrides.data ?? undefined,
    mutate: overrides.mutate ?? vi.fn(),
    revalidate: vi.fn(),
  };
};

describe("useObject", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return object data when loading is successful", () => {
    const mockObject = {
      id: "obj1",
      name: "Test Object",
      snippet: "Test snippet",
      archived: false,
    };

    const mockUseCachedPromiseReturn = createMockUseCachedPromiseReturn({
      data: mockObject,
    });

    vi.mocked(useCachedPromise).mockReturnValue(mockUseCachedPromiseReturn);

    const { result } = renderHook(() => useObject("space1", "obj1", BodyFormat.Markdown));

    expect(result.current.object).toEqual(mockObject);
    expect(result.current.objectError).toBeUndefined();
    expect(result.current.isLoadingObject).toBe(false);
    expect(result.current.mutateObject).toBe(mockUseCachedPromiseReturn.mutate);
  });

  it("should call useCachedPromise with correct parameters", () => {
    const mockUseCachedPromiseReturn = createMockUseCachedPromiseReturn({
      isLoading: true,
    });

    vi.mocked(useCachedPromise).mockReturnValue(mockUseCachedPromiseReturn);

    renderHook(() => useObject("space1", "obj1", BodyFormat.Markdown));

    expect(useCachedPromise).toHaveBeenCalledWith(expect.any(Function), ["space1", "obj1", BodyFormat.Markdown], {
      keepPreviousData: true,
      execute: true,
    });
  });

  it("should not execute when spaceId is empty", () => {
    const mockUseCachedPromiseReturn = createMockUseCachedPromiseReturn({
      data: undefined,
    });

    vi.mocked(useCachedPromise).mockReturnValue(mockUseCachedPromiseReturn);

    renderHook(() => useObject("", "obj1", BodyFormat.Markdown));

    expect(useCachedPromise).toHaveBeenCalledWith(expect.any(Function), ["", "obj1", BodyFormat.Markdown], {
      keepPreviousData: true,
      execute: false,
    });
  });

  it("should not execute when objectId is empty", () => {
    const mockUseCachedPromiseReturn = createMockUseCachedPromiseReturn({
      data: undefined,
    });

    vi.mocked(useCachedPromise).mockReturnValue(mockUseCachedPromiseReturn);

    renderHook(() => useObject("space1", "", BodyFormat.Markdown));

    expect(useCachedPromise).toHaveBeenCalledWith(expect.any(Function), ["space1", "", BodyFormat.Markdown], {
      keepPreviousData: true,
      execute: false,
    });
  });

  it("should not execute when format is not provided", () => {
    const mockUseCachedPromiseReturn = createMockUseCachedPromiseReturn({
      data: undefined,
    });

    vi.mocked(useCachedPromise).mockReturnValue(mockUseCachedPromiseReturn);

    renderHook(() => useObject("space1", "obj1", null as unknown as BodyFormat));

    expect(useCachedPromise).toHaveBeenCalledWith(expect.any(Function), ["space1", "obj1", null], {
      keepPreviousData: true,
      execute: false,
    });
  });

  it("should handle loading state", () => {
    const mockUseCachedPromiseReturn = createMockUseCachedPromiseReturn({
      isLoading: true,
    });

    vi.mocked(useCachedPromise).mockReturnValue(mockUseCachedPromiseReturn);

    const { result } = renderHook(() => useObject("space1", "obj1", BodyFormat.Markdown));

    expect(result.current.object).toBeUndefined();
    expect(result.current.objectError).toBeUndefined();
    expect(result.current.isLoadingObject).toBe(true);
  });

  it("should handle error state", () => {
    const mockError = new Error("Failed to fetch object");
    const mockUseCachedPromiseReturn = createMockUseCachedPromiseReturn({
      error: mockError,
    });

    vi.mocked(useCachedPromise).mockReturnValue(mockUseCachedPromiseReturn);

    const { result } = renderHook(() => useObject("space1", "obj1", BodyFormat.Markdown));

    expect(result.current.object).toBeUndefined();
    expect(result.current.objectError).toBe(mockError);
    expect(result.current.isLoadingObject).toBe(false);
  });

  it("should call getObject API when useCachedPromise function is executed", async () => {
    const mockObject: SpaceObjectWithBody = {
      object: "object",
      id: "obj1",
      name: "Test Object",
      icon: "icon",
      space_id: "space1",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      layout: "basic" as any,
      snippet: "Test snippet",
      archived: false,
      type: {
        object: "type",
        id: "type1",
        key: "document",
        name: "Document",
        plural_name: "Documents",
        icon: "icon",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        layout: "basic" as any,
        archived: false,
        properties: [],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
      properties: [],
      markdown: "",
    };

    vi.mocked(getObject).mockResolvedValue({ object: mockObject });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let cachedPromiseFunction: any;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    vi.mocked(useCachedPromise).mockImplementation((fn, _deps, _options) => {
      cachedPromiseFunction = fn;
      return createMockUseCachedPromiseReturn({
        isLoading: true,
      });
    });

    renderHook(() => useObject("space1", "obj1", BodyFormat.Markdown));

    // Execute the cached promise function
    const result = await cachedPromiseFunction("space1", "obj1", BodyFormat.Markdown);

    expect(getObject).toHaveBeenCalledWith("space1", "obj1", BodyFormat.Markdown);
    expect(result).toEqual(mockObject);
  });

  it("should handle different body formats", () => {
    const mockUseCachedPromiseReturn = createMockUseCachedPromiseReturn({
      data: undefined,
    });

    vi.mocked(useCachedPromise).mockReturnValue(mockUseCachedPromiseReturn);

    // Test with JSON format
    renderHook(() => useObject("space1", "obj1", BodyFormat.JSON));

    expect(useCachedPromise).toHaveBeenLastCalledWith(expect.any(Function), ["space1", "obj1", BodyFormat.JSON], {
      keepPreviousData: true,
      execute: true,
    });
  });

  it("should properly rename returned values", () => {
    const mockMutate = vi.fn();
    const mockUseCachedPromiseReturn = {
      data: { id: "test" },
      error: new Error("test error"),
      isLoading: true,
      mutate: mockMutate,
      revalidate: vi.fn(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;

    vi.mocked(useCachedPromise).mockReturnValue(mockUseCachedPromiseReturn);

    const { result } = renderHook(() => useObject("space1", "obj1", BodyFormat.Markdown));

    // Check that values are properly renamed
    expect(result.current.object).toEqual({ id: "test" });
    expect(result.current.objectError).toEqual(new Error("test error"));
    expect(result.current.isLoadingObject).toBe(true);
    expect(result.current.mutateObject).toBe(mockMutate);
  });
});
