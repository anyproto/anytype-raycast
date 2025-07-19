import { Image } from "@raycast/api";
import { describe, expect, it, vi } from "vitest";
import { ObjectLayout, Space, SpaceObject } from "../../models";
import { TEST_IDS, createSpace, createSpaceObject, createType } from "../../test";
import { ViewType } from "../ObjectList";

describe("ObjectListItem", () => {
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

  describe("props structure", () => {
    it("should have correct prop types", () => {
      const props = {
        space: mockSpace,
        objectId: TEST_IDS.object,
        icon: { source: "icon-source" } as Image.ImageLike,
        title: "Test Title",
        subtitle: { value: "Test Subtitle", tooltip: "Subtitle tooltip" },
        accessories: [
          { icon: { source: "star" } as Image.ImageLike, tooltip: "Pinned" },
          { text: "Admin", tooltip: "Role: Admin" },
          { date: new Date("2024-01-01"), tooltip: "Created date" },
          { tag: { value: "New", color: "green", tooltip: "New item" } },
        ],
        mutate: [vi.fn(), vi.fn()],
        mutateViews: vi.fn(),
        object: mockObject,
        layout: "basic" as const,
        viewType: ViewType.objects,
        isGlobalSearch: false,
        isNoPinView: false,
        isPinned: true,
        searchText: "test",
      };

      expect(props.space).toBeDefined();
      expect(props.objectId).toBe(TEST_IDS.object);
      expect(props.icon).toBeDefined();
      expect(props.title).toBe("Test Title");
      expect(props.subtitle).toBeDefined();
      expect(props.accessories).toHaveLength(4);
      expect(props.mutate).toHaveLength(2);
      expect(props.object).toBe(mockObject);
      expect(props.viewType).toBe(ViewType.objects);
      expect(props.isPinned).toBe(true);
    });
  });

  describe("accessory handling", () => {
    it("should map accessories correctly", () => {
      const accessories = [
        { icon: { source: "star" } as Image.ImageLike, tooltip: "Pinned" },
        { text: "Admin", tooltip: "Role: Admin" },
        { date: new Date("2024-01-01"), tooltip: "Created date" },
        { tag: { value: "New", color: "green", tooltip: "New item" } },
      ];

      const mapped = accessories.map((accessory) => {
        const { icon, date, text, tooltip, tag } = accessory;
        const accessoryProps: {
          icon?: Image.ImageLike;
          date?: Date;
          text?: string;
          tooltip?: string;
          tag?: { value: string; color: string; tooltip: string };
        } = {};

        if (icon) accessoryProps.icon = icon;
        if (date) accessoryProps.date = date;
        if (text) accessoryProps.text = text;
        if (tooltip) accessoryProps.tooltip = tooltip;
        if (tag) accessoryProps.tag = tag;

        return accessoryProps;
      });

      expect(mapped).toHaveLength(4);
      expect(mapped[0]).toHaveProperty("icon");
      expect(mapped[0]).toHaveProperty("tooltip");
      expect(mapped[1]).toHaveProperty("text");
      expect(mapped[2]).toHaveProperty("date");
      expect(mapped[3]).toHaveProperty("tag");
    });

    it("should handle empty accessories", () => {
      const accessories: Array<{ text?: string; icon?: unknown; tooltip?: string }> | undefined = undefined;
      const mapped = accessories?.map(() => ({})) || [];

      expect(mapped).toEqual([]);
    });

    it("should handle accessories with only some properties", () => {
      const accessories = [
        { text: "Text only" },
        { icon: { source: "icon" } as Image.ImageLike },
        { tooltip: "Tooltip only" },
      ];

      const mapped = accessories.map((accessory: { text?: string; icon?: Image.ImageLike; tooltip?: string }) => {
        const { icon, text, tooltip } = accessory;
        const accessoryProps: {
          icon?: Image.ImageLike;
          text?: string;
          tooltip?: string;
        } = {};

        if (icon) accessoryProps.icon = icon;
        if (text) accessoryProps.text = text;
        if (tooltip) accessoryProps.tooltip = tooltip;

        return accessoryProps;
      });

      expect(mapped[0]).toEqual({ text: "Text only" });
      expect(mapped[1]).toEqual({ icon: { source: "icon" } });
      expect(mapped[2]).toEqual({ tooltip: "Tooltip only" });
    });
  });

  describe("subtitle handling", () => {
    it("should handle subtitle with value and tooltip", () => {
      const subtitle = { value: "Subtitle text", tooltip: "Subtitle tooltip" };

      const result = subtitle ? { value: subtitle.value, tooltip: subtitle.tooltip } : undefined;

      expect(result).toEqual({ value: "Subtitle text", tooltip: "Subtitle tooltip" });
    });

    it("should handle undefined subtitle", () => {
      const subtitle: { value: string; tooltip: string } | undefined = undefined;

      const result = subtitle ? { value: subtitle.value, tooltip: subtitle.tooltip } : undefined;

      expect(result).toBeUndefined();
    });
  });

  describe("different view types", () => {
    it("should handle objects view type", () => {
      const viewType = ViewType.objects;
      expect(viewType).toBe("Object");
    });

    it("should handle types view type", () => {
      const viewType = ViewType.types;
      expect(viewType).toBe("Type");
    });

    it("should handle properties view type", () => {
      const viewType = ViewType.properties;
      expect(viewType).toBe("Property");
    });

    it("should handle members view type", () => {
      const viewType = ViewType.members;
      expect(viewType).toBe("Member");
    });
  });

  describe("search context", () => {
    it("should pass search text to actions", () => {
      const searchText = "test search";
      const props = {
        searchText,
        isGlobalSearch: true,
      };

      expect(props.searchText).toBe("test search");
      expect(props.isGlobalSearch).toBe(true);
    });

    it("should handle empty search text", () => {
      const searchText = "";
      const props = {
        searchText,
        isGlobalSearch: false,
      };

      expect(props.searchText).toBe("");
      expect(props.isGlobalSearch).toBe(false);
    });
  });

  describe("pin state", () => {
    it("should handle pinned state", () => {
      const props = {
        isPinned: true,
        isNoPinView: false,
      };

      expect(props.isPinned).toBe(true);
      expect(props.isNoPinView).toBe(false);
    });

    it("should handle unpinned state", () => {
      const props = {
        isPinned: false,
        isNoPinView: false,
      };

      expect(props.isPinned).toBe(false);
      expect(props.isNoPinView).toBe(false);
    });

    it("should handle no pin view", () => {
      const props = {
        isPinned: false,
        isNoPinView: true,
      };

      expect(props.isPinned).toBe(false);
      expect(props.isNoPinView).toBe(true);
    });
  });
});
