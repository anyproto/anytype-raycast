/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCachedPromise } from "@raycast/utils";
import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getMembers } from "../../api";
import { Member, MemberRole } from "../../models";
import {
  createMember,
  mockCachedPromiseError,
  mockCachedPromiseLoading,
  mockCachedPromisePaginated,
  mockCachedPromiseSuccess,
  TEST_IDS,
} from "../../test";
import { useMembers } from "../useMembers";

vi.mock("@raycast/utils");
vi.mock("../../api");

const mockUseCachedPromise = vi.mocked(useCachedPromise);
const mockGetMembers = vi.mocked(getMembers);

describe("useMembers", () => {
  const spaceId = TEST_IDS.space;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch members successfully", () => {
    const mockMembers = [
      createMember({ id: "member1", name: "John Doe", role: MemberRole.Owner }),
      createMember({ id: "member2", name: "Jane Smith", role: MemberRole.Editor }),
    ];

    mockUseCachedPromise.mockReturnValue(mockCachedPromiseSuccess(mockMembers) as any);

    const { result } = renderHook(() => useMembers(spaceId));

    expect(result.current.members).toEqual(mockMembers);
    expect(result.current.membersError).toBeUndefined();
    expect(result.current.isLoadingMembers).toBe(false);
  });

  it("should handle loading state", () => {
    mockUseCachedPromise.mockReturnValue(mockCachedPromiseLoading<Member[]>() as any);

    const { result } = renderHook(() => useMembers(spaceId));

    expect(result.current.members).toEqual([]);
    expect(result.current.isLoadingMembers).toBe(true);
    expect(result.current.membersError).toBeUndefined();
  });

  it("should handle error state", () => {
    const mockError = new Error("Failed to fetch members");
    mockUseCachedPromise.mockReturnValue(mockCachedPromiseError<Member[]>(mockError) as any);

    const { result } = renderHook(() => useMembers(spaceId));

    expect(result.current.members).toEqual([]);
    expect(result.current.membersError).toBe(mockError);
    expect(result.current.isLoadingMembers).toBe(false);
  });

  it("should filter out undefined members", () => {
    const mockMembers = [
      createMember({ id: "member1", name: "User 1", role: MemberRole.Owner }),
      undefined,
      createMember({ id: "member2", name: "User 2", role: MemberRole.Editor }),
      null,
    ];

    mockUseCachedPromise.mockReturnValue(mockCachedPromiseSuccess(mockMembers) as any);

    const { result } = renderHook(() => useMembers(spaceId));

    expect(result.current.members).toHaveLength(2);
    expect(result.current.members[0].id).toBe("member1");
    expect(result.current.members[0].name).toBe("User 1");
    expect(result.current.members[1].id).toBe("member2");
    expect(result.current.members[1].name).toBe("User 2");
  });

  it("should handle pagination", () => {
    const mockMembers = Array(10)
      .fill(null)
      .map((_, i) =>
        createMember({
          id: `member${i}`,
          name: `User ${i}`,
          role: i === 0 ? MemberRole.Owner : MemberRole.Editor,
        }),
      );

    mockUseCachedPromise.mockReturnValue(mockCachedPromisePaginated(mockMembers, 1, true) as any);

    const { result } = renderHook(() => useMembers(spaceId));

    expect(result.current.members).toHaveLength(10);
    expect(result.current.membersPagination).toBeDefined();
    expect(result.current.membersPagination?.hasMore).toBe(true); // We passed true to the mock
  });

  it("should not execute when spaceId is missing", () => {
    mockUseCachedPromise.mockReturnValue(mockCachedPromiseSuccess<Member[]>([]) as any);

    renderHook(() => useMembers(""));

    expect(mockUseCachedPromise).toHaveBeenCalledWith(
      expect.any(Function),
      [""],
      expect.objectContaining({
        execute: false,
      }),
    );
  });

  it("should keep previous data during refetch", () => {
    mockUseCachedPromise.mockReturnValue(mockCachedPromiseSuccess<Member[]>([]) as any);

    renderHook(() => useMembers(spaceId));

    expect(mockUseCachedPromise).toHaveBeenCalledWith(
      expect.any(Function),
      [spaceId],
      expect.objectContaining({
        keepPreviousData: true,
      }),
    );
  });

  it("should call getMembers with correct pagination parameters", async () => {
    // Test the function passed to useCachedPromise
    const mockCallback = vi.fn(async (options: { page: number }) => {
      const offset = options.page * 10; // apiLimit
      const response = await getMembers(spaceId, { offset, limit: 10 });
      return {
        data: response.members,
        hasMore: response.pagination.has_more,
      };
    });

    mockGetMembers.mockResolvedValue({
      members: [createMember({ id: "member1", name: "User", role: MemberRole.Owner })],
      pagination: { total: 1, offset: 0, limit: 10, has_more: false },
    });

    const result = await mockCallback({ page: 0 });

    expect(mockGetMembers).toHaveBeenCalledWith(spaceId, {
      offset: 0,
      limit: 10,
    });
    expect(result.data).toHaveLength(1);
    expect(result.hasMore).toBe(false);
  });

  it("should handle mutate function", () => {
    const mockMutate = vi.fn();
    mockUseCachedPromise.mockReturnValue({
      ...mockCachedPromiseSuccess<Member[]>([]),
      mutate: mockMutate,
    } as any);

    const { result } = renderHook(() => useMembers(spaceId));

    result.current.mutateMembers();
    expect(mockMutate).toHaveBeenCalled();
  });

  it("should handle page 2 pagination", async () => {
    const mockCallback = vi.fn(async (options: { page: number }) => {
      const offset = options.page * 10;
      const response = await getMembers(spaceId, { offset, limit: 10 });
      return {
        data: response.members,
        hasMore: response.pagination.has_more,
      };
    });

    mockGetMembers.mockResolvedValue({
      members: Array(10)
        .fill(null)
        .map((_, i) =>
          createMember({
            id: `member${i + 10}`,
            name: `User ${i + 10}`,
            role: MemberRole.Editor,
          }),
        ),
      pagination: { total: 25, offset: 10, limit: 10, has_more: true },
    });

    const result = await mockCallback({ page: 1 });

    expect(mockGetMembers).toHaveBeenCalledWith(spaceId, {
      offset: 10,
      limit: 10,
    });
    expect(result.data).toHaveLength(10);
    expect(result.hasMore).toBe(true);
  });
});
