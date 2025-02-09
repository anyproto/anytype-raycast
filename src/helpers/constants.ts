import { getPreferenceValues } from "@raycast/api";
import { encodeQueryParams } from "./query";

// Strings
export const apiAppName = "raycast_v1_0125";
export const anytypeNetwork = "N83gJpVd9MuNRZAuJLZ7LiMntTThhPc6DtzWWVjb1M3PouVU";
export const errorConnectionMessage = "Can't connect to API. Please ensure Anytype is running and reachable.";

// URLs
export const apiUrl = "http://localhost:31009/v1";
export const downloadUrl = "https://download.anytype.io/";

// Numbers
export const apiLimit = getPreferenceValues().limit;
export const apiLimitMax = 1000;
export const iconWidth = 64;
export const maxPinnedObjects = 5;

// Local Storage Keys
export const localStorageKeys = {
  appKey: "app_key",
  pinnedSpaces: "pinned_spaces",
  pinnedObjectsWith(suffix: string): string {
    return `pinned_objects_${suffix}`;
  },
};

// API Endpoints
export const apiEndpoints = {
  createObject: (spaceId: string) => ({
    url: `${apiUrl}/spaces/${spaceId}/objects`,
    method: "POST",
  }),
  createSpace: {
    url: `${apiUrl}/spaces`,
    method: "POST",
  },
  deleteObject: (spaceId: string, objectId: string) => ({
    url: `${apiUrl}/spaces/${spaceId}/objects/${objectId}`,
    method: "DELETE",
  }),
  displayCode: (appName: string) => ({
    url: `${apiUrl}/auth/display_code?app_name=${appName}`,
    method: "POST",
  }),
  getExport: (spaceId: string, objectId: string, format: string) => ({
    url: `${apiUrl}/spaces/${spaceId}/objects/${objectId}/export/${format}`,
    method: "POST",
  }),
  // TODO: waiting for API to be implemented
  getMember: (spaceId: string, objectId: string) => ({
    url: `${apiUrl}/spaces/${spaceId}/members/${objectId}`,
    method: "GET",
  }),
  getMembers: (spaceId: string, options: { offset: number; limit: number }) => ({
    url: `${apiUrl}/spaces/${spaceId}/members${encodeQueryParams(options)}`,
    method: "GET",
  }),
  getObject: (spaceId: string, objectId: string) => ({
    url: `${apiUrl}/spaces/${spaceId}/objects/${objectId}`,
    method: "GET",
  }),
  getObjects: (spaceId: string, options: { offset: number; limit: number }) => ({
    url: `${apiUrl}/spaces/${spaceId}/objects${encodeQueryParams(options)}`,
    method: "GET",
  }),
  getSpaces: (options: { offset: number; limit: number }) => ({
    url: `${apiUrl}/spaces${encodeQueryParams(options)}`,
    method: "GET",
  }),
  getTemplates: (spaceId: string, typeId: string, options: { offset: number; limit: number }) => ({
    url: `${apiUrl}/spaces/${spaceId}/types/${typeId}/templates${encodeQueryParams(options)}`,
    method: "GET",
  }),
  getToken: (challengeId: string, code: string) => ({
    url: `${apiUrl}/auth/token?challenge_id=${challengeId}&code=${code}`,
    method: "POST",
  }),
  getType: (spaceId: string, typeId: string) => ({
    url: `${apiUrl}/spaces/${spaceId}/types/${typeId}`,
    method: "GET",
  }),
  getTypes: (spaceId: string, options: { offset: number; limit: number }) => ({
    url: `${apiUrl}/spaces/${spaceId}/types${encodeQueryParams(options)}`,
    method: "GET",
  }),
  globalSearch: (options: { offset: number; limit: number }) => ({
    url: `${apiUrl}/search${encodeQueryParams(options)}`,
    method: "POST",
  }),
  search: (spaceId: string, options: { offset: number; limit: number }) => ({
    url: `${apiUrl}/spaces/${spaceId}/search${encodeQueryParams(options)}`,
    method: "POST",
  }),
};
