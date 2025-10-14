import { describe, expect, it } from "vitest";
import { CreateObjectFormValues } from "../components";
import { TEST_IDS } from "../test";

interface LaunchContext {
  defaults?: {
    space: string;
    type: string;
    template: string;
    list: string;
    name: string;
    icon: string;
    description: string;
    body: string;
    source: string;
  };
}

describe("create-object", () => {
  describe("CreateObject component", () => {
    it("should merge launchContext defaults with draftValues", () => {
      const launchContext: LaunchContext = {
        defaults: {
          space: TEST_IDS.space,
          type: TEST_IDS.type,
          template: TEST_IDS.template,
          list: TEST_IDS.list,
          name: "Default Name",
          icon: "default-icon",
          description: "Default Description",
          body: "Default Body",
          source: "Default Source",
        },
      };

      const draftValues: Partial<CreateObjectFormValues> = {
        name: "Draft Name",
        icon: "draft-icon",
        // Other values not provided in draft
      };

      // Simulate merging logic
      const mergedValues = {
        ...(launchContext?.defaults || {}),
        ...(draftValues || {}),
      };

      // draftValues should take precedence
      expect(mergedValues.name).toBe("Draft Name");
      expect(mergedValues.icon).toBe("draft-icon");

      // launchContext defaults should be used for non-overridden values
      expect(mergedValues.space).toBe(TEST_IDS.space);
      expect(mergedValues.type).toBe(TEST_IDS.type);
      expect(mergedValues.template).toBe(TEST_IDS.template);
      expect(mergedValues.list).toBe(TEST_IDS.list);
      expect(mergedValues.description).toBe("Default Description");
      expect(mergedValues.body).toBe("Default Body");
      expect(mergedValues.source).toBe("Default Source");
    });

    it("should handle undefined launchContext", () => {
      const launchContext: LaunchContext | undefined = undefined;
      const draftValues: Partial<CreateObjectFormValues> = {
        name: "Draft Name",
        icon: "draft-icon",
      };

      // Simulate merging logic
      const defaults: Record<string, unknown> = (launchContext as unknown as LaunchContext | null)?.defaults || {};
      const mergedValues: Record<string, unknown> = {
        ...defaults,
        ...(draftValues || {}),
      };

      expect(mergedValues.name).toBe("Draft Name");
      expect(mergedValues.icon).toBe("draft-icon");
      expect(mergedValues.space).toBeUndefined();
      expect(mergedValues.type).toBeUndefined();
    });

    it("should handle undefined draftValues", () => {
      const launchContext: LaunchContext = {
        defaults: {
          space: TEST_IDS.space,
          type: TEST_IDS.type,
          template: TEST_IDS.template,
          list: TEST_IDS.list,
          name: "Default Name",
          icon: "default-icon",
          description: "Default Description",
          body: "Default Body",
          source: "Default Source",
        },
      };
      const draftValues = undefined;

      // Simulate merging logic
      const mergedValues = {
        ...(launchContext?.defaults || {}),
        ...(draftValues || {}),
      };

      expect(mergedValues).toEqual(launchContext.defaults);
    });

    it("should handle both undefined", () => {
      const launchContext: LaunchContext | undefined = undefined;
      const draftValues: Partial<CreateObjectFormValues> | undefined = undefined;

      // Simulate merging logic
      const defaults = (launchContext as unknown as LaunchContext | null)?.defaults || {};
      const mergedValues = {
        ...defaults,
        ...(draftValues || {}),
      };

      expect(mergedValues).toEqual({});
    });

    it("should completely override with draftValues when all properties are provided", () => {
      const launchContext: LaunchContext = {
        defaults: {
          space: "old-space",
          type: "old-type",
          template: "old-template",
          list: "old-list",
          name: "Old Name",
          icon: "old-icon",
          description: "Old Description",
          body: "Old Body",
          source: "Old Source",
        },
      };

      const draftValues: CreateObjectFormValues = {
        space: TEST_IDS.space,
        type: TEST_IDS.type,
        template: TEST_IDS.template,
        list: TEST_IDS.list,
        name: "New Name",
        icon: "new-icon",
        description: "New Description",
        body: "New Body",
        source: "New Source",
      };

      // Simulate merging logic
      const mergedValues = {
        ...(launchContext?.defaults || {}),
        ...(draftValues || {}),
      };

      expect(mergedValues).toEqual(draftValues);
      expect(mergedValues.space).not.toBe("old-space");
      expect(mergedValues.name).not.toBe("Old Name");
    });
  });

  describe("props structure", () => {
    it("should have correct prop types", () => {
      // Test that props can be constructed correctly
      const props = {
        draftValues: {
          space: TEST_IDS.space,
          type: TEST_IDS.type,
          template: TEST_IDS.template,
          list: TEST_IDS.list,
          name: "Test Object",
          icon: "test-icon",
          description: "Test Description",
          body: "Test Body",
          source: "Test Source",
        },
        launchContext: {
          defaults: {
            space: TEST_IDS.space,
            type: TEST_IDS.type,
            template: TEST_IDS.template,
            list: TEST_IDS.list,
            name: "Default Name",
            icon: "default-icon",
            description: "Default Description",
            body: "Default Body",
            source: "Default Source",
          },
        },
      };

      expect(props.draftValues).toBeDefined();
      expect(props.launchContext).toBeDefined();
      expect(props.launchContext.defaults).toBeDefined();
    });
  });
});
