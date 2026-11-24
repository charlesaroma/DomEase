/* Uploads */
import { http } from "./api/client";
import { routes } from "./api/routes";
import { putMedia } from "./demo/media";
import { DEMO } from "./mode";

/**
 * Send a file (already resized, for photos) and get back where it lives.
 *   API:  POST /admin/uploads, multipart { file, folder } → { url, width, height }
 *         The API puts it in object storage and returns its public address.
 *   Demo: kept in this browser's IndexedDB, as a "demo-media:" address.
 * `folder` groups files in storage: recipes, sponsored, guides, content.
 */
export async function upload(file, { folder, width, height } = {}) {
  if (DEMO) return { url: await putMedia(file), width, height };
  const body = new FormData();
  body.append("file", file, file.name ?? `upload.${(file.type.split("/")[1] ?? "bin").replace("jpeg", "jpg")}`);
  if (folder) body.append("folder", folder);
  return http(routes.uploads, { method: "POST", body });
}
