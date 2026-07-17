import { useGoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      const profile = await fetch(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        { headers: { Authorization: `Bearer ${tokenResponse.access_token}` } }
      ).then((res) => res.json());
      login({ ...profile });
      navigate("/dashboard");
    },
    onError: () => console.error("Google login failed"),
  });

  return (
    <div style={s.shell}>
      <div style={s.card}>
        {/* Logo */}
        <div style={s.logo}>
          <span style={s.logoMark}>OS</span>
          <span style={s.logoText}>InterviewOS</span>
        </div>

        <div style={s.divider} />

        <div style={s.body}>
          <p style={s.heading}>Sign in to your account</p>
          <p style={s.sub}>Continue with your Google account to access the platform.</p>

          <button id="google-login-btn" style={s.googleBtn} onClick={() => googleLogin()}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>
        </div>

        <div style={s.divider} />

        <div style={s.footer}>
          <p style={s.footerText}>
            By signing in you agree to our{" "}
            <a href="#" style={s.footerLink}>Terms of Service</a>
            {" "}and{" "}
            <a href="#" style={s.footerLink}>Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

const s: Record<string, React.CSSProperties> = {
  shell: {
    minHeight: "100vh",
    background: "var(--bg)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Inter', system-ui, sans-serif",
    padding: "24px",
  },
  card: {
    width: "100%",
    maxWidth: "360px",
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-lg)",
    overflow: "hidden",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "20px 24px",
  },
  logoMark: {
    width: "26px", height: "26px",
    background: "var(--text)", color: "var(--bg)",
    fontSize: "11px", fontWeight: 700,
    display: "flex", alignItems: "center", justifyContent: "center",
    borderRadius: "var(--radius-sm)",
    letterSpacing: "0.02em",
    flexShrink: 0,
  },
  logoText: { fontSize: "14px", fontWeight: 600, color: "var(--text)" },
  divider:  { height: "1px", background: "var(--border)" },
  body:     { padding: "24px" },
  heading:  { fontSize: "14px", fontWeight: 600, color: "var(--text)", marginBottom: "4px" },
  sub:      { fontSize: "12.5px", color: "var(--text-muted)", lineHeight: 1.5, marginBottom: "20px" },
  googleBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    width: "100%",
    height: "36px",
    background: "var(--bg)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    fontSize: "13px",
    fontWeight: 500,
    color: "var(--text)",
    cursor: "pointer",
    transition: "border-color 150ms ease, background 150ms ease",
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  footer:     { padding: "14px 24px" },
  footerText: { fontSize: "11.5px", color: "var(--text-faint)", lineHeight: 1.5 },
  footerLink: { color: "var(--text-muted)", textDecoration: "underline", textUnderlineOffset: "2px" },
};
