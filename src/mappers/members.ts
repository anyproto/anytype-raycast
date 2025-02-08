import { Icon } from "@raycast/api";
import { getIcon } from "../helpers/icon";
import { Member } from "../helpers/schemas";

/**
 * Map raw `Member` objects from the API into display-ready data (e.g., icon).
 * @param members The raw `Member` objects from the API.
 * @returns The display-ready `Member` objects.
 */
export async function mapMembers(members: Member[]): Promise<Member[]> {
  return Promise.all(
    members.map(async (member) => {
      return mapMember(member);
    }),
  );
}

/**
 * Map a raw `Member` object from the API into display-ready data (e.g., icon).
 * @param member The raw `Member` object from the API.
 * @returns The display-ready `Member` object.
 */
export async function mapMember(member: Member): Promise<Member> {
  const icon = (await getIcon(member.icon)) || Icon.PersonCircle;
  return {
    ...member,
    name: member.name || "Untitled",
    icon,
  };
}
