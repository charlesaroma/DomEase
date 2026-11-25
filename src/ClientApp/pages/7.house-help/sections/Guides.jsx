/* Guides */
import { FileText } from "lucide-react";

import Media, { useMediaUrl } from "@/components/ui/Media";
import { useAppGuides } from "@/store/queries/app";
import { cn } from "@/utils/cn";

/** The guides the admin uploads: read in the browser as PDFs. */
export default function Guides() {
  const { data: guides = [] } = useAppGuides();
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {guides.map((g) => (
        <Guide key={g.id} guide={g} />
      ))}
    </ul>
  );
}

function Guide({ guide: g }) {
  const href = useMediaUrl(g.fileUrl);
  return (
    <li>
      <a
        href={href ?? undefined}
        target="_blank"
        rel="noreferrer"
        aria-disabled={!href}
        className={cn("flex gap-4 rounded-r-card bg-white p-4 shadow-sh-1", href ? "hover:shadow-sh-2" : "pointer-events-none opacity-60")}
      >
        <Media
          src={g.cover?.url}
          alt=""
          className="h-16 w-12 shrink-0 rounded-r-sm"
          fallback={
            <span className="grid size-12 shrink-0 place-items-center rounded-r-md bg-clay-100 text-clay-700">
              <FileText className="size-6" aria-hidden="true" />
            </span>
          }
        />
        <span>
          <span className="block font-semibold">{g.title}</span>
          <span className="block text-sm text-ink-2">{g.summary}</span>
          <span className="mt-1 block text-xs text-ink-3">{href ? `${g.pages} pages · PDF` : "Coming soon"}</span>
        </span>
      </a>
    </li>
  );
}
