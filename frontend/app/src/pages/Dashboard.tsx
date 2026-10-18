import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, Toaster } from "sonner";
import axios from "axios";
import { AppLayout } from "../components/layout/AppLayout";
import { BACKEND_URL } from "../lib/config";
import { connectWallet } from "../components/wallet/Metamask";
// ── Source types ──────────────────────────────────────────────────────────────

type Source = "github" | "codeforces" | "resume" | "questionbank" | "custom";

const SOURCES: { id: Source; label: string; description: string }[] = [
  {
    id: "github",
    label: "GitHub Repository",
    description:
      "Generate interview questions from a GitHub profile and project history.",
  },
  {
    id: "codeforces",
    label: "Codeforces Profile",
    description:
      "Analyze contest rating, strong topics, and low-solve-rate areas.",
  },
  {
    id: "resume",
    label: "Resume / CV",
    description:
      "Upload or paste your resume to tailor interview questions to your background.",
  },
  {
    id: "questionbank",
    label: "Question Bank",
    description:
      "Pull questions from LeetCode, HackerRank, Codeforces and other platforms.",
  },
  {
    id: "custom",
    label: "Custom Source",
    description:
      "Import questions from your own endpoint or upload a custom set.",
  },
];

const QUESTION_PLATFORMS = [
  "LeetCode",
  "HackerRank",
  "HackerEarth",
  "Codeforces",
  "OA Library",
];
const DIFFICULTIES = ["Easy", "Medium", "Hard"];
const TOPICS = [
  "Arrays",
  "Trees",
  "Graphs",
  "DP",
  "System Design",
  "Strings",
  "Math",
];

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
      const res = await axios.post(`${BACKEND_URL}/api/v1/pre-interview`, {
        gitHub: url,
      });
      navigate(`/project/${res.data.projectId}/check`);
    } catch {
      toast.error(
        "Failed to analyse repository. Please check the URL and try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={s.panel}>
      <div style={s.panelHeader}>
        <p style={s.panelTitle}>GitHub Repository</p>
        <p style={s.panelDesc}>
          The AI will analyse your public repositories and generate
          context-aware questions based on your actual work.
        </p>
      </div>

      <div style={s.form}>
        <div className="field">
          <label className="label">Repository or Profile URL</label>
          <input
            className="input"
            placeholder="https://github.com/username"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
        </div>

        <div style={s.row}>
          <div className="field" style={{ flex: 1 }}>
            <label className="label">Difficulty</label>
            <select
              className="input"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              style={s.select}
            >
              {DIFFICULTIES.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </div>
          <div className="field" style={{ flex: 1 }}>
            <label className="label">Duration (minutes)</label>
            <input
              className="input"
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              min="15"
              max="120"
            />
          </div>
        </div>

        <div style={s.info}>
          <span style={{ color: "var(--text-faint)", fontSize: "11px" }}>
            ⚠
          </span>
          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            Only public repositories are accessible. Ensure the GitHub URL is
            valid.
          </span>
        </div>
      </div>

      <div style={s.panelFooter}>
        <button
          className="btn btn-primary btn-lg"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner" />
              Analysing...
            </>
          ) : (
            "Analyse Repository →"
          )}
        </button>
        <button
          className="btn btn-primary btn-lg"
          onClick={() => connectWallet()}
        >
          Connect Wallet
        </button>
      </div>
    </div>
  );
}

// ── Codeforces Profile panel ──────────────────────────────────────────────────

interface CodeforcesProfileData {
  handle: string;
  rating: number | null;
  maxRating: number | null;
  rank: string | null;
  maxRank: string | null;
  solvedRecent: number;
  submissionsAnalysed: number;
  strongTags: string[];
  weakTags: string[];
  fetchedAt: string;
}

function CodeforcesPanel() {
  const navigate = useNavigate();
  const [handle, setHandle] = useState("");
  const [profile, setProfile] = useState<CodeforcesProfileData | null>(null);
  const [loading, setLoading] = useState(false);
  const [starting, setStarting] = useState(false);

  async function handleAnalyze() {
    if (!handle.trim()) {
      toast.error("Please enter a Codeforces handle or profile URL");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.get(
        `${BACKEND_URL}/api/v1/codeforces/${encodeURIComponent(handle.trim())}`
      );
      setProfile(res.data.profile);
      toast.success(`Profile loaded for ${res.data.profile.handle}`);
    } catch (err: any) {
      toast.error(
        err.response?.data?.error ?? "Failed to fetch Codeforces profile."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleStart() {
    const targetHandle = profile ? profile.handle : handle.trim();
    if (!targetHandle) {
      toast.error("Please enter a Codeforces handle first");
      return;
    }
    setStarting(true);
    try {
      const res = await axios.post(`${BACKEND_URL}/api/v1/pre-interview`, {
        codeforcesHandle: targetHandle,
      });
      navigate(`/project/${res.data.projectId}/check`);
    } catch {
      toast.error("Failed to initialize interview. Please try again.");
    } finally {
      setStarting(false);
    }
  }

  return (
    <div style={s.panel}>
      <div style={s.panelHeader}>
        <p style={s.panelTitle}>Codeforces Profile</p>
        <p style={s.panelDesc}>
          Analyse contest ratings, submission history, and topic proficiencies to
          generate targeted competitive programming questions.
        </p>
      </div>

      <div style={s.form}>
        <div className="field">
          <label className="label">Codeforces Handle or Profile URL</label>
          <div style={{ display: "flex", gap: "8px" }}>
            <input
              className="input"
              placeholder="e.g. tourist or https://codeforces.com/profile/tourist"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
              style={{ flex: 1 }}
            />
            <button
              className="btn btn-secondary"
              onClick={handleAnalyze}
              disabled={loading}
              type="button"
            >
              {loading ? "Analyzing..." : "Analyze"}
            </button>
          </div>
        </div>

        {profile && (
          <div style={s.profileCard}>
            <div style={s.profileHeader}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={s.profileHandle}>{profile.handle}</span>
                <span style={s.profileRank}>{profile.rank ?? "unrated"}</span>
              </div>
              <div style={s.profileStats}>
                <span>Rating: <strong>{profile.rating ?? "—"}</strong></span>
                <span style={{ color: "var(--text-faint)" }}>•</span>
                <span>Max: <strong>{profile.maxRating ?? "—"}</strong> ({profile.maxRank ?? "—"})</span>
              </div>
            </div>

            <div style={s.profileRow}>
              <div style={s.statBox}>
                <span style={s.statValue}>{profile.solvedRecent}</span>
                <span style={s.statLabel}>Solved problems (recent {profile.submissionsAnalysed} submissions)</span>
              </div>
            </div>

            <div style={{ marginTop: "12px" }}>
              <span style={s.tagHeader}>Strongest Topics:</span>
              <div style={s.tagList}>
                {profile.strongTags.length ? (
                  profile.strongTags.map((tag) => (
                    <span key={tag} style={s.strongTagBadge}>
                      ✓ {tag}
                    </span>
                  ))
                ) : (
                  <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>None detected</span>
                )}
              </div>
            </div>

            <div style={{ marginTop: "10px" }}>
              <span style={s.tagHeader}>Lowest Solve-Rate Topics (Targeted Questions):</span>
              <div style={s.tagList}>
                {profile.weakTags.length ? (
                  profile.weakTags.map((tag) => (
                    <span key={tag} style={s.weakTagBadge}>
                      ⚠ {tag}
                    </span>
                  ))
                ) : (
                  <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>None detected</span>
                )}
              </div>
            </div>
          </div>
        )}

        <div style={s.info}>
          <span style={{ color: "var(--text-faint)", fontSize: "11px" }}>⚠</span>
          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            Codeforces rate limit allows 1 call per 2 seconds. The analysis is cached for 10 minutes.
          </span>
        </div>
      </div>

      <div style={s.panelFooter}>
        <button
          className="btn btn-primary btn-lg"
          onClick={handleStart}
          disabled={starting}
        >
          {starting ? (
            <>
              <span className="spinner" />
              Starting Assessment...
            </>
          ) : (
            "Start Codeforces Assessment →"
          )}
        </button>
      </div>
    </div>
  );
}

// ── Resume Ingestion panel ────────────────────────────────────────────────────

function ResumePanel() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"upload" | "paste">("upload");
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [words, setWords] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [starting, setStarting] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (!selected.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Please upload a PDF file.");
      return;
    }
    setFile(selected);
    await uploadResume(selected);
  }

  async function uploadResume(pdfFile: File) {
    setUploading(true);
    const formData = new FormData();
    formData.append("file", pdfFile);

    try {
      let res;
      try {
        res = await axios.post(`${BACKEND_URL}/api/v1/ingest/resume`, formData);
      } catch {
        res = await axios.post("http://localhost:8000/ingest/resume", formData);
      }

      setText(res.data.text);
      setWords(res.data.words ?? res.data.text.trim().split(/\s+/).length);
      toast.success(`Resume ingested successfully (${res.data.words} words)!`);
    } catch (err: any) {
      toast.error(
        err.response?.data?.detail ??
        err.response?.data?.error ??
        "Failed to extract resume text. You can paste your resume text directly."
      );
    } finally {
      setUploading(false);
    }
  }

  async function handleStart() {
    const activeText = text.trim();
    if (!activeText) {
      toast.error("Please upload a resume PDF or paste resume text first.");
      return;
    }
    setStarting(true);
    try {
      const res = await axios.post(`${BACKEND_URL}/api/v1/pre-interview`, {
        resumeText: activeText,
        resumeWords: words || activeText.split(/\s+/).length,
      });
      navigate(`/project/${res.data.projectId}/check`);
    } catch {
      toast.error("Failed to start interview. Please try again.");
    } finally {
      setStarting(false);
    }
  }

  return (
    <div style={s.panel}>
      <div style={s.panelHeader}>
        <p style={s.panelTitle}>Resume / CV Ingestion</p>
        <p style={s.panelDesc}>
          Upload your PDF resume or paste text to generate bespoke technical interview
          questions tailored to your project experience, stack, and skill gaps.
        </p>
      </div>

      <div style={s.form}>
        <div style={{ display: "flex", gap: "8px", marginBottom: "4px" }}>
          <button
            type="button"
            style={{
              ...s.platformBtn,
              ...(tab === "upload" ? s.platformBtnActive : {}),
            }}
            onClick={() => setTab("upload")}
          >
            Upload PDF
          </button>
          <button
            type="button"
            style={{
              ...s.platformBtn,
              ...(tab === "paste" ? s.platformBtnActive : {}),
            }}
            onClick={() => setTab("paste")}
          >
            Paste Text
          </button>
        </div>

        {tab === "upload" ? (
          <div style={s.dropzone}>
            <label style={s.dropzoneLabel}>
              <span style={{ fontSize: "28px", marginBottom: "8px" }}>📄</span>
              <span style={{ fontWeight: 500, color: "var(--text)", fontSize: "13px" }}>
                {file ? file.name : "Click to select or drag & drop a PDF resume"}
              </span>
              <span style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                Maximum 5 MB, up to 4 pages (text-based PDF)
              </span>
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
            </label>
            {uploading && (
              <div style={{ marginTop: "12px", display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "var(--accent)" }}>
                <span className="spinner" /> Ingesting & extracting text...
              </div>
            )}
          </div>
        ) : (
          <div className="field">
            <label className="label">Paste Resume Content</label>
            <textarea
              className="input"
              rows={8}
              placeholder="Paste the plain text of your resume here..."
              value={text}
              onChange={(e) => {
                const val = e.target.value;
                setText(val);
                setWords(val.trim() ? val.trim().split(/\s+/).length : 0);
              }}
              style={{ fontFamily: "monospace", fontSize: "12px", lineHeight: "1.5", resize: "vertical" }}
            />
          </div>
        )}

        {text && (
          <div style={s.resumePreview}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text)" }}>Extracted Content Preview</span>
              <span style={{ fontSize: "11px", color: "var(--accent)", fontWeight: 500 }}>{words} words parsed</span>
            </div>
            <p style={s.previewSnippet}>{text.slice(0, 320)}...</p>
          </div>
        )}

        <div style={s.info}>
          <span style={{ color: "var(--text-faint)", fontSize: "11px" }}>ℹ</span>
          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            The AI engine extracts skills, tools, and project highlights to frame real-world situational questions.
          </span>
        </div>
      </div>

      <div style={s.panelFooter}>
        <button
          className="btn btn-primary btn-lg"
          onClick={handleStart}
          disabled={starting || !text}
        >
          {starting ? (
            <>
              <span className="spinner" />
              Starting Interview...
            </>
          ) : (
            "Start Resume-Based Interview →"
          )}
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
          Select questions from popular competitive programming platforms and
          configure the assessment parameters.
        </p>
      </div>

      <div style={s.form}>
        <div className="field">
          <label className="label">Platform</label>
          <div style={s.platformGrid}>
            {QUESTION_PLATFORMS.map((p) => (
              <button
                key={p}
                style={{
                  ...s.platformBtn,
                  ...(platform === p ? s.platformBtnActive : {}),
                }}
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
            <select
              className="input"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              style={s.select}
            >
              {DIFFICULTIES.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </div>
          <div className="field" style={{ flex: 1 }}>
            <label className="label">Topic</label>
            <select
              className="input"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              style={s.select}
            >
              {TOPICS.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="field" style={{ width: "100px" }}>
            <label className="label">Count</label>
            <input
              className="input"
              type="number"
              value={count}
              onChange={(e) => setCount(e.target.value)}
              min="1"
              max="50"
            />
          </div>
        </div>
      </div>

      <div style={s.panelFooter}>
        <button
          className="btn btn-ghost btn-lg"
          onClick={() => toast.info("Question Bank integration coming soon")}
        >
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
          Connect your own question endpoint or import from a structured
          dataset.
        </p>
      </div>

      <div style={s.form}>
        <div className="field">
          <label className="label">API Endpoint</label>
          <input
            className="input"
            placeholder="https://your-api.com/questions"
            value={endpoint}
            onChange={(e) => setEndpoint(e.target.value)}
          />
        </div>
        <div style={s.row}>
          <div className="field" style={{ flex: 1 }}>
            <label className="label">Category</label>
            <input
              className="input"
              placeholder="e.g. backend-fundamentals"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>
          <div className="field" style={{ width: "100px" }}>
            <label className="label">Count</label>
            <input
              className="input"
              type="number"
              value={count}
              onChange={(e) => setCount(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div style={s.panelFooter}>
        <button
          className="btn btn-ghost btn-lg"
          onClick={() => toast.info("Custom source integration coming soon")}
        >
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
    github: <GitHubPanel />,
    codeforces: <CodeforcesPanel />,
    resume: <ResumePanel />,
    questionbank: <QuestionBankPanel />,
    custom: <CustomPanel />,
  };

  return (
    <AppLayout title="Dashboard">
      <Toaster richColors position="top-right" />

      <div style={s.page}>
        {/* Page header */}
        <div style={s.header}>
          <div>
            <h1 style={s.heading}>Create Interview</h1>
            <p style={s.sub}>
              Generate technical interviews from multiple sources.
            </p>
          </div>
        </div>

        <div style={s.workspace}>
          {/* Source selector */}
          <div style={s.sourceList}>
            <p style={s.sectionLabel}>Interview Source</p>
            {SOURCES.map((src) => (
              <button
                key={src.id}
                style={{
                  ...s.sourceItem,
                  ...(active === src.id ? s.sourceItemActive : {}),
                }}
                onClick={() => setActive(src.id)}
              >
                <span style={s.sourceLabel}>{src.label}</span>
                <span style={s.sourceDesc}>{src.description}</span>
                {active === src.id && <span style={s.activeIndicator} />}
              </button>
            ))}
          </div>

          {/* Configuration panel */}
          <div style={s.configArea}>{panelMap[active]}</div>
        </div>
      </div>
    </AppLayout>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────

const s: Record<string, React.CSSProperties> = {
  page: {
    padding: "32px 32px",
    maxWidth: "1100px",
    margin: "0 auto",
    width: "100%",
  },
  header: { marginBottom: "28px" },
  heading: {
    fontSize: "18px",
    fontWeight: 600,
    color: "var(--text)",
    letterSpacing: "-0.02em",
    marginBottom: "4px",
  },
  sub: { fontSize: "13px", color: "var(--text-muted)" },
  workspace: {
    display: "flex",
    gap: "0",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-lg)",
    overflow: "hidden",
    background: "var(--surface)",
  },

  // Source list (left)
  sourceList: {
    width: "260px",
    flexShrink: 0,
    borderRight: "1px solid var(--border)",
    padding: "12px 0",
  },
  sectionLabel: {
    fontSize: "11px",
    fontWeight: 500,
    color: "var(--text-faint)",
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    padding: "4px 16px 8px",
  },
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
  sourceDesc: {
    fontSize: "11.5px",
    color: "var(--text-muted)",
    lineHeight: 1.4,
  },
  activeIndicator: {
    position: "absolute",
    left: 0,
    top: "25%",
    bottom: "25%",
    width: "2px",
    background: "var(--accent)",
    borderRadius: "0 2px 2px 0",
  },

  // Config area (right)
  configArea: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },

  // Panel
  panel: { flex: 1, display: "flex", flexDirection: "column" },
  panelHeader: {
    padding: "24px 28px 20px",
    borderBottom: "1px solid var(--border)",
  },
  panelTitle: {
    fontSize: "14px",
    fontWeight: 600,
    color: "var(--text)",
    marginBottom: "4px",
  },
  panelDesc: { fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.5 },
  form: {
    padding: "24px 28px",
    display: "flex",
    flexDirection: "column",
    gap: "18px",
    flex: 1,
  },
  row: { display: "flex", gap: "12px", alignItems: "flex-end" },
  info: {
    display: "flex",
    alignItems: "flex-start",
    gap: "8px",
    padding: "10px 12px",
    background: "var(--surface-2)",
    borderRadius: "var(--radius)",
    border: "1px solid var(--border)",
  },
  panelFooter: {
    padding: "16px 28px 24px",
    borderTop: "1px solid var(--border)",
    display: "flex",
    gap: "10px",
  },
  select: { appearance: "none", cursor: "pointer" },

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
  profileCard: {
    padding: "16px",
    background: "var(--surface-2)",
    borderRadius: "var(--radius)",
    border: "1px solid var(--border)",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  profileHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "8px",
  },
  profileHandle: {
    fontSize: "15px",
    fontWeight: 600,
    color: "var(--text)",
  },
  profileRank: {
    fontSize: "11px",
    padding: "2px 8px",
    borderRadius: "999px",
    background: "var(--accent-faint)",
    color: "var(--accent)",
    fontWeight: 500,
    textTransform: "capitalize",
  },
  profileStats: {
    fontSize: "12px",
    color: "var(--text-muted)",
    display: "flex",
    gap: "6px",
    alignItems: "center",
  },
  profileRow: {
    display: "flex",
    gap: "12px",
  },
  statBox: {
    padding: "8px 12px",
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    flex: 1,
  },
  statValue: {
    fontSize: "14px",
    fontWeight: 600,
    color: "var(--text)",
  },
  statLabel: {
    fontSize: "11px",
    color: "var(--text-muted)",
  },
  tagHeader: {
    fontSize: "11.5px",
    fontWeight: 500,
    color: "var(--text-muted)",
    display: "block",
    marginBottom: "4px",
  },
  tagList: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
  },
  strongTagBadge: {
    fontSize: "11px",
    padding: "2px 8px",
    borderRadius: "4px",
    background: "rgba(16, 185, 129, 0.12)",
    border: "1px solid rgba(16, 185, 129, 0.3)",
    color: "#10b981",
    fontWeight: 500,
  },
  weakTagBadge: {
    fontSize: "11px",
    padding: "2px 8px",
    borderRadius: "4px",
    background: "rgba(245, 158, 11, 0.12)",
    border: "1px solid rgba(245, 158, 11, 0.3)",
    color: "#f59e0b",
    fontWeight: 500,
  },
  dropzone: {
    border: "2px dashed var(--border)",
    borderRadius: "var(--radius)",
    padding: "28px 16px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    background: "var(--surface-2)",
  },
  dropzoneLabel: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    cursor: "pointer",
    width: "100%",
  },
  resumePreview: {
    padding: "12px 14px",
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
  },
  previewSnippet: {
    fontSize: "11.5px",
    color: "var(--text-muted)",
    lineHeight: 1.5,
    margin: 0,
    fontFamily: "monospace",
    whiteSpace: "pre-wrap",
  },
};
