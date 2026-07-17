import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, Toaster } from "sonner";
import axios from "axios";
import { AppLayout } from "../components/layout/AppLayout";
import { BACKEND_URL } from "../lib/config";

// ── Source types ──────────────────────────────────────────────────────────────

type Source = "github" | "questionbank" | "custom";

const SOURCES: { id: Source; label: string; description: string }[] = [
  {
    id: "github",
    label: "GitHub Repository",
    description: "Generate interview questions from a GitHub profile and project history.",
  },
  {
    id: "questionbank",
    label: "Question Bank",
    description: "Pull questions from LeetCode, HackerRank, Codeforces and other platforms.",
  },
  {
    id: "custom",
    label: "Custom Source",
    description: "Import questions from your own endpoint or upload a custom set.",
  },
];

const QUESTION_PLATFORMS = ["LeetCode", "HackerRank", "HackerEarth", "Codeforces", "OA Library"];
const DIFFICULTIES = ["Easy", "Medium", "Hard"];
const TOPICS = ["Arrays", "Trees", "Graphs", "DP", "System Design", "Strings", "Math"];

// ── GitHub panel ──────────────────────────────────────────────────────────────

function GitHubPanel() {
  const navigate = useNavigate();
  const [url, setUrl] = useState("");
  const [difficulty, setDifficulty] = useState("Medium");
  const [duration, setDuration] = useState("45");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!url.trim()) {
      toast.error("Please enter a GitHub URL");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${BACKEND_URL}/api/v1/pre-interview`, { gitHub: url });
      navigate(`/project/${res.data.projectId}`);
    } catch {
      toast.error("Failed to analyse repository. Please check the URL and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={s.panel}>
      <div style={s.panelHeader}>
        <p style={s.panelTitle}>GitHub Repository</p>
        <p style={s.panelDesc}>
          The AI will analyse your public repositories and generate context-aware questions based on your actual work.
        </p>
      </div>

      <div style={s.form}>
        <div className="field">
          <label className="label">Repository or Profile URL</label>
          <input
            className="input"
            placeholder="https://github.com/username"
            value={url}
            onChange={e => setUrl(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
          />
        </div>

        <div style={s.row}>
          <div className="field" style={{ flex: 1 }}>
            <label className="label">Difficulty</label>
            <select className="input" value={difficulty} onChange={e => setDifficulty(e.target.value)} style={s.select}>
              {DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div className="field" style={{ flex: 1 }}>
            <label className="label">Duration (minutes)</label>
            <input className="input" type="number" value={duration} onChange={e => setDuration(e.target.value)} min="15" max="120" />
          </div>
        </div>

        <div style={s.info}>
          <span style={{ color: "var(--text-faint)", fontSize: "11px" }}>⚠</span>
          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            Only public repositories are accessible. Ensure the GitHub URL is valid.
          </span>
        </div>
      </div>

      <div style={s.panelFooter}>
        <button className="btn btn-primary btn-lg" onClick={handleSubmit} disabled={loading}>
          {loading ? <><span className="spinner" />Analysing...</> : "Analyse Repository →"}
        </button>
      </div>
    </div>
  );
}

// ── Question Bank panel ───────────────────────────────────────────────────────

function QuestionBankPanel() {
  const [platform, setPlatform] = useState("LeetCode");
  const [difficulty, setDifficulty] = useState("Medium");
  const [topic, setTopic] = useState("Arrays");
  const [count, setCount] = useState("10");

  return (
    <div style={s.panel}>
      <div style={s.panelHeader}>
        <p style={s.panelTitle}>Question Bank</p>
        <p style={s.panelDesc}>
          Select questions from popular competitive programming platforms and configure the assessment parameters.
        </p>
      </div>

      <div style={s.form}>
        <div className="field">
          <label className="label">Platform</label>
          <div style={s.platformGrid}>
            {QUESTION_PLATFORMS.map(p => (
              <button
                key={p}
                style={{ ...s.platformBtn, ...(platform === p ? s.platformBtnActive : {}) }}
                onClick={() => setPlatform(p)}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div style={s.row}>
          <div className="field" style={{ flex: 1 }}>
            <label className="label">Difficulty</label>
            <select className="input" value={difficulty} onChange={e => setDifficulty(e.target.value)} style={s.select}>
              {DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div className="field" style={{ flex: 1 }}>
            <label className="label">Topic</label>
            <select className="input" value={topic} onChange={e => setTopic(e.target.value)} style={s.select}>
              {TOPICS.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="field" style={{ width: "100px" }}>
            <label className="label">Count</label>
            <input className="input" type="number" value={count} onChange={e => setCount(e.target.value)} min="1" max="50" />
          </div>
        </div>
      </div>

      <div style={s.panelFooter}>
        <button className="btn btn-ghost btn-lg" onClick={() => toast.info("Question Bank integration coming soon")}>
          Create Assessment →
        </button>
      </div>
    </div>
  );
}

// ── Custom Source panel ───────────────────────────────────────────────────────

function CustomPanel() {
  const [endpoint, setEndpoint] = useState("");
  const [category, setCategory] = useState("");
  const [count, setCount] = useState("10");

  return (
    <div style={s.panel}>
      <div style={s.panelHeader}>
        <p style={s.panelTitle}>Custom Source</p>
        <p style={s.panelDesc}>
          Connect your own question endpoint or import from a structured dataset.
        </p>
      </div>

      <div style={s.form}>
        <div className="field">
          <label className="label">API Endpoint</label>
          <input
            className="input"
            placeholder="https://your-api.com/questions"
            value={endpoint}
            onChange={e => setEndpoint(e.target.value)}
          />
        </div>
        <div style={s.row}>
          <div className="field" style={{ flex: 1 }}>
            <label className="label">Category</label>
            <input className="input" placeholder="e.g. backend-fundamentals" value={category} onChange={e => setCategory(e.target.value)} />
          </div>
          <div className="field" style={{ width: "100px" }}>
            <label className="label">Count</label>
            <input className="input" type="number" value={count} onChange={e => setCount(e.target.value)} />
          </div>
        </div>
      </div>

      <div style={s.panelFooter}>
        <button className="btn btn-ghost btn-lg" onClick={() => toast.info("Custom source integration coming soon")}>
          Import Questions →
        </button>
      </div>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────

export const Dashboard = () => {
  const [active, setActive] = useState<Source>("github");

  const panelMap: Record<Source, React.ReactNode> = {
    github:       <GitHubPanel />,
    questionbank: <QuestionBankPanel />,
    custom:       <CustomPanel />,
  };

  return (
    <AppLayout title="Dashboard">
      <Toaster richColors position="top-right" />

      <div style={s.page}>
        {/* Page header */}
        <div style={s.header}>
          <div>
            <h1 style={s.heading}>Create Interview</h1>
            <p style={s.sub}>Generate technical interviews from multiple sources.</p>
          </div>
        </div>

        <div style={s.workspace}>
          {/* Source selector */}
          <div style={s.sourceList}>
            <p style={s.sectionLabel}>Interview Source</p>
            {SOURCES.map(src => (
              <button
                key={src.id}
                style={{ ...s.sourceItem, ...(active === src.id ? s.sourceItemActive : {}) }}
                onClick={() => setActive(src.id)}
              >
                <span style={s.sourceLabel}>{src.label}</span>
                <span style={s.sourceDesc}>{src.description}</span>
                {active === src.id && <span style={s.activeIndicator} />}
              </button>
            ))}
          </div>

          {/* Configuration panel */}
          <div style={s.configArea}>
            {panelMap[active]}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────

const s: Record<string, React.CSSProperties> = {
  page:      { padding: "32px 32px", maxWidth: "1100px", margin: "0 auto", width: "100%" },
  header:    { marginBottom: "28px" },
  heading:   { fontSize: "18px", fontWeight: 600, color: "var(--text)", letterSpacing: "-0.02em", marginBottom: "4px" },
  sub:       { fontSize: "13px", color: "var(--text-muted)" },
  workspace: { display: "flex", gap: "0", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden", background: "var(--surface)" },

  // Source list (left)
  sourceList:  { width: "260px", flexShrink: 0, borderRight: "1px solid var(--border)", padding: "12px 0" },
  sectionLabel: { fontSize: "11px", fontWeight: 500, color: "var(--text-faint)", letterSpacing: "0.05em", textTransform: "uppercase", padding: "4px 16px 8px" },
  sourceItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "3px",
    padding: "10px 16px",
    width: "100%",
    background: "transparent",
    border: "none",
    textAlign: "left",
    cursor: "pointer",
    position: "relative",
    transition: "background var(--t)",
  },
  sourceItemActive: { background: "var(--surface-2)" },
  sourceLabel: { fontSize: "13px", fontWeight: 500, color: "var(--text)" },
  sourceDesc:  { fontSize: "11.5px", color: "var(--text-muted)", lineHeight: 1.4 },
  activeIndicator: {
    position: "absolute",
    left: 0, top: "25%", bottom: "25%",
    width: "2px",
    background: "var(--accent)",
    borderRadius: "0 2px 2px 0",
  },

  // Config area (right)
  configArea: { flex: 1, display: "flex", flexDirection: "column", minWidth: 0 },

  // Panel
  panel:       { flex: 1, display: "flex", flexDirection: "column" },
  panelHeader: { padding: "24px 28px 20px", borderBottom: "1px solid var(--border)" },
  panelTitle:  { fontSize: "14px", fontWeight: 600, color: "var(--text)", marginBottom: "4px" },
  panelDesc:   { fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.5 },
  form:        { padding: "24px 28px", display: "flex", flexDirection: "column", gap: "18px", flex: 1 },
  row:         { display: "flex", gap: "12px", alignItems: "flex-end" },
  info:        { display: "flex", alignItems: "flex-start", gap: "8px", padding: "10px 12px", background: "var(--surface-2)", borderRadius: "var(--radius)", border: "1px solid var(--border)" },
  panelFooter: { padding: "16px 28px 24px", borderTop: "1px solid var(--border)", display: "flex", gap: "10px" },
  select:      { appearance: "none", cursor: "pointer" },

  // Platform grid
  platformGrid: { display: "flex", flexWrap: "wrap", gap: "6px" },
  platformBtn: {
    padding: "0 12px",
    height: "28px",
    fontSize: "12.5px",
    fontWeight: 500,
    background: "transparent",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    color: "var(--text-muted)",
    cursor: "pointer",
    transition: "all var(--t)",
  },
  platformBtnActive: {
    background: "var(--accent-faint)",
    borderColor: "var(--accent-border)",
    color: "var(--accent)",
  },
};
