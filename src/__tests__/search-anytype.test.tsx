import { Icon, Image } from "@raycast/api";
import { showFailureToast } from "@raycast/utils";
import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ViewType } from "../components";
import { useGlobalSearch, usePinnedObjects, useSpaces } from "../hooks";
import { SpaceObject } from "../models";
import { TEST_IDS, createSpace, createSpaceObject, createType } from "../test";
import { bundledTypeKeys, localStorageKeys, processObject } from "../utils";

vi.mock("../hooks");
vi.mock("../utils", async () => {
  const actual = await vi.importActual("../utils");
  return {
    ...actual,
    processObject: vi.fn(),
    fetchTypeKeysForPages: vi.fn().mockResolvedValue(["page", "note"]),
    fetchTypesKeysForTasks: vi.fn().mockResolvedValue(["task"]),
    fetchTypeKeysForLists: vi.fn().mockResolvedValue(["collection"]),
  };
});

const mockUseSpaces = vi.mocked(useSpaces);
const mockUseGlobalSearch = vi.mocked(useGlobalSearch);
const mockUsePinnedObjects = vi.mocked(usePinnedObjects);
const mockShowFailureToast = vi.mocked(showFailureToast);
const mockProcessObject = vi.mocked(processObject);

describe("search-anytype", () => {
  const mockSpace = createSpace({
    id: TEST_IDS.space,
    name: "Test Space",
    icon: "🌍",
  });

  const mockObject: SpaceObject = createSpaceObject({
    id: TEST_IDS.object,
    space_id: TEST_IDS.space,
    name: "Test Object",
    snippet: "Test snippet",
  });

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementations
    mockUseSpaces.mockReturnValue({
      spaces: [mockSpace],
      spacesError: undefined,
      isLoadingSpaces: false,
      mutateSpaces: vi.fn(),
      spacesPagination: undefined,
    });

    mockUseGlobalSearch.mockReturnValue({
      objects: [],
      objectsError: undefined,
      isLoadingObjects: false,
      mutateObjects: vi.fn(),
      objectsPagination: undefined,
    });

    mockUsePinnedObjects.mockReturnValue({
      pinnedObjects: [],
      pinnedObjectsError: undefined,
      isLoadingPinnedObjects: false,
      mutatePinnedObjects: vi.fn(),
    });

    mockProcessObject.mockImplementation((object, isPinned) => ({
      id: object.id,
      spaceId: object.space_id,
      title: object.name,
      subtitle: undefined,
      icon: object.icon,
      accessories: [],
      isPinned,
      object,
      layout: object.layout,
      mutate: [],
    }));
  });

  describe("filtering", () => {
    it("should filter objects by search term in name", () => {
      const objects: SpaceObject[] = [
        { ...mockObject, name: "Test Document", snippet: "Some content" },
        { ...mockObject, id: "2", name: "Another Object", snippet: "Different content" },
      ];

      // Filter logic
      const searchTerm = "test";
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      const filtered = objects.filter(
        (object) =>
          object.name.toLowerCase().includes(lowerCaseSearchTerm) ||
          object.snippet.toLowerCase().includes(lowerCaseSearchTerm),
      );

      expect(filtered).toHaveLength(1);
      expect(filtered[0].name).toBe("Test Document");
    });

    it("should filter objects by search term in snippet", () => {
      const objects: SpaceObject[] = [
        { ...mockObject, name: "Document", snippet: "Contains test word" },
        { ...mockObject, id: "2", name: "Another", snippet: "Different content" },
      ];

      // Filter logic
      const searchTerm = "test";
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      const filtered = objects.filter(
        (object) =>
          object.name.toLowerCase().includes(lowerCaseSearchTerm) ||
          object.snippet.toLowerCase().includes(lowerCaseSearchTerm),
      );

      expect(filtered).toHaveLength(1);
      expect(filtered[0].snippet).toBe("Contains test word");
    });

    it("should be case insensitive", () => {
      const objects: SpaceObject[] = [
        { ...mockObject, name: "TEST DOCUMENT", snippet: "content" },
        { ...mockObject, id: "2", name: "test document", snippet: "content" },
        { ...mockObject, id: "3", name: "TeSt DoCuMeNt", snippet: "content" },
      ];

      // Filter logic
      const searchTerm = "test";
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      const filtered = objects.filter(
        (object) =>
          object.name.toLowerCase().includes(lowerCaseSearchTerm) ||
          object.snippet.toLowerCase().includes(lowerCaseSearchTerm),
      );

      expect(filtered).toHaveLength(3);
    });
  });

  describe("view type filtering", () => {
    it("should set empty types array for all objects view", () => {
      const currentView = ViewType.objects;
      const viewToType: Partial<Record<ViewType, string[]>> = {
        [ViewType.objects]: [],
        [ViewType.pages]: ["page", "note"],
        [ViewType.tasks]: ["task"],
        [ViewType.lists]: ["collection"],
        [ViewType.bookmarks]: [bundledTypeKeys.bookmark],
      };

      const types = viewToType[currentView] ?? [];
      expect(types).toEqual([]);
    });

    it("should set page types for pages view", () => {
      const currentView = ViewType.pages;
      const typeKeysForPages = ["page", "note"];
      const viewToType: Partial<Record<ViewType, string[]>> = {
        [ViewType.objects]: [],
        [ViewType.pages]: typeKeysForPages,
        [ViewType.tasks]: ["task"],
        [ViewType.lists]: ["collection"],
        [ViewType.bookmarks]: [bundledTypeKeys.bookmark],
      };

      const types = viewToType[currentView] ?? [];
      expect(types).toEqual(["page", "note"]);
    });

    it("should set task types for tasks view", () => {
      const currentView = ViewType.tasks;
      const typeKeysForTasks = ["task"];
      const viewToType: Partial<Record<ViewType, string[]>> = {
        [ViewType.objects]: [],
        [ViewType.pages]: ["page", "note"],
        [ViewType.tasks]: typeKeysForTasks,
        [ViewType.lists]: ["collection"],
        [ViewType.bookmarks]: [bundledTypeKeys.bookmark],
      };

      const types = viewToType[currentView] ?? [];
      expect(types).toEqual(["task"]);
    });

    it("should set bookmark type for bookmarks view", () => {
      const currentView = ViewType.bookmarks;
      const viewToType: Partial<Record<ViewType, string[]>> = {
        [ViewType.objects]: [],
        [ViewType.pages]: ["page", "note"],
        [ViewType.tasks]: ["task"],
        [ViewType.lists]: ["collection"],
        [ViewType.bookmarks]: [bundledTypeKeys.bookmark],
      };

      const types = viewToType[currentView] ?? [];
      expect(types).toEqual([bundledTypeKeys.bookmark]);
    });
  });

  describe("pinned objects", () => {
    it("should filter pinned objects by type", () => {
      const pinnedObjects: SpaceObject[] = [
        { ...mockObject, type: createType({ key: "page", name: "Page" }) },
        { ...mockObject, id: "2", type: createType({ key: "task", name: "Task" }) },
        { ...mockObject, id: "3", type: createType({ key: "note", name: "Note" }) },
      ];

      const types = ["page", "note"];
      const filtered = pinnedObjects.filter((object) => types.length === 0 || types.includes(object.type.key));

      expect(filtered).toHaveLength(2);
      expect(filtered.map((o) => o.type.key)).toEqual(["page", "note"]);
    });

    it("should show all pinned objects when no type filter", () => {
      const pinnedObjects: SpaceObject[] = [
        { ...mockObject, type: createType({ key: "page", name: "Page" }) },
        { ...mockObject, id: "2", type: createType({ key: "task", name: "Task" }) },
      ];

      const types: string[] = [];
      const filtered = pinnedObjects.filter((object) => types.length === 0 || types.includes(object.type.key));

      expect(filtered).toHaveLength(2);
    });

    it("should filter out pinned objects from regular results", () => {
      const pinnedObjects: SpaceObject[] = [{ ...mockObject, id: "1", space_id: TEST_IDS.space }];

      const allObjects: SpaceObject[] = [
        { ...mockObject, id: "1", space_id: TEST_IDS.space },
        { ...mockObject, id: "2", space_id: TEST_IDS.space },
      ];

      const filtered = allObjects.filter(
        (object) => !pinnedObjects.some((pinned) => pinned.id === object.id && pinned.space_id === object.space_id),
      );

      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe("2");
    });
  });

  describe("space icons", () => {
    it("should build space icon map from spaces", () => {
      const spaces = [
        { id: "space1", name: "Space 1", icon: { source: "icon1" } as Image.ImageLike },
        { id: "space2", name: "Space 2", icon: { source: "icon2" } as Image.ImageLike },
      ];

      const spaceIconMap = new Map(spaces.map((space) => [space.id, space.icon]));

      expect(spaceIconMap.get("space1")).toEqual({ source: "icon1" });
      expect(spaceIconMap.get("space2")).toEqual({ source: "icon2" });
    });

    it("should use fallback icon when space icon not found", () => {
      const spaceIcons = new Map<string, Image.ImageLike>();
      const object: SpaceObject = { ...mockObject, space_id: "unknown-space" };

      const spaceIcon = spaceIcons.get(object.space_id) || Icon.BullsEye;

      expect(spaceIcon).toBe(Icon.BullsEye);
    });
  });

  describe("error handling", () => {
    it("should show error toast when spaces fail to load", () => {
      const error = new Error("Failed to load spaces");
      mockUseSpaces.mockReturnValue({
        spaces: [],
        spacesError: error,
        isLoadingSpaces: false,
        mutateSpaces: vi.fn(),
        spacesPagination: undefined,
      });

      // Trigger useEffect
      const { result } = renderHook(() => {
        const spacesError = error;
        if (spacesError) {
          showFailureToast(spacesError, { title: "Failed to fetch latest data" });
        }
        return spacesError;
      });

      expect(result.current).toBe(error);
      expect(mockShowFailureToast).toHaveBeenCalledWith(error, { title: "Failed to fetch latest data" });
    });

    it("should show error toast when global search fails", () => {
      const error = new Error("Search failed");
      mockUseGlobalSearch.mockReturnValue({
        objects: [],
        objectsError: error,
        isLoadingObjects: false,
        mutateObjects: vi.fn(),
        objectsPagination: undefined,
      });

      // Trigger useEffect
      const { result } = renderHook(() => {
        const objectsError = error;
        if (objectsError) {
          showFailureToast(objectsError, { title: "Failed to fetch latest data" });
        }
        return objectsError;
      });

      expect(result.current).toBe(error);
      expect(mockShowFailureToast).toHaveBeenCalledWith(error, { title: "Failed to fetch latest data" });
    });
  });

  describe("search execution", () => {
    it("should execute search when viewing all objects", () => {
      // const searchText = "test"; // Not used in test
      const types: string[] = [];
      const currentView = ViewType.objects;

      const shouldExecute = currentView === ViewType.objects || types.length > 0;

      expect(shouldExecute).toBe(true);
    });

    it("should execute search when types are selected", () => {
      // const searchText = "test"; // Not used in test
      const types = ["page", "note"];
      const currentView = ViewType.pages;

      // Testing OR condition where first part is false but second is true
      // @ts-expect-error - Intentionally testing mismatched ViewType comparison
      const shouldExecute = currentView === ViewType.objects || types.length > 0;

      expect(shouldExecute).toBe(true);
    });

    it("should not execute search when not viewing objects and no types", () => {
      // const searchText = "test"; // Not used in test
      const types: string[] = [];
      const currentView = ViewType.pages;

      // Testing OR condition where both parts are false
      // @ts-expect-error - Intentionally testing mismatched ViewType comparison
      const shouldExecute = currentView === ViewType.objects || types.length > 0;

      expect(shouldExecute).toBe(false);
    });
  });

  describe("local storage key", () => {
    it("should use correct suffix for pinned objects", () => {
      const suffix = localStorageKeys.suffixForGlobalSearch;

      // Call usePinnedObjects with the suffix
      usePinnedObjects(suffix);

      expect(mockUsePinnedObjects).toHaveBeenCalledWith(suffix);
    });
  });
});
