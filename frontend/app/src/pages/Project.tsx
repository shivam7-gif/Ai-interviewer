import { useParams } from "react-router-dom";
import { useRef, useState } from "react";
import { Ide } from "../components/Ide";
import { ChangeLang } from "../components/ChangeLanguage";
import { useAuth } from "../context/AuthContext";
import { AIInterviewer } from "../components/AIInterviewer/AIInterviewer";
import { UserCamera } from "../components/AIInterviewer/UserCamera";
import { ProblemDashboard } from "../components/problemDashboard/ProblemDashboard";

const SESSION_PROBLEM = {
  title: "Breakfast",
  source: "Google SDE Summer Intern 2027 OA",
  difficulty: "Medium" as const,
  acceptance: 55,
  tags: ["Topological Sort", "Graph", "Greedy"],
  description:
    "There are N components from 1 to N needed to assemble a machine. Given M pairs of components (Aᵢ, Bᵢ) (1 ≤ i ≤ M), component A must be installed before component B during assembly. If assembling the machine is not possible, then print -1. Otherwise, print the lexicographically-smallest arrangement for assembling the machine.",
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
      input: "3\n4 3\n1 2\n2 3\n3 4\n3 2\n1 2\n2 3\n3 1\n5 5\n1 2\n2 3\n3 4\n4 5\n5 1",
      output: "1 2 3 4\n-1\n1 2 3 4 5",
    },
  ],
};

function TranscriptPanel({ projectId, user }: { projectId: string; user: ReturnType<typeof useAuth>["user"] }) {
  return (
    <div style={s.transcriptPanel}>
      <div style={s.transcriptArea}>
        <AIInterviewer projectId={projectId} user={user} />
      </div>
      <UserCamera label={user?.name ? user.name.split(" ")[0] : "You"} />
    </div>
  );
}

function ProblemPanel() {
  return (
    <div style={s.rightPanel}>
      <ProblemDashboard problem={SESSION_PROBLEM} />
    </div>
  );
}

function EditorPanel({ onRun }: { onRun: () => void }) {
  const editorRef = useRef(null);
  const [language, setLanguage] = useState("cpp");

  function handleMount(editor: unknown) {
    editorRef.current = editor as typeof editorRef.current;
  }

  return (
    <div style={s.centerPanel}>
      <div style={s.editorTopBar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px', color: '#71717a' }}>Language</span>
          <ChangeLang onChange={(lang) => setLanguage(lang.toLowerCase())} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: '#a1a1aa', fontSize: '13px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: '#f87171' }}>
            <span></span> Report
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
            <span></span> AI Helper
          </div>
          <div style={{ cursor: 'pointer' }}>⚙️</div>
        </div>
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>
        <Ide onMount={handleMount} language={language} />
      </div>
      <div style={s.editorBottomBar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 500 }}>
          <span>^</span> Test Results
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button style={s.runBtn} onClick={onRun} id="run-btn">
            ▶ Run Code
          </button>
          <button style={s.submitBtn} id="submit-btn">
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}

export const Project = () => {
  const { projectId } = useParams();
  const { user } = useAuth();

  function handleRun() {
    console.log("Run triggered");
  }

  return (
    <div style={s.shell}>
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

      <div style={s.workspace}>
        <TranscriptPanel projectId={projectId!} user={user} />
        <EditorPanel onRun={handleRun} />
        <ProblemPanel />
      </div>
    </div>
  );
};

const s: Record<string, React.CSSProperties> = {
  shell: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    background: "var(--bg)",
    fontFamily: "'Inter', system-ui, sans-serif",
    overflow: "hidden",
  },

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
  topLeft: { display: "flex", alignItems: "center", gap: "8px" },
  topRight: { display: "flex", alignItems: "center", gap: "8px" },
  logoMark: {
    width: "22px",
    height: "22px",
    background: "var(--text)",
    color: "var(--bg)",
    fontSize: "10px",
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "var(--radius-sm)",
  },
  topTitle: { fontSize: "13px", fontWeight: 600, color: "var(--text)" },
  sep: { color: "var(--text-faint)", fontSize: "12px" },
  sessionLabel: { fontSize: "12px", color: "var(--text-muted)" },
  sessionId: { fontSize: "11.5px", color: "var(--text-muted)", fontFamily: "monospace" },
  avatar: { width: "24px", height: "24px", borderRadius: "50%" },
  userName: { fontSize: "12.5px", color: "var(--text-muted)" },

  workspace: { flex: 1, display: "flex", overflow: "hidden", minHeight: 0 },

  transcriptPanel: {
    width: "280px",
    flexShrink: 0,
    borderRight: "1px solid #27272a",
    display: "flex",
    flexDirection: "column",
    background: "var(--surface)",
    overflow: "hidden",
    minHeight: 0,
  },
  transcriptArea: {
    flex: 1,
    minHeight: 0,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  rightPanel: {
    width: "clamp(320px, 35vw, 550px)",
    flexShrink: 0,
    borderLeft: "1px solid #27272a",
    display: "flex",
    flexDirection: "column",
    background: "var(--surface)",
    overflow: "hidden",
    minHeight: 0,
  },
  centerPanel: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    minHeight: 0,
  },
  editorTopBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 16px",
    height: "48px",
    borderBottom: "1px solid #27272a",
    background: "#09090b",
    flexShrink: 0,
  },
  editorBottomBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 16px",
    height: "52px",
    borderTop: "1px solid #27272a",
    background: "#09090b",
    flexShrink: 0,
    color: "#e4e4e7"
  },
  runBtn: {
    background: "transparent",
    border: "1px solid #eab308",
    color: "#eab308",
    padding: "6px 14px",
    borderRadius: "6px",
    fontSize: "13px",
    fontWeight: 500,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px"
  },
  submitBtn: {
    background: "#16a34a",
    border: "none",
    color: "#fff",
    padding: "7px 20px",
    borderRadius: "6px",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer"
  },
};
