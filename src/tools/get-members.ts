import { getMembers } from "../api";
import { apiLimitMax } from "../utils";

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
  const allMembers = [];
  let hasMore = true;
  let offset = 0;

  while (hasMore) {
    const { members, pagination } = await getMembers(spaceId, { offset, limit: apiLimitMax });
    allMembers.push(...members);
    hasMore = pagination.has_more;
    offset += apiLimitMax;
  }
  const results = allMembers.map(({ object, name, id, global_name, role }) => ({
    object,
    name,
    id,
    global_name,
    role,
  }));

  return {
    results,
    total: allMembers.length,
  };
}
