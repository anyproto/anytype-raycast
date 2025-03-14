import { search } from "../api";
import { SortDirection, SortTimestamp } from "../models";
import { apiLimit } from "../utils";

type Input = {
  /**
   * The unique identifier of the space to search within.
   * This value can be obtained from the `getSpaces` tool.
   */
  spaceId: string;

  /**
   * The search query for the title of the page.
   * Note: Only plain text is supported; operators are not allowed.
   */
  query: string;

  /**
   * The types of objects to search for, identified by their id or unique_key.
   * This value can be obtained from the `getTypes` tool.
   * When user asks for 'list' objects, search for 'ot-set' and 'ot-collection' types.
   * If no types are specified, the search will include all types of objects
   * Default value is an empty array.
   */
  types?: string[];

  /**
   * Optional sorting options for the search results
   * (e.g., sorting direction and field).
   */
  sort?: {
    /**
     * The sorting direction for the search results.
     * This value can be either "asc" (ascending) or "desc" (descending).
     * Default value is "desc".
     */
    direction?: SortDirection;

    /**
     * The sorting field for the search results.
     * This value can be "last_modified_date", "last_opened_date", or "created_date".
     * Default value is "last_modified_date".
     */
    timestamp?: SortTimestamp;
  };
};

/**
 * Perform a search for objects within a specific space.
 * This function queries the specified space and returns a list of objects
 * that match the search criteria.
 * For empty search query and sort criterion, most recently modified objects are returned.
 */
export default async function tool({ spaceId, query, types, sort }: Input) {
  types = types ?? [];
  const sortOptions = {
    direction: sort?.direction ?? SortDirection.Descending,
    timestamp: sort?.timestamp ?? SortTimestamp.LastModifiedDate,
  };

  const { data, pagination } = await search(
    spaceId,
    { query, types, sort: sortOptions },
    { offset: 0, limit: apiLimit },
  );
  const results = data.map(({ object, name, id, snippet }) => ({
    object,
    name,
    id,
    snippet,
  }));

  return {
    results,
    pagination,
  };
}
