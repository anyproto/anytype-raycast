import { updateMember } from "../api/updateMember";
import { MemberRole, MemberStatus } from "../models";

type Input = {
  /**
   * The unique identifier of the space to approve the member to.
   * This value can be obtained from the `getSpaces` tool.
   * */
  spaceId: string;

  /**
   * The unique identifier of the member to approve.
   * This value can be obtained from the `get-members` tool.
   */
  memberId: string;

  /**
   * The role to assign to the member.
   */
  role: MemberRole.Reader | MemberRole.Writer;
};

/**
 * Approve a joining member to a space.
 * This function approves a member to a space and assigns a role to them.
 */
export default async function tool({ spaceId, memberId, role }: Input) {
  return await updateMember(spaceId, memberId, {
    status: MemberStatus.Active,
    role: role,
  });
}
