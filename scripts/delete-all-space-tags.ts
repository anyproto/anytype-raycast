/**
 * One-off: list every tag in a space (by name) for the built-in Tag property only (property key "tag"),
 * then delete them after typing DELETE.
 *
 * Usage:
 *   ANYTYPE_API_KEY=... npx tsx scripts/delete-all-space-tags.ts <spaceId>
 *   # or
 *   ANYTYPE_API_KEY=... ANYTYPE_SPACE_ID=<spaceId> npx tsx scripts/delete-all-space-tags.ts
 *
 * Env:
 *   ANYTYPE_API_URL — default http://127.0.0.1:31009
 *   ANYTYPE_API_KEY — Bearer token (required)
 *   ANYTYPE_SPACE_ID — optional if space id is passed as argv
 */

import { stdin as input, stdout as output } from "node:process";
import * as readline from "node:readline/promises";
import { encodeQueryParams } from "../src/utils/query";

const ANYTYPE_VERSION = "2025-11-08";
const PAGE = 100;
/** Built-in Tag relation property key (see `propKeys.tag` in src/utils/constant.ts). */
const BUILTIN_TAG_PROPERTY_KEY = "tag";

interface Pagination {
  total: number;
  offset: number;
  limit: number;
  has_more: boolean;
}

interface Paginated<T> {
  data: T[];
  pagination: Pagination;
}

interface RawProperty {
  id: string;
  key: string;
  name: string;
  format: string;
}

interface RawTag {
  id: string;
  key: string;
  name: string;
  color: string;
}

function getBaseUrl(): string {
  return process.env.ANYTYPE_API_URL?.trim() || "http://127.0.0.1:31009";
}

function getToken(): string {
  const t = process.env.ANYTYPE_API_KEY?.trim();
  if (!t) {
    throw new Error("Set ANYTYPE_API_KEY to your Anytype API bearer token.");
  }
  return t;
}

function getSpaceId(): string {
  const fromEnv = process.env.ANYTYPE_SPACE_ID?.trim();
  const fromArgv = process.argv[2]?.trim();
  const id = fromArgv || fromEnv;
  if (!id) {
    throw new Error("Pass space id as the first argument or set ANYTYPE_SPACE_ID.");
  }
  return id;
}

async function checkOk(res: Response): Promise<void> {
  if (res.ok) return;
  let detail = "";
  try {
    detail = (await res.text()) || "";
  } catch {
    /* ignore */
  }
  throw new Error(`API ${res.status} ${res.statusText}${detail ? `: ${detail}` : ""}`);
}

async function apiGetJson<T>(url: string, token: string): Promise<T> {
  const res = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "Anytype-Version": ANYTYPE_VERSION,
    },
  });
  await checkOk(res);
  return (await res.json()) as T;
}

async function apiDelete(url: string, token: string): Promise<void> {
  const res = await fetch(url, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "Anytype-Version": ANYTYPE_VERSION,
    },
  });
  await checkOk(res);
}

async function fetchAllProperties(baseUrl: string, spaceId: string, token: string): Promise<RawProperty[]> {
  const out: RawProperty[] = [];
  let offset = 0;
  let hasMore = true;
  while (hasMore) {
    const q = encodeQueryParams({ offset, limit: PAGE });
    const body = await apiGetJson<Paginated<RawProperty>>(`${baseUrl}/v1/spaces/${spaceId}/properties${q}`, token);
    out.push(...body.data);
    hasMore = body.pagination.has_more;
    offset += body.data.length;
  }
  return out;
}

async function fetchAllTagsForProperty(
  baseUrl: string,
  spaceId: string,
  propertyId: string,
  token: string,
): Promise<RawTag[]> {
  const out: RawTag[] = [];
  let offset = 0;
  let hasMore = true;
  while (hasMore) {
    const q = encodeQueryParams({ offset, limit: PAGE });
    const body = await apiGetJson<Paginated<RawTag>>(
      `${baseUrl}/v1/spaces/${spaceId}/properties/${propertyId}/tags${q}`,
      token,
    );
    out.push(...body.data);
    hasMore = body.pagination.has_more;
    offset += body.data.length;
  }
  return out;
}

async function main(): Promise<void> {
  const baseUrl = getBaseUrl().replace(/\/$/, "");
  const token = getToken();
  const spaceId = getSpaceId();

  const properties = await fetchAllProperties(baseUrl, spaceId, token);
  const tagProperty = properties.find((p) => p.key === BUILTIN_TAG_PROPERTY_KEY);

  if (!tagProperty) {
    console.log(`No built-in tag property (key "${BUILTIN_TAG_PROPERTY_KEY}") in this space.`);
    return;
  }

  const tags = await fetchAllTagsForProperty(baseUrl, spaceId, tagProperty.id, token);

  if (tags.length === 0) {
    console.log("Built-in tag property exists but it has no tags.");
    return;
  }

  console.log(`Space: ${spaceId}`);
  console.log(`Tag property: ${tagProperty.name || tagProperty.key} (${tagProperty.id})`);
  console.log(`Tags (${tags.length} total):\n`);
  for (const tag of tags) {
    console.log(`  ${tag.name}`);
  }

  const rl = readline.createInterface({ input, output });
  const answer = await rl.question(`\nType DELETE to remove all ${tags.length} tags (this cannot be undone): `);
  rl.close();

  if (answer.trim() !== "DELETE") {
    console.log("Aborted.");
    return;
  }

  let deleted = 0;
  for (const tag of tags) {
    const url = `${baseUrl}/v1/spaces/${spaceId}/properties/${tagProperty.id}/tags/${tag.id}`;
    await apiDelete(url, token);
    deleted += 1;
    console.log(`Deleted (${deleted}/${tags.length}): ${tag.name}`);
  }

  console.log("Done.");
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
