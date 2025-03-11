import { showToast, Toast } from "@raycast/api";
import semver from "semver";
import { PaginatedResponse, Space } from "../helpers/schema";
import { apiFetch } from "../utils/api";
import { apiEndpoints, currentApiVersion, errorConnectionMessage } from "../utils/constant";

// Validate api version and token by checking if data can be fetched without errors
export async function checkApiTokenValidity(): Promise<boolean> {
  try {
    const { url, method } = apiEndpoints.getSpaces({ offset: 0, limit: 1 });
    const response = await apiFetch<PaginatedResponse<Space>>(url, { method: method });

    const apiVersion = response.headers.get("X-API-Version");
    if (apiVersion) {
      if (semver.gt(apiVersion, currentApiVersion)) {
        showToast(
          Toast.Style.Failure,
          "Extension Update Required",
          `Please update the extension to match the Anytype app's API version ${apiVersion}.`,
        );
      } else if (semver.lt(apiVersion, currentApiVersion)) {
        showToast(
          Toast.Style.Failure,
          "App Update Required",
          `Please update the Anytype app to match the extension's API version ${currentApiVersion}.`,
        );
      }
    }
    return true;
  } catch (error) {
    if (error instanceof Error) {
      return error.message == errorConnectionMessage;
    } else {
      console.error("Unknown error:", error);
      return false;
    }
  }
}
