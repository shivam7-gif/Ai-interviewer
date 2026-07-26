import { useState } from "react";
import { Copy, Check, Bookmark, ImageIcon, Flag } from "lucide-react";

// ---------- Types ----------

interface SampleCase {
  input: string;
  output: string;
  explanation?: string;
}

interface ProblemDashboardProps {
  problem?: {
    title: string;
    source: string;
    difficulty: "Easy" | "Medium" | "Hard";
    acceptance: number;
    tags: string[];
    description: string;
    inputFormat: string[];
    outputFormat: string;
    constraints: string[];
    samples: SampleCase[];
  };
}

// ---------- Default content (from the OA screenshot) ----------

const defaultProblem: ProblemDashboardProps["problem"] = {
  title: "Breakfast",
  source: "Google_SDE summer intern2027_4july OA",
  difficulty: "Medium",
  acceptance: 55,
  tags: ["Topological Sort", "Graph", "Greedy"],
  description:
    "There are N components from 1 to N needed to assemble a machine. Given M pairs of components (Aᵢ, Bᵢ) (1 ≤ i ≤ M), component Aᵢ must be installed before component Bᵢ during assembly. If assembling the machine is not possible, print -1. Otherwise, print the lexicographically-smallest arrangement for assembling the machine.",
  inputFormat: [
    "The first line contains an integer T denoting the number of test cases.",
    "The first line of each test case contains two integers N and M denoting the number of components and their ordering constraints respectively.",
    "Next M lines contain two space-separated integers denoting the relations.",
  ],
  outputFormat:
    "Print -1 if assembling the machine is not possible. Otherwise, print the lexicographically-smallest arrangement.",
  constraints: ["1 ≤ T ≤ 5", "2 ≤ N ≤ 10^5", "1 ≤ M ≤ min(10^5, N * (N - 1) / 2)"],
  samples: [
    {
      input: "1\n4 5\n2 4\n4 3\n1 3\n2 3\n1 2",
      output: "1 2 4 3",
      explanation:
        "Installing in order 1, 2, 4, 3 satisfies every precedence pair and is the smallest such ordering.",
    },
  ],
};

const NAV_ITEMS = ["Description", "Solution", "Editorial", "Discussions", "Submissions"] as const;

const DIFFICULTY_STYLES: Record<string, string> = {
  Easy: "text-emerald-400 border-emerald-800 bg-emerald-950",
  Medium: "text-amber-400 border-amber-800 bg-amber-950",
  Hard: "text-rose-400 border-rose-800 bg-rose-950",
};

// ---------- Component ----------

export const ProblemDashboard = ({ problem }: ProblemDashboardProps) => {
  const [activeTab, setActiveTab] = useState<(typeof NAV_ITEMS)[number]>("Description");
  const [saved, setSaved] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Merge field-by-field (not a shallow spread) so a partial/undefined
  // `problem` prop — or one where a single key is explicitly undefined —
  // never crashes the render.
  const d = defaultProblem as NonNullable<ProblemDashboardProps["problem"]>;
  const p: NonNullable<ProblemDashboardProps["problem"]> = {
    title: problem?.title ?? d.title,
    source: problem?.source ?? d.source,
    difficulty: problem?.difficulty ?? d.difficulty,
    acceptance: problem?.acceptance ?? d.acceptance,
    tags: problem?.tags ?? d.tags,
    description: problem?.description ?? d.description,
    inputFormat: problem?.inputFormat ?? d.inputFormat,
    outputFormat: problem?.outputFormat ?? d.outputFormat,
    constraints: problem?.constraints ?? d.constraints,
    samples: problem?.samples ?? d.samples,
  };

  const copySample = (text: string, index: number) => {
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopiedIndex(index);
    window.setTimeout(() => setCopiedIndex((cur) => (cur === index ? null : cur)), 1500);
  };

  return (
    // bg-zinc-900 (not neutral-950) deliberately sits a shade lighter than
    // most host app shells so this panel reads as its own surface instead
    // of melting into the page behind it. Border-l gives it a hard edge
    // when dropped into a split layout like an IDE / interview panel.
    <div className="h-full min-w-0 w-full bg-zinc-900 text-zinc-200 font-sans flex flex-col overflow-hidden border-l border-zinc-800">
      {/* Tab bar */}
      <div className="flex items-center gap-1 border-b border-zinc-800 bg-zinc-950 px-3 overflow-x-auto shrink-0">
        {NAV_ITEMS.map((item) => {
          const active = item === activeTab;
          return (
            <button
              key={item}
              onClick={() => setActiveTab(item)}
              className={`relative shrink-0 px-3 py-3 text-[13px] transition-colors ${
                active ? "text-zinc-50 font-medium" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {item}
              {active && (
                <span className="absolute left-2 right-2 -bottom-px h-0.5 rounded-full bg-amber-400" />
              )}
            </button>
          );
        })}
      </div>

      {/* Scrollable body */}
      <div className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden px-6 py-5">
        {activeTab === "Description" ? (
          <>
            {/* Eyebrow / source */}
            <p className="text-[11px] uppercase tracking-wider text-zinc-500 mb-1.5 truncate">
              {p.source}
            </p>

            {/* Title */}
            <h1 className="text-xl font-semibold text-zinc-50 leading-snug mb-3">{p.title}</h1>

            {/* Meta row: difficulty, acceptance, tags */}
            <div className="flex flex-wrap items-center gap-x-2 gap-y-2 mb-4">
              <span
                className={`text-xs font-medium px-2 py-1 rounded border ${DIFFICULTY_STYLES[p.difficulty]}`}
              >
                {p.difficulty}
              </span>
              <span className="text-xs text-zinc-500">{p.acceptance}% accepted</span>
              <span className="w-px h-4 bg-zinc-700 mx-1" />
              {p.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-1 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 mb-6 pb-5 border-b border-zinc-800 text-[13px] text-zinc-400">
              <button
                onClick={() => setSaved((s) => !s)}
                className={`flex items-center gap-1.5 hover:text-zinc-100 transition-colors ${
                  saved ? "text-amber-400" : ""
                }`}
              >
                <Bookmark size={14} fill={saved ? "currentColor" : "none"} />
                Save
              </button>
              <button className="flex items-center gap-1.5 hover:text-zinc-100 transition-colors">
                <ImageIcon size={14} />
                Images
              </button>
              <button className="flex items-center gap-1.5 hover:text-zinc-100 transition-colors">
                <Flag size={14} />
                Report
              </button>
            </div>

            {/* Description */}
            <p className="text-[13.5px] leading-[1.75] text-zinc-300 mb-6">{p.description}</p>

            {/* Input format */}
            <section className="mb-6">
              <h2 className="text-[13px] font-semibold text-zinc-50 mb-2.5">Input format</h2>
              <ul className="space-y-2">
                {p.inputFormat.map((line, i) => (
                  <li key={i} className="flex gap-2.5 text-[13.5px] text-zinc-300 leading-[1.65]">
                    <span className="text-zinc-600 select-none leading-[1.65]">•</span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Output format */}
            <section className="mb-6">
              <h2 className="text-[13px] font-semibold text-zinc-50 mb-2.5">Output format</h2>
              <p className="text-[13.5px] text-zinc-300 leading-[1.65]">{p.outputFormat}</p>
            </section>

            {/* Constraints */}
            <section className="mb-6 pb-6 border-b border-zinc-800">
              <h2 className="text-[13px] font-semibold text-zinc-50 mb-2.5">Constraints</h2>
              <div className="rounded-md border border-zinc-700 bg-zinc-950 px-4 py-3 flex flex-col gap-1.5 font-mono text-[13px] text-zinc-400">
                {p.constraints.map((c, i) => (
                  <span key={i}>{c}</span>
                ))}
              </div>
            </section>

            {/* Samples */}
            {p.samples.map((sample, i) => (
              <section key={i} className="mb-6">
                <h2 className="text-[13px] font-semibold text-zinc-50 mb-2.5">
                  Sample Input {p.samples.length > 1 ? i + 1 : ""}
                </h2>
                <div className="relative rounded-md border border-zinc-700 bg-zinc-950 overflow-hidden shadow-sm">
                  <pre className="text-[13px] font-mono text-zinc-300 px-4 py-3 whitespace-pre overflow-x-auto leading-relaxed">
{sample.input}
                  </pre>
                  <button
                    onClick={() => copySample(sample.input, i * 2)}
                    className="absolute top-2 right-2 p-1.5 rounded text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
                    aria-label="Copy input"
                  >
                    {copiedIndex === i * 2 ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>

                <h2 className="text-[13px] font-semibold text-zinc-50 mt-5 mb-2.5">
                  Sample Output {p.samples.length > 1 ? i + 1 : ""}
                </h2>
                <div className="relative rounded-md border border-zinc-700 bg-zinc-950 overflow-hidden shadow-sm">
                  <pre className="text-[13px] font-mono text-zinc-300 px-4 py-3 whitespace-pre overflow-x-auto leading-relaxed">
{sample.output}
                  </pre>
                  <button
                    onClick={() => copySample(sample.output, i * 2 + 1)}
                    className="absolute top-2 right-2 p-1.5 rounded text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
                    aria-label="Copy output"
                  >
                    {copiedIndex === i * 2 + 1 ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>

                {sample.explanation && (
                  <p className="text-[13px] text-zinc-400 leading-relaxed mt-3">
                    <span className="text-zinc-500 font-medium">Explanation: </span>
                    {sample.explanation}
                  </p>
                )}
              </section>
            ))}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full py-24 text-center">
            <p className="text-sm text-zinc-500">
              {activeTab} isn&apos;t available for this problem yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProblemDashboard;