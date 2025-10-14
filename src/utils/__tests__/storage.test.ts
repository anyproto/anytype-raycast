import { LocalStorage, showToast } from "@raycast/api";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPinnedObjects, expectFailureToast, expectSuccessToast } from "../../test";
import { localStorageKeys, maxPinnedObjects } from "../constant";
import { addPinned, getPinned, moveDownInPinned, moveUpInPinned, removePinned, setPinned } from "../storage";

// Mock Raycast API
vi.mock("@raycast/api", () => ({
  LocalStorage: {
    getItem: vi.fn(),
    setItem: vi.fn(),
  },
  showToast: vi.fn(),
  Toast: {
    Style: {
      Success: "SUCCESS",
      Failure: "FAILURE",
    },
  },
  getPreferenceValues: vi.fn().mockReturnValue({ apiUrl: "http://127.0.0.1:9090" }),
}));

describe("storage utils", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getPinned", () => {
    it("should return parsed pinned objects when they exist", async () => {
      const mockPinnedObjects = createPinnedObjects(2);
      vi.mocked(LocalStorage.getItem).mockResolvedValue(JSON.stringify(mockPinnedObjects));

      const result = await getPinned("test");

      expect(LocalStorage.getItem).toHaveBeenCalledWith(localStorageKeys.pinnedObjectsWith("test"));
      expect(result).toEqual(mockPinnedObjects);
    });

    it("should return empty array when no pinned objects exist", async () => {
      vi.mocked(LocalStorage.getItem).mockResolvedValue(undefined);

      const result = await getPinned("test");

      expect(result).toEqual([]);
    });
  });

  describe("setPinned", () => {
    it("should save pinned objects to local storage", async () => {
      const pinnedObjects = createPinnedObjects(2);

      await setPinned("test", pinnedObjects);

      expect(LocalStorage.setItem).toHaveBeenCalledWith(
        localStorageKeys.pinnedObjectsWith("test"),
        JSON.stringify(pinnedObjects),
      );
    });
  });

  describe("addPinned", () => {
    it("should add a new pinned object successfully", async () => {
      const existingPinned = [{ spaceId: "space1", objectId: "obj1" }];
      vi.mocked(LocalStorage.getItem).mockResolvedValue(JSON.stringify(existingPinned));

      await addPinned("space2", "obj2", "test", "Test Object", "Object");

      expect(LocalStorage.setItem).toHaveBeenCalledWith(
        localStorageKeys.pinnedObjectsWith("test"),
        JSON.stringify([...existingPinned, { spaceId: "space2", objectId: "obj2" }]),
      );
      expectSuccessToast("Object pinned", "Test Object");
    });

    it("should show error when object is already pinned", async () => {
      const existingPinned = [{ spaceId: "space1", objectId: "obj1" }];
      vi.mocked(LocalStorage.getItem).mockResolvedValue(JSON.stringify(existingPinned));

      await addPinned("space1", "obj1", "test", "Test Object", "Object");

      expect(LocalStorage.setItem).not.toHaveBeenCalled();
      expectFailureToast("Object is already pinned");
    });

    it("should show error when max pinned objects reached", async () => {
      const existingPinned = createPinnedObjects(maxPinnedObjects);
      vi.mocked(LocalStorage.getItem).mockResolvedValue(JSON.stringify(existingPinned));

      await addPinned("spaceNew", "objNew", "test", "Test Object", "Object");

      expect(LocalStorage.setItem).not.toHaveBeenCalled();
      expectFailureToast(`Can't pin more than ${maxPinnedObjects} items`);
    });
  });

  describe("removePinned", () => {
    it("should remove pinned object successfully", async () => {
      const existingPinned = createPinnedObjects(2);
      vi.mocked(LocalStorage.getItem).mockResolvedValue(JSON.stringify(existingPinned));

      await removePinned("space0", "obj0", "test", "Test Object", "Object");

      expect(LocalStorage.setItem).toHaveBeenCalledWith(
        localStorageKeys.pinnedObjectsWith("test"),
        JSON.stringify([{ spaceId: "space1", objectId: "obj1" }]),
      );
      expectSuccessToast("Object unpinned", "Test Object");
    });

    it("should show error when object is not pinned", async () => {
      const existingPinned = [{ spaceId: "space1", objectId: "obj1" }];
      vi.mocked(LocalStorage.getItem).mockResolvedValue(JSON.stringify(existingPinned));

      await removePinned("space2", "obj2", "test", "Test Object", "Object");

      expect(LocalStorage.setItem).not.toHaveBeenCalled();
      expectFailureToast("Object is not pinned");
    });

    it("should remove without toast when title and contextLabel not provided", async () => {
      const existingPinned = createPinnedObjects(2);
      vi.mocked(LocalStorage.getItem).mockResolvedValue(JSON.stringify(existingPinned));

      await removePinned("space0", "obj0", "test");

      expect(LocalStorage.setItem).toHaveBeenCalled();
      expect(showToast).not.toHaveBeenCalled();
    });
  });

  describe("moveUpInPinned", () => {
    it("should move item up in the list", async () => {
      const existingPinned = createPinnedObjects(3);
      vi.mocked(LocalStorage.getItem).mockResolvedValue(JSON.stringify(existingPinned));

      await moveUpInPinned("space1", "obj1", "test");

      expect(LocalStorage.setItem).toHaveBeenCalledWith(
        localStorageKeys.pinnedObjectsWith("test"),
        JSON.stringify([
          { spaceId: "space1", objectId: "obj1" },
          { spaceId: "space0", objectId: "obj0" },
          { spaceId: "space2", objectId: "obj2" },
        ]),
      );
    });

    it("should not move first item up", async () => {
      const existingPinned = createPinnedObjects(2);
      vi.mocked(LocalStorage.getItem).mockResolvedValue(JSON.stringify(existingPinned));

      await moveUpInPinned("space0", "obj0", "test");

      expect(LocalStorage.setItem).not.toHaveBeenCalled();
    });

    it("should not move non-existent item", async () => {
      const existingPinned = [{ spaceId: "space1", objectId: "obj1" }];
      vi.mocked(LocalStorage.getItem).mockResolvedValue(JSON.stringify(existingPinned));

      await moveUpInPinned("space2", "obj2", "test");

      expect(LocalStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe("moveDownInPinned", () => {
    it("should move item down in the list", async () => {
      const existingPinned = createPinnedObjects(3);
      vi.mocked(LocalStorage.getItem).mockResolvedValue(JSON.stringify(existingPinned));

      await moveDownInPinned("space1", "obj1", "test");

      expect(LocalStorage.setItem).toHaveBeenCalledWith(
        localStorageKeys.pinnedObjectsWith("test"),
        JSON.stringify([
          { spaceId: "space0", objectId: "obj0" },
          { spaceId: "space2", objectId: "obj2" },
          { spaceId: "space1", objectId: "obj1" },
        ]),
      );
    });

    it("should not move last item down", async () => {
      const existingPinned = createPinnedObjects(2);
      vi.mocked(LocalStorage.getItem).mockResolvedValue(JSON.stringify(existingPinned));

      await moveDownInPinned("space1", "obj1", "test");

      expect(LocalStorage.setItem).not.toHaveBeenCalled();
    });

    it("should not move non-existent item", async () => {
      const existingPinned = [{ spaceId: "space1", objectId: "obj1" }];
      vi.mocked(LocalStorage.getItem).mockResolvedValue(JSON.stringify(existingPinned));

      await moveDownInPinned("space2", "obj2", "test");

      expect(LocalStorage.setItem).not.toHaveBeenCalled();
    });
  });
});
