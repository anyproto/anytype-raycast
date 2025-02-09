import { LocalStorage, showToast, Toast } from "@raycast/api";
import { localStorageKeys, maxPinnedObjects } from "./constants";

export async function getPinnedObjects(pinSuffix: string): Promise<{ spaceId: string; objectId: string }[]> {
  const pinnedObjects = await LocalStorage.getItem<string>(localStorageKeys.pinnedObjectsWith(pinSuffix));
  return pinnedObjects ? JSON.parse(pinnedObjects) : [];
}

export async function addPinnedObject(
  spaceId: string,
  objectId: string,
  pinSuffix: string,
  title: string,
  contextLabel: string,
): Promise<void> {
  const pinnedObjects = await getPinnedObjects(pinSuffix);
  const isAlreadyPinned = pinnedObjects.some((obj) => obj.spaceId === spaceId && obj.objectId === objectId);

  if (isAlreadyPinned) {
    await showToast({
      style: Toast.Style.Failure,
      title: `${contextLabel} is already pinned`,
    });
    return;
  }

  if (pinnedObjects.length >= maxPinnedObjects) {
    await showToast({
      style: Toast.Style.Failure,
      title: `Can't pin more than ${maxPinnedObjects} items`,
    });
    return;
  }

  pinnedObjects.push({ spaceId, objectId });
  await LocalStorage.setItem(localStorageKeys.pinnedObjectsWith(pinSuffix), JSON.stringify(pinnedObjects));

  await showToast({
    style: Toast.Style.Success,
    title: `${contextLabel} pinned`,
    message: title,
  });
}

export async function removePinnedObject(
  spaceId: string,
  objectId: string,
  pinSuffix: string,
  title?: string,
  contextLabel?: string,
): Promise<void> {
  const pinnedObjects = await getPinnedObjects(pinSuffix);
  const updatedPinnedObjects = pinnedObjects.filter(
    (pinned) => pinned.spaceId !== spaceId || pinned.objectId !== objectId,
  );

  if (updatedPinnedObjects.length === pinnedObjects.length) {
    await showToast({
      style: Toast.Style.Failure,
      title: `${contextLabel} is not pinned`,
    });
    return;
  }

  await LocalStorage.setItem(localStorageKeys.pinnedObjectsWith(pinSuffix), JSON.stringify(updatedPinnedObjects));

  await showToast({
    style: Toast.Style.Success,
    title: `${contextLabel} unpinned`,
    message: title,
  });
}

async function movePinnedItem(spaceId: string, objectId: string, pinSuffix: string, direction: -1 | 1): Promise<void> {
  const pinnedObjects = await getPinnedObjects(pinSuffix);
  const index = pinnedObjects.findIndex((pinned) => pinned.spaceId === spaceId && pinned.objectId === objectId);
  const targetIndex = index + direction;
  if (index === -1 || targetIndex < 0 || targetIndex >= pinnedObjects.length) {
    return;
  }
  // Swap the two items using destructuring assignment
  [pinnedObjects[index], pinnedObjects[targetIndex]] = [pinnedObjects[targetIndex], pinnedObjects[index]];
  await LocalStorage.setItem(localStorageKeys.pinnedObjectsWith(pinSuffix), JSON.stringify(pinnedObjects));
}

export async function moveUpInPinned(spaceId: string, objectId: string, pinSuffix: string): Promise<void> {
  await movePinnedItem(spaceId, objectId, pinSuffix, -1);
}

export async function moveDownInPinned(spaceId: string, objectId: string, pinSuffix: string): Promise<void> {
  await movePinnedItem(spaceId, objectId, pinSuffix, 1);
}
