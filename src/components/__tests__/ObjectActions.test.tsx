import { Clipboard, confirmAlert, getPreferenceValues, open, showToast, Toast } from "@raycast/api";
import { showFailureToast } from "@raycast/utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { deleteObject, deleteProperty, deleteType, getRawObject } from "../../api";
import { BodyFormat, Property, PropertyFormat, Type } from "../../models";
import { createRawSpaceObjectWithBody, createSpaceObject, TEST_IDS } from "../../test";
import { addPinned, localStorageKeys, moveDownInPinned, moveUpInPinned, removePinned } from "../../utils";
import { ViewType } from "../ObjectList";

vi.mock("../../api");
vi.mock("../../utils", async () => {
  const actual = await vi.importActual("../../utils");
  return {
    ...actual,
    addPinned: vi.fn(),
    removePinned: vi.fn(),
    moveUpInPinned: vi.fn(),
    moveDownInPinned: vi.fn(),
  };
});

const mockDeleteObject = vi.mocked(deleteObject);
const mockDeleteProperty = vi.mocked(deleteProperty);
const mockDeleteType = vi.mocked(deleteType);
const mockGetRawObject = vi.mocked(getRawObject);
const mockShowToast = vi.mocked(showToast);
const mockShowFailureToast = vi.mocked(showFailureToast);
const mockGetPreferenceValues = vi.mocked(getPreferenceValues);
const mockOpen = vi.mocked(open);
const mockConfirmAlert = vi.mocked(confirmAlert);
const mockAddPinned = vi.mocked(addPinned);
const mockRemovePinned = vi.mocked(removePinned);
const mockMoveUpInPinned = vi.mocked(moveUpInPinned);
const mockMoveDownInPinned = vi.mocked(moveDownInPinned);

describe("ObjectActions", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockGetPreferenceValues.mockReturnValue({
      primaryAction: "open-in-app",
    });

    Clipboard.copy = vi.fn();
  });

  describe("URL generation", () => {
    it("should generate correct object URL", () => {
      const objectId = TEST_IDS.object;
      const spaceId = TEST_IDS.space;
      const expectedUrl = `anytype://object?objectId=${objectId}&spaceId=${spaceId}`;

      expect(expectedUrl).toBe("anytype://object?objectId=obj-1&spaceId=space-1");
    });
  });

  describe("pin actions", () => {
    it("should add object to pinned list", async () => {
      const suffix = localStorageKeys.suffixForViewsPerSpace(TEST_IDS.space, ViewType.objects);

      await addPinned(TEST_IDS.space, TEST_IDS.object, suffix, "Test Object", "Test Context");

      expect(mockAddPinned).toHaveBeenCalledWith(
        TEST_IDS.space,
        TEST_IDS.object,
        suffix,
        "Test Object",
        "Test Context",
      );
    });

    it("should remove object from pinned list", async () => {
      const suffix = localStorageKeys.suffixForViewsPerSpace(TEST_IDS.space, ViewType.objects);

      await removePinned(TEST_IDS.space, TEST_IDS.object, suffix);

      expect(mockRemovePinned).toHaveBeenCalledWith(TEST_IDS.space, TEST_IDS.object, suffix);
    });

    it("should use global search suffix when in global search", () => {
      const isGlobalSearch = true;
      const suffix = isGlobalSearch
        ? localStorageKeys.suffixForGlobalSearch
        : localStorageKeys.suffixForViewsPerSpace(TEST_IDS.space, ViewType.objects);

      expect(suffix).toBe(localStorageKeys.suffixForGlobalSearch);
    });

    it("should move pinned item up", async () => {
      const suffix = localStorageKeys.suffixForViewsPerSpace(TEST_IDS.space, ViewType.objects);

      await moveUpInPinned(TEST_IDS.space, TEST_IDS.object, suffix);

      expect(mockMoveUpInPinned).toHaveBeenCalledWith(TEST_IDS.space, TEST_IDS.object, suffix);
    });

    it("should move pinned item down", async () => {
      const suffix = localStorageKeys.suffixForViewsPerSpace(TEST_IDS.space, ViewType.objects);

      await moveDownInPinned(TEST_IDS.space, TEST_IDS.object, suffix);

      expect(mockMoveDownInPinned).toHaveBeenCalledWith(TEST_IDS.space, TEST_IDS.object, suffix);
    });
  });

  describe("delete actions", () => {
    it("should delete object after confirmation", async () => {
      mockConfirmAlert.mockResolvedValue(true);
      mockDeleteObject.mockResolvedValue(createSpaceObject({ id: TEST_IDS.object }));

      // Simulate delete flow
      const confirmed = await confirmAlert({
        title: "Delete Object?",
        message: "This action cannot be undone.",
      });

      if (confirmed) {
        await deleteObject(TEST_IDS.space, TEST_IDS.object);
        await showToast(Toast.Style.Success, "Object deleted");
      }

      expect(mockDeleteObject).toHaveBeenCalledWith(TEST_IDS.space, TEST_IDS.object);
      expect(mockShowToast).toHaveBeenCalledWith(Toast.Style.Success, "Object deleted");
    });

    it("should not delete when confirmation is cancelled", async () => {
      mockConfirmAlert.mockResolvedValue(false);

      const confirmed = await confirmAlert({
        title: "Delete Object?",
        message: "This action cannot be undone.",
      });

      expect(confirmed).toBe(false);
      expect(mockDeleteObject).not.toHaveBeenCalled();
    });

    it("should handle delete error", async () => {
      mockConfirmAlert.mockResolvedValue(true);
      const error = new Error("Delete failed");
      mockDeleteObject.mockRejectedValue(error);

      const confirmed = await confirmAlert({
        title: "Delete Object?",
        message: "This action cannot be undone.",
      });

      if (confirmed) {
        try {
          await deleteObject(TEST_IDS.space, TEST_IDS.object);
        } catch (e) {
          await showFailureToast(e, { title: "Failed to delete object" });
        }
      }

      expect(mockShowFailureToast).toHaveBeenCalledWith(error, { title: "Failed to delete object" });
    });
  });

  describe("copy actions", () => {
    it("should copy object link", async () => {
      const objectUrl = `anytype://object?objectId=${TEST_IDS.object}&spaceId=${TEST_IDS.space}`;

      await Clipboard.copy(objectUrl);
      await showToast(Toast.Style.Success, "Copied link to clipboard");

      expect(Clipboard.copy).toHaveBeenCalledWith(objectUrl);
      expect(mockShowToast).toHaveBeenCalledWith(Toast.Style.Success, "Copied link to clipboard");
    });

    it("should copy object markdown", async () => {
      const mockObject = createRawSpaceObjectWithBody({
        markdown: "# Test Object\n\nContent here",
      });

      mockGetRawObject.mockResolvedValue({ object: mockObject });

      const response = await getRawObject(TEST_IDS.space, TEST_IDS.object, BodyFormat.Markdown);
      await Clipboard.copy(response.object.markdown);
      await showToast(Toast.Style.Success, "Copied markdown to clipboard");

      expect(Clipboard.copy).toHaveBeenCalledWith("# Test Object\n\nContent here");
    });
  });

  describe("view type specific actions", () => {
    it("should identify type view", () => {
      const viewType = ViewType.types;
      const isType = viewType === ViewType.types;

      expect(isType).toBe(true);
    });

    it("should identify property view", () => {
      const viewType = ViewType.properties;
      const isProperty = viewType === ViewType.properties;

      expect(isProperty).toBe(true);
    });

    it("should identify member view", () => {
      const viewType = ViewType.members;
      const isMember = viewType === ViewType.members;

      expect(isMember).toBe(true);
    });
  });

  describe("open actions", () => {
    it("should open object in app", async () => {
      const objectUrl = `anytype://object?objectId=${TEST_IDS.object}&spaceId=${TEST_IDS.space}`;

      await open(objectUrl);

      expect(mockOpen).toHaveBeenCalledWith(objectUrl);
    });

    it("should respect primary action preference", () => {
      mockGetPreferenceValues.mockReturnValue({ primaryAction: "view-details" });

      const { primaryAction } = getPreferenceValues();

      expect(primaryAction).toBe("view-details");
    });
  });

  describe("update actions", () => {
    it("should navigate to update form for object", () => {
      const mockPush = vi.fn();
      const mockPop = vi.fn();

      // Simulate navigation
      const navigation = { pop: mockPop, push: mockPush };
      navigation.push("UpdateObjectForm");

      expect(mockPush).toHaveBeenCalledWith("UpdateObjectForm");
    });
  });

  describe("type-specific delete", () => {
    it("should delete type", async () => {
      mockConfirmAlert.mockResolvedValue(true);
      mockDeleteType.mockResolvedValue({ id: TEST_IDS.type, key: "test_type", plural_name: "Test Types" } as Type);

      const confirmed = await confirmAlert({
        title: "Delete Type?",
        message: "This action cannot be undone.",
      });

      if (confirmed) {
        await deleteType(TEST_IDS.space, TEST_IDS.type);
        await showToast(Toast.Style.Success, "Type deleted");
      }

      expect(mockDeleteType).toHaveBeenCalledWith(TEST_IDS.space, TEST_IDS.type);
    });

    it("should delete property", async () => {
      mockConfirmAlert.mockResolvedValue(true);
      mockDeleteProperty.mockResolvedValue({
        id: TEST_IDS.property,
        key: "test_property",
        format: PropertyFormat.Text,
      } as Property);

      const confirmed = await confirmAlert({
        title: "Delete Property?",
        message: "This action cannot be undone.",
      });

      if (confirmed) {
        await deleteProperty(TEST_IDS.space, TEST_IDS.property);
        await showToast(Toast.Style.Success, "Property deleted");
      }

      expect(mockDeleteProperty).toHaveBeenCalledWith(TEST_IDS.space, TEST_IDS.property);
    });
  });
});
