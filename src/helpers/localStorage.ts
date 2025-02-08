import { LocalStorage, showToast, Toast } from "@raycast/api";

const maxPinnedObjects = 5;
const PINNED_OBJECTS_KEY = "pinned_objects";

export async function getPinnedObjects(spaceIdForPinned: string): Promise<{ spaceId: string; objectId: string }[]> {
  const pinnedObjects = await LocalStorage.getItem<string>(`${spaceIdForPinned}_${PINNED_OBJECTS_KEY}`);
  return pinnedObjects ? JSON.parse(pinnedObjects) : [];
}

export async function addPinnedObject(spaceId: string, objectId: string, spaceIdForPinned: string): Promise<void> {
  const pinnedObjects = await getPinnedObjects(spaceIdForPinned);
  if (!pinnedObjects.some((obj) => obj.spaceId === spaceId && obj.objectId === objectId)) {
    if (pinnedObjects.length >= maxPinnedObjects) {
      await showToast(Toast.Style.Failure, `Can't pin more than ${maxPinnedObjects} objects`);
      return;
    }
    pinnedObjects.push({ spaceId, objectId });
    await LocalStorage.setItem(`${spaceIdForPinned}_${PINNED_OBJECTS_KEY}`, JSON.stringify(pinnedObjects));
  }
}

export async function removePinnedObject(spaceId: string, objectId: string, spaceIdForPinned: string): Promise<void> {
  const pinnedObjects = await getPinnedObjects(spaceIdForPinned);
  const updatedPinnedObjects = pinnedObjects.filter(
    (pinned) => pinned.spaceId !== spaceId || pinned.objectId !== objectId,
  );
  await LocalStorage.setItem(`${spaceIdForPinned}_${PINNED_OBJECTS_KEY}`, JSON.stringify(updatedPinnedObjects));
}

async function movePinnedItem(
  spaceId: string,
  objectId: string,
  spaceIdForPinned: string,
  direction: -1 | 1,
): Promise<void> {
  const pinnedObjects = await getPinnedObjects(spaceIdForPinned);
  const index = pinnedObjects.findIndex((pinned) => pinned.spaceId === spaceId && pinned.objectId === objectId);
  const targetIndex = index + direction;
  if (index === -1 || targetIndex < 0 || targetIndex >= pinnedObjects.length) {
    return;
  }
  // Swap the two items using destructuring assignment
  [pinnedObjects[index], pinnedObjects[targetIndex]] = [pinnedObjects[targetIndex], pinnedObjects[index]];
  await LocalStorage.setItem(`${spaceIdForPinned}_${PINNED_OBJECTS_KEY}`, JSON.stringify(pinnedObjects));
}

export async function moveUpInPinned(spaceId: string, objectId: string, spaceIdForPinned: string): Promise<void> {
  await movePinnedItem(spaceId, objectId, spaceIdForPinned, -1);
}

export async function moveDownInPinned(spaceId: string, objectId: string, spaceIdForPinned: string): Promise<void> {
  await movePinnedItem(spaceId, objectId, spaceIdForPinned, 1);
}
