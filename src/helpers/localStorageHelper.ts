import { LocalStorage, showToast, Toast } from "@raycast/api";

export async function getPinnedObjects(): Promise<{ spaceId: string; objectId: string }[]> {
  const pinnedObjects = await LocalStorage.getItem<string>("pinned_objects");
  return pinnedObjects ? JSON.parse(pinnedObjects) : [];
}

export async function addPinnedObject(spaceId: string, objectId: string): Promise<void> {
  const pinnedObjects = await getPinnedObjects();
  if (!pinnedObjects.some((obj) => obj.spaceId === spaceId && obj.objectId === objectId)) {
    if (pinnedObjects.length >= 5) {
      await showToast(Toast.Style.Failure, "Can't pin object", "Unpin an object to pin a new one.");
      return;
    }
    pinnedObjects.push({ spaceId, objectId });
    await LocalStorage.setItem("pinned_objects", JSON.stringify(pinnedObjects));
  }
}

export async function removePinnedObject(spaceId: string, objectId: string): Promise<void> {
  const pinnedObjects = await getPinnedObjects();
  const updatedPinnedObjects = pinnedObjects.filter(
    (pinnedObject) => pinnedObject.spaceId !== spaceId || pinnedObject.objectId !== objectId,
  );
  await LocalStorage.setItem("pinned_objects", JSON.stringify(updatedPinnedObjects));
}
