import { beforeEach, describe, expect, it, vi } from "vitest";
import { IconFormat, MemberRole, MemberStatus, ObjectLayout, RawMember } from "../../models";
import { createObjectIcon, createRawMember } from "../../test";
import { getIconWithFallback, getNameWithFallback } from "../../utils";
import { mapMember, mapMembers } from "../members";

vi.mock("../../utils/icon", () => ({
  getIconWithFallback: vi.fn(),
}));
vi.mock("../../utils/object", () => ({
  getNameWithFallback: vi.fn(),
}));

const mockGetIconWithFallback = vi.mocked(getIconWithFallback);
const mockGetNameWithFallback = vi.mocked(getNameWithFallback);

describe("members mapper", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("mapMember", () => {
    it("should map raw member with icon and name", async () => {
      const rawMember: RawMember = createRawMember({
        id: "member1",
        name: "John Doe",
        icon: createObjectIcon({ format: IconFormat.Emoji, emoji: "👤" }),
        status: MemberStatus.Active,
        role: MemberRole.Editor,
      });

      mockGetIconWithFallback.mockResolvedValue("👤");
      mockGetNameWithFallback.mockReturnValue("John Doe");

      const result = await mapMember(rawMember);

      expect(mockGetIconWithFallback).toHaveBeenCalledWith(rawMember.icon, ObjectLayout.Participant);
      expect(mockGetNameWithFallback).toHaveBeenCalledWith("John Doe");

      expect(result).toEqual({
        ...rawMember,
        name: "John Doe",
        icon: "👤",
      });
    });

    it("should handle member without name", async () => {
      const rawMember: RawMember = createRawMember({
        id: "member2",
        name: "",
        icon: null,
        status: MemberStatus.Active,
        role: MemberRole.Viewer,
      });

      mockGetIconWithFallback.mockResolvedValue("👤"); // Default icon
      mockGetNameWithFallback.mockReturnValue("Untitled");

      const result = await mapMember(rawMember);

      expect(mockGetNameWithFallback).toHaveBeenCalledWith("");
      expect(result.name).toBe("Untitled");
    });

    it("should handle member without icon", async () => {
      const rawMember: RawMember = createRawMember({
        id: "member3",
        name: "Jane Smith",
        icon: null,
        status: MemberStatus.Active,
        role: MemberRole.Owner,
      });

      mockGetIconWithFallback.mockResolvedValue("👤"); // Fallback icon
      mockGetNameWithFallback.mockReturnValue("Jane Smith");

      const result = await mapMember(rawMember);

      expect(mockGetIconWithFallback).toHaveBeenCalledWith(null, ObjectLayout.Participant);
      expect(result.icon).toBe("👤");
    });

    it("should preserve all member properties", async () => {
      const rawMember: RawMember = createRawMember({
        id: "member4",
        name: "Admin User",
        icon: createObjectIcon({ format: IconFormat.Emoji, emoji: "🔧" }),
        status: MemberStatus.Active,
        role: MemberRole.Owner,
      });

      mockGetIconWithFallback.mockResolvedValue("🔧");
      mockGetNameWithFallback.mockReturnValue("Admin User");

      const result = await mapMember(rawMember);

      expect(result).toMatchObject({
        id: "member4",
        status: MemberStatus.Active,
        role: MemberRole.Owner,
      });
    });
  });

  describe("mapMembers", () => {
    it("should map multiple members", async () => {
      const rawMembers: RawMember[] = [
        createRawMember({
          id: "member1",
          name: "User 1",
          icon: createObjectIcon({ format: IconFormat.Emoji, emoji: "😀" }),
          status: MemberStatus.Active,
          role: MemberRole.Viewer,
        }),
        createRawMember({
          id: "member2",
          name: "User 2",
          icon: createObjectIcon({ format: IconFormat.Emoji, emoji: "😎" }),
          status: MemberStatus.Active,
          role: MemberRole.Editor,
        }),
      ];

      mockGetIconWithFallback.mockResolvedValueOnce("😀").mockResolvedValueOnce("😎");
      mockGetNameWithFallback.mockReturnValueOnce("User 1").mockReturnValueOnce("User 2");

      const result = await mapMembers(rawMembers);

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe("User 1");
      expect(result[0].icon).toBe("😀");
      expect(result[1].name).toBe("User 2");
      expect(result[1].icon).toBe("😎");
    });

    it("should handle empty array", async () => {
      const result = await mapMembers([]);
      expect(result).toEqual([]);
    });

    it("should handle mixed member states", async () => {
      const rawMembers: RawMember[] = [
        createRawMember({
          id: "member1",
          name: "Active User",
          icon: createObjectIcon({ format: IconFormat.Emoji, emoji: "✅" }),
          status: MemberStatus.Active,
          role: MemberRole.Editor,
        }),
        createRawMember({
          id: "member2",
          name: "",
          icon: null,
          status: MemberStatus.Removed,
          role: MemberRole.Viewer,
        }),
        createRawMember({
          id: "member3",
          name: "Pending User",
          icon: createObjectIcon({ format: IconFormat.Emoji, emoji: "⏳" }),
          status: MemberStatus.Joining,
          role: MemberRole.Viewer,
        }),
      ];

      mockGetIconWithFallback.mockResolvedValueOnce("✅").mockResolvedValueOnce("👤").mockResolvedValueOnce("⏳");
      mockGetNameWithFallback
        .mockReturnValueOnce("Active User")
        .mockReturnValueOnce("Untitled")
        .mockReturnValueOnce("Pending User");

      const result = await mapMembers(rawMembers);

      expect(result).toHaveLength(3);
      expect(result[0].status).toBe(MemberStatus.Active);
      expect(result[1].name).toBe("Untitled");
      expect(result[2].status).toBe(MemberStatus.Joining);

      // Verify all were processed with correct layout
      expect(mockGetIconWithFallback).toHaveBeenCalledTimes(3);
      expect(mockGetIconWithFallback).toHaveBeenCalledWith(expect.anything(), ObjectLayout.Participant);
    });

    it("should handle errors in mapping", async () => {
      const rawMembers: RawMember[] = [
        createRawMember({
          id: "member1",
          name: "User",
          icon: null,
          status: MemberStatus.Active,
          role: MemberRole.Viewer,
        }),
      ];

      const error = new Error("Icon fetch failed");
      mockGetIconWithFallback.mockRejectedValue(error);

      await expect(mapMembers(rawMembers)).rejects.toThrow("Icon fetch failed");
    });
  });
});
