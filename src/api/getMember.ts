import { mapMember } from "../mappers/members";
import { Member, RawMember } from "../models";
import { apiEndpoints, apiFetch, ErrorWithStatus } from "../utils";

export async function getMember(
  spaceId: string,
  objectId: string,
): Promise<{
  member: Member | null;
}> {
  const { url, method } = apiEndpoints.getMember(spaceId, objectId);
  try {
    const response = await apiFetch<{ member: RawMember }>(url, { method: method });
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
