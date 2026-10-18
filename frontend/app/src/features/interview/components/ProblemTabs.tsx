import React, { useState } from "react";
import { Flag, Check, Copy } from "lucide-react";
import type { Problem } from "../types";

interface ProblemTabsProps {
  problem: Problem;
  solutionCode?: string;
}

export const ProblemTabs: React.FC<ProblemTabsProps> = ({ problem: p }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copy = (text: string, key: string) => {
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopiedKey(key);
    setTimeout(() => setCopiedKey((k) => (k === key ? null : k)), 1500);
  };

  const difficultyColorClass =
    p.difficulty === "Easy"
      ? "diff-easy"
      : p.difficulty === "Hard"
      ? "diff-hard"
      : "diff-medium";

  return (
    <div className="problem-panel">
      {/* Scrollable Problem Content */}
      <div className="problem-content-scroll">
        {/* Title: 18px semibold */}
        {p.title && <h1 className="problem-title">{p.title}</h1>}

        {/* Metadata line: Plain difficulty text · Topics separated by " / " */}
        {p.topicTags && p.topicTags.length > 0 && (
          <div className="problem-meta-line">
            <span className={`diff-text ${difficultyColorClass}`}>
              {p.difficulty}
            </span>
            <span className="meta-sep" aria-hidden="true">
              ·
            </span>
            <span className="topics-text">
              {p.topicTags.join(" / ")}
            </span>
          </div>
        )}

        {/* Problem Statement: comfortable 68ch reading measure */}
        {p.description && (
          <div className="problem-statement">
            <p>{p.description}</p>
          </div>
        )}

        {/* Input Format */}
        {p.inputFormat && p.inputFormat.length > 0 && (
          <section className="problem-section">
            <h2 className="section-heading">Input Format</h2>
            <ul className="format-list">
              {p.inputFormat.map((line, i) => (
                <li key={i} className="format-list-item">
                  <span className="format-bullet">•</span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Output Format */}
        {p.outputFormat && (
          <section className="problem-section">
            <h2 className="section-heading">Output Format</h2>
            <div className="problem-statement">
              <p>{p.outputFormat}</p>
            </div>
          </section>
        )}

        {/* Constraints */}
        {p.constraints && p.constraints.length > 0 && (
          <section className="problem-section">
            <h2 className="section-heading">Constraints</h2>
            <div className="constraints-list">
              {p.constraints.map((c, i) => (
                <code key={i} className="constraint-code-line">
                  {c}
                </code>
              ))}
            </div>
          </section>
        )}

        {/* Sample Test Cases */}
        {p.samples && p.samples.length > 0 && (
          <section className="problem-section">
            <h2 className="section-heading">Examples</h2>
            {p.samples.map((sample, i) => (
              <div key={i} className="sample-case-container">
                <div className="sample-case-label">
                  Example {p.samples.length > 1 ? i + 1 : ""}
                </div>

                <SampleBox
                  label="Input"
                  value={sample.input}
                  copyKey={`in-${i}`}
                  copiedKey={copiedKey}
                  onCopy={copy}
                />

                <SampleBox
                  label="Output"
                  value={sample.output}
                  copyKey={`out-${i}`}
                  copiedKey={copiedKey}
                  onCopy={copy}
                />

                {sample.explanation && (
                  <div className="sample-explanation">
                    <span className="explanation-title">Explanation: </span>
                    <span className="explanation-body">{sample.explanation}</span>
                  </div>
                )}
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  );
};

const SampleBox: React.FC<{
  label: string;
  value: string;
  copyKey: string;
  copiedKey: string | null;
  onCopy: (text: string, key: string) => void;
}> = ({ label, value, copyKey, copiedKey, onCopy }) => (
  <div className="sample-box">
    <div className="sample-box-header">
      <span className="sample-box-label">{label}</span>
      <button
        type="button"
        className="sample-copy-btn"
        onClick={() => onCopy(value, copyKey)}
        aria-label={`Copy ${label}`}
        title={`Copy ${label}`}
      >
        {copiedKey === copyKey ? (
          <Check size={12} strokeWidth={2} />
        ) : (
          <Copy size={12} strokeWidth={2} />
        )}
      </button>
    </div>
    <pre className="sample-box-code">{value}</pre>
  </div>
);
