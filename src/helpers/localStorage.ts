import { LocalStorage, showToast, Toast } from "@raycast/api";

const maxPinnedObjects = 5;

export async function getPinnedObjects(): Promise<{ spaceId: string; objectId: string }[]> {
  const pinnedObjects = await LocalStorage.getItem<string>("pinned_objects");
  return pinnedObjects ? JSON.parse(pinnedObjects) : [];
}

export async function addPinnedObject(spaceId: string, objectId: string): Promise<void> {
  const pinnedObjects = await getPinnedObjects();
  if (!pinnedObjects.some((obj) => obj.spaceId === spaceId && obj.objectId === objectId)) {
    if (pinnedObjects.length > maxPinnedObjects) {
      await showToast(Toast.Style.Failure, `Can't pin more than ${maxPinnedObjects} objects`);
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

async function movePinnedItem(spaceId: string, objectId: string, direction: -1 | 1): Promise<void> {
  const pinnedObjects = await getPinnedObjects();
  const index = pinnedObjects.findIndex((pinned) => pinned.spaceId === spaceId && pinned.objectId === objectId);
  const targetIndex = index + direction;
  if (index === -1 || targetIndex < 0 || targetIndex >= pinnedObjects.length) {
    return;
  }
  // Swap the two items using destructuring assignment
  [pinnedObjects[index], pinnedObjects[targetIndex]] = [pinnedObjects[targetIndex], pinnedObjects[index]];
  await LocalStorage.setItem("pinned_objects", JSON.stringify(pinnedObjects));
}

export async function moveUpInPinned(spaceId: string, objectId: string): Promise<void> {
  await movePinnedItem(spaceId, objectId, -1);
}

export async function moveDownInPinned(spaceId: string, objectId: string): Promise<void> {
  await movePinnedItem(spaceId, objectId, 1);
}
