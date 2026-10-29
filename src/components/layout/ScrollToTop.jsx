/* Scroll To Top */
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Every new page starts at the top, unless the link points at a section.
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}
