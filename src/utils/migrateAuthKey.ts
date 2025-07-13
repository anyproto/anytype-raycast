import { LocalStorage } from "@raycast/api";

const OLD_KEY = "app_key";
const NEW_KEY = "api_key";

// Cache the migration promise to ensure it only runs once per session
let migrationPromise: Promise<boolean> | null = null;

/**
 * Migrates authentication key from old localStorage key (app_key) to new key (api_key).
 * This is a one-time migration that preserves existing authentication.
 * Uses promise caching to ensure migration only runs once per session.
 * @returns {Promise<boolean>} True if migration was performed, false if not needed
 */
export async function migrateAuthKey(): Promise<boolean> {
  if (migrationPromise !== null) {
    return migrationPromise;
  }

  migrationPromise = performMigration();
  return migrationPromise;
}

async function performMigration(): Promise<boolean> {
  try {
    const oldValue = await LocalStorage.getItem<string>(OLD_KEY);
    if (!oldValue) {
      // No old key, nothing to migrate
      return false;
    }

    const newValue = await LocalStorage.getItem<string>(NEW_KEY);
    if (newValue) {
      // New key already exists, remove old key to clean up
      await LocalStorage.removeItem(OLD_KEY);
      return false;
    }

    await LocalStorage.setItem(NEW_KEY, oldValue);
    await LocalStorage.removeItem(OLD_KEY);

    return true;
  } catch (error) {
    console.error("Error during authentication key migration:", error);
    return false;
  }
}
