import { getTemplates, getTypes } from "../api";
import { Space, Template, Type } from "../models";
import { apiKeyPrefixes, apiLimitMax } from "../utils";

/**
 * Checks if a given `Type` is a list type.
 */
export function typeIsList(layout: string): boolean {
  return layout === "set" || layout === "collection";
}

/**
 * Fetches all `Type`s from a single space, doing pagination if necessary.
 */
export async function fetchAllTypesForSpace(spaceId: string): Promise<Type[]> {
  const allTypes: Type[] = [];
  let hasMore = true;
  let offset = 0;

  while (hasMore) {
    const response = await getTypes(spaceId, { offset, limit: apiLimitMax });
    allTypes.push(...response.types);
    hasMore = response.pagination.has_more;
    offset += apiLimitMax;
  }

  return allTypes;
}

/**
 * Aggregates all `Type`s from all given spaces.
 */
export async function getAllTypesFromSpaces(spaces: Space[]): Promise<Type[]> {
  const allTypes: Type[] = [];
  for (const space of spaces) {
    try {
      const types = await fetchAllTypesForSpace(space.id);
      allTypes.push(...types);
    } catch (err) {
      console.log(`Error fetching types for space ${space.id}:`, err);
    }
  }
  return allTypes;
}

/**
 * Fetches all `Template`s from a single space and type, doing pagination if necessary.
 */
export async function fetchAllTemplatesForSpace(spaceId: string, typeId: string): Promise<Template[]> {
  const allTemplates: Template[] = [];
  let hasMore = true;
  let offset = 0;

  while (hasMore) {
    const response = await getTemplates(spaceId, typeId, { offset, limit: apiLimitMax });
    allTemplates.push(...response.templates);
    hasMore = response.pagination.has_more;
    offset += apiLimitMax;
  }

  return allTemplates;
}

/**
 * Fetches all unique type keys for page types.
 */
export async function fetchTypeKeysForPages(
  spaces: Space[],
  typeKeysForTasks: string[],
  typeKeysForLists: string[],
): Promise<string[]> {
  const excludedKeysForPages = new Set([
    // not shown anywhere
    "ot-audio",
    "ot-chat",
    "ot-file",
    "ot-image",
    "ot-objectType",
    "ot-tag",
    "ot-template",
    "ot-video",

    // shown in other views
    "ot-set",
    "ot-collection",
    "ot-bookmark",
    "ot-participant",
    ...typeKeysForTasks,
    ...typeKeysForLists,
  ]);

  const allTypes = await getAllTypesFromSpaces(spaces);
  const pageTypeKeys = new Set(allTypes.map((type) => type.key).filter((key) => !excludedKeysForPages.has(key)));
  return Array.from(pageTypeKeys);
}

/**
 * Fetches all type keys for task types.
 */
export async function fetchTypesKeysForTasks(spaces: Space[]): Promise<string[]> {
  const tasksTypes = await getAllTypesFromSpaces(spaces);
  const taskTypeKeys = new Set(tasksTypes.filter((type) => type.layout === "todo").map((type) => type.key));
  return Array.from(taskTypeKeys);
}

/**
 * Fetches all type keys for list types.
 */
export async function fetchTypeKeysForLists(spaces: Space[]): Promise<string[]> {
  const listsTypes = await getAllTypesFromSpaces(spaces);
  const listTypeKeys = new Set(
    listsTypes.filter((type) => type.layout === "set" || type.layout === "collection").map((type) => type.key),
  );
  return Array.from(listTypeKeys);
}

/**
 * Checks if a type is custom user type or not (built-in system type).
 */
export function isUserType(key: string): boolean {
  return apiKeyPrefixes.types.length + 24 === key.length && /\d/.test(key);
}

/**
 * Checks if a property is custom user property or not (built-in system property).
 */
export function isUserProperty(key: string): boolean {
  return apiKeyPrefixes.properties.length + 24 === key.length && /\d/.test(key);
}
