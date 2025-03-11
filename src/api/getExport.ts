import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { apiFetch } from "../helpers/api";
import { apiEndpoints } from "../helpers/constant";
import { Export, ObjectExport } from "../helpers/schema";

export async function getExport(spaceId: string, objectId: string, format: string): Promise<Export> {
  const tmpdir = os.tmpdir();
  const { url, method } = apiEndpoints.getExport(spaceId, objectId, format);

  const response = await apiFetch<ObjectExport>(url, {
    method: method,
    body: JSON.stringify({ path: tmpdir }),
  });

  // Find markdown file in the output directory
  const outputPath = response.payload.path;
  const mdFiles = fs.readdirSync(outputPath).filter((file) => file.endsWith(".md"));
  if (mdFiles.length === 0) throw new Error("Markdown file not found in export .");
  if (mdFiles.length > 1) throw new Error("Multiple markdown files found in export.");
  const mdFile = mdFiles[0];

  // Read markdown file and replace relative image paths with absolute paths
  const markdown = fs.readFileSync(path.join(outputPath, mdFile), "utf8");
  const re = /\(files\/([^)]+)\)/g;
  const result = markdown.replace(re, `(file://${path.join(outputPath, "files", "$1")})`);

  return { markdown: result };
}
