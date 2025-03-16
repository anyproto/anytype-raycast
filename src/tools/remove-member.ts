import { updateMember } from "../api/updateMember";
import { MemberStatus } from "../models";

type Input = {
  /**
   * The unique identifier of the space to remove the member from.
   * This value can be obtained from the `getSpaces` tool.
   * */
  spaceId: string;

  /**
   * The unique identifier of the member to remove.
   * This value can be obtained from the `get-members` tool.
   */
  memberId: string;
};

/**
 * Remove an active member from a space.
 */
export default async function tool({ spaceId, memberId }: Input) {
  return await updateMember(spaceId, memberId, {
    status: MemberStatus.Removed,
  });
}
