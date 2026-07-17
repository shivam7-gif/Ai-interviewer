import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: "⊞" },
  { to: "/interviews", label: "Interviews",  icon: "▶" },
  { to: "/reports",   label: "Reports",      icon: "⬒" },
  { to: "/settings",  label: "Settings",     icon: "⚙" },
];

export function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <aside style={s.sidebar}>
      {/* Logo */}
      <div style={s.logo}>
        <span style={s.logoMark}>OS</span>
        <span style={s.logoText}>InterviewOS</span>
      </div>

      <div style={s.divider} />

      {/* Navigation */}
      <nav style={s.nav}>
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.to} to={item.to} style={({ isActive }) => ({
            ...s.navItem,
            ...(isActive ? s.navItemActive : {}),
          })}>
            <span style={s.navIcon}>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div style={{ flex: 1 }} />

      {/* User */}
      {user && (
        <div style={s.userArea}>
          <div style={s.divider} />
          <div style={s.userRow}>
            <img src={user.picture} alt="" style={s.avatar} />
            <div style={s.userInfo}>
              <div style={s.userName}>{user.name}</div>
              <div style={s.userEmail}>{user.email}</div>
            </div>
          </div>
          <button style={s.logoutBtn} onClick={() => { logout(); navigate("/login"); }}>
            Sign out
          </button>
        </div>
      )}
    </aside>
  );
}

const s: Record<string, React.CSSProperties> = {
  sidebar: {
    width: "var(--sidebar-w)",
    flexShrink: 0,
    height: "100vh",
    background: "var(--surface)",
    borderRight: "1px solid var(--border)",
    display: "flex",
    flexDirection: "column",
    overflowY: "auto",
    position: "sticky",
    top: 0,
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "0 16px",
    height: "var(--topnav-h)",
    flexShrink: 0,
  },
  logoMark: {
    width: "26px",
    height: "26px",
    background: "var(--text)",
    color: "var(--bg)",
    fontSize: "11px",
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "var(--radius-sm)",
    letterSpacing: "0.02em",
    flexShrink: 0,
  },
  logoText: {
    fontSize: "13.5px",
    fontWeight: 600,
    color: "var(--text)",
    letterSpacing: "-0.01em",
  },
  divider: { height: "1px", background: "var(--border)", flexShrink: 0 },
  nav: {
    padding: "8px 8px",
    display: "flex",
    flexDirection: "column",
    gap: "1px",
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "0 10px",
    height: "32px",
    borderRadius: "var(--radius)",
    fontSize: "13px",
    fontWeight: 500,
    color: "var(--text-muted)",
    transition: "background var(--t), color var(--t)",
    textDecoration: "none",
  },
  navItemActive: {
    background: "var(--surface-2)",
    color: "var(--text)",
  },
  navIcon: { fontSize: "12px", width: "16px", textAlign: "center", flexShrink: 0 },
  userArea: { display: "flex", flexDirection: "column", flexShrink: 0 },
  userRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px 16px",
  },
  avatar: { width: "26px", height: "26px", borderRadius: "50%", flexShrink: 0 },
  userInfo: { overflow: "hidden", flex: 1 },
  userName: {
    fontSize: "12.5px",
    fontWeight: 500,
    color: "var(--text)",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  userEmail: {
    fontSize: "11px",
    color: "var(--text-muted)",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  logoutBtn: {
    margin: "0 8px 8px",
    padding: "0 10px",
    height: "28px",
    background: "transparent",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    color: "var(--text-muted)",
    fontSize: "12px",
    cursor: "pointer",
    textAlign: "left",
    transition: "color var(--t), border-color var(--t)",
  },
};
