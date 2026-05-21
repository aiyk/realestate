import { ChevronDown } from "lucide-react";

type Faq = { question: string; answer: string };

type Props = {
  faqs: Faq[];
};

export function AgentFaqAccordion({ faqs }: Props) {
  if (faqs.length === 0) return null;
  return (
    <div className="space-y-2">
      {faqs.map((f, i) => (
        <details
          key={i}
          className="group rounded-2xl border border-stone-200 bg-white px-5 py-3 open:shadow-sm"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-left text-sm font-semibold text-stone-900">
            {f.question}
            <ChevronDown className="h-4 w-4 text-stone-500 transition group-open:rotate-180" />
          </summary>
          <p className="mt-2 whitespace-pre-line text-sm text-stone-700">
            {f.answer}
          </p>
        </details>
      ))}
    </div>
  );
}
