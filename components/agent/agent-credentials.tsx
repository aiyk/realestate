import { Award, Languages } from "lucide-react";

type Props = {
  languages: string[];
  credentials: string[];
  yearsOfExperience?: number | null;
};

export function AgentCredentials({
  languages,
  credentials,
  yearsOfExperience,
}: Props) {
  if (
    languages.length === 0 &&
    credentials.length === 0 &&
    !yearsOfExperience
  ) {
    return null;
  }
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {(languages.length > 0 || yearsOfExperience) && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
            Speaks
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {languages.map((l) => (
              <span
                key={l}
                className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-3 py-1 text-sm text-stone-700"
              >
                <Languages className="h-3 w-3" />
                {l}
              </span>
            ))}
            {yearsOfExperience ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-sm text-amber-800">
                {yearsOfExperience}+ years experience
              </span>
            ) : null}
          </div>
        </div>
      )}
      {credentials.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
            Credentials
          </p>
          <ul className="mt-3 space-y-1.5">
            {credentials.map((c) => (
              <li
                key={c}
                className="inline-flex items-center gap-2 text-sm text-stone-700"
              >
                <Award className="h-4 w-4 text-emerald-700" />
                {c}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
