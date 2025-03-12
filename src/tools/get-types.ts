import { getTypes } from "../api";
import { apiLimit } from "../utils";

type Input = {
  /**
   * The unique identifier of the space to get types from.
   * This value can be obtained from the `getSpaces` tool.
   */
  spaceId: string;
};

/**
 * Retrieve a list of all types in a space.
 * This function queries the specified space and returns a list of types that are available in the space.
 * Should be called when user requests objects of a specific type.
 */
export default async function tool({ spaceId }: Input) {
  const { types, pagination } = await getTypes(spaceId, { offset: 0, limit: apiLimit });
  const results = types.map(({ object, name, id, unique_key }) => ({ object, name, id, unique_key }));

  return {
    results,
    pagination,
  };
}
