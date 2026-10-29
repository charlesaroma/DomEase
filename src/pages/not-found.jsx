/* Not Found */
import Button from "@/components/ui/Button";
import pages from "@/data/pages.json";
import useSeo from "@/seo/useSeo";

const copy = pages.notFound;

export default function NotFound() {
  useSeo({ title: `${copy.title} | DomEase` });
  return (
    <section className="mx-auto flex max-w-xl flex-col items-center px-5 py-28 text-center">
      <img src="/logo/domease-mark.svg" alt="" width="905" height="790" className="h-24 w-auto" />
      <h1 className="mt-8 text-4xl font-bold">{copy.title}</h1>
      <p className="mt-4 text-lg text-ink-2">{copy.body}</p>
      <Button to="/" className="mt-8">
        {copy.cta}
      </Button>
    </section>
  );
}
