import { LocalStorage } from "@raycast/api";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock the LocalStorage module
vi.mock("@raycast/api", () => ({
  LocalStorage: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  },
}));

describe("migrateAuthKey", () => {
  const OLD_KEY = "app_key";
  const NEW_KEY = "api_key";
  const mockLocalStorage = vi.mocked(LocalStorage);

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the module to clear the cached promise
    vi.resetModules();
  });

  it("should migrate old key to new key when only old key exists", async () => {
    const oldValue = "old-auth-token";
    mockLocalStorage.getItem.mockImplementation(async (key: string) => {
      if (key === OLD_KEY) return oldValue;
      if (key === NEW_KEY) return undefined;
      return undefined;
    });

    // Import fresh module
    const { migrateAuthKey: freshMigrateAuthKey } = await import("../migrateAuthKey");
    const result = await freshMigrateAuthKey();

    expect(result).toBe(true);
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(NEW_KEY, oldValue);
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(OLD_KEY);
  });

  it("should not migrate when no old key exists", async () => {
    mockLocalStorage.getItem.mockResolvedValue(undefined);

    const { migrateAuthKey: freshMigrateAuthKey } = await import("../migrateAuthKey");
    const result = await freshMigrateAuthKey();

    expect(result).toBe(false);
    expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
    expect(mockLocalStorage.removeItem).not.toHaveBeenCalled();
  });

  it("should clean up old key when new key already exists", async () => {
    mockLocalStorage.getItem.mockImplementation(async (key: string) => {
      if (key === OLD_KEY) return "old-token";
      if (key === NEW_KEY) return "new-token";
      return undefined;
    });

    const { migrateAuthKey: freshMigrateAuthKey } = await import("../migrateAuthKey");
    const result = await freshMigrateAuthKey();

    expect(result).toBe(false);
    expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(OLD_KEY);
  });

  it("should handle errors gracefully", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mockLocalStorage.getItem.mockRejectedValue(new Error("Storage error"));

    const { migrateAuthKey: freshMigrateAuthKey } = await import("../migrateAuthKey");
    const result = await freshMigrateAuthKey();

    expect(result).toBe(false);
    expect(consoleErrorSpy).toHaveBeenCalledWith("Error during authentication key migration:", expect.any(Error));

    consoleErrorSpy.mockRestore();
  });

  it("should use cached promise for subsequent calls", async () => {
    mockLocalStorage.getItem.mockImplementation(async (key: string) => {
      if (key === OLD_KEY) return "old-token";
      if (key === NEW_KEY) return undefined;
      return undefined;
    });

    const { migrateAuthKey: freshMigrateAuthKey } = await import("../migrateAuthKey");

    // First call
    const result1 = await freshMigrateAuthKey();
    expect(result1).toBe(true);
    expect(mockLocalStorage.getItem).toHaveBeenCalledTimes(2); // OLD_KEY and NEW_KEY

    // Clear mocks but don't reset module
    vi.clearAllMocks();

    // Second call should use cached promise
    const result2 = await freshMigrateAuthKey();
    expect(result2).toBe(true);
    expect(mockLocalStorage.getItem).not.toHaveBeenCalled(); // Should not call again
  });

  it("should handle setItem errors", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mockLocalStorage.getItem.mockImplementation(async (key: string) => {
      if (key === OLD_KEY) return "old-token";
      if (key === NEW_KEY) return undefined;
      return undefined;
    });
    mockLocalStorage.setItem.mockRejectedValue(new Error("Failed to set"));

    const { migrateAuthKey: freshMigrateAuthKey } = await import("../migrateAuthKey");
    const result = await freshMigrateAuthKey();

    expect(result).toBe(false);
    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  it("should handle removeItem errors", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mockLocalStorage.getItem.mockImplementation(async (key: string) => {
      if (key === OLD_KEY) return "old-token";
      if (key === NEW_KEY) return undefined;
      return undefined;
    });
    mockLocalStorage.removeItem.mockRejectedValue(new Error("Failed to remove"));

    const { migrateAuthKey: freshMigrateAuthKey } = await import("../migrateAuthKey");
    const result = await freshMigrateAuthKey();

    expect(result).toBe(false);
    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });
});
