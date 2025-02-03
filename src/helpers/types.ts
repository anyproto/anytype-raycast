import { getTypes } from "../api/getTypes";
import { apiLimitMax } from "./constants";
import { Space, Type } from "./schemas";

/**
 * Fetches all `Type`s from a single space, doing pagination if necessary.
 */
export async function fetchAllTypesForSpace(spaceId: string): Promise<Type[]> {
  let allTypes: Type[] = [];
  let hasMore = true;
  let offset = 0;

  while (hasMore) {
    const response = await getTypes(spaceId, { offset, limit: apiLimitMax });
    allTypes = [...allTypes, ...response.types];
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
