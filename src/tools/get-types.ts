import { getTypes } from "../api/getTypes";
import { apiLimit } from "../helpers/constants";

type Input = {
  /**
   * The unique identifier of the space to get types from.
   * This value can be obtained from the `getSpaces` tool.
   */
  spaceId: string;
};

/**
 * Retrieve a list of all types in a space.
 * This function queries the specified space and returns a list of types
 * that are available in the space.
 */
export default async function tool({ spaceId }: Input) {
  const { types, pagination } = await getTypes(spaceId, { offset: 0, limit: apiLimit });
  const results = types.map(({ object, name, id, unique_key }) => ({ object, name, id, unique_key }));

  return {
    results,
    pagination,
  };
}
