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
    <div style={s.leftPanel}>
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
  const [language, setLanguage] = useState("javascript");

  function handleMount(editor: unknown) {
    editorRef.current = editor as typeof editorRef.current;
  }

  return (
    <div style={s.centerPanel}>
      <div style={s.editorBar}>
        <ChangeLang onChange={(lang) => setLanguage(lang.toLowerCase())} />
        <div style={{ flex: 1 }} />
        <button className="btn btn-ghost" onClick={onRun} id="run-btn">
          Run
        </button>
        <button className="btn btn-primary" id="submit-btn">
          Submit
        </button>
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>
        <Ide onMount={handleMount} language={language} />
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

  leftPanel: {
    width: "280px",
    flexShrink: 0,
    borderRight: "1px solid var(--border)",
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

  centerPanel: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    minHeight: 0,
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

  rightPanel: {
    flex: "0 0 clamp(440px, 40vw, 580px)",
    width: "clamp(440px, 40vw, 580px)",
    flexShrink: 0,
    display: "flex",
    flexDirection: "column",
    background: "var(--surface)",
    overflow: "hidden",
    minHeight: 0,
  },
};
