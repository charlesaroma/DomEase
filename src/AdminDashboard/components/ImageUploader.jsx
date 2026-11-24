/* Image Uploader */
import { ArrowLeft, ArrowRight, ImagePlus, LoaderCircle, Star, Trash2 } from "lucide-react";
import { useId, useRef, useState } from "react";

import Media from "@/components/ui/Media";
import { useUpload } from "@/store/queries/admin";
import { cn } from "@/utils/cn";

import { MAX_PHOTO_MB, resizePhoto } from "../lib/media";

/**
 * Photos for a record: pick or drop them, they are resized in the browser
 * (WebP, `maxWidth`), uploaded, and previewed at the shape the app shows
 * them. The first photo is the cover. Each has alt text for screen readers.
 *
 *   value     [{ url, alt, width, height }]
 *   onChange  (photos) => void
 *   max       how many it may hold (1 for a single photo)
 *   folder    where the API files them: recipes, sponsored, content
 *   aspect    Tailwind aspect class matching where it is shown
 */
export default function ImageUploader({ value = [], onChange, max = 1, folder, aspect = "aspect-[4/3]", label = "Photos", hint, altFrom = "" }) {
  const input = useRef(null);
  const id = useId();
  const upload = useUpload();
  const [busy, setBusy] = useState(0);
  const [error, setError] = useState("");
  const [over, setOver] = useState(false);
  const room = max - value.length;

  async function add(files) {
    setError("");
    const picked = [...files].filter((f) => f.type.startsWith("image/")).slice(0, Math.max(0, room));
    if (!picked.length) {
      if (files.length) setError(room > 0 ? "Choose a JPG, PNG or WebP photo." : `This holds ${max} photo${max === 1 ? "" : "s"}. Remove one first.`);
      return;
    }
    setBusy(picked.length);
    const added = [];
    for (const file of picked) {
      try {
        if (file.size > MAX_PHOTO_MB * 1048576) throw new Error(`${file.name} is over ${MAX_PHOTO_MB} MB.`);
        const { blob, width, height } = await resizePhoto(file);
        const res = await upload.mutateAsync({ file: blob, folder, width, height });
        added.push({ url: res.url, alt: altFrom, width: res.width ?? width, height: res.height ?? height });
      } catch (e) {
        setError(e.message || "That photo could not be uploaded.");
      }
      setBusy((n) => n - 1);
    }
    if (added.length) onChange(max === 1 ? added.slice(0, 1) : [...value, ...added]);
  }

  const move = (i, by) => {
    const next = [...value];
    [next[i], next[i + by]] = [next[i + by], next[i]];
    onChange(next);
  };
  const setAlt = (i, alt) => onChange(value.map((p, j) => (j === i ? { ...p, alt } : p)));

  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="text-sm font-medium" id={`${id}-label`}>
          {label}
        </span>
        {max > 1 && (
          <span className="text-xs text-ink-2">
            {value.length} of {max}
          </span>
        )}
      </div>

      <ul className={cn("grid gap-3", max > 1 ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-1")} aria-labelledby={`${id}-label`}>
        {value.map((p, i) => (
          <li key={p.url} className="overflow-hidden rounded-r-md border border-line bg-white">
            <div className={cn("relative", aspect)}>
              <Media src={p.url} alt={p.alt} className="absolute inset-0 size-full" fallback={<div className="absolute inset-0 bg-paper-2" />} />
              {i === 0 && max > 1 && (
                <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-r-pill bg-ink/80 px-2 py-0.5 text-xs text-white">
                  <Star className="size-3" aria-hidden="true" /> Cover
                </span>
              )}
              <div className="absolute top-2 right-2 flex gap-1">
                {max > 1 && i > 0 && (
                  <IconButton label="Move earlier" onClick={() => move(i, -1)}>
                    <ArrowLeft className="size-4" />
                  </IconButton>
                )}
                {max > 1 && i < value.length - 1 && (
                  <IconButton label="Move later" onClick={() => move(i, 1)}>
                    <ArrowRight className="size-4" />
                  </IconButton>
                )}
                <IconButton label="Remove photo" danger onClick={() => onChange(value.filter((_, j) => j !== i))}>
                  <Trash2 className="size-4" />
                </IconButton>
              </div>
            </div>
            <input
              value={p.alt ?? ""}
              onChange={(e) => setAlt(i, e.target.value)}
              placeholder="Describe the photo"
              aria-label={`Description of photo ${i + 1}`}
              className="w-full border-t border-line px-3 py-2 text-sm outline-none focus:bg-paper"
            />
          </li>
        ))}

        {room > 0 && (
          <li>
            <button
              type="button"
              onClick={() => input.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setOver(true);
              }}
              onDragLeave={() => setOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setOver(false);
                add(e.dataTransfer.files);
              }}
              disabled={busy > 0}
              className={cn(
                "flex w-full flex-col items-center justify-center gap-2 rounded-r-md border-2 border-dashed p-4 text-center text-sm transition-colors",
                aspect,
                over ? "border-clay-700 bg-clay-100/50" : "border-line-2 text-ink-2 hover:border-clay-700 hover:text-clay-700",
              )}
            >
              {busy > 0 ? <LoaderCircle className="size-6 animate-spin" aria-hidden="true" /> : <ImagePlus className="size-6" aria-hidden="true" />}
              <span className="font-medium">{busy > 0 ? "Uploading" : value.length ? "Add another" : "Add a photo"}</span>
              <span className="text-xs text-ink-3">Drop here or choose. JPG, PNG or WebP.</span>
            </button>
          </li>
        )}
      </ul>

      <input
        ref={input}
        type="file"
        accept="image/*"
        multiple={max > 1}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(e) => {
          add(e.target.files);
          e.target.value = "";
        }}
      />
      {error && (
        <p className="mt-2 text-sm text-danger" role="alert">
          {error}
        </p>
      )}
      {hint && !error && <p className="mt-2 text-xs text-ink-2">{hint}</p>}
    </div>
  );
}

function IconButton({ label, danger, children, ...props }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn("grid size-8 place-items-center rounded-r-pill bg-white/90 text-ink shadow-sh-1 hover:bg-white", danger && "hover:text-danger")}
      {...props}
    >
      {children}
    </button>
  );
}
