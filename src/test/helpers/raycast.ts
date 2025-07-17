import { showToast, Toast } from "@raycast/api";
import { vi } from "vitest";

/**
 * Helper to assert a success toast was shown
 */
export function expectSuccessToast(title: string, message?: string) {
  expect(showToast).toHaveBeenCalledWith({
    style: Toast.Style.Success,
    title,
    ...(message && { message }),
  });
}

/**
 * Helper to assert a failure toast was shown
 */
export function expectFailureToast(title: string, message?: string) {
  expect(showToast).toHaveBeenCalledWith({
    style: Toast.Style.Failure,
    title,
    ...(message && { message }),
  });
}

/**
 * Create an array of pinned objects for testing
 */
export function createPinnedObjects(count: number): Array<{ spaceId: string; objectId: string }> {
  return Array(count)
    .fill(null)
    .map((_, i) => ({
      spaceId: `space${i}`,
      objectId: `obj${i}`,
    }));
}

/**
 * Standard Raycast API mock object
 */
export const RAYCAST_API_MOCK = {
  LocalStorage: {
    getItem: vi.fn(),
    setItem: vi.fn(),
  },
  showToast: vi.fn(),
  Toast: {
    Style: {
      Success: "SUCCESS",
      Failure: "FAILURE",
    },
  },
  getPreferenceValues: vi.fn().mockReturnValue({ apiUrl: "http://127.0.0.1:9090" }),
};
