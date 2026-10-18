import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Mic, MicOff, Video, VideoOff } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Navbar } from "./components/Navbar";
import { LeftPanel } from "./components/LeftPanel";
import { CodeEditor } from "./components/CodeEditor";
import { ProblemTabs } from "./components/ProblemTabs";
import { SESSION_PROBLEM, SOLUTION_CODE } from "./data";
import { useCamera } from "./hooks";
import { useInterviewMediaStore } from "../../stores/InterviewMediaStore";
import "./interview.css";
import "./deviceCheck.css";

/* ── Resizable panel separator ───────────────────────────────────── */
interface SeparatorProps {
  onMouseDown: (e: React.MouseEvent) => void;
}

const PanelSeparator: React.FC<SeparatorProps> = ({ onMouseDown }) => (
  <div
    className="panel-separator"
    onMouseDown={onMouseDown}
    title="Drag to resize"
  >
    <div className="separator-handle" />
  </div>
);

/* ── Skeleton loader ─────────────────────────────────────────────── */
const LoadingSkeleton: React.FC = () => (
  <div className="loading-skeleton">
    <div className="skeleton-nav" />
    <div className="skeleton-body">
      <div className="skeleton-panel" />
      <div className="skeleton-panel skeleton-panel-wide" />
      <div className="skeleton-panel" />
    </div>
  </div>
);

/* ── InterviewPage ───────────────────────────────────────────────── */
const STORAGE_KEY = "interviewos_panel_sizes";
const DEFAULT_SIZES = [22, 50, 28]; // %

export const InterviewPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { stream, isSessionChecked } = useInterviewMediaStore();

  // Guard the IDE route: redirect to check page if not verified or tracks not live
  useEffect(() => {
    if (!projectId || !isSessionChecked(projectId)) {
      navigate(`/project/${projectId}/check`, { replace: true });
    }
  }, [projectId, isSessionChecked, navigate]);

  const [ready, setReady] = useState(false);
  const [disconnectedKind, setDisconnectedKind] = useState<"camera" | "microphone" | null>(null);

  // Timer starts only after entering the IDE; preserved across check page trips
  const TIMER_STORAGE_KEY = `interview_timer_${projectId}`;
  const getInitialTimer = (): number => {
    try {
      const saved = sessionStorage.getItem(TIMER_STORAGE_KEY);
      if (saved) return Number(saved);
    } catch {}
    return 90 * 60; // 90 min in seconds
  };

  const [timer, setTimer] = useState<number>(getInitialTimer);
  const [isFullIde, setIsFullIde] = useState(false);

  const handleTrackEnded = (kind: "video" | "audio") => {
    setDisconnectedKind(kind === "video" ? "camera" : "microphone");
  };

  const camera = useCamera(stream, handleTrackEnded);
  const containerRef = useRef<HTMLDivElement>(null);

  // Panel sizes
  const getSavedSizes = (): number[] => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return DEFAULT_SIZES;
  };

  const [sizes, setSizes] = useState<number[]>(getSavedSizes);
  const draggingRef = useRef<{ sep: number; startX: number; startSizes: number[] } | null>(null);

  // Persist sizes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sizes));
  }, [sizes]);

  // Countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((t) => {
        const next = Math.max(0, t - 1);
        try {
          sessionStorage.setItem(TIMER_STORAGE_KEY, String(next));
        } catch {}
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [TIMER_STORAGE_KEY]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  // Loading simulation
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 600);
    return () => clearTimeout(t);
  }, []);

  // Escape key exits Full IDE mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullIde) {
        setIsFullIde(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullIde]);

  // Drag resize logic
  const onSepMouseDown = (sepIdx: number) => (e: React.MouseEvent) => {
    e.preventDefault();
    draggingRef.current = {
      sep: sepIdx,
      startX: e.clientX,
      startSizes: [...sizes],
    };
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!draggingRef.current || !containerRef.current) return;
      const { sep, startX, startSizes } = draggingRef.current;
      const totalW = containerRef.current.getBoundingClientRect().width;
      const dx = ((e.clientX - startX) / totalW) * 100;
      const newSizes = [...startSizes];
      const minSize = 15;
      newSizes[sep] = Math.max(minSize, startSizes[sep] + dx);
      newSizes[sep + 1] = Math.max(minSize, startSizes[sep + 1] - dx);
      // Ensure total stays 100
      const total = newSizes.reduce((a, b) => a + b, 0);
      const scale = 100 / total;
      setSizes(newSizes.map((s) => s * scale));
    };

    const onMouseUp = () => {
      draggingRef.current = null;
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  const [mobileTab, setMobileTab] = useState<"editor" | "problem">("editor");

  if (!ready) return <LoadingSkeleton />;

  const displayName = user?.name?.split(" ")[0] ?? "You";

  return (
    <div className="interview-shell">
      <Navbar
        sessionId={projectId}
        userName={user?.name ?? undefined}
        userAvatar={user?.picture ?? undefined}
        timeRemaining={formatTime(timer)}
        isWarning={timer < 600}
      />

      {/* Non-blocking device disconnection banner */}
      {disconnectedKind && (
        <div className="device-disconnect-banner" role="alert">
          <div className="device-disconnect-msg">
            <span className="disconnect-dot" aria-hidden="true" />
            <span>
              {disconnectedKind === "camera"
                ? "Camera disconnected. Reconnect to continue."
                : "Microphone disconnected. Reconnect to continue."}
            </span>
          </div>
          <button
            type="button"
            className="disconnect-fix-btn"
            onClick={() => navigate(`/project/${projectId}/check`)}
          >
            Fix
          </button>
        </div>
      )}

      {/* Responsive tabs below 1024px (hidden in Full IDE mode) */}
      {!isFullIde && (
        <div className="mobile-view-tabs" role="tablist" aria-label="Interview Panels">
          <button
            type="button"
            role="tab"
            aria-selected={mobileTab === "editor"}
            className={`mobile-view-tab ${mobileTab === "editor" ? "active" : ""}`}
            onClick={() => setMobileTab("editor")}
          >
            Code Editor
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mobileTab === "problem"}
            className={`mobile-view-tab ${mobileTab === "problem" ? "active" : ""}`}
            onClick={() => setMobileTab("problem")}
          >
            Problem Description
          </button>
        </div>
      )}

      {/* Three-panel workspace */}
      <div
        className={`interview-workspace mobile-active-${mobileTab} ${
          isFullIde ? "full-ide-active" : ""
        }`}
        ref={containerRef}
      >
        {/* Left panel (hidden in Full IDE mode) */}
        {!isFullIde && (
          <div className="panel-left" style={{ width: `${sizes[0]}%` }}>
            <LeftPanel
              projectId={projectId ?? ""}
              userName={displayName}
              camera={camera}
            />
          </div>
        )}

        {!isFullIde && <PanelSeparator onMouseDown={onSepMouseDown(0)} />}

        {/* Center panel */}
        <div
          className="panel-center"
          style={{ width: isFullIde ? "100%" : `${sizes[1]}%` }}
        >
          <CodeEditor
            sessionId={projectId}
            isFullIde={isFullIde}
            onToggleFullIde={() => setIsFullIde((v) => !v)}
          />
        </div>

        {!isFullIde && <PanelSeparator onMouseDown={onSepMouseDown(1)} />}

        {/* Right panel (hidden in Full IDE mode) */}
        {!isFullIde && (
          <div className="panel-right" style={{ width: `${sizes[2]}%` }}>
            <ProblemTabs problem={SESSION_PROBLEM} solutionCode={SOLUTION_CODE} />
          </div>
        )}
      </div>

      {/* Floating small camera div on left bottom ONLY in Full IDE mode */}
      {isFullIde && (
        <div
          className="floating-camera-card"
          role="region"
          aria-label="Camera preview in Full IDE mode"
        >
          <div className="floating-camera-video-container">
            <video
              ref={camera.attachVideo}
              autoPlay
              playsInline
              muted
              className={`floating-camera-video ${camera.camOff ? "hidden" : ""}`}
            />
            {camera.camOff && (
              <div className="floating-camera-fallback">
                <VideoOff size={16} aria-hidden="true" />
                <span>Camera Off</span>
              </div>
            )}
            <div className="floating-camera-tag">
              <span className="live-dot" aria-hidden="true" />
              <span>{displayName}</span>
            </div>
          </div>
          <div className="floating-camera-footer">
            <span className="floating-camera-name">{displayName}</span>
            <div className="floating-camera-controls">
              <button
                type="button"
                className={`floating-control-btn ${camera.micMuted ? "btn-off" : ""}`}
                onClick={() => camera.setMicMuted((m) => !m)}
                title={camera.micMuted ? "Unmute Mic" : "Mute Mic"}
                aria-label={camera.micMuted ? "Unmute Mic" : "Mute Mic"}
              >
                {camera.micMuted ? <MicOff size={12} /> : <Mic size={12} />}
              </button>
              <button
                type="button"
                className={`floating-control-btn ${camera.camOff ? "btn-off" : ""}`}
                onClick={camera.toggleCam}
                title={camera.camOff ? "Turn Camera On" : "Turn Camera Off"}
                aria-label={camera.camOff ? "Turn Camera On" : "Turn Camera Off"}
              >
                {camera.camOff ? <VideoOff size={12} /> : <Video size={12} />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
