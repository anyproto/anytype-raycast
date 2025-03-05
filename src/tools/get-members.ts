import { getMembers } from "../api/getMembers";
import { apiLimit } from "../helpers/constants";

type Input = {
  /**
   * The unique identifier of the space to get members from.
   * This value can be obtained from the `getSpaces` tool.
   */
  spaceId: string;
};

/**
 * Retrieve a list of members in the specified space.
 * This function queries the specified space and returns a list of members.
 */
export default async function tool({ spaceId }: Input) {
  const { members, pagination } = await getMembers(spaceId, { offset: 0, limit: apiLimit });
  const results = members.map(({ object, name, id, global_name, role }) => ({ object, name, id, global_name, role }));

  return {
    results,
    pagination,
  };
}
