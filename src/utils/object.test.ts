import { getPreferenceValues, Icon } from "@raycast/api";
import { MutatePromise } from "@raycast/utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Member, ObjectLayout, Property, PropertyFormat, SortProperty, SpaceObject, Tag, Type } from "../models";
import { getDateLabel, getShortDateLabel, propKeys } from "../utils";
import { processObject } from "./object";

// Mock dependencies
vi.mock("@raycast/api", () => ({
  getPreferenceValues: vi.fn(),
  Icon: {
    Star: "star-icon",
    Tag: "tag-icon",
  },
}));

vi.mock("../utils", () => ({
  getDateLabel: vi.fn(),
  getShortDateLabel: vi.fn(),
  propKeys: {
    tag: "tag",
  },
}));

describe("processObject", () => {
  const mockMutate = vi.fn() as unknown as MutatePromise<SpaceObject[] | Type[] | Property[] | Member[]>;
  const mockMutatePinned = vi.fn() as unknown as MutatePromise<SpaceObject[] | Type[] | Property[] | Member[]>;

  const mockType: Type = {
    object: "type",
    id: "type1",
    key: "document",
    name: "Document",
    plural_name: "Documents",
    icon: "doc-icon",
    layout: ObjectLayout.Basic,
    archived: false,
    properties: [],
  };

  const mockObject: SpaceObject = {
    object: "object",
    id: "obj1",
    name: "Test Object",
    icon: "object-icon",
    space_id: "space1",
    layout: ObjectLayout.Basic,
    snippet: "Test snippet",
    archived: false,
    type: mockType,
    properties: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getPreferenceValues).mockReturnValue({ sort: SortProperty.LastModifiedDate });
    vi.mocked(getDateLabel).mockReturnValue("Last Modified Date");
    vi.mocked(getShortDateLabel).mockReturnValue("Modified");
  });

  it("should process a basic object without dates or tags", () => {
    const result = processObject(mockObject, false, mockMutate);

    expect(result).toEqual({
      spaceId: "space1",
      id: "obj1",
      icon: "object-icon",
      title: "Test Object",
      subtitle: undefined,
      accessories: [
        {
          date: undefined,
          tooltip: "Never Modified",
          text: "—",
        },
        {
          icon: "doc-icon",
          tooltip: "Type: Document",
        },
      ],
      mutate: [mockMutate],
      object: mockObject,
      layout: ObjectLayout.Basic,
      isPinned: false,
    });
  });

  it("should add star icon when object is pinned", () => {
    const result = processObject(mockObject, true, mockMutate, mockMutatePinned);

    expect(result.accessories[0]).toEqual({
      icon: Icon.Star,
      tooltip: "Pinned",
    });
    expect(result.isPinned).toBe(true);
    expect(result.mutate).toEqual([mockMutate, mockMutatePinned]);
  });

  it("should process object with valid date", () => {
    const dateValue = "2024-01-15T10:30:00Z";
    const objectWithDate: SpaceObject = {
      ...mockObject,
      properties: [
        {
          id: "prop1",
          key: SortProperty.LastModifiedDate,
          name: "Last Modified",
          format: PropertyFormat.Date,
          date: dateValue,
        },
      ],
    };

    const result = processObject(objectWithDate, false, mockMutate);

    const dateAccessory = result.accessories.find((acc) => "date" in acc);
    expect(dateAccessory).toBeDefined();
    expect(dateAccessory?.date).toEqual(new Date(dateValue));
    expect(dateAccessory?.tooltip).toContain("Last Modified Date:");
    expect(dateAccessory?.text).toBeUndefined();
  });

  it("should process object with tags", () => {
    const tags: Tag[] = [
      { id: "tag1", key: "tag1", name: "Important", color: "#FF0000" },
      { id: "tag2", key: "tag2", name: "Work", color: "#0000FF" },
    ];

    const objectWithTags: SpaceObject = {
      ...mockObject,
      properties: [
        {
          id: "prop2",
          key: propKeys.tag,
          name: "Tags",
          format: PropertyFormat.MultiSelect,
          multi_select: tags,
        },
      ],
    };

    const result = processObject(objectWithTags, false, mockMutate);

    const tagAccessory = result.accessories.find((acc) => acc.icon === Icon.Tag);
    expect(tagAccessory).toBeDefined();
    expect(tagAccessory?.tooltip).toBe("Tags: Important, Work");
  });

  it("should use LastModifiedDate when sort is Name", () => {
    vi.mocked(getPreferenceValues).mockReturnValue({ sort: SortProperty.Name });
    vi.mocked(getDateLabel).mockReturnValue("Last Modified Date");
    vi.mocked(getShortDateLabel).mockReturnValue("Modified");

    const dateValue = "2024-01-15T10:30:00Z";
    const objectWithDates: SpaceObject = {
      ...mockObject,
      properties: [
        {
          id: "prop3",
          key: SortProperty.Name,
          name: "Name",
          format: PropertyFormat.Text,
          text: "Some name",
        },
        {
          id: "prop4",
          key: SortProperty.LastModifiedDate,
          name: "Last Modified",
          format: PropertyFormat.Date,
          date: dateValue,
        },
      ],
    };

    const result = processObject(objectWithDates, false, mockMutate);

    const dateAccessory = result.accessories.find((acc) => "date" in acc);
    expect(dateAccessory?.date).toEqual(new Date(dateValue));
    expect(dateAccessory?.tooltip).toContain("Last Modified Date:");
  });

  it("should handle invalid date (timestamp 0)", () => {
    const objectWithInvalidDate: SpaceObject = {
      ...mockObject,
      properties: [
        {
          id: "prop5",
          key: SortProperty.LastModifiedDate,
          name: "Last Modified",
          format: PropertyFormat.Date,
          date: "1970-01-01T00:00:00Z", // Unix epoch 0
        },
      ],
    };

    const result = processObject(objectWithInvalidDate, false, mockMutate);

    const dateAccessory = result.accessories.find((acc) => "date" in acc);
    expect(dateAccessory?.date).toBeUndefined();
    expect(dateAccessory?.text).toBe("—");
    expect(dateAccessory?.tooltip).toBe("Never Modified");
  });

  it("should handle object with all features combined", () => {
    const dateValue = "2024-01-15T10:30:00Z";
    const tags: Tag[] = [{ id: "tag1", key: "tag1", name: "Priority", color: "#FF0000" }];

    const fullObject: SpaceObject = {
      ...mockObject,
      properties: [
        {
          id: "prop6",
          key: SortProperty.LastModifiedDate,
          name: "Last Modified",
          format: PropertyFormat.Date,
          date: dateValue,
        },
        {
          id: "prop7",
          key: propKeys.tag,
          name: "Tags",
          format: PropertyFormat.MultiSelect,
          multi_select: tags,
        },
      ],
    };

    const result = processObject(fullObject, true, mockMutate, mockMutatePinned);

    expect(result.accessories).toHaveLength(4); // Star, Tag, Date, Type
    expect(result.accessories[0].icon).toBe(Icon.Star);
    expect(result.accessories[1].icon).toBe(Icon.Tag);
    expect(result.accessories[2].date).toEqual(new Date(dateValue));
    expect(result.accessories[3].icon).toBe("doc-icon");
  });

  it("should handle different sort properties", () => {
    vi.mocked(getPreferenceValues).mockReturnValue({ sort: SortProperty.CreatedDate });
    vi.mocked(getDateLabel).mockReturnValue("Created Date");
    vi.mocked(getShortDateLabel).mockReturnValue("Created");

    const dateValue = "2024-01-10T08:00:00Z";
    const objectWithCreatedDate: SpaceObject = {
      ...mockObject,
      properties: [
        {
          id: "prop8",
          key: SortProperty.CreatedDate,
          name: "Created",
          format: PropertyFormat.Date,
          date: dateValue,
        },
      ],
    };

    const result = processObject(objectWithCreatedDate, false, mockMutate);

    const dateAccessory = result.accessories.find((acc) => "date" in acc);
    expect(dateAccessory?.date).toEqual(new Date(dateValue));
    expect(dateAccessory?.tooltip).toContain("Created Date:");
  });

  it("should filter out undefined mutate promises", () => {
    const result = processObject(mockObject, false, mockMutate, undefined);

    expect(result.mutate).toEqual([mockMutate]);
    expect(result.mutate).toHaveLength(1);
  });
});
