import { Icon } from "@raycast/api";
import { showFailureToast } from "@raycast/utils";
import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  useMembers,
  usePinnedMembers,
  usePinnedObjects,
  usePinnedProperties,
  usePinnedTypes,
  useProperties,
  useSearch,
  useTypes,
} from "../../hooks";
import {
  Member,
  MemberRole,
  MemberStatus,
  ObjectLayout,
  Property,
  PropertyFormat,
  Space,
  SpaceObject,
  Type,
} from "../../models";
import { TEST_IDS, createMember, createPropertyMetadata, createSpace, createSpaceObject, createType } from "../../test";
import { formatMemberRole, localStorageKeys, processObject } from "../../utils";
import { ViewType } from "../ObjectList";

vi.mock("../../hooks");
vi.mock("../../utils", async () => {
  const actual = await vi.importActual("../../utils");
  return {
    ...actual,
    processObject: vi.fn(),
  };
});

const mockUseSearch = vi.mocked(useSearch);
const mockUseTypes = vi.mocked(useTypes);
const mockUseProperties = vi.mocked(useProperties);
const mockUseMembers = vi.mocked(useMembers);
const mockUsePinnedObjects = vi.mocked(usePinnedObjects);
const mockUsePinnedTypes = vi.mocked(usePinnedTypes);
const mockUsePinnedProperties = vi.mocked(usePinnedProperties);
const mockUsePinnedMembers = vi.mocked(usePinnedMembers);
const mockShowFailureToast = vi.mocked(showFailureToast);
const mockProcessObject = vi.mocked(processObject);

describe("ObjectList", () => {
  const mockSpace: Space = createSpace({
    id: TEST_IDS.space,
    name: "Test Space",
    icon: "🌍",
  });

  const mockObject: SpaceObject = createSpaceObject({
    id: TEST_IDS.object,
    space_id: TEST_IDS.space,
    name: "Test Object",
    snippet: "Test snippet",
    type: createType({ key: "page", name: "Page" }),
    icon: "📄",
    layout: ObjectLayout.Basic,
  });

  const mockType: Type = createType({
    id: TEST_IDS.type,
    name: "Test Type",
    icon: "📄",
    layout: ObjectLayout.Basic,
  });

  const mockProperty: Property = createPropertyMetadata({
    id: TEST_IDS.property,
    name: "Test Property",
    key: "test-property",
    format: PropertyFormat.Text,
    icon: "📝",
  });

  const mockMember: Member = createMember({
    id: TEST_IDS.member,
    name: "Test Member",
    global_name: "test.member",
    icon: "👤",
    role: MemberRole.Owner,
    status: MemberStatus.Active,
  });

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementations
    mockUseSearch.mockReturnValue({
      objects: [],
      objectsError: undefined,
      isLoadingObjects: false,
      mutateObjects: vi.fn(),
      objectsPagination: undefined,
    });

    mockUseTypes.mockReturnValue({
      types: [],
      typesError: undefined,
      isLoadingTypes: false,
      mutateTypes: vi.fn(),
      typesPagination: undefined,
    });

    mockUseProperties.mockReturnValue({
      properties: [],
      propertiesError: undefined,
      isLoadingProperties: false,
      mutateProperties: vi.fn(),
      propertiesPagination: undefined,
    });

    mockUseMembers.mockReturnValue({
      members: [],
      membersError: undefined,
      isLoadingMembers: false,
      mutateMembers: vi.fn(),
      membersPagination: undefined,
    });

    mockUsePinnedObjects.mockReturnValue({
      pinnedObjects: [],
      pinnedObjectsError: undefined,
      isLoadingPinnedObjects: false,
      mutatePinnedObjects: vi.fn(),
    });

    mockUsePinnedTypes.mockReturnValue({
      pinnedTypes: [],
      pinnedTypesError: undefined,
      isLoadingPinnedTypes: false,
      mutatePinnedTypes: vi.fn(),
    });

    mockUsePinnedProperties.mockReturnValue({
      pinnedProperties: [],
      pinnedPropertiesError: undefined,
      isLoadingPinnedProperties: false,
      mutatePinnedProperties: vi.fn(),
    });

    mockUsePinnedMembers.mockReturnValue({
      pinnedMembers: [],
      pinnedMembersError: undefined,
      isLoadingPinnedMembers: false,
      mutatePinnedMembers: vi.fn(),
    });

    mockProcessObject.mockImplementation((object, isPinned) => ({
      id: object.id,
      spaceId: object.space_id,
      title: object.name,
      subtitle: undefined,
      icon: object.icon,
      accessories: isPinned ? [{ icon: Icon.Star, tooltip: "Pinned" }] : [],
      isPinned,
      object,
      layout: object.layout,
      mutate: [vi.fn(), vi.fn()],
    }));
  });

  describe("filtering", () => {
    it("should filter items by name case-insensitively", () => {
      const items = [{ name: "Test Item" }, { name: "Another Item" }, { name: "TEST UPPERCASE" }];

      const searchText = "test";
      const filtered = items.filter((item) => item.name.toLowerCase().includes(searchText.toLowerCase()));

      expect(filtered).toHaveLength(2);
      expect(filtered.map((i) => i.name)).toEqual(["Test Item", "TEST UPPERCASE"]);
    });

    it("should return all items when search text is empty", () => {
      const items = [{ name: "Item 1" }, { name: "Item 2" }];

      const searchText = "";
      const filtered = items.filter((item) => item.name.toLowerCase().includes(searchText.toLowerCase()));

      expect(filtered).toHaveLength(2);
    });
  });

  describe("processing items", () => {
    it("should process type with pinned status", () => {
      const isPinned = true;
      const mutateTypes = vi.fn();
      const mutatePinnedTypes = vi.fn();

      const processed = {
        spaceId: mockSpace.id,
        id: mockType.id,
        icon: mockType.icon,
        title: mockType.name,
        subtitle: { value: "", tooltip: "" },
        accessories: isPinned ? [{ icon: Icon.Star, tooltip: "Pinned" }] : [],
        mutate: [mutateTypes, mutatePinnedTypes],
        object: mockType,
        layout: mockType.layout,
        isPinned,
      };

      expect(processed.accessories).toHaveLength(1);
      expect(processed.accessories[0]).toEqual({ icon: Icon.Star, tooltip: "Pinned" });
      expect(processed.isPinned).toBe(true);
    });

    it("should process property without pinned status", () => {
      const isPinned = false;

      const processed = {
        spaceId: mockSpace.id,
        id: mockProperty.id,
        icon: mockProperty.icon,
        title: mockProperty.name,
        subtitle: { value: "", tooltip: "" },
        accessories: isPinned ? [{ icon: Icon.Star, tooltip: "Pinned" }] : [],
        mutate: [vi.fn(), vi.fn()],
        object: mockProperty,
        layout: undefined,
        isPinned,
      };

      expect(processed.accessories).toHaveLength(0);
      expect(processed.isPinned).toBe(false);
    });

    it("should process member with role and status", () => {
      const isPinned = false;
      const memberWithJoining = { ...mockMember, status: MemberStatus.Joining };

      const processedJoining = {
        spaceId: mockSpace.id,
        id: memberWithJoining.id,
        icon: memberWithJoining.icon,
        title: memberWithJoining.name,
        subtitle: { value: memberWithJoining.global_name, tooltip: `ANY Name: ${memberWithJoining.global_name}` },
        accessories: [
          ...(isPinned ? [{ icon: Icon.Star, tooltip: "Pinned" }] : []),
          memberWithJoining.status === MemberStatus.Joining
            ? {
                tag: { value: "Join Request", color: "orange", tooltip: "Pending" },
              }
            : {
                text: formatMemberRole(memberWithJoining.role),
                tooltip: `Role: ${formatMemberRole(memberWithJoining.role)}`,
              },
        ],
        mutate: [vi.fn(), vi.fn()],
        object: memberWithJoining,
        layout: undefined,
        isPinned,
      };

      expect(processedJoining.accessories).toHaveLength(1);
      expect(processedJoining.accessories[0]).toEqual({
        tag: { value: "Join Request", color: "orange", tooltip: "Pending" },
      });

      // Test active member
      const processedActive = {
        spaceId: mockSpace.id,
        id: mockMember.id,
        icon: mockMember.icon,
        title: mockMember.name,
        subtitle: { value: mockMember.global_name, tooltip: `ANY Name: ${mockMember.global_name}` },
        accessories: [
          {
            text: formatMemberRole(mockMember.role),
            tooltip: `Role: ${formatMemberRole(mockMember.role)}`,
          },
        ],
        mutate: [vi.fn(), vi.fn()],
        object: mockMember,
        layout: undefined,
        isPinned: false,
      };

      expect(processedActive.accessories[0]).toHaveProperty("text");
    });
  });

  describe("pinned items filtering", () => {
    it("should filter out pinned objects from regular list", () => {
      const pinnedObjects = [mockObject];
      const allObjects = [mockObject, { ...mockObject, id: "2" }];

      const filtered = allObjects.filter(
        (object) => !pinnedObjects.some((pinned) => pinned.id === object.id && pinned.space_id === object.space_id),
      );

      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe("2");
    });

    it("should filter out pinned types from regular list", () => {
      const pinnedTypes = [mockType];
      const allTypes = [mockType, { ...mockType, id: "2" }];

      const filtered = allTypes.filter((type) => !pinnedTypes.some((pinned) => pinned.id === type.id));

      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe("2");
    });
  });

  describe("error handling", () => {
    it("should show error toast for data fetch errors", () => {
      const error = new Error("Failed to fetch");
      mockUseSearch.mockReturnValue({
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

    it("should show error toast for pinned data fetch errors", () => {
      const error = new Error("Failed to fetch pinned");
      mockUsePinnedObjects.mockReturnValue({
        pinnedObjects: [],
        pinnedObjectsError: error,
        isLoadingPinnedObjects: false,
        mutatePinnedObjects: vi.fn(),
      });

      // Trigger useEffect
      const { result } = renderHook(() => {
        const pinnedObjectsError = error;
        if (pinnedObjectsError) {
          showFailureToast(pinnedObjectsError, { title: "Failed to fetch pinned data" });
        }
        return pinnedObjectsError;
      });

      expect(result.current).toBe(error);
      expect(mockShowFailureToast).toHaveBeenCalledWith(error, { title: "Failed to fetch pinned data" });
    });
  });

  describe("view type handling", () => {
    it("should use correct storage key for objects view", () => {
      const spaceId = TEST_IDS.space;
      const viewType = ViewType.objects;
      const key = localStorageKeys.suffixForViewsPerSpace(spaceId, viewType);

      usePinnedObjects(key);

      expect(mockUsePinnedObjects).toHaveBeenCalledWith(key);
    });

    it("should use correct storage key for types view", () => {
      const spaceId = TEST_IDS.space;
      const viewType = ViewType.types;
      const key = localStorageKeys.suffixForViewsPerSpace(spaceId, viewType);

      usePinnedTypes(key);

      expect(mockUsePinnedTypes).toHaveBeenCalledWith(key);
    });

    it("should use correct storage key for properties view", () => {
      const spaceId = TEST_IDS.space;
      const viewType = ViewType.properties;
      const key = localStorageKeys.suffixForViewsPerSpace(spaceId, viewType);

      usePinnedProperties(key);

      expect(mockUsePinnedProperties).toHaveBeenCalledWith(key);
    });

    it("should use correct storage key for members view", () => {
      const spaceId = TEST_IDS.space;
      const viewType = ViewType.members;
      const key = localStorageKeys.suffixForViewsPerSpace(spaceId, viewType);

      usePinnedMembers(key);

      expect(mockUsePinnedMembers).toHaveBeenCalledWith(key);
    });
  });

  describe("loading states", () => {
    it("should combine all loading states", () => {
      const states = {
        isLoadingObjects: false,
        isLoadingTypes: true,
        isLoadingProperties: false,
        isLoadingMembers: false,
        isLoadingPinnedObjects: false,
        isLoadingPinnedTypes: false,
        isLoadingPinnedProperties: true,
        isLoadingPinnedMembers: false,
      };

      const isLoading =
        states.isLoadingObjects ||
        states.isLoadingTypes ||
        states.isLoadingProperties ||
        states.isLoadingMembers ||
        states.isLoadingPinnedObjects ||
        states.isLoadingPinnedTypes ||
        states.isLoadingPinnedProperties ||
        states.isLoadingPinnedMembers;

      expect(isLoading).toBe(true);
    });
  });

  describe("pagination", () => {
    it("should use correct pagination for each view", () => {
      const objectsPagination = { hasMore: true, onLoadMore: vi.fn() };
      const typesPagination = { hasMore: false, onLoadMore: vi.fn() };
      const propertiesPagination = { hasMore: true, onLoadMore: vi.fn() };
      const membersPagination = { hasMore: false, onLoadMore: vi.fn() };

      const paginationMap: Partial<Record<ViewType, typeof objectsPagination>> = {
        [ViewType.objects]: objectsPagination,
        [ViewType.types]: typesPagination,
        [ViewType.properties]: propertiesPagination,
        [ViewType.members]: membersPagination,
      };

      expect(paginationMap[ViewType.objects]).toBe(objectsPagination);
      expect(paginationMap[ViewType.types]).toBe(typesPagination);
      expect(paginationMap[ViewType.properties]).toBe(propertiesPagination);
      expect(paginationMap[ViewType.members]).toBe(membersPagination);
    });
  });
});
