import { useState } from "react";
import { Copy, Check, Bookmark, ImageIcon, Flag, FileText, Star, BookOpen, MessageSquare, History } from "lucide-react";

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

const NAV_ITEMS = [
  { id: "Description", icon: FileText },
  { id: "Solution", icon: Star },
  { id: "Editorial", icon: BookOpen, suffix: "3/3" },
  { id: "Discussions", icon: MessageSquare },
  { id: "Submissions", icon: History },
] as const;

const DIFFICULTY_STYLES: Record<string, string> = {
  Easy: "text-emerald-400 border-emerald-800 bg-emerald-950",
  Medium: "text-amber-400 border-amber-800 bg-amber-950",
  Hard: "text-rose-400 border-rose-800 bg-rose-950",
};

const solutionCode = "";

// ---------- Component ----------

export const ProblemDashboard = ({ problem }: ProblemDashboardProps) => {
  const [activeTab, setActiveTab] = useState<(typeof NAV_ITEMS)[number]["id"]>("Description");
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
    <div className="h-full min-w-0 w-full bg-[#0a0a0c] text-zinc-300 font-sans flex flex-col overflow-hidden border-l border-zinc-800/50">
      {/* Tab bar */}
      <div className="flex items-center gap-6 border-b border-zinc-800/80 bg-zinc-950/50 px-6 overflow-x-auto shrink-0 hide-scrollbar">
        {NAV_ITEMS.map((item) => {
          const active = item.id === activeTab;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`relative shrink-0 py-3.5 flex items-center gap-1.5 text-[13px] tracking-wide transition-colors ${
                active ? "text-zinc-100 font-medium" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <Icon size={14} className={active ? "text-amber-400" : ""} />
              {item.id}
              {item.suffix && <span className="text-[11px] text-zinc-600 ml-0.5">{item.suffix}</span>}
              {active && (
                <span className="absolute left-0 right-0 -bottom-px h-[2px] rounded-t-sm bg-zinc-200" />
              )}
            </button>
          );
        })}
      </div>

      {/* Scrollable body */}
      <div className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden px-6 py-5">
        {activeTab === "Description" ? (
          <>
            {/* Title Section */}
            <h1 className="text-[19px] font-bold text-zinc-100 leading-snug mb-1">
              {p.title} — {p.source}
            </h1>
            <h2 className="text-[17px] font-bold text-zinc-100 mb-4">Question</h2>

            {/* Meta row: difficulty, acceptance, tags */}
            <div className="flex flex-wrap items-center gap-x-2 gap-y-2 mb-4">
              <span
                className={`text-xs font-medium px-2 py-1 rounded border ${DIFFICULTY_STYLES[p.difficulty]}`}
              >
                {p.difficulty}
              </span>
              <span className="text-[12.5px] text-zinc-500 flex items-center gap-2">
                <FileText size={13} className="text-zinc-600" />
                {p.source}
              </span>
              <span className="w-px h-4 bg-zinc-800 mx-1" />
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
            <div className="flex items-center gap-6 mb-8 pb-6 border-b border-zinc-800/80 text-[14.5px] text-zinc-400">
              <button
                onClick={() => setSaved((s) => !s)}
                className={`flex items-center gap-2 hover:text-zinc-100 transition-colors ${
                  saved ? "text-amber-400" : ""
                }`}
              >
                <Bookmark size={16} fill={saved ? "currentColor" : "none"} />
                Save
              </button>
              <button className="flex items-center gap-2 hover:text-zinc-100 transition-colors">
                <ImageIcon size={16} />
                Images
              </button>
              <button className="flex items-center gap-2 hover:text-zinc-100 transition-colors">
                <Flag size={16} />
                Report
              </button>
            </div>

            {/* Description */}
            <p className="text-[14.5px] leading-[2] text-zinc-300 mb-8">{p.description}</p>

            {/* Input format */}
            <section className="mb-8">
              <h2 className="text-[14px] font-semibold text-zinc-50 mb-3">Input format</h2>
              <ul className="space-y-3">
                {p.inputFormat.map((line, i) => (
                  <li key={i} className="flex gap-3 text-[14.5px] text-zinc-300 leading-[1.8]">
                    <span className="text-zinc-600 select-none leading-[1.8]">•</span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Output format */}
            <section className="mb-8">
              <h2 className="text-[14px] font-semibold text-zinc-50 mb-3">Output format</h2>
              <p className="text-[14.5px] text-zinc-300 leading-[1.8]">{p.outputFormat}</p>
            </section>

            {/* Constraints */}
            <section className="mb-8 pb-8 border-b border-zinc-800/80">
              <h2 className="text-[14px] font-semibold text-zinc-50 mb-3">Constraints</h2>
              <div className="rounded-md border border-zinc-700/80 bg-zinc-950/50 px-5 py-4 flex flex-col gap-2 font-mono text-[14px] text-zinc-400">
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
        ) : activeTab === "Solution" ? (
          <div className="flex flex-col h-full">
            <h2 className="text-[15px] font-semibold text-zinc-50 mb-1.5">Solution</h2>
            <p className="text-[13px] text-zinc-400 mb-4 leading-relaxed">
              Below is the C++ solution using Topological Sort with a min-heap to ensure the lexicographically smallest arrangement.
            </p>
            <div className="relative flex-1 min-h-0 flex flex-col rounded-md border border-zinc-700 bg-zinc-950 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-800 bg-[#121214] shrink-0">
                <span className="text-[12px] font-medium text-zinc-400">C++</span>
                <button
                  onClick={() => copySample(solutionCode, 999)}
                  className="p-1 rounded text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
                  aria-label="Copy solution"
                >
                  {copiedIndex === 999 ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
              <div className="flex-1 overflow-auto">
                <pre className="text-[13px] font-mono text-zinc-300 px-4 py-4 whitespace-pre leading-relaxed">
{solutionCode}
                </pre>
              </div>
            </div>
          </div>
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