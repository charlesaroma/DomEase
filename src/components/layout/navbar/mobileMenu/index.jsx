/* Mobile Menu */
import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import site from "@/data/site.json";

// The nav links on phones: a button that drops a panel under the header.
// Closes on a link, Escape, a tap outside, or the screen widening past md.
export default function MobileMenu() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    const onPointer = (e) => !rootRef.current?.contains(e.target) && setOpen(false);
    const wide = window.matchMedia("(min-width: 48rem)");
    const onWide = (e) => e.matches && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    wide.addEventListener("change", onWide);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
      wide.removeEventListener("change", onWide);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Close menu" : "Open menu"}
        className="grid size-11 place-items-center rounded-r-pill text-ink hover:bg-paper-2"
      >
        {open ? <X className="size-6" strokeWidth={1.75} /> : <Menu className="size-6" strokeWidth={1.75} />}
      </button>
      {open && (
        <div id="mobile-menu" className="absolute inset-x-0 top-full border-b border-line bg-white px-5 pb-6 shadow-sh-2">
          <ul>
            {site.nav.map((item) => (
              <li key={item.label}>
                <Link to={item.to} onClick={() => setOpen(false)} className="block border-b border-line py-4 font-display text-lg text-ink">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
