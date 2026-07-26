import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const STATS = [
  { value: "3-panel", label: "workspace layout" },
  { value: "15+",     label: "languages supported" },
  { value: "Real-time", label: "voice AI interview" },
];

export const LandingPage = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  const handleStart = () => navigate(isLoggedIn ? "/dashboard" : "/login");

  return (
    <div style={s.shell}>
      {/* Nav */}
      <nav style={s.nav}>
        <div style={s.navLeft}>
          <span style={s.logoMark}>OS</span>
          <span style={s.logoText}>InterviewOS</span>
        </div>
        <div style={s.navRight}>
          <a href="#features" style={s.navLink}>Features</a>
          <a href="#stack" style={s.navLink}>Stack</a>
          <button style={s.navBtn} onClick={handleStart}>
            {isLoggedIn ? "Open Dashboard" : "Get Started"}
          </button>
        </div>
      </nav>

      {/* Hero */}
      <main style={s.hero}>
        <div style={s.eyebrow}>
          <span className="badge badge-default">Open Beta</span>
          <span style={s.eyebrowText}>AI-powered technical interviews</span>
        </div>

        <h1 style={s.heading}>
          The serious engineering<br />interview platform.
        </h1>

        <p style={s.sub}>
          InterviewOS analyses your GitHub repositories and conducts a real-time
          technical interview via voice AI — while you code in a full Monaco
          editor. Purpose-built for engineers, not entertainment.
        </p>

        <div style={s.actions}>
          <button className="btn btn-primary btn-lg" onClick={handleStart} id="hero-cta">
            {isLoggedIn ? "Open Dashboard" : "Start an interview"}
          </button>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost btn-lg"
          >
            View on GitHub
          </a>
        </div>

        {/* Stats bar */}
        <div style={s.statsBar}>
          {STATS.map((stat, i) => (
            <div key={stat.label} style={s.statItem}>
              {i > 0 && <div style={s.statDivider} />}
              <span style={s.statValue}>{stat.value}</span>
              <span style={s.statLabel}>{stat.label}</span>
            </div>
          ))}
        </div>
      </main>

      {/* Feature table */}
      <section id="features" style={s.section}>
        <div style={s.sectionInner}>
          <p style={s.sectionLabel}>CAPABILITIES</p>
          <div style={s.featureTable}>
            {[
              { title: "GitHub Integration",  desc: "Fetches your public repositories and generates context-aware, project-specific interview questions." },
              { title: "Voice AI",            desc: "LiveKit WebRTC powers low-latency voice so the interview feels natural, not robotic." },
              { title: "Monaco Editor",       desc: "Full VS Code-grade editor with syntax highlighting, autocomplete, and 15+ language support." },
              { title: "Interview Sessions",  desc: "Every session is persisted — review transcripts, scores, and conversation history." },
              { title: "Question Bank",       desc: "Pull from LeetCode, HackerRank, Codeforces and other platforms for structured assessments." },
              { title: "Google OAuth",        desc: "One-click sign-in. No passwords, no friction. Your data stays with you." },
            ].map((f, i) => (
              <div key={f.title} style={{ ...s.featureRow, ...(i < 5 ? { borderBottom: "1px solid var(--border)" } : {}) }}>
                <p style={s.featureTitle}>{f.title}</p>
                <p style={s.featureDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stack */}
      <section id="stack" style={{ ...s.section, background: "var(--surface)" }}>
        <div style={s.sectionInner}>
          <p style={s.sectionLabel}>TECH STACK</p>
          <div style={s.stackGrid}>
            {[
              ["React 19", "Frontend"],
              ["TypeScript", "Type safety"],
              ["Vite 8", "Build tool"],
              ["Node.js + Express", "Backend"],
              ["PostgreSQL", "Database"],
              ["Prisma ORM", "Data layer"],
              ["LiveKit", "WebRTC voice"],
              ["Socket.IO", "Real-time events"],
              ["Google OAuth", "Authentication"],
            ].map(([name, role]) => (
              <div key={name} style={s.stackItem}>
                <span style={s.stackName}>{name}</span>
                <span style={s.stackRole}>{role}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={s.footer}>
        <span>InterviewOS AI · Built by Shivam · MIT License</span>
        <span>© {new Date().getFullYear()}</span>
      </footer>
    </div>
  );
};

const s: Record<string, React.CSSProperties> = {
  shell: {
    minHeight: "100vh",
    background: "var(--bg)",
    fontFamily: "'Inter', system-ui, sans-serif",
    color: "var(--text)",
    display: "flex",
    flexDirection: "column",
  },

  // Nav
  nav: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 40px",
    height: "56px",
    borderBottom: "1px solid var(--border)",
    position: "sticky",
    top: 0,
    background: "var(--bg)",
    zIndex: 100,
  },
  navLeft:  { display: "flex", alignItems: "center", gap: "10px" },
  navRight: { display: "flex", alignItems: "center", gap: "20px" },
  logoMark: {
    width: "26px", height: "26px",
    background: "var(--text)", color: "var(--bg)",
    fontSize: "11px", fontWeight: 700,
    display: "flex", alignItems: "center", justifyContent: "center",
    borderRadius: "4px",
  },
  logoText: { fontSize: "14px", fontWeight: 600, color: "var(--text)", letterSpacing: "-0.01em" },
  navLink:  { fontSize: "13px", color: "var(--text-muted)", textDecoration: "none", transition: "color 150ms" },
  navBtn: {
    height: "30px",
    padding: "0 14px",
    background: "var(--text)",
    color: "var(--bg)",
    border: "none",
    borderRadius: "var(--radius)",
    fontSize: "13px",
    fontWeight: 500,
    cursor: "pointer",
  },

  // Hero
  hero: {
    maxWidth: "720px",
    margin: "0 auto",
    padding: "80px 40px 80px",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    width: "100%",
  },
  eyebrow: { display: "flex", alignItems: "center", gap: "12px" },
  eyebrowText: { fontSize: "13px", color: "var(--text-muted)" },
  heading: {
    fontSize: "clamp(28px, 5vw, 48px)",
    fontWeight: 600,
    color: "var(--text)",
    lineHeight: 1.15,
    letterSpacing: "-0.03em",
    margin: 0,
  },
  sub: { fontSize: "15px", color: "var(--text-muted)", lineHeight: 1.7, maxWidth: "560px" },
  actions: { display: "flex", gap: "10px", flexWrap: "wrap" },

  // Stats
  statsBar: {
    display: "flex",
    alignItems: "center",
    gap: "0",
    padding: "16px 0",
    borderTop: "1px solid var(--border)",
    borderBottom: "1px solid var(--border)",
    marginTop: "12px",
  },
  statItem:    { display: "flex", flexDirection: "column", gap: "2px", flex: 1, padding: "0 20px 0 0" },
  statDivider: { width: "1px", height: "32px", background: "var(--border)", marginRight: "20px", flexShrink: 0 },
  statValue:   { fontSize: "15px", fontWeight: 600, color: "var(--text)", letterSpacing: "-0.02em" },
  statLabel:   { fontSize: "12px", color: "var(--text-muted)" },

  // Sections
  section:      { padding: "60px 40px" },
  sectionInner: { maxWidth: "720px", margin: "0 auto" },
  sectionLabel: { fontSize: "11px", fontWeight: 500, color: "var(--text-faint)", letterSpacing: "0.08em", marginBottom: "20px" },

  // Feature table
  featureTable: { border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden" },
  featureRow:   { display: "flex", gap: "32px", padding: "16px 20px", background: "var(--surface)" },
  featureTitle: { width: "180px", flexShrink: 0, fontSize: "13.5px", fontWeight: 500, color: "var(--text)" },
  featureDesc:  { fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.6, flex: 1 },

  // Stack grid
  stackGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
    gap: "1px",
    background: "var(--border)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-lg)",
    overflow: "hidden",
  },
  stackItem: {
    background: "var(--surface)",
    padding: "14px 16px",
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  stackName: { fontSize: "13px", fontWeight: 500, color: "var(--text)" },
  stackRole: { fontSize: "12px", color: "var(--text-muted)" },

  // Footer
  footer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 40px",
    borderTop: "1px solid var(--border)",
    fontSize: "12px",
    color: "var(--text-faint)",
    marginTop: "auto",
  },
};