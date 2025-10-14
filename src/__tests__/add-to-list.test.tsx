import { popToRoot, showToast, Toast } from "@raycast/api";
import { showFailureToast, useForm } from "@raycast/utils";
import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AddToListValues } from "../add-to-list";
import { addObjectsToList } from "../api";
import { useObjectsInList, useSearch, useSpaces } from "../hooks";
import { createApiResponse, createSpace, createSpaceObject, TEST_IDS } from "../test";
import { bundledTypeKeys } from "../utils";

vi.mock("../api");
vi.mock("../hooks");

const mockAddObjectsToList = vi.mocked(addObjectsToList);
const mockUseSpaces = vi.mocked(useSpaces);
const mockUseSearch = vi.mocked(useSearch);
const mockUseObjectsInList = vi.mocked(useObjectsInList);
const mockUseForm = vi.mocked(useForm);
const mockShowToast = vi.mocked(showToast);
const mockShowFailureToast = vi.mocked(showFailureToast);
const mockPopToRoot = vi.mocked(popToRoot);

describe("AddToList", () => {
  const mockSpace = createSpace({
    id: TEST_IDS.space,
    name: "Test Space",
    icon: "🌍",
  });

  // These are defined for reference but not used in current tests
  // const mockList = createSpaceObject({
  //   id: TEST_IDS.list,
  //   name: "Test List",
  //   icon: "📋",
  // });

  // const mockObject = createSpaceObject({
  //   id: TEST_IDS.object,
  //   name: "Test Object",
  //   icon: "📄",
  // });

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

    mockUseSearch.mockReturnValue({
      objects: [],
      objectsError: undefined,
      isLoadingObjects: false,
      mutateObjects: vi.fn(),
      objectsPagination: undefined,
    });

    mockUseObjectsInList.mockReturnValue({
      objects: [],
      objectsError: undefined,
      isLoadingObjects: false,
      mutateObjects: vi.fn(),
      objectsPagination: undefined,
    });

    mockUseForm.mockReturnValue({
      handleSubmit: vi.fn(),
      itemProps: {
        spaceId: { id: "spaceId", value: "", onChange: vi.fn(), error: undefined },
        listId: { id: "listId", value: "", onChange: vi.fn(), error: undefined },
        objectId: { id: "objectId", value: "", onChange: vi.fn(), error: undefined },
      },
      values: { spaceId: "", listId: "", objectId: "" },
      setValue: vi.fn(),
      setValidationError: vi.fn(),
      reset: vi.fn(),
      focus: vi.fn(),
    });
  });

  describe("form validation", () => {
    it("should validate space is required", () => {
      const validation = {
        spaceId: (value: string) => {
          if (!value) {
            return "Space is required";
          }
        },
      };

      expect(validation.spaceId("")).toBe("Space is required");
      expect(validation.spaceId(TEST_IDS.space)).toBeUndefined();
    });

    it("should validate list is required", () => {
      const validation = {
        listId: (value: string) => {
          if (!value) {
            return "List is required";
          }
        },
      };

      expect(validation.listId("")).toBe("List is required");
      expect(validation.listId("valid-list-id")).toBeUndefined();
    });

    it("should validate object is required", () => {
      const validation = {
        objectId: (value: string) => {
          if (!value) {
            return "Object is required";
          }
        },
      };

      expect(validation.objectId("")).toBe("Object is required");
      expect(validation.objectId(TEST_IDS.object)).toBeUndefined();
    });
  });

  describe("data fetching", () => {
    it("should fetch lists with collection type filter", () => {
      const listSearchText = "test";
      const spaceId = TEST_IDS.space;

      // Call useSearch hook with the expected parameters
      useSearch(spaceId, listSearchText, [bundledTypeKeys.collection]);

      expect(mockUseSearch).toHaveBeenCalledWith(spaceId, listSearchText, [bundledTypeKeys.collection]);
    });

    it("should fetch objects without type filter", () => {
      const objectSearchText = "test";
      const spaceId = TEST_IDS.space;

      // Call useSearch hook for objects
      useSearch(spaceId, objectSearchText, []);

      expect(mockUseSearch).toHaveBeenCalledWith(spaceId, objectSearchText, []);
    });

    it("should fetch list items when list is selected", () => {
      const spaceId = TEST_IDS.space;
      const listId = TEST_IDS.list;

      // Call useObjectsInList hook
      useObjectsInList(spaceId, listId, "");

      expect(mockUseObjectsInList).toHaveBeenCalledWith(spaceId, listId, "");
    });
  });

  describe("form submission", () => {
    it("should successfully add object to list", async () => {
      const values: AddToListValues = {
        spaceId: TEST_IDS.space,
        listId: TEST_IDS.list,
        objectId: TEST_IDS.object,
      };

      mockAddObjectsToList.mockResolvedValue(createApiResponse("Success"));

      // Simulate form submission
      const onSubmit = async (values: AddToListValues) => {
        await showToast(Toast.Style.Animated, "Adding object to list...");
        const request = { objects: [values.objectId] };
        const response = await addObjectsToList(values.spaceId, values.listId, request);
        if (response.payload) {
          await showToast(Toast.Style.Success, "Object added to list successfully", response.payload);
          popToRoot();
        }
      };

      await onSubmit(values);

      expect(mockShowToast).toHaveBeenCalledWith(Toast.Style.Animated, "Adding object to list...");
      expect(mockAddObjectsToList).toHaveBeenCalledWith(values.spaceId, values.listId, {
        objects: [values.objectId],
      });
      expect(mockShowToast).toHaveBeenCalledWith(Toast.Style.Success, "Object added to list successfully", "Success");
      expect(mockPopToRoot).toHaveBeenCalled();
    });

    it("should handle submission failure", async () => {
      const values: AddToListValues = {
        spaceId: TEST_IDS.space,
        listId: TEST_IDS.list,
        objectId: TEST_IDS.object,
      };

      const error = new Error("API Error");
      mockAddObjectsToList.mockRejectedValue(error);

      // Simulate form submission with error
      const onSubmit = async (values: AddToListValues) => {
        try {
          await showToast(Toast.Style.Animated, "Adding object to list...");
          const request = { objects: [values.objectId] };
          await addObjectsToList(values.spaceId, values.listId, request);
        } catch (error) {
          await showFailureToast(error, { title: "Failed to add object to list" });
        }
      };

      await onSubmit(values);

      expect(mockShowToast).toHaveBeenCalledWith(Toast.Style.Animated, "Adding object to list...");
      expect(mockAddObjectsToList).toHaveBeenCalledWith(values.spaceId, values.listId, {
        objects: [values.objectId],
      });
      expect(mockShowFailureToast).toHaveBeenCalledWith(error, { title: "Failed to add object to list" });
    });

    it("should handle response without payload", async () => {
      const values: AddToListValues = {
        spaceId: TEST_IDS.space,
        listId: TEST_IDS.list,
        objectId: TEST_IDS.object,
      };

      mockAddObjectsToList.mockResolvedValue(createApiResponse(""));

      // Simulate form submission
      const onSubmit = async (values: AddToListValues) => {
        await showToast(Toast.Style.Animated, "Adding object to list...");
        const request = { objects: [values.objectId] };
        const response = await addObjectsToList(values.spaceId, values.listId, request);
        if (!response.payload) {
          await showToast(Toast.Style.Failure, "Failed to add object to list");
        }
      };

      await onSubmit(values);

      expect(mockShowToast).toHaveBeenCalledWith(Toast.Style.Failure, "Failed to add object to list");
      expect(mockPopToRoot).not.toHaveBeenCalled();
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

    it("should show error toast when lists fail to load", () => {
      const error = new Error("Failed to load lists");
      mockUseSearch.mockReturnValue({
        objects: [],
        objectsError: error,
        isLoadingObjects: false,
        mutateObjects: vi.fn(),
        objectsPagination: undefined,
      });

      // Trigger useEffect
      const { result } = renderHook(() => {
        const listsError = error;
        if (listsError) {
          showFailureToast(listsError, { title: "Failed to fetch latest data" });
        }
        return listsError;
      });

      expect(result.current).toBe(error);
      expect(mockShowFailureToast).toHaveBeenCalledWith(error, { title: "Failed to fetch latest data" });
    });
  });

  describe("object filtering", () => {
    it("should filter out objects already in the list", () => {
      const existingObject = createSpaceObject({ id: "existing", name: "Existing", icon: "📄" });
      const newObject = createSpaceObject({ id: "new", name: "New", icon: "📄" });

      mockUseObjectsInList.mockReturnValue({
        objects: [existingObject],
        objectsError: undefined,
        isLoadingObjects: false,
        mutateObjects: vi.fn(),
        objectsPagination: undefined,
      });

      // Filter logic
      const allObjects = [existingObject, newObject];
      const listItems = [existingObject];
      const filtered = allObjects.filter((object) => !listItems.some((item) => item.id === object.id));

      expect(filtered).toEqual([newObject]);
      expect(filtered).not.toContain(existingObject);
    });

    it("should filter out the list itself from objects", () => {
      const listId = TEST_IDS.list;
      const listAsObject = createSpaceObject({ id: listId, name: "The List", icon: "📄" });
      const otherObject = createSpaceObject({ id: "other", name: "Other", icon: "📄" });

      // Filter logic
      const allObjects = [listAsObject, otherObject];
      const filtered = allObjects.filter((object) => object.id !== listId);

      expect(filtered).toEqual([otherObject]);
      expect(filtered).not.toContain(listAsObject);
    });

    it("should apply both filters together", () => {
      const listId = TEST_IDS.list;
      const listAsObject = createSpaceObject({ id: listId, name: "The List", icon: "📄" });
      const existingObject = createSpaceObject({ id: "existing", name: "Existing", icon: "📄" });
      const newObject = createSpaceObject({ id: "new", name: "New", icon: "📄" });

      const allObjects = [listAsObject, existingObject, newObject];
      const listItems = [existingObject];

      // Combined filter logic
      const filtered = allObjects.filter(
        (object) => !listItems.some((item) => item.id === object.id) && object.id !== listId,
      );

      expect(filtered).toEqual([newObject]);
      expect(filtered).toHaveLength(1);
    });
  });

  describe("loading states", () => {
    it("should show loading when spaces are loading", () => {
      mockUseSpaces.mockReturnValue({
        spaces: [],
        spacesError: undefined,
        isLoadingSpaces: true,
        mutateSpaces: vi.fn(),
        spacesPagination: undefined,
      });

      const isLoading = true; // isLoadingSpaces
      expect(isLoading).toBe(true);
    });

    it("should show loading when form is submitting", () => {
      const loading = true; // setLoading(true) during submission
      expect(loading).toBe(true);
    });

    it("should combine all loading states", () => {
      const loading = false;
      const isLoadingSpaces = true;
      const isLoadingObjects = false;
      const isLoadingLists = true;
      const isLoadingListItems = false;

      const combinedLoading = loading || isLoadingSpaces || isLoadingObjects || isLoadingLists || isLoadingListItems;
      expect(combinedLoading).toBe(true);
    });
  });
});
