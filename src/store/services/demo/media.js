/* Demo Media Store */
// Photos and PDFs uploaded while running on demo data. They live in this
// browser's IndexedDB (localStorage holds about 5 MB, a handful of photos),
// under addresses like "demo-media:ab12cd3", which <Media> turns back into a
// picture. With the API set, uploads go to object storage instead and these
// addresses never appear.

const DB = "domease-media";
const STORE = "files";
export const DEMO_PREFIX = "demo-media:";

let opening;
function open() {
  opening ??= new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return opening;
}

async function run(mode, fn) {
  const db = await open();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const req = fn(tx.objectStore(STORE));
    tx.oncomplete = () => resolve(req.result);
    tx.onerror = () => reject(tx.error);
  });
}

/** Keep a file; returns its demo address. */
export async function putMedia(blob) {
  const id = Math.random().toString(36).slice(2, 11);
  await run("readwrite", (s) => s.put(blob, id));
  return `${DEMO_PREFIX}${id}`;
}

/** The file behind a demo address, or null when this browser no longer has it. */
export async function getMedia(address) {
  try {
    return (await run("readonly", (s) => s.get(address.slice(DEMO_PREFIX.length)))) ?? null;
  } catch {
    return null;
  }
}

export const isDemoMedia = (src) => typeof src === "string" && src.startsWith(DEMO_PREFIX);
