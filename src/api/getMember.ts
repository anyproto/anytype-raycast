import { apiFetch } from "../helpers/api";
import { apiEndpoints } from "../helpers/constants";
import { ErrorWithStatus } from "../helpers/errors";
import { DisplayMember, Member } from "../helpers/schemas";
import { mapMember } from "../mappers/members";

export async function getMember(
  spaceId: string,
  objectId: string,
): Promise<{
  member: DisplayMember | null;
}> {
  const { url, method } = apiEndpoints.getMember(spaceId, objectId);
  try {
    const response = await apiFetch<{ member: Member }>(url, { method: method });
    return {
      member: response ? await mapMember(response.payload.member) : null,
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes("404")) {
      (error as ErrorWithStatus).status = 404;
    }
    throw error;
  }
}
