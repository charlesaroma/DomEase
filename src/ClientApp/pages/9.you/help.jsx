/* Help */
import { Bug, ChevronDown, Lightbulb, Mail } from "lucide-react";
import { useState } from "react";

import Button from "@/components/ui/Button";
import { useAppFaqs, useAppSettings, useSendReport } from "@/store/queries/app";

import Screen from "../../components/Screen";
import Sheet, { TextField } from "../../components/Sheet";
import { useToast } from "../../components/Toast";

// The questions households ask most (managed in the admin), and a way to
// tell us about a problem or an idea; both reach the admin's Inbox.
export default function Help() {
  const { data: faqs = [] } = useAppFaqs();
  const { data: settings } = useAppSettings();
  const [topic, setTopic] = useState(null);

  return (
    <Screen back="/app/you" title="Help">
      <ul className="divide-y divide-line rounded-r-card bg-white shadow-sh-1">
        {faqs.map((f) => (
          <li key={f.id}>
            <details className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-medium">
                {f.question}
                <ChevronDown className="size-5 shrink-0 text-ink-3 transition-transform group-open:rotate-180" aria-hidden="true" />
              </summary>
              <p className="px-5 pb-5 text-ink-2">{f.answer}</p>
            </details>
          </li>
        ))}
      </ul>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <Action icon={Bug} label="Report a problem" onClick={() => setTopic("problem")} />
        <Action icon={Lightbulb} label="Share an idea" onClick={() => setTopic("idea")} />
        {settings?.supportEmail && <Action icon={Mail} label="Email us" href={`mailto:${settings.supportEmail}`} />}
      </div>

      <ReportSheet topic={topic} onClose={() => setTopic(null)} />
    </Screen>
  );
}

function Action({ icon: Icon, label, ...props }) {
  const Tag = props.href ? "a" : "button";
  return (
    <Tag {...(props.href ? {} : { type: "button" })} {...props} className="flex items-center gap-3 rounded-r-card bg-white p-4 text-left shadow-sh-1 hover:shadow-sh-2">
      <Icon className="size-5 text-clay-700" aria-hidden="true" />
      <span className="font-medium">{label}</span>
    </Tag>
  );
}

function ReportSheet({ topic, onClose }) {
  const send = useSendReport();
  const toast = useToast();
  const [message, setMessage] = useState("");
  return (
    <Sheet
      open={!!topic}
      onClose={onClose}
      title={topic === "idea" ? "Share an idea" : "Report a problem"}
      footer={
        <Button
          className="w-full"
          disabled={message.trim().length < 5 || send.isPending}
          onClick={() =>
            send.mutate(
              { topic, message: message.trim() },
              {
                onSuccess: () => {
                  toast("Thank you. We read every one.");
                  setMessage("");
                  onClose();
                },
              },
            )
          }
        >
          Send
        </Button>
      }
    >
      <TextField
        label={topic === "idea" ? "What would make DomEase better?" : "What happened?"}
        multiline
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        hint={topic === "problem" ? "What you tapped, and what you expected." : undefined}
      />
    </Sheet>
  );
}
