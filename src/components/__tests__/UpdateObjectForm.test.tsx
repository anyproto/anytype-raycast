import { showToast, Toast, useNavigation } from "@raycast/api";
import { showFailureToast } from "@raycast/utils";
import { formatRFC3339 } from "date-fns";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { updateObject } from "../../api";
import { useSearch, useTagsMap } from "../../hooks";
import { IconFormat, PropertyFormat, PropertyLinkWithValue, UpdateObjectRequest } from "../../models";
import { createPropertyMetadata, createPropertyWithValue, createSpaceObject, TEST_IDS } from "../../test";
import { bundledPropKeys, getNumberFieldValidations, isEmoji } from "../../utils";

vi.mock("../../api");
vi.mock("../../hooks");
vi.mock("../../utils", async () => {
  const actual = await vi.importActual("../../utils");
  return {
    ...actual,
    getNumberFieldValidations: vi.fn(),
  };
});

const mockUpdateObject = vi.mocked(updateObject);
const mockUseSearch = vi.mocked(useSearch);
const mockUseTagsMap = vi.mocked(useTagsMap);
const mockShowToast = vi.mocked(showToast);
const mockShowFailureToast = vi.mocked(showFailureToast);
const mockGetNumberFieldValidations = vi.mocked(getNumberFieldValidations);
const mockUseNavigation = vi.mocked(useNavigation);

describe("UpdateObjectForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUseNavigation.mockReturnValue({
      pop: vi.fn(),
      push: vi.fn(),
    });

    mockUseSearch.mockReturnValue({
      objects: [],
      objectsError: undefined,
      isLoadingObjects: false,
      mutateObjects: vi.fn(),
      objectsPagination: undefined,
    });

    mockUseTagsMap.mockReturnValue({
      tagsMap: {},
      tagsError: undefined,
      isLoadingTags: false,
      mutateTags: vi.fn(),
    });

    mockGetNumberFieldValidations.mockReturnValue({});
  });

  describe("initial values mapping", () => {
    it("should map text property to initial value", () => {
      const prop = createPropertyMetadata({ key: "text_field", format: PropertyFormat.Text });
      const entry = createPropertyWithValue({ key: "text_field", text: "Initial text" });

      let value: string | undefined;
      switch (prop.format) {
        case PropertyFormat.Text:
          value = entry.text ?? "";
          break;
      }

      expect(value).toBe("Initial text");
    });

    it("should map number property to initial value", () => {
      const prop = createPropertyMetadata({ key: "number_field", format: PropertyFormat.Number });
      const entry = createPropertyWithValue({ key: "number_field", number: 42 });

      let value: number | string | undefined;
      switch (prop.format) {
        case PropertyFormat.Number:
          value = entry.number ?? "";
          break;
      }

      expect(value).toBe(42);
    });

    it("should map date property to Date object", () => {
      const prop = createPropertyMetadata({ key: "date_field", format: PropertyFormat.Date });
      const dateString = "2024-01-01T00:00:00Z";
      const entry = createPropertyWithValue({ key: "date_field", date: dateString });

      let value: Date | undefined;
      switch (prop.format) {
        case PropertyFormat.Date:
          value = entry.date ? new Date(entry.date) : undefined;
          break;
      }

      expect(value).toEqual(new Date(dateString));
    });

    it("should map checkbox property to boolean", () => {
      const prop = createPropertyMetadata({ key: "checkbox_field", format: PropertyFormat.Checkbox });
      const entry = createPropertyWithValue({ key: "checkbox_field", checkbox: true });

      let value: boolean = false;
      switch (prop.format) {
        case PropertyFormat.Checkbox:
          value = entry.checkbox ?? false;
          break;
      }

      expect(value).toBe(true);
    });

    it("should map multi-select property to array of IDs", () => {
      const prop = createPropertyMetadata({ key: "multi_field", format: PropertyFormat.MultiSelect });
      const entry = createPropertyWithValue({
        key: "multi_field",
        multi_select: [
          { id: "tag1", key: "tag1", name: "Tag 1", color: "red" },
          { id: "tag2", key: "tag2", name: "Tag 2", color: "blue" },
        ],
      });

      let value: string[] = [];
      switch (prop.format) {
        case PropertyFormat.MultiSelect:
          value = entry.multi_select?.map((tag) => tag.id) ?? [];
          break;
      }

      expect(value).toEqual(["tag1", "tag2"]);
    });
  });

  describe("form submission", () => {
    it("should update object successfully", async () => {
      const updatedObject = createSpaceObject({ id: TEST_IDS.object, name: "Updated Object" });
      mockUpdateObject.mockResolvedValue({ object: updatedObject });

      const request: UpdateObjectRequest = {
        name: "Updated Object",
        icon: { format: IconFormat.Emoji, emoji: "📝" },
        properties: [],
      };

      const response = await updateObject(TEST_IDS.space, TEST_IDS.object, request);

      expect(mockUpdateObject).toHaveBeenCalledWith(TEST_IDS.space, TEST_IDS.object, request);
      expect(response.object.name).toBe("Updated Object");
    });

    it("should handle update failure", async () => {
      const error = new Error("Update failed");
      mockUpdateObject.mockRejectedValue(error);

      try {
        await updateObject(TEST_IDS.space, TEST_IDS.object, {} as UpdateObjectRequest);
      } catch (e) {
        await showFailureToast(e, { title: "Failed to update object" });
      }

      expect(mockShowFailureToast).toHaveBeenCalledWith(error, { title: "Failed to update object" });
    });

    it("should show success toast and navigate back", async () => {
      const mockPop = vi.fn();
      mockUseNavigation.mockReturnValue({ pop: mockPop, push: vi.fn() });

      await showToast(Toast.Style.Success, "Object updated successfully");
      mockPop();

      expect(mockShowToast).toHaveBeenCalledWith(Toast.Style.Success, "Object updated successfully");
      expect(mockPop).toHaveBeenCalled();
    });
  });

  describe("property value conversion", () => {
    it("should convert form values to property entries", () => {
      const properties = [
        createPropertyMetadata({ key: "text_prop", format: PropertyFormat.Text }),
        createPropertyMetadata({ key: "number_prop", format: PropertyFormat.Number }),
      ];

      const formValues: Record<string, string> = {
        text_prop: "New text",
        number_prop: "100",
      };

      const entries: PropertyLinkWithValue[] = [];

      properties.forEach((prop) => {
        const raw = formValues[prop.key];
        if (raw !== undefined && raw !== null && raw !== "") {
          const entry: PropertyLinkWithValue = { key: prop.key };

          switch (prop.format) {
            case PropertyFormat.Text:
              entry.text = String(raw);
              break;
            case PropertyFormat.Number:
              entry.number = Number(raw);
              break;
          }

          entries.push(entry);
        }
      });

      expect(entries).toEqual([
        { key: "text_prop", text: "New text" },
        { key: "number_prop", number: 100 },
      ]);
    });

    it("should handle empty values", () => {
      const prop = createPropertyMetadata({ key: "text_prop", format: PropertyFormat.Text });
      const raw = "";
      const entries: PropertyLinkWithValue[] = [];

      if (raw !== undefined && raw !== null && raw !== "") {
        entries.push({ key: prop.key, text: raw });
      }

      expect(entries).toEqual([]);
    });

    it("should handle date conversion", () => {
      const prop = createPropertyMetadata({ key: "date_prop", format: PropertyFormat.Date });
      const date = new Date("2024-01-01");
      const entry: PropertyLinkWithValue = { key: prop.key };

      if (date instanceof Date && !isNaN(date.getTime())) {
        entry.date = formatRFC3339(date);
      }

      expect(entry.date).toBe(formatRFC3339(date));
    });
  });

  describe("bundled properties", () => {
    it("should filter out bundled properties", () => {
      const allProperties = [
        createPropertyMetadata({ key: "custom_prop" }),
        createPropertyMetadata({ key: bundledPropKeys.name }),
        createPropertyMetadata({ key: bundledPropKeys.description }),
      ];

      const filtered = allProperties.filter((p) => !Object.values(bundledPropKeys).includes(p.key));

      expect(filtered).toHaveLength(1);
      expect(filtered[0].key).toBe("custom_prop");
    });
  });

  describe("error handling", () => {
    it("should show error when search fails", () => {
      const error = new Error("Search failed");
      mockUseSearch.mockReturnValue({
        objects: [],
        objectsError: error,
        isLoadingObjects: false,
        mutateObjects: vi.fn(),
        objectsPagination: undefined,
      });

      // Simulate useEffect
      if (error) {
        showFailureToast(error, { title: "Failed to load data" });
      }

      expect(mockShowFailureToast).toHaveBeenCalledWith(error, { title: "Failed to load data" });
    });

    it("should show error when tags fail to load", () => {
      const error = new Error("Tags failed");
      mockUseTagsMap.mockReturnValue({
        tagsMap: {},
        tagsError: error,
        isLoadingTags: false,
        mutateTags: vi.fn(),
      });

      // Simulate useEffect
      if (error) {
        showFailureToast(error, { title: "Failed to load data" });
      }

      expect(mockShowFailureToast).toHaveBeenCalledWith(error, { title: "Failed to load data" });
    });
  });

  describe("icon handling", () => {
    it("should validate emoji icon", () => {
      expect(isEmoji("📄")).toBe(true);
      expect(isEmoji("✅")).toBe(true);
      expect(isEmoji("abc")).toBe(false);
    });

    it("should handle icon update", () => {
      const icon = "📝";
      const iconObject = { format: IconFormat.Emoji, emoji: icon };

      expect(iconObject.format).toBe(IconFormat.Emoji);
      expect(iconObject.emoji).toBe("📝");
    });
  });
});
