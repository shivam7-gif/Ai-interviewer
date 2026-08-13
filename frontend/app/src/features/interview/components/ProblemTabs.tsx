import React, { useState } from "react";
import {
  FileText,
  Star,
  BookOpen,
  MessageSquare,
  History,
  Copy,
  Check,
  Bookmark,
  Flag,
  ImageIcon,
  ExternalLink,
  Building2,
  Tag,
} from "lucide-react";
import type { TabId, Problem } from "../types";

const DIFFICULTY_CLASSES: Record<string, string> = {
  Easy: "difficulty-easy",
  Medium: "difficulty-medium",
  Hard: "difficulty-hard",
};

const TABS: { id: TabId; icon: React.ComponentType<{ size?: number; className?: string }>; suffix?: string }[] = [
  { id: "Description", icon: FileText },
  { id: "Solution", icon: Star },
  { id: "Editorial", icon: BookOpen, suffix: "3" },
  { id: "Discussion", icon: MessageSquare },
  { id: "Submissions", icon: History },
];

interface ProblemTabsProps {
  problem: Problem;
  solutionCode: string;
}

export const ProblemTabs: React.FC<ProblemTabsProps> = ({ problem, solutionCode }) => {
  const [activeTab, setActiveTab] = useState<TabId>("Description");
  const [saved, setSaved] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copy = (text: string, key: string) => {
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopiedKey(key);
    setTimeout(() => setCopiedKey((k) => (k === key ? null : k)), 1500);
  };

  return (
    <div className="problem-panel">
      {/* Tab bar */}
      <div className="problem-tab-bar">
        {TABS.map(({ id, icon: Icon, suffix }) => {
          const active = id === activeTab;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`problem-tab ${active ? "problem-tab-active" : ""}`}
            >
              <Icon size={13} className={active ? "problem-tab-icon-active" : "problem-tab-icon"} />
              {id}
              {suffix && <span className="problem-tab-suffix">{suffix}</span>}
              {active && <span className="problem-tab-underline" />}
            </button>
          );
        })}
      </div>

      {/* Scrollable body */}
      <div className="problem-body">
        {activeTab === "Description" && (
          <ProblemDescription
            problem={problem}
            saved={saved}
            onSave={() => setSaved((s) => !s)}
            copiedKey={copiedKey}
            onCopy={copy}
          />
        )}
        {activeTab === "Solution" && (
          <SolutionTab code={solutionCode} onCopy={copy} copiedKey={copiedKey} />
        )}
        {(activeTab === "Editorial" || activeTab === "Discussion" || activeTab === "Submissions") && (
          <EmptyTab tab={activeTab} />
        )}
      </div>
    </div>
  );
};

/* ── Description tab ──────────────────────────────────────────────── */

interface ProblemDescriptionProps {
  problem: Problem;
  saved: boolean;
  onSave: () => void;
  copiedKey: string | null;
  onCopy: (text: string, key: string) => void;
}

const ProblemDescription: React.FC<ProblemDescriptionProps> = ({
  problem: p,
  saved,
  onSave,
  copiedKey,
  onCopy,
}) => (
  <>
    {/* Title */}
    <h1 className="problem-title">{p.title}</h1>

    {/* Meta */}
    <div className="problem-meta-row">
      <span className={`difficulty-badge ${DIFFICULTY_CLASSES[p.difficulty]}`}>
        {p.difficulty}
      </span>
      <span className="problem-acceptance">
        <FileText size={12} />
        {p.acceptance}% acceptance
      </span>
    </div>

    {/* Company tags */}
    <div className="problem-tags-row">
      <Building2 size={12} className="tags-icon" />
      {p.companyTags.map((tag) => (
        <span key={tag} className="company-tag">{tag}</span>
      ))}
    </div>

    {/* Topic tags */}
    <div className="problem-tags-row">
      <Tag size={12} className="tags-icon" />
      {p.topicTags.map((tag) => (
        <span key={tag} className="topic-tag">{tag}</span>
      ))}
    </div>

    {/* Action bar */}
    <div className="problem-actions">
      <button onClick={onSave} className={`action-btn ${saved ? "action-btn-saved" : ""}`}>
        <Bookmark size={14} fill={saved ? "currentColor" : "none"} />
        {saved ? "Saved" : "Save"}
      </button>
      <button className="action-btn">
        <ImageIcon size={14} />
        Images
      </button>
      <button className="action-btn action-btn-report">
        <Flag size={14} />
        Report
      </button>
      <button className="action-btn" style={{ marginLeft: "auto" }}>
        <ExternalLink size={13} />
      </button>
    </div>

    <div className="problem-divider" />

    {/* Source */}
    <p className="problem-source">{p.source}</p>

    {/* Description */}
    <p className="problem-description">{p.description}</p>

    {/* Input format */}
    <Section title="Input Format">
      <ul className="problem-list">
        {p.inputFormat.map((line, i) => (
          <li key={i} className="problem-list-item">
            <span className="problem-list-bullet">•</span>
            {line}
          </li>
        ))}
      </ul>
    </Section>

    {/* Output format */}
    <Section title="Output Format">
      <p className="problem-description" style={{ marginBottom: 0 }}>{p.outputFormat}</p>
    </Section>

    {/* Constraints */}
    <Section title="Constraints">
      <div className="constraints-box">
        {p.constraints.map((c, i) => (
          <code key={i} className="constraint-line">{c}</code>
        ))}
      </div>
    </Section>

    {/* Samples */}
    {p.samples.map((sample, i) => (
      <div key={i}>
        <SampleBlock
          label={`Sample Input${p.samples.length > 1 ? ` ${i + 1}` : ""}`}
          code={sample.input}
          copyKey={`input-${i}`}
          copiedKey={copiedKey}
          onCopy={onCopy}
        />
        <SampleBlock
          label={`Sample Output${p.samples.length > 1 ? ` ${i + 1}` : ""}`}
          code={sample.output}
          copyKey={`output-${i}`}
          copiedKey={copiedKey}
          onCopy={onCopy}
        />
        {sample.explanation && (
          <div className="sample-explanation">
            <span className="sample-explanation-label">Explanation: </span>
            {sample.explanation}
          </div>
        )}
      </div>
    ))}
  </>
);

/* ── Solution tab ─────────────────────────────────────────────────── */

const SolutionTab: React.FC<{
  code: string;
  onCopy: (text: string, key: string) => void;
  copiedKey: string | null;
}> = ({ code, onCopy, copiedKey }) => (
  <>
    <h2 className="section-title" style={{ marginBottom: 4 }}>Solution</h2>
    <p className="problem-description">
      Topological Sort (Kahn's Algorithm) with a min-heap to produce the lexicographically smallest valid ordering.
    </p>
    <div className="code-block-wrapper">
      <div className="code-block-header">
        <span className="code-block-lang">C++</span>
        <button
          className="code-copy-btn"
          onClick={() => onCopy(code, "solution")}
        >
          {copiedKey === "solution" ? <Check size={13} /> : <Copy size={13} />}
        </button>
      </div>
      <pre className="code-block">{code}</pre>
    </div>
  </>
);

/* ── Empty tab ────────────────────────────────────────────────────── */

const EmptyTab: React.FC<{ tab: string }> = ({ tab }) => (
  <div className="empty-tab">
    <p className="empty-tab-text">{tab} isn't available for this problem yet.</p>
  </div>
);

/* ── Reusable bits ────────────────────────────────────────────────── */

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <section style={{ marginBottom: 24 }}>
    <h2 className="section-title">{title}</h2>
    {children}
  </section>
);

const SampleBlock: React.FC<{
  label: string;
  code: string;
  copyKey: string;
  copiedKey: string | null;
  onCopy: (text: string, key: string) => void;
}> = ({ label, code, copyKey, copiedKey, onCopy }) => (
  <div style={{ marginBottom: 16 }}>
    <div className="section-title" style={{ marginBottom: 8 }}>{label}</div>
    <div className="code-block-wrapper">
      <button
        className="code-copy-btn sample-copy-btn"
        onClick={() => onCopy(code, copyKey)}
      >
        {copiedKey === copyKey ? <Check size={13} /> : <Copy size={13} />}
      </button>
      <pre className="code-block sample-code">{code}</pre>
    </div>
  </div>
);
