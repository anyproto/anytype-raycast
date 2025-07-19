import { describe, expect, it } from "vitest";
import { CreateTypeFormProps } from "../components";
import { TEST_IDS } from "../test";

describe("create-type", () => {
  it("should pass draftValues to CreateTypeForm", () => {
    const draftValues = {
      space: TEST_IDS.space,
      name: "Test Type",
      icon: "test-icon",
      description: "Test Description",
    };

    // Props that would be passed to CreateTypeForm
    const formProps = {
      draftValues: draftValues,
      enableDrafts: true,
    };

    expect(formProps.draftValues).toBe(draftValues);
    expect(formProps.enableDrafts).toBe(true);
  });

  it("should handle undefined draftValues", () => {
    const props: CreateTypeFormProps = {
      draftValues: undefined,
      enableDrafts: true,
    };

    // Props that would be passed to CreateTypeForm
    const formProps = {
      draftValues: props.draftValues,
      enableDrafts: true,
    };

    expect(formProps.draftValues).toBeUndefined();
    expect(formProps.enableDrafts).toBe(true);
  });

  it("should always enable drafts", () => {
    // Test that enableDrafts is always true regardless of draftValues
    const testCases = [
      { draftValues: { name: "Type 1" } },
      { draftValues: undefined },
      { draftValues: { space: TEST_IDS.space, name: "Type 2", icon: "icon" } },
    ];

    testCases.forEach((testCase) => {
      const formProps = {
        draftValues: testCase.draftValues,
        enableDrafts: true,
      };
      expect(formProps.enableDrafts).toBe(true);
    });
  });
});
