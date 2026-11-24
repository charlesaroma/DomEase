/* Data Mode */
// With no API address set, every service reads and writes the demo database
// (store/services/demo/db.js), seeded from src/data/seed: the exact JSON the
// API will send (docs/05-api-contract.md). Set VITE_API_URL to switch to the
// real Node.js API; no page changes.
export const API_URL = import.meta.env.VITE_API_URL ?? "";
export const DEMO = !API_URL;
