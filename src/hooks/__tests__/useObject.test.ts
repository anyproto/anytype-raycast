import { useCachedPromise } from "@raycast/utils";
import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getObject } from "../../api";
import { BodyFormat, SpaceObjectWithBody } from "../../models";
import {
  createMockCachedPromise,
  createSpaceObject,
  mockCachedPromiseError,
  mockCachedPromiseLoading,
  mockCachedPromiseSuccess,
  TEST_IDS,
} from "../../test";
import { useObject } from "../useObject";

vi.mock("../../api", () => ({
  getObject: vi.fn(),
}));

vi.mock("@raycast/utils", () => ({
  useCachedPromise: vi.fn(),
}));

describe("useObject", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return object data when loading is successful", () => {
    const mockObject = createSpaceObject({
      id: TEST_IDS.object,
      name: "Test Object",
    }) as SpaceObjectWithBody;

    const mockReturn = mockCachedPromiseSuccess(mockObject);
    vi.mocked(useCachedPromise).mockReturnValue(mockReturn as ReturnType<typeof useCachedPromise>);

    const { result } = renderHook(() => useObject(TEST_IDS.space, TEST_IDS.object, BodyFormat.Markdown));

    expect(result.current.object).toEqual(mockObject);
    expect(result.current.objectError).toBeUndefined();
    expect(result.current.isLoadingObject).toBe(false);
    expect(result.current.mutateObject).toBe(mockReturn.mutate);
  });

  it("should call useCachedPromise with correct parameters", () => {
    const mockReturn = mockCachedPromiseLoading();
    vi.mocked(useCachedPromise).mockReturnValue(mockReturn as ReturnType<typeof useCachedPromise>);

    renderHook(() => useObject(TEST_IDS.space, TEST_IDS.object, BodyFormat.Markdown));

    expect(useCachedPromise).toHaveBeenCalledWith(
      expect.any(Function),
      [TEST_IDS.space, TEST_IDS.object, BodyFormat.Markdown],
      {
        keepPreviousData: true,
        execute: true,
      },
    );
  });

  it("should not execute when spaceId is empty", () => {
    const mockReturn = createMockCachedPromise();
    vi.mocked(useCachedPromise).mockReturnValue(mockReturn as ReturnType<typeof useCachedPromise>);

    renderHook(() => useObject("", TEST_IDS.object, BodyFormat.Markdown));

    expect(useCachedPromise).toHaveBeenCalledWith(expect.any(Function), ["", TEST_IDS.object, BodyFormat.Markdown], {
      keepPreviousData: true,
      execute: false,
    });
  });

  it("should not execute when objectId is empty", () => {
    const mockReturn = createMockCachedPromise();
    vi.mocked(useCachedPromise).mockReturnValue(mockReturn as ReturnType<typeof useCachedPromise>);

    renderHook(() => useObject(TEST_IDS.space, "", BodyFormat.Markdown));

    expect(useCachedPromise).toHaveBeenCalledWith(expect.any(Function), [TEST_IDS.space, "", BodyFormat.Markdown], {
      keepPreviousData: true,
      execute: false,
    });
  });

  it("should not execute when format is not provided", () => {
    const mockReturn = createMockCachedPromise();
    vi.mocked(useCachedPromise).mockReturnValue(mockReturn as ReturnType<typeof useCachedPromise>);

    renderHook(() => useObject(TEST_IDS.space, TEST_IDS.object, null as unknown as BodyFormat));

    expect(useCachedPromise).toHaveBeenCalledWith(expect.any(Function), [TEST_IDS.space, TEST_IDS.object, null], {
      keepPreviousData: true,
      execute: false,
    });
  });

  it("should handle loading state", () => {
    vi.mocked(useCachedPromise).mockReturnValue(mockCachedPromiseLoading() as ReturnType<typeof useCachedPromise>);

    const { result } = renderHook(() => useObject(TEST_IDS.space, TEST_IDS.object, BodyFormat.Markdown));

    expect(result.current.object).toBeUndefined();
    expect(result.current.objectError).toBeUndefined();
    expect(result.current.isLoadingObject).toBe(true);
  });

  it("should handle error state", () => {
    const mockError = new Error("Failed to fetch object");
    vi.mocked(useCachedPromise).mockReturnValue(
      mockCachedPromiseError(mockError) as ReturnType<typeof useCachedPromise>,
    );

    const { result } = renderHook(() => useObject(TEST_IDS.space, TEST_IDS.object, BodyFormat.Markdown));

    expect(result.current.object).toBeUndefined();
    expect(result.current.objectError).toBe(mockError);
    expect(result.current.isLoadingObject).toBe(false);
  });

  it("should call getObject API when useCachedPromise function is executed", async () => {
    const mockObject = createSpaceObject({
      id: TEST_IDS.object,
      name: "Test Object",
    }) as SpaceObjectWithBody;

    vi.mocked(getObject).mockResolvedValue({ object: mockObject });

    type PromiseFunction = (spaceId: string, objectId: string, format: BodyFormat) => Promise<SpaceObjectWithBody>;
    let cachedPromiseFunction: PromiseFunction;
    vi.mocked(useCachedPromise).mockImplementation((fn) => {
      cachedPromiseFunction = fn as PromiseFunction;
      return mockCachedPromiseLoading() as ReturnType<typeof useCachedPromise>;
    });

    renderHook(() => useObject(TEST_IDS.space, TEST_IDS.object, BodyFormat.Markdown));

    const result = await cachedPromiseFunction!(TEST_IDS.space, TEST_IDS.object, BodyFormat.Markdown);

    expect(getObject).toHaveBeenCalledWith(TEST_IDS.space, TEST_IDS.object, BodyFormat.Markdown);
    expect(result).toEqual(mockObject);
  });

  it("should handle different body formats", () => {
    const mockReturn = createMockCachedPromise();
    vi.mocked(useCachedPromise).mockReturnValue(mockReturn as ReturnType<typeof useCachedPromise>);

    renderHook(() => useObject(TEST_IDS.space, TEST_IDS.object, BodyFormat.JSON));

    expect(useCachedPromise).toHaveBeenLastCalledWith(
      expect.any(Function),
      [TEST_IDS.space, TEST_IDS.object, BodyFormat.JSON],
      {
        keepPreviousData: true,
        execute: true,
      },
    );
  });

  it("should properly rename returned values", () => {
    const mockMutate = vi.fn();
    const mockData = createSpaceObject({ id: "test" });
    const mockError = new Error("test error");

    const mockReturn = createMockCachedPromise({
      data: mockData,
      error: mockError,
      isLoading: true,
      mutate: mockMutate,
    });

    vi.mocked(useCachedPromise).mockReturnValue(mockReturn as ReturnType<typeof useCachedPromise>);

    const { result } = renderHook(() => useObject(TEST_IDS.space, TEST_IDS.object, BodyFormat.Markdown));

    expect(result.current.object).toEqual(mockData);
    expect(result.current.objectError).toEqual(mockError);
    expect(result.current.isLoadingObject).toBe(true);
    expect(result.current.mutateObject).toBe(mockMutate);
  });
});
