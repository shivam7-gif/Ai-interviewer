import { useParams } from "react-router-dom";
import { useRef, useState, useEffect } from "react";
import { Ide } from "../components/Ide";
import { ChangeLang } from "../components/ChangeLanguage";
import { useAuth } from "../context/AuthContext";
import { AIInterviewer } from "../components/AIInterviewer/AIInterviewer";

// ── Timer hook ────────────────────────────────────────────────────────────────

function useTimer(totalSeconds: number) {
  const [remaining, setRemaining] = useState(totalSeconds);
  useEffect(() => {
    const id = setInterval(() => setRemaining(r => Math.max(0, r - 1)), 1000);
    return () => clearInterval(id);
  }, []);
  const m = String(Math.floor(remaining / 60)).padStart(2, "0");
  const s = String(remaining % 60).padStart(2, "0");
  return { display: `${m}:${s}`, expired: remaining === 0, fraction: remaining / totalSeconds };
}

// ── Transcript panel (left) ───────────────────────────────────────────────────

function TranscriptPanel({ projectId, user }: { projectId: string; user: any }) {
  return (
    <div style={s.leftPanel}>
      <div style={s.panelHead}>
        <span style={s.panelLabel}>Transcript</span>
      </div>
      <div style={{ flex: 1, overflowY: "auto" }}>
        <AIInterviewer projectId={projectId} user={user} editorRef={null} language="" />
      </div>
    </div>
  );
}

// ── Question & Meta panel (right) ─────────────────────────────────────────────

function MetaPanel({ totalSeconds = 2700 }: { totalSeconds?: number }) {
  const { display, expired, fraction } = useTimer(totalSeconds);

  const circumference = 2 * Math.PI * 18;
  const strokeDashoffset = circumference * (1 - fraction);

  return (
    <div style={s.rightPanel}>
      {/* Timer */}
      <div style={s.panelHead}>
        <span style={s.panelLabel}>Session</span>
      </div>
      <div style={s.timerSection}>
        <div style={s.timerRing}>
          <svg width="48" height="48" viewBox="0 0 48 48">
            <circle cx="24" cy="24" r="18" fill="none" stroke="var(--border)" strokeWidth="3" />
            <circle
              cx="24" cy="24" r="18" fill="none"
              stroke={expired ? "var(--danger)" : "var(--accent)"}
              strokeWidth="3"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform="rotate(-90 24 24)"
              style={{ transition: "stroke-dashoffset 1s linear" }}
            />
          </svg>
          <span style={{ ...s.timerText, color: expired ? "var(--danger)" : "var(--text)" }}>{display}</span>
        </div>
        <span style={s.timerLabel}>{expired ? "Time expired" : "Remaining"}</span>
      </div>

      <div style={s.divider} />

      {/* Current question */}
      <div style={s.section}>
        <p style={s.sectionTitle}>Current Question</p>
        <p style={s.questionTitle}>Two Sum</p>
        <span className="badge badge-green" style={{ marginBottom: "10px" }}>Easy</span>
        <p style={s.questionBody}>
          Given an array of integers <code style={s.code}>nums</code> and an integer{" "}
          <code style={s.code}>target</code>, return indices of the two numbers that add up to{" "}
          <code style={s.code}>target</code>.
        </p>
        <div style={{ marginTop: "10px" }}>
          <p style={s.exampleLabel}>Example</p>
          <pre style={s.pre}>{`Input:  nums = [2,7,11,15], target = 9\nOutput: [0,1]`}</pre>
        </div>
      </div>

      <div style={s.divider} />

      {/* Progress */}
      <div style={s.section}>
        <p style={s.sectionTitle}>Progress</p>
        <div style={s.progressRow}>
          {["Q1", "Q2", "Q3", "Q4", "Q5"].map((q, i) => (
            <div
              key={q}
              style={{
                ...s.progressDot,
                background: i === 0 ? "var(--accent)" : i < 1 ? "var(--success)" : "var(--surface-2)",
                border: `1px solid ${i === 0 ? "var(--accent)" : i < 1 ? "var(--success)" : "var(--border)"}`,
              }}
              title={q}
            />
          ))}
        </div>
        <p style={s.progressLabel}>Question 1 of 5</p>
      </div>

      <div style={s.divider} />

      {/* Notes */}
      <div style={{ ...s.section, flex: 1 }}>
        <p style={s.sectionTitle}>Notes</p>
        <textarea
          style={s.notes}
          placeholder="Scratch pad — notes are local only"
        />
      </div>
    </div>
  );
}

// ── Editor panel (center) ─────────────────────────────────────────────────────

function EditorPanel({ onRun }: { onRun: () => void }) {
  const editorRef = useRef(null);
  const [language, setLanguage] = useState("javascript");

  function handleMount(editor: any) {
    editorRef.current = editor;
  }

  return (
    <div style={s.centerPanel}>
      {/* Editor toolbar */}
      <div style={s.editorBar}>
        <ChangeLang onChange={lang => setLanguage(lang.toLowerCase())} />
        <div style={{ flex: 1 }} />
        <button className="btn btn-ghost" onClick={onRun} id="run-btn">Run</button>
        <button className="btn btn-primary" id="submit-btn">Submit</button>
      </div>
      {/* Monaco */}
      <div style={{ flex: 1, minHeight: 0 }}>
        <Ide onMount={handleMount} language={language} />
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export const Project = () => {
  const { projectId } = useParams();
  const { user } = useAuth();

  function handleRun() {
    console.log("Run triggered");
  }

  return (
    <div style={s.shell}>
      {/* Top bar */}
      <header style={s.topBar}>
        <div style={s.topLeft}>
          <span style={s.logoMark}>OS</span>
          <span style={s.topTitle}>InterviewOS</span>
          <span style={s.sep}>·</span>
          <span style={s.sessionLabel}>Session</span>
          <code style={s.sessionId}>{projectId?.slice(0, 8)}</code>
        </div>
        <div style={s.topRight}>
          {user?.picture && <img src={user.picture} alt="" style={s.avatar} />}
          <span style={s.userName}>{user?.name}</span>
        </div>
      </header>

      {/* Workspace */}
      <div style={s.workspace}>
        <TranscriptPanel projectId={projectId!} user={user} />
        <EditorPanel onRun={handleRun} />
        <MetaPanel />
      </div>
    </div>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────

const s: Record<string, React.CSSProperties> = {
  shell: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    background: "var(--bg)",
    fontFamily: "'Inter', system-ui, sans-serif",
    overflow: "hidden",
  },

  // Top bar
  topBar: {
    height: "var(--topnav-h)",
    borderBottom: "1px solid var(--border)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 20px",
    flexShrink: 0,
    background: "var(--surface)",
  },
  topLeft:     { display: "flex", alignItems: "center", gap: "8px" },
  topRight:    { display: "flex", alignItems: "center", gap: "8px" },
  logoMark: {
    width: "22px", height: "22px",
    background: "var(--text)", color: "var(--bg)",
    fontSize: "10px", fontWeight: 700,
    display: "flex", alignItems: "center", justifyContent: "center",
    borderRadius: "var(--radius-sm)",
  },
  topTitle:    { fontSize: "13px", fontWeight: 600, color: "var(--text)" },
  sep:         { color: "var(--text-faint)", fontSize: "12px" },
  sessionLabel:{ fontSize: "12px", color: "var(--text-muted)" },
  sessionId:   { fontSize: "11.5px", color: "var(--text-muted)", fontFamily: "monospace" },
  avatar:      { width: "24px", height: "24px", borderRadius: "50%" },
  userName:    { fontSize: "12.5px", color: "var(--text-muted)" },

  // Workspace
  workspace: { flex: 1, display: "flex", overflow: "hidden" },

  // Left panel — transcript
  leftPanel: {
    width: "260px",
    flexShrink: 0,
    borderRight: "1px solid var(--border)",
    display: "flex",
    flexDirection: "column",
    background: "var(--surface)",
    overflow: "hidden",
  },

  // Center panel — editor
  centerPanel: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    borderRight: "1px solid var(--border)",
  },
  editorBar: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "0 12px",
    height: "44px",
    borderBottom: "1px solid var(--border)",
    background: "var(--surface)",
    flexShrink: 0,
  },

  // Right panel — meta
  rightPanel: {
    width: "260px",
    flexShrink: 0,
    display: "flex",
    flexDirection: "column",
    background: "var(--surface)",
    overflowY: "auto",
  },

  panelHead: {
    height: "44px",
    borderBottom: "1px solid var(--border)",
    display: "flex",
    alignItems: "center",
    padding: "0 16px",
    flexShrink: 0,
  },
  panelLabel: { fontSize: "11px", fontWeight: 500, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" },

  // Timer
  timerSection: { padding: "20px 16px 16px", display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" },
  timerRing:    { position: "relative", display: "flex", alignItems: "center", justifyContent: "center" },
  timerText:    { position: "absolute", fontSize: "11px", fontWeight: 600, fontFamily: "monospace" },
  timerLabel:   { fontSize: "11px", color: "var(--text-muted)" },

  divider: { height: "1px", background: "var(--border)", flexShrink: 0 },

  // Section
  section:      { padding: "14px 16px", display: "flex", flexDirection: "column", gap: "6px" },
  sectionTitle: { fontSize: "11px", fontWeight: 500, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" },
  questionTitle:{ fontSize: "13.5px", fontWeight: 600, color: "var(--text)", marginBottom: "4px" },
  questionBody: { fontSize: "12.5px", color: "var(--text-muted)", lineHeight: 1.6 },
  code:         { fontFamily: "monospace", fontSize: "11.5px", background: "var(--surface-2)", padding: "1px 4px", borderRadius: "3px", border: "1px solid var(--border)" },
  exampleLabel: { fontSize: "11px", fontWeight: 500, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "4px" },
  pre:          { fontSize: "11.5px", fontFamily: "monospace", color: "var(--text-2)", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "8px 10px", lineHeight: 1.7, whiteSpace: "pre" },

  // Progress
  progressRow:  { display: "flex", gap: "6px", alignItems: "center" },
  progressDot:  { width: "20px", height: "6px", borderRadius: "3px" },
  progressLabel:{ fontSize: "11px", color: "var(--text-muted)" },

  // Notes
  notes: {
    flex: 1,
    width: "100%",
    minHeight: "100px",
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    padding: "8px 10px",
    color: "var(--text)",
    fontSize: "12.5px",
    lineHeight: 1.6,
    resize: "none",
    outline: "none",
    fontFamily: "inherit",
  },
};
