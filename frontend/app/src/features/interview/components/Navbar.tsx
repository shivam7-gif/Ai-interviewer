import React, { useState, useEffect } from "react";
import { Terminal, Sun, Moon } from "lucide-react";

interface NavbarProps {
  sessionId?: string;
  userName?: string;
  userAvatar?: string;
  timeRemaining?: string;
  isWarning?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  sessionId,
  userName,
  userAvatar,
  timeRemaining = "44:23",
  isWarning = false,
}) => {
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    return (localStorage.getItem("theme") as "dark" | "light") ?? "dark";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  };

  return (
    <header className="interview-topbar">
      {/* Left: wordmark and session id (mono, muted) */}
      <div className="topbar-left">
        <span className="session-tag">session</span>
        <code className="session-code">
          {sessionId ? sessionId.slice(0, 8) : "a3f9c1b2"}
        </code>
      </div>

      {/* Center: timer centered in mono, plain text, no pill background */}
      <div className="topbar-center">
        <span
          className={`topbar-timer ${isWarning ? "timer-warning" : ""}`}
          aria-label={`Time remaining: ${timeRemaining}`}
        >
          {timeRemaining}
        </span>
      </div>

      {/* Right: user name and theme toggle */}
      <div className="topbar-right">
        <button
          className="theme-toggle-btn"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
          title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
        >
          {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
        </button>

        <div className="user-profile">
          {userAvatar ? (
            <img src={userAvatar} alt="" className="user-avatar-img" />
          ) : (
            <div className="user-avatar-fallback">
              {(userName ?? "C")[0].toUpperCase()}
            </div>
          )}
          <span className="user-display-name">{userName ?? "Candidate"}</span>
        </div>
      </div>
    </header>
  );
};
