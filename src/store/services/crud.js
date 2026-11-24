/* CRUD Service */
import { http } from "./api/client";
import { db, newId, now, reply } from "./demo/db";
import { DEMO } from "./mode";

/**
 * List, read, create, update and delete one collection, against the demo
 * database or the API. Every admin collection that is a plain list of records
 * goes through this, so they all behave the same way.
 */
export function crud(table, route, prefix) {
  const rows = () => db.get(table);
  return {
    list: () => (DEMO ? reply(rows()) : http(route)),
    get: (id) => (DEMO ? reply(rows().find((r) => r.id === id)) : http(`${route}/${id}`)),
    create(data) {
      if (!DEMO) return http(route, { method: "POST", body: data });
      const row = { ...data, id: newId(prefix), createdAt: now() };
      db.set(table, [row, ...rows()]);
      return reply(row);
    },
    update(id, data) {
      if (!DEMO) return http(`${route}/${id}`, { method: "PATCH", body: data });
      const next = rows().map((r) => (r.id === id ? { ...r, ...data, updatedAt: now() } : r));
      db.set(table, next);
      return reply(next.find((r) => r.id === id));
    },
    remove(id) {
      if (!DEMO) return http(`${route}/${id}`, { method: "DELETE" });
      db.set(table, rows().filter((r) => r.id !== id));
      return reply(null);
    },
  };
}
