import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

interface TopNavProps {
  title: string;
}

export function TopNav({ title }: TopNavProps) {
  const { user } = useAuth();
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    return (localStorage.getItem("theme") as "dark" | "light") ?? "dark";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <header style={s.nav}>
      <span style={s.title}>{title}</span>

      <div style={s.right}>
        {/* Search */}
        <div style={s.searchWrap}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--text-faint)", flexShrink: 0 }}>
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input style={s.search} placeholder="Search..." />
          <kbd style={s.kbd}>⌘K</kbd>
        </div>

        {/* Theme toggle */}
        <button
          style={s.iconBtn}
          onClick={() => setTheme(t => t === "dark" ? "light" : "dark")}
          title="Toggle theme"
        >
          {theme === "dark" ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          )}
        </button>

        {/* Avatar */}
        {user?.picture && (
          <img src={user.picture} alt="" style={s.avatar} />
        )}
      </div>
    </header>
  );
}

const s: Record<string, React.CSSProperties> = {
  nav: {
    height: "var(--topnav-h)",
    borderBottom: "1px solid var(--border)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 24px",
    background: "var(--bg)",
    flexShrink: 0,
  },
  title: {
    fontSize: "13.5px",
    fontWeight: 500,
    color: "var(--text)",
    letterSpacing: "-0.01em",
  },
  right: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  searchWrap: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "0 10px",
    height: "30px",
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    width: "200px",
  },
  search: {
    flex: 1,
    background: "transparent",
    border: "none",
    outline: "none",
    fontSize: "12.5px",
    color: "var(--text-muted)",
    minWidth: 0,
  },
  kbd: {
    fontSize: "11px",
    color: "var(--text-faint)",
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    borderRadius: "3px",
    padding: "1px 4px",
    flexShrink: 0,
  },
  iconBtn: {
    width: "30px",
    height: "30px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "transparent",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    color: "var(--text-muted)",
    transition: "background var(--t), color var(--t)",
    flexShrink: 0,
  },
  avatar: {
    width: "26px",
    height: "26px",
    borderRadius: "50%",
    border: "1px solid var(--border)",
    flexShrink: 0,
  },
};
