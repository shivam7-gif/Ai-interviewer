import React from "react";
import {
  Play,
  RotateCcw,
  Sparkles,
  Flag,
  Check,
  Maximize2,
  Minimize2,
} from "lucide-react";

const LANGUAGES = [
  "C++",
  "Python",
  "JavaScript",
  "TypeScript",
  "Java",
  "C",
  "C#",
  "Go",
  "Rust",
  "Kotlin",
  "Swift",
];

interface EditorToolbarProps {
  language: string;
  onLanguageChange: (lang: string) => void;
  onRun: () => void;
  onSubmit: () => void;
  onReset: () => void;
  running?: boolean;
  submitted?: boolean;
  isFullIde?: boolean;
  onToggleFullIde?: () => void;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  language,
  onLanguageChange,
  onRun,
  onSubmit,
  onReset,
  running = false,
  submitted = false,
  isFullIde = false,
  onToggleFullIde,
}) => {
  return (
    <div className="editor-toolbar">
      {/* Left: Language selector as a plain bordered select */}
      <div className="toolbar-left">
        <label htmlFor="language-select" className="sr-only">
          Select Programming Language
        </label>
        <select
          id="language-select"
          className="lang-select"
          value={language}
          onChange={(e) => onLanguageChange(e.target.value)}
        >
          {LANGUAGES.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>
      </div>

      {/* Right: Actions */}
      <div className="toolbar-right">
        {/* Ghost icon buttons: Reset, Hint, Report */}
        <button
          type="button"
          className="ghost-toolbar-btn"
          onClick={onReset}
          title="Reset code (Ctrl+R)"
          aria-label="Reset code"
        >
          <RotateCcw size={14} aria-hidden="true" />
        </button>

        <button
          type="button"
          className="ghost-toolbar-btn"
          title="Hint (1/3)"
          aria-label="Hint 1 of 3"
        >
          <Sparkles size={14} aria-hidden="true" />
        </button>

        <button
          type="button"
          className="ghost-toolbar-btn"
          title="Report issue"
          aria-label="Report issue"
        >
          <Flag size={14} aria-hidden="true" />
        </button>

        {onToggleFullIde && (
          <button
            type="button"
            className={`ghost-toolbar-btn full-ide-btn ${isFullIde ? "active" : ""}`}
            onClick={onToggleFullIde}
            title={isFullIde ? "Exit Full IDE (Esc)" : "Full IDE"}
            aria-label={isFullIde ? "Exit Full IDE" : "Full IDE"}
          >
            {isFullIde ? (
              <Minimize2 size={14} aria-hidden="true" />
            ) : (
              <Maximize2 size={14} aria-hidden="true" />
            )}
          </button>
        )}

        <div className="toolbar-divider" />

        {/* Run button: secondary outlined button */}
        <button
          type="button"
          className="secondary-run-btn"
          onClick={onRun}
          disabled={running}
          id="run-btn"
          title="Run code (Ctrl+Enter)"
          aria-label="Run code (Ctrl+Enter)"
        >
          <Play size={12} fill="currentColor" aria-hidden="true" />
          <span>{running ? "Running..." : "Run"}</span>
        </button>

        {/* Submit button: single primary amber button with dark text */}
        <button
          type="button"
          className={`primary-submit-btn ${submitted ? "submit-success" : ""}`}
          onClick={onSubmit}
          disabled={running}
          id="submit-btn"
          title="Submit code (Ctrl+Shift+Enter)"
          aria-label="Submit code (Ctrl+Shift+Enter)"
        >
          {submitted ? (
            <Check size={13} strokeWidth={2.5} aria-hidden="true" />
          ) : null}
          <span>{submitted ? "Accepted" : "Submit"}</span>
        </button>
      </div>
    </div>
  );
};
