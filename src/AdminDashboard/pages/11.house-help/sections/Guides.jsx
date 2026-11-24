/* Guides */
import { FileText, Plus } from "lucide-react";

import Media from "@/components/ui/Media";
import { useState } from "react";

import Button from "@/components/ui/Button";
import { useDeleteGuide, useGuides, useSaveGuide } from "@/store/queries/admin";

import Drawer from "../../../components/Drawer";
import { Field, Input, Textarea } from "../../../components/Field";
import FileUploader from "../../../components/FileUploader";
import ImageUploader from "../../../components/ImageUploader";
import { useNotify } from "../../../components/Notice";
import { date } from "../../../lib/format";

// The PDFs are uploaded here to object storage, so a guide can be replaced
// without an app release (PRD 12.1). Households open them from House Help.
export default function Guides() {
  const { data: guides = [] } = useGuides();
  const save = useSaveGuide();
  const remove = useDeleteGuide();
  const notify = useNotify();
  const [form, setForm] = useState(null);

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        {guides.map((g) => (
          <button
            key={g.id}
            type="button"
            onClick={() => setForm(g)}
            className="flex gap-4 rounded-r-card border border-line bg-white p-5 text-left hover:border-clay-400"
          >
            <Media
              src={g.cover?.url}
              alt=""
              className="h-16 w-12 shrink-0 rounded-r-sm"
              fallback={
                <span className="grid size-12 shrink-0 place-items-center rounded-r-md bg-clay-100 text-clay-700">
                  <FileText className="size-6" strokeWidth={1.75} aria-hidden="true" />
                </span>
              }
            />
            <span>
              <span className="block font-semibold">{g.title}</span>
              <span className="mt-1 block text-[15px] text-ink-2">{g.summary}</span>
              <span className="mt-2 block text-sm text-ink-3">
                {g.pages} pages · updated {date(g.updatedAt ?? g.createdAt)}
                {!g.fileUrl && <span className="ml-2 text-danger">No PDF yet</span>}
              </span>
            </span>
          </button>
        ))}
        <button
          type="button"
          onClick={() => setForm({ title: "", summary: "", pages: 1, fileUrl: "", cover: null })}
          className="flex items-center justify-center gap-2 rounded-r-card border border-dashed border-line-2 p-5 text-ink-2 hover:border-clay-700 hover:text-clay-700"
        >
          <Plus className="size-5" /> Add a guide
        </button>
      </div>

      <Drawer
        open={!!form}
        title={form?.id ? form.title : "Add a guide"}
        onClose={() => setForm(null)}
        footer={
          <>
            {form?.id && (
              <Button
                variant="ghost"
                className="mr-auto text-danger"
                onClick={() => {
                  if (window.confirm(`Remove ${form.title}?`)) remove.mutate(form.id, { onSuccess: () => setForm(null) });
                }}
              >
                Remove
              </Button>
            )}
            <Button variant="ghost" onClick={() => setForm(null)}>
              Cancel
            </Button>
            <Button
              disabled={!form?.title?.trim() || save.isPending}
              onClick={() =>
                save.mutate(form, {
                  onSuccess: () => {
                    notify("Guide saved.");
                    setForm(null);
                  },
                })
              }
            >
              Save
            </Button>
          </>
        }
      >
        {form && (
          <div className="space-y-5">
            <Field label="Title">
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </Field>
            <Field label="Summary">
              <Textarea value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} />
            </Field>
            <FileUploader
              label="The guide (PDF)"
              folder="guides"
              value={form.fileUrl}
              onChange={(fileUrl) => setForm({ ...form, fileUrl })}
              hint="Up to 20 MB. Uploading a new file replaces it for every household straight away."
            />
            <Field label="Pages" className="max-w-32">
              <Input type="number" min="1" value={form.pages} onChange={(e) => setForm({ ...form, pages: Number(e.target.value) })} />
            </Field>
            <ImageUploader
              label="Cover (optional)"
              folder="guides"
              aspect="aspect-[3/4]"
              altFrom={form.title}
              value={form.cover ? [form.cover] : []}
              onChange={(list) => setForm({ ...form, cover: list[0] ?? null })}
              hint="Shown beside the guide in House Help. The first page works well."
            />
          </div>
        )}
      </Drawer>
    </>
  );
}
