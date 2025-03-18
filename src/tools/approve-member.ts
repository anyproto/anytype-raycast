import { updateMember } from "../api/updateMember";
import { MemberRole, MemberStatus } from "../models";

type Input = {
  /**
   * The unique identifier of the space to approve the member to.
   * This value can be obtained from the `getSpaces` tool.
   * */
  spaceId: string;

  /**
   * The unique identity of the member to approve (note: this is different from the id, which has a prefix `_participant`).
   * This value can be obtained from the `get-members` tool.
   */
  memberIdentity: string;

  /**
   * The role to assign to the member.
   */
  role: MemberRole.Viewer | MemberRole.Editor;
};

/**
 * Approve a joining member to a space.
 * This function approves a member to a space and assigns a role to them.
 */
export default async function tool({ spaceId, memberIdentity, role }: Input) {
  const response = await updateMember(spaceId, memberIdentity, {
    status: MemberStatus.Active,
    role: role,
  });

  if (!response.member) {
    throw new Error("Failed to approve member");
  }

  return {
    object: response.member.object,
    name: response.member.name,
    id: response.member.id,
    identity: response.member.identity,
    global_name: response.member.global_name,
    status: response.member.status,
    role: response.member.role,
  };
}
