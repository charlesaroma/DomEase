/* Page SEO */
import { useEffect } from "react";

// Sets the document title and description for the current page.
export default function useSeo({ title, description }) {
  useEffect(() => {
    if (title) document.title = title;
    if (description) document.querySelector('meta[name="description"]')?.setAttribute("content", description);
  }, [title, description]);
}
