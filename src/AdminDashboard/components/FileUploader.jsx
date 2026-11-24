/* File Uploader */
import { FileText, LoaderCircle, Upload, X } from "lucide-react";
import { useRef, useState } from "react";

import { useMediaUrl } from "@/components/ui/Media";
import { useUpload } from "@/store/queries/admin";

import { MAX_PDF_MB } from "../lib/media";

/**
 * One document, a PDF by default (House Help guides). Uploads it and hands
 * back its address; shows the current file with a link to open it.
 *   value     the stored address
 *   onChange  (url, { name, size }) => void
 */
export default function FileUploader({ value, onChange, folder, accept = "application/pdf", label = "File", hint }) {
  const input = useRef(null);
  const upload = useUpload();
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const href = useMediaUrl(value);

  async function pick(file) {
    if (!file) return;
    setError("");
    if (accept === "application/pdf" && file.type !== "application/pdf") return setError("Choose a PDF.");
    if (file.size > MAX_PDF_MB * 1048576) return setError(`That file is over ${MAX_PDF_MB} MB.`);
    try {
      const res = await upload.mutateAsync({ file, folder });
      setName(file.name);
      onChange(res.url, { name: file.name, size: file.size });
    } catch (e) {
      setError(e.message || "That file could not be uploaded.");
    }
  }

  return (
    <div>
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      <div className="flex items-center gap-3 rounded-r-md border border-line bg-white px-3.5 py-3">
        <FileText className="size-5 shrink-0 text-clay-700" aria-hidden="true" />
        <div className="min-w-0 flex-1 text-[15px]">
          {value ? (
            <a href={href ?? undefined} target="_blank" rel="noreferrer" className="block truncate text-clay-800 underline-offset-2 hover:underline">
              {name || value.split("/").pop()}
            </a>
          ) : (
            <span className="text-ink-2">No file yet</span>
          )}
        </div>
        {value && (
          <button type="button" onClick={() => onChange("", null)} aria-label="Remove file" className="grid size-8 place-items-center rounded-r-pill text-ink-2 hover:bg-danger-100 hover:text-danger">
            <X className="size-4" />
          </button>
        )}
        <button
          type="button"
          onClick={() => input.current?.click()}
          disabled={upload.isPending}
          className="inline-flex h-9 items-center gap-2 rounded-r-pill border border-line-2 px-3.5 text-sm font-medium hover:border-clay-700 hover:text-clay-700 disabled:opacity-60"
        >
          {upload.isPending ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <Upload className="size-4" aria-hidden="true" />}
          {upload.isPending ? "Uploading" : value ? "Replace" : "Upload"}
        </button>
      </div>
      <input
        ref={input}
        type="file"
        accept={accept}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(e) => {
          pick(e.target.files?.[0]);
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
