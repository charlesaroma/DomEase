/* Scroll To Top */
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Every new page starts at the top, unless the link points at a section, in
// which case we scroll to it. Keyed on location.key so clicking the same link
// twice still scrolls. Pages are lazy, so the section may not be mounted yet:
// keep looking for a moment before giving up.
export default function ScrollToTop() {
  const { pathname, hash, key } = useLocation();
  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
      return;
    }
    const id = decodeURIComponent(hash.slice(1));
    let frame;
    const started = performance.now();
    const seek = () => {
      const target = document.getElementById(id);
      if (target) target.scrollIntoView();
      else if (performance.now() - started < 2000) frame = requestAnimationFrame(seek);
    };
    seek();
    return () => cancelAnimationFrame(frame);
  }, [pathname, hash, key]);
  return null;
}
