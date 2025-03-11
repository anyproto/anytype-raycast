import { displayCode } from "../api/displayCode";
import { apiAppName } from "../helpers/constant";
import { DisplayCodeResponse } from "../helpers/schema";

/**
 * Start pairing with the Anytype desktop app.
 * Shows a 4-digit code in popup of the Anytype desktop app that user needs to enter in the extension.
 * Should be called when API authorization fails because of missing or invalid token.
 */
export default async function tool(): Promise<DisplayCodeResponse> {
  return await displayCode(apiAppName);
}
