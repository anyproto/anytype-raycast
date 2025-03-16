import { updateMember } from "../api/updateMember";
import { MemberRole, MemberStatus } from "../models";

type Input = {
  /**
   * The unique identifier of the space to update the member role in.
   * This value can be obtained from the `getSpaces` tool.
   * */
  spaceId: string;

  /**
   * The unique identifier of the member to update the role of.
   * This value can be obtained from the `get-members` tool.
   */
  memberId: string;

  /**
   * The new role to assign to the member.
   */
  role: MemberRole.Reader | MemberRole.Writer;
};

/**
 * Update the role of an active member in a space.
 */
export default async function tool({ spaceId, memberId, role }: Input) {
  return await updateMember(spaceId, memberId, {
    status: MemberStatus.Active,
    role: role,
  });
}
