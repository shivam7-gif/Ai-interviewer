import React from "react";
import { Terminal } from "lucide-react";

interface NavbarProps {
  sessionId?: string;
  userName?: string;
  userAvatar?: string;
  timeRemaining?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  sessionId,
  userName,
  userAvatar,
  timeRemaining = "44:23",
}) => {
  return (
    <header className="interview-navbar">
      {/* Left */}
      <div className="nav-left">
        <div className="logo-mark">
          <Terminal size={13} strokeWidth={2.5} />
        </div>
        <span className="logo-text">InterviewOS</span>
        <div className="nav-divider" />
        <span className="session-label">Session</span>
        <code className="session-id">{sessionId?.slice(0, 8) ?? "a3f9c1b2"}</code>
      </div>

      {/* Center — timer */}
      <div className="nav-center">
        <div className="timer-chip">
          <span className="timer-dot" />
          <span className="timer-value">{timeRemaining}</span>
          <span className="timer-unit">remaining</span>
        </div>
      </div>

      {/* Right */}
      <div className="nav-right">
        <div className="user-pill">
          {userAvatar ? (
            <img src={userAvatar} alt={userName ?? "User"} className="user-avatar" />
          ) : (
            <div className="user-avatar-placeholder">
              {(userName ?? "U")[0].toUpperCase()}
            </div>
          )}
          <span className="user-name">{userName ?? "Candidate"}</span>
        </div>
      </div>
    </header>
  );
};
