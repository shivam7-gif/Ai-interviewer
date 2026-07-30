import React, { useState, useRef, useEffect } from "react";
import {
  Play,
  CheckCircle,
  ChevronDown,
  Flag,
  Sparkles,
  Settings,
  RotateCcw,
} from "lucide-react";

const LANGUAGES = [
  "C++", "Python", "JavaScript", "TypeScript", "Java",
  "C", "C#", "Go", "Rust", "Kotlin", "Swift",
];

interface EditorToolbarProps {
  language: string;
  onLanguageChange: (lang: string) => void;
  onRun: () => void;
  onSubmit: () => void;
  onReset: () => void;
  running?: boolean;
  submitted?: boolean;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  language,
  onLanguageChange,
  onRun,
  onSubmit,
  onReset,
  running = false,
  submitted = false,
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="editor-toolbar">
      {/* Left — language picker */}
      <div ref={ref} style={{ position: "relative" }}>
        <button
          className="lang-dropdown-btn"
          onClick={() => setOpen((o) => !o)}
          id="language-dropdown"
        >
          <span className="lang-dot" />
          <span>{language}</span>
          <ChevronDown
            size={13}
            style={{
              transition: "transform 0.15s",
              transform: open ? "rotate(180deg)" : "none",
              color: "#52525B",
            }}
          />
        </button>

        {open && (
          <div className="lang-dropdown-menu">
            <div className="lang-dropdown-header">Language</div>
            {LANGUAGES.map((lang) => (
              <button
                key={lang}
                className={`lang-option ${lang === language ? "lang-option-active" : ""}`}
                onClick={() => {
                  onLanguageChange(lang);
                  setOpen(false);
                }}
              >
                <span className={`lang-option-dot ${lang === language ? "lang-option-dot-active" : ""}`} />
                {lang}
                {lang === language && (
                  <CheckCircle size={13} style={{ marginLeft: "auto", color: "#FACC15" }} />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right — action buttons */}
      <div className="toolbar-actions">
        <button className="toolbar-btn-icon" onClick={onReset} title="Reset code">
          <RotateCcw size={14} />
        </button>
        <button className="toolbar-btn-icon" title="AI Helper">
          <Sparkles size={14} />
          <span>AI Helper</span>
        </button>
        <button className="toolbar-btn-icon toolbar-btn-report" title="Report issue">
          <Flag size={14} />
        </button>
        <div className="toolbar-separator" />
        <button
          className={`toolbar-run-btn ${running ? "toolbar-run-btn-loading" : ""}`}
          onClick={onRun}
          disabled={running}
          id="run-btn"
        >
          {running ? (
            <span className="btn-spinner" />
          ) : (
            <Play size={13} fill="currentColor" />
          )}
          <span>{running ? "Running..." : "Run"}</span>
          <span className="toolbar-shortcut">⌘↵</span>
        </button>
        <button
          className={`toolbar-submit-btn ${submitted ? "toolbar-submit-btn-success" : ""}`}
          onClick={onSubmit}
          id="submit-btn"
        >
          {submitted ? <CheckCircle size={13} /> : <CheckCircle size={13} />}
          <span>{submitted ? "Accepted!" : "Submit"}</span>
          <span className="toolbar-shortcut">⌘⇧↵</span>
        </button>
        <button className="toolbar-btn-icon" title="Settings">
          <Settings size={14} />
        </button>
      </div>
    </div>
  );
};
