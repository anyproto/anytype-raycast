import { getTemplates, getTypes } from "../api";
import { Space, Template, Type } from "../models";
import { apiLimitMax } from "../utils";

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
