import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Navbar } from "./components/Navbar";
import { LeftPanel } from "./components/LeftPanel";
import { CodeEditor } from "./components/CodeEditor";
import { ProblemTabs } from "./components/ProblemTabs";
import { SESSION_PROBLEM, SOLUTION_CODE } from "./data";
import "./interview.css";

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
  const { user } = useAuth();
  const [ready, setReady] = useState(false);
  const [timer, setTimer] = useState(90 * 60); // 90 min in seconds
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
    const interval = setInterval(() => setTimer((t) => Math.max(0, t - 1)), 1000);
    return () => clearInterval(interval);
  }, []);

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

  if (!ready) return <LoadingSkeleton />;

  return (
    <div className="interview-shell">
      <Navbar
        sessionId={projectId}
        userName={user?.name ?? undefined}
        userAvatar={user?.picture ?? undefined}
        timeRemaining={formatTime(timer)}
      />

      {/* Three-panel workspace */}
      <div className="interview-workspace" ref={containerRef}>
        {/* Left panel */}
        <div className="panel-left" style={{ width: `${sizes[0]}%` }}>
          <LeftPanel
            projectId={projectId ?? ""}
            userName={user?.name?.split(" ")[0] ?? "You"}
          />
        </div>

        <PanelSeparator onMouseDown={onSepMouseDown(0)} />

        {/* Center panel */}
        <div className="panel-center" style={{ width: `${sizes[1]}%` }}>
          <CodeEditor sessionId={projectId} />
        </div>

        <PanelSeparator onMouseDown={onSepMouseDown(1)} />

        {/* Right panel */}
        <div className="panel-right" style={{ width: `${sizes[2]}%` }}>
          <ProblemTabs problem={SESSION_PROBLEM} solutionCode={SOLUTION_CODE} />
        </div>
      </div>
    </div>
  );
};
