import { vi } from "vitest";

// Mock Raycast API for testing
export const getPreferenceValues = vi.fn(() => ({
  limit: 10,
  apiKey: "",
  sort: "name",
}));

export const LocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  allItems: vi.fn(),
};

export const showToast = vi.fn();
export const showFailureToast = vi.fn();

export const Toast = {
  Style: {
    Success: "success",
    Failure: "failure",
    Animated: "animated",
  },
};

export const Color = {
  Red: "red",
  Orange: "orange",
  Yellow: "yellow",
  Green: "green",
  Blue: "blue",
  Purple: "purple",
  Magenta: "magenta",
  PrimaryText: "primaryText",
  SecondaryText: "secondaryText",
};

// Image type for icon testing
export type Image = {
  source: string;
};

export const Image = {
  ImageLike: {} as Image,
  Mask: {
    Circle: "circle",
    RoundedRectangle: "roundedRectangle",
    Rectangle: "rectangle",
  },
};

// Icon constants
export const Icon = {
  Document: "document-icon",
  BullsEye: "bullseye-icon",
};

// Mock utilities from @raycast/utils
export const useForm = vi.fn();
export const useFetch = vi.fn();
export const usePromise = vi.fn();
export const useCachedPromise = vi.fn();

// Navigation
export const popToRoot = vi.fn();
export const useNavigation = vi.fn(() => ({
  pop: vi.fn(),
  push: vi.fn(),
}));

// Clipboard
export const Clipboard = {
  copy: vi.fn(),
  paste: vi.fn(),
  clear: vi.fn(),
};

// Open
export const open = vi.fn();

// Alert
export const confirmAlert = vi.fn();
