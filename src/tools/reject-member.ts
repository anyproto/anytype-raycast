import { updateMember } from "../api/updateMember";
import { MemberStatus } from "../models";

type Input = {
  /**
   * The unique identifier of the space to reject the member from.
   * This value can be obtained from the `getSpaces` tool.
   * */
  spaceId: string;

  /**
   * The unique identifier of the member to reject.
   * This value can be obtained from the `get-members` tool.
   */
  memberId: string;
};

/**
 * Reject a joining member from a space.
 */
export default async function tool({ spaceId, memberId }: Input) {
  return await updateMember(spaceId, memberId, {
    status: MemberStatus.Declined,
  });
}
