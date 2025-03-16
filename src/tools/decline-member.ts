import { updateMember } from "../api/updateMember";
import { MemberStatus } from "../models";

type Input = {
  /**
   * The unique identifier of the space to decline the member from.
   * This value can be obtained from the `getSpaces` tool.
   * */
  spaceId: string;

  /**
   * The unique identifier of the member to decline
   * This value can be obtained from the `get-members` tool.
   */
  memberId: string;
};

/**
 * Decline a joining member from a space.
 */
export default async function tool({ spaceId, memberId }: Input) {
  return await updateMember(spaceId, memberId, {
    status: MemberStatus.Declined,
  });
}
