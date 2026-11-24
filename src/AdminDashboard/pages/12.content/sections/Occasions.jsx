/* Occasions */
import { Link } from "react-router-dom";

import { useOccasions, useRecipes, useSaveOccasion } from "@/store/queries/admin";

import { useNotify } from "../../../components/Notice";
import Panel from "../../../components/Panel";
import Toggle from "../../../components/Toggle";
import { plural } from "../../../lib/format";

// The special occasion menus (Premium, FR-MP-9). Switch one off out of
// season; its recipes stay in the library.
export default function Occasions() {
  const { data: occasions = [] } = useOccasions();
  const { data: recipes = [] } = useRecipes();
  const save = useSaveOccasion();
  const notify = useNotify();

  return (
    <Panel title="Occasion menus" padded={false}>
      <ul>
        {[...occasions]
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((o) => {
            const n = recipes.filter((r) => r.status === "published" && r.occasions?.includes(o.id)).length;
            return (
              <li key={o.id} className="flex items-center gap-4 border-b border-line px-5 py-4 last:border-0">
                <div className="flex-1">
                  <p className="font-medium">{o.name}</p>
                  <Link to={`/admin/recipes?occasion=${o.id}`} className={`text-sm hover:underline ${n ? "text-ink-2" : "text-danger"}`}>
                    {n ? plural(n, "recipe") : "No recipes yet: the menu shows empty"}
                  </Link>
                </div>
                <Toggle
                  label={`Show ${o.name}`}
                  checked={o.active}
                  onChange={(active) => save.mutate({ id: o.id, active }, { onSuccess: () => notify(active ? `${o.name} menu is showing.` : `${o.name} menu hidden.`) })}
                />
              </li>
            );
          })}
      </ul>
    </Panel>
  );
}
