import { getPreferenceValues } from "@raycast/api";
import { ViewType } from "../components";
import { encodeQueryParams } from "./query";

// Strings
export const apiAppName = "raycast_v1_0125";
export const anytypeNetwork = "N83gJpVd9MuNRZAuJLZ7LiMntTThhPc6DtzWWVjb1M3PouVU";
export const errorConnectionMessage = "Can't connect to API. Please ensure Anytype is running and reachable.";

// URLs
export const apiUrl = "http://localhost:31009/v1";
export const downloadUrl = "https://download.anytype.io/";
export const anytypeSpaceDeeplink = (spaceId: string) => `anytype://main/object/_blank_/space.id/${spaceId}`;

// Numbers
export const currentApiVersion = "2025-04-22";
export const apiLimit = getPreferenceValues().limit;
export const apiLimitMax = 1000;
export const iconWidth = 64;
export const maxPinnedObjects = 5;

// Local Storage Keys
export const localStorageKeys = {
  appKey: "app_key",
  suffixForSpaces: "spaces",
  suffixForGlobalSearch: "global_search",
  suffixForViewsPerSpace(spaceId: string, viewType: ViewType): string {
    return `${spaceId}_${viewType}`;
  },
  pinnedObjectsWith(suffix: string): string {
    return `pinned_objects_${suffix}`;
  },
};

export const apiKeyPrefixes = {
  properties: "",
  types: "ot-", // TODO: change to "type_" when API is updated
  tags: "",
};

// API Property/Type Keys
export const apiPropertyKeys = {
  description: `${apiKeyPrefixes.properties}description`,
  type: `${apiKeyPrefixes.properties}type`,
  createdDate: `${apiKeyPrefixes.properties}created_date`,
  lastModifiedDate: `${apiKeyPrefixes.properties}last_modified_date`,
  lastOpenedDate: `${apiKeyPrefixes.properties}last_opened_date`,
  addedDate: `${apiKeyPrefixes.properties}added_date`,
  lastModifiedBy: `${apiKeyPrefixes.properties}last_modified_by`,
};

export const apiTypeKeys = {};

// Colors
export const colorMap: { [key: string]: string } = {
  grey: "#b6b6b6",
  yellow: "#ecd91b",
  orange: "#ffb522",
  red: "#f55522",
  pink: "#e51ca0",
  purple: "#ab50cc",
  blue: "#3e58eb",
  ice: "#2aa7ee",
  teal: "#0fc8ba",
  lime: "#5dd400",
};
export const defaultTintColor = { light: "black", dark: "white" };

// API Endpoints
export const apiEndpoints = {
  // auth
  displayCode: (appName: string) => ({
    url: `${apiUrl}/auth/display_code?app_name=${appName}`,
    method: "POST",
  }),
  getToken: (challengeId: string, code: string) => ({
    url: `${apiUrl}/auth/token?challenge_id=${challengeId}&code=${code}`,
    method: "POST",
  }),

  // export
  getExport: (spaceId: string, objectId: string, format: string) => ({
    url: `${apiUrl}/spaces/${spaceId}/objects/${objectId}/${format}`,
    method: "GET",
  }),

  // lists
  getListViews: (spaceId: string, listId: string, options: { offset: number; limit: number }) => ({
    url: `${apiUrl}/spaces/${spaceId}/lists/${listId}/views${encodeQueryParams(options)}`,
    method: "GET",
  }),
  getObjectsInList: (spaceId: string, listId: string, viewId: string, options: { offset: number; limit: number }) => ({
    url: `${apiUrl}/spaces/${spaceId}/lists/${listId}/${viewId}/objects${encodeQueryParams(options)}`,
    method: "GET",
  }),
  addObjectsToList: (spaceId: string, listId: string) => ({
    url: `${apiUrl}/spaces/${spaceId}/lists/${listId}/objects`,
    method: "POST",
  }),
  removeObjectsFromList: (spaceId: string, listId: string, objectId: string) => ({
    url: `${apiUrl}/spaces/${spaceId}/lists/${listId}/objects/${objectId}`,
    method: "DELETE",
  }),

  // objects
  getObject: (spaceId: string, objectId: string) => ({
    url: `${apiUrl}/spaces/${spaceId}/objects/${objectId}`,
    method: "GET",
  }),
  getObjects: (spaceId: string, options: { offset: number; limit: number }) => ({
    url: `${apiUrl}/spaces/${spaceId}/objects${encodeQueryParams(options)}`,
    method: "GET",
  }),
  createObject: (spaceId: string) => ({
    url: `${apiUrl}/spaces/${spaceId}/objects`,
    method: "POST",
  }),
  deleteObject: (spaceId: string, objectId: string) => ({
    url: `${apiUrl}/spaces/${spaceId}/objects/${objectId}`,
    method: "DELETE",
  }),

  // properties
  getProperties: (spaceId: string, options: { offset: number; limit: number }) => ({
    url: `${apiUrl}/spaces/${spaceId}/properties${encodeQueryParams(options)}`,
    method: "GET",
  }),
  getProperty: (spaceId: string, propertyId: string) => ({
    url: `${apiUrl}/spaces/${spaceId}/properties/${propertyId}`,
    method: "GET",
  }),
  createProperty: (spaceId: string) => ({
    url: `${apiUrl}/spaces/${spaceId}/properties`,
    method: "POST",
  }),
  updateProperty: (spaceId: string, propertyId: string) => ({
    url: `${apiUrl}/spaces/${spaceId}/properties/${propertyId}`,
    method: "PATCH",
  }),
  deleteProperty: (spaceId: string, propertyId: string) => ({
    url: `${apiUrl}/spaces/${spaceId}/properties/${propertyId}`,
    method: "DELETE",
  }),

  // tags
  getTags: (spaceId: string, propertyId: string, options: { offset: number; limit: number }) => ({
    url: `${apiUrl}/spaces/${spaceId}/properties/${propertyId}/tags${encodeQueryParams(options)}`,
    method: "GET",
  }),
  getTag: (spaceId: string, propertyId: string, tagId: string) => ({
    url: `${apiUrl}/spaces/${spaceId}/properties/${propertyId}/tags/${tagId}`,
    method: "GET",
  }),

  // search
  globalSearch: (options: { offset: number; limit: number }) => ({
    url: `${apiUrl}/search${encodeQueryParams(options)}`,
    method: "POST",
  }),
  search: (spaceId: string, options: { offset: number; limit: number }) => ({
    url: `${apiUrl}/spaces/${spaceId}/search${encodeQueryParams(options)}`,
    method: "POST",
  }),

  // spaces
  createSpace: {
    url: `${apiUrl}/spaces`,
    method: "POST",
  },
  getSpace: (spaceId: string) => ({
    url: `${apiUrl}/spaces/${spaceId}`,
    method: "GET",
  }),
  getSpaces: (options: { offset: number; limit: number }) => ({
    url: `${apiUrl}/spaces${encodeQueryParams(options)}`,
    method: "GET",
  }),

  // members
  getMember: (spaceId: string, objectId: string) => ({
    url: `${apiUrl}/spaces/${spaceId}/members/${objectId}`,
    method: "GET",
  }),
  getMembers: (spaceId: string, options: { offset: number; limit: number }) => ({
    url: `${apiUrl}/spaces/${spaceId}/members${encodeQueryParams(options)}`,
    method: "GET",
  }),
  //! Member management not enabled yet
  updateMember: (spaceId: string, objectId: string) => ({
    url: `${apiUrl}/spaces/${spaceId}/members/${objectId}`,
    method: "PATCH",
  }),

  // types
  getType: (spaceId: string, typeId: string) => ({
    url: `${apiUrl}/spaces/${spaceId}/types/${typeId}`,
    method: "GET",
  }),
  getTypes: (spaceId: string, options: { offset: number; limit: number }) => ({
    url: `${apiUrl}/spaces/${spaceId}/types${encodeQueryParams(options)}`,
    method: "GET",
  }),

  // templates
  getTemplate: (spaceId: string, typeId: string, templateId: string) => ({
    url: `${apiUrl}/spaces/${spaceId}/types/${typeId}/templates/${templateId}`,
    method: "GET",
  }),
  getTemplates: (spaceId: string, typeId: string, options: { offset: number; limit: number }) => ({
    url: `${apiUrl}/spaces/${spaceId}/types/${typeId}/templates${encodeQueryParams(options)}`,
    method: "GET",
  }),
};
