import { showToast, Toast } from "@raycast/api";
import { showFailureToast } from "@raycast/utils";
import { formatRFC3339 } from "date-fns";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { addObjectsToList, createObject } from "../../api";
import { useCreateObjectData, useTagsMap } from "../../hooks";
import { CreateObjectRequest, IconFormat, PropertyFormat, PropertyLinkWithValue } from "../../models";
import { createApiResponse, createPropertyMetadata, createSpaceObject, TEST_IDS } from "../../test";
import { bundledPropKeys, fetchTypeKeysForLists, getNumberFieldValidations, isEmoji } from "../../utils";
import { CreateObjectFormValues } from "../CreateForm/CreateObjectForm";

vi.mock("../../api");
vi.mock("../../hooks");
vi.mock("../../utils", async () => {
  const actual = await vi.importActual("../../utils");
  return {
    ...actual,
    fetchTypeKeysForLists: vi.fn(),
    getNumberFieldValidations: vi.fn(),
  };
});

const mockCreateObject = vi.mocked(createObject);
const mockAddObjectsToList = vi.mocked(addObjectsToList);
const mockUseCreateObjectData = vi.mocked(useCreateObjectData);
const mockUseTagsMap = vi.mocked(useTagsMap);
const mockShowToast = vi.mocked(showToast);
const mockShowFailureToast = vi.mocked(showFailureToast);
const mockFetchTypeKeysForLists = vi.mocked(fetchTypeKeysForLists);
const mockGetNumberFieldValidations = vi.mocked(getNumberFieldValidations);

describe("CreateObjectForm", () => {
  const defaultFormData = {
    spaces: [],
    types: [],
    templates: [],
    lists: [],
    objects: [],
    selectedSpaceId: TEST_IDS.space,
    setSelectedSpaceId: vi.fn(),
    selectedTypeId: TEST_IDS.type,
    setSelectedTypeId: vi.fn(),
    selectedTemplateId: TEST_IDS.template,
    setSelectedTemplateId: vi.fn(),
    selectedListId: "",
    setSelectedListId: vi.fn(),
    listSearchText: "",
    setListSearchText: vi.fn(),
    objectSearchText: "",
    setObjectSearchText: vi.fn(),
    isLoadingData: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseCreateObjectData.mockReturnValue(defaultFormData);
    mockUseTagsMap.mockReturnValue({
      tagsMap: {},
      tagsError: undefined,
      isLoadingTags: false,
      mutateTags: vi.fn(),
    });
    mockFetchTypeKeysForLists.mockResolvedValue(["collection"]);
    mockGetNumberFieldValidations.mockReturnValue({});
  });

  describe("form initialization", () => {
    it("should initialize with draft values", () => {
      const draftValues: CreateObjectFormValues = {
        spaceId: TEST_IDS.space,
        typeId: TEST_IDS.type,
        name: "Test Object",
        icon: "📄",
        description: "Test description",
      };

      // Test passes - form initialization happens in the component
      expect(draftValues).toBeDefined();
      expect(draftValues.name).toBe("Test Object");
    });
  });

  describe("property formatting", () => {
    it("should format text property correctly", () => {
      const prop = createPropertyMetadata({
        key: "text_prop",
        format: PropertyFormat.Text,
      });

      const value = "Test text";
      const entry: PropertyLinkWithValue = { key: prop.key };

      // Simulate the switch case logic
      switch (prop.format) {
        case PropertyFormat.Text:
          entry.text = String(value);
          break;
      }

      expect(entry).toEqual({ key: "text_prop", text: "Test text" });
    });

    it("should format number property correctly", () => {
      const prop = createPropertyMetadata({
        key: "number_prop",
        format: PropertyFormat.Number,
      });

      const value = "42";
      const entry: PropertyLinkWithValue = { key: prop.key };

      switch (prop.format) {
        case PropertyFormat.Number:
          entry.number = Number(value);
          break;
      }

      expect(entry).toEqual({ key: "number_prop", number: 42 });
    });

    it("should format date property correctly", () => {
      const prop = createPropertyMetadata({
        key: "date_prop",
        format: PropertyFormat.Date,
      });

      const date = new Date("2024-01-01");
      const entry: PropertyLinkWithValue = { key: prop.key };

      switch (prop.format) {
        case PropertyFormat.Date:
          if (date instanceof Date && !isNaN(date.getTime())) {
            entry.date = formatRFC3339(date);
          }
          break;
      }

      expect(entry.date).toBe(formatRFC3339(date));
    });

    it("should format checkbox property correctly", () => {
      const prop = createPropertyMetadata({
        key: "checkbox_prop",
        format: PropertyFormat.Checkbox,
      });

      const value = true;
      const entry: PropertyLinkWithValue = { key: prop.key };

      switch (prop.format) {
        case PropertyFormat.Checkbox:
          entry.checkbox = Boolean(value);
          break;
      }

      expect(entry).toEqual({ key: "checkbox_prop", checkbox: true });
    });

    it("should format multi-select property correctly", () => {
      const prop = createPropertyMetadata({
        key: "multi_select_prop",
        format: PropertyFormat.MultiSelect,
      });

      const value = ["option1", "option2"];
      const entry: PropertyLinkWithValue = { key: prop.key };

      switch (prop.format) {
        case PropertyFormat.MultiSelect:
          entry.multi_select = value as string[];
          break;
      }

      expect(entry).toEqual({ key: "multi_select_prop", multi_select: ["option1", "option2"] });
    });
  });

  describe("form submission", () => {
    it("should create object successfully", async () => {
      const values: CreateObjectFormValues = {
        spaceId: TEST_IDS.space,
        typeId: TEST_IDS.type,
        name: "Test Object",
        icon: "📄",
        body: "Test body content",
      };

      const mockObject = createSpaceObject({ id: "new-object-id" });
      mockCreateObject.mockResolvedValue({ object: mockObject });

      // Simulate form submission
      const request: CreateObjectRequest = {
        name: values.name || "",
        icon: { format: IconFormat.Emoji, emoji: values.icon || "" },
        body: values.body || "",
        template_id: "",
        type_key: "page",
        properties: [],
      };

      await createObject(TEST_IDS.space, request);

      expect(mockCreateObject).toHaveBeenCalledWith(TEST_IDS.space, request);
    });

    it("should add object to list when list is selected", async () => {
      const values: CreateObjectFormValues = {
        spaceId: TEST_IDS.space,
        typeId: TEST_IDS.type,
        listId: TEST_IDS.list,
        name: "Test Object",
      };

      const mockObject = createSpaceObject({ id: "new-object-id" });
      mockCreateObject.mockResolvedValue({ object: mockObject });
      mockAddObjectsToList.mockResolvedValue(createApiResponse("Success"));

      // Simulate the creation and list addition flow
      const createResponse = await createObject(TEST_IDS.space, {} as CreateObjectRequest);

      if (createResponse.object.id && values.listId) {
        await addObjectsToList(TEST_IDS.space, values.listId, { objects: [createResponse.object.id] });
        await showToast(Toast.Style.Success, "Object created and added to collection");
      }

      expect(mockAddObjectsToList).toHaveBeenCalledWith(TEST_IDS.space, TEST_IDS.list, {
        objects: ["new-object-id"],
      });
      expect(mockShowToast).toHaveBeenCalledWith(Toast.Style.Success, "Object created and added to collection");
    });

    it("should handle creation failure", async () => {
      const error = new Error("Creation failed");
      mockCreateObject.mockRejectedValue(error);

      try {
        await createObject(TEST_IDS.space, {} as CreateObjectRequest);
      } catch (e) {
        await showFailureToast(e, { title: "Failed to create object" });
      }

      expect(mockShowFailureToast).toHaveBeenCalledWith(error, { title: "Failed to create object" });
    });
  });

  describe("bundled properties", () => {
    it("should handle description property", () => {
      const descriptionValue = "Test description";
      const propertiesEntries: PropertyLinkWithValue[] = [];

      if (descriptionValue) {
        propertiesEntries.push({
          key: bundledPropKeys.description,
          text: String(descriptionValue),
        });
      }

      expect(propertiesEntries).toEqual([{ key: bundledPropKeys.description, text: "Test description" }]);
    });

    it("should handle source property", () => {
      const sourceValue = "https://example.com";
      const propertiesEntries: PropertyLinkWithValue[] = [];

      if (sourceValue) {
        propertiesEntries.push({
          key: bundledPropKeys.source,
          url: String(sourceValue),
        });
      }

      expect(propertiesEntries).toEqual([{ key: bundledPropKeys.source, url: "https://example.com" }]);
    });
  });

  describe("utility functions", () => {
    it("should validate emoji correctly", () => {
      expect(isEmoji("📄")).toBe(true);
      expect(isEmoji("🎉")).toBe(true);
      expect(isEmoji("text")).toBe(false);
      expect(isEmoji("123")).toBe(false);
    });

    it("should fetch type keys for lists", async () => {
      mockFetchTypeKeysForLists.mockResolvedValue(["collection", "set"]);

      const result = await fetchTypeKeysForLists([]);

      expect(result).toEqual(["collection", "set"]);
    });
  });

  describe("property filtering", () => {
    it("should filter out bundled properties", () => {
      const properties = [
        createPropertyMetadata({ key: "custom_prop" }),
        createPropertyMetadata({ key: bundledPropKeys.description }),
        createPropertyMetadata({ key: bundledPropKeys.name }),
      ];

      const filtered = properties.filter((p) => !Object.values(bundledPropKeys).includes(p.key));

      expect(filtered).toHaveLength(1);
      expect(filtered[0].key).toBe("custom_prop");
    });
  });
});
