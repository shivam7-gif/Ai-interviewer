import React, { useRef, useState, useEffect, useCallback } from "react";
import Editor from "@monaco-editor/react";
import type * as monaco from "monaco-editor";
import { useLanguageStore } from "../../../stores/LanguageStore";
import { EditorToolbar } from "./EditorToolbar";
import { TestResults } from "./TestResults";
import { INITIAL_CODE } from "../data";

const LANG_TO_MONACO: Record<string, string> = {
  "C++": "cpp",
  Python: "python",
  JavaScript: "javascript",
  TypeScript: "typescript",
  Java: "java",
  C: "c",
  "C#": "csharp",
  Go: "go",
  Rust: "rust",
  Kotlin: "kotlin",
  Swift: "swift",
};

const STORAGE_KEY = "interviewos_editor_code";

interface CodeEditorProps {
  sessionId?: string;
  isFullIde?: boolean;
  onToggleFullIde?: () => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  sessionId: _,
  isFullIde = false,
  onToggleFullIde,
}) => {
  const { language, setLanguage } = useLanguageStore();
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<typeof monaco | null>(null);

  const getInitialCode = (): string => {
    const defaultTemplate =
      INITIAL_CODE[LANG_TO_MONACO[language.name] ?? "cpp"] ??
      INITIAL_CODE.cpp;
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && (saved.includes("solve(") || saved.includes("Breakfast") || saved.includes("indegree"))) {
      localStorage.removeItem(STORAGE_KEY);
      return defaultTemplate;
    }
    return saved ?? defaultTemplate;
  };

  const [code, setCode] = useState(getInitialCode);
  const [running, setRunning] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const [testCollapsed, setTestCollapsed] = useState(false);

  // Auto-save
  useEffect(() => {
    const timer = setTimeout(() => localStorage.setItem(STORAGE_KEY, code), 800);
    return () => clearTimeout(timer);
  }, [code]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleRun();
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "Enter") {
        e.preventDefault();
        handleSubmit();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Define and apply custom Monaco theme matching the design system
  const applyTheme = useCallback((monacoInstance: typeof monaco) => {
    monacoInstance.editor.defineTheme("interviewos-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "6B685F", fontStyle: "italic" },
        { token: "keyword", foreground: "C99A4B" },
        { token: "string", foreground: "8FB98B" },
        { token: "number", foreground: "D08770" },
        { token: "type", foreground: "7FA7B5" },
        { token: "function", foreground: "E8E4DA" },
      ],
      colors: {
        "editor.background": "#0F0F0E",
        "editor.foreground": "#ECE9E2",
        "editorLineNumber.foreground": "#4A483F",
        "editorLineNumber.activeForeground": "#ECE9E2",
        "editor.lineHighlightBackground": "#1F1E1B",
        "editorCursor.foreground": "#E5A00D",
        "editor.selectionBackground": "#3A383280",
        "editorIndentGuide.background": "#2A2925",
        "editorIndentGuide.activeBackground": "#3A3832",
      },
    });

    monacoInstance.editor.defineTheme("interviewos-light", {
      base: "vs",
      inherit: true,
      rules: [
        { token: "comment", foreground: "9E998E", fontStyle: "italic" },
        { token: "keyword", foreground: "A36B00" },
        { token: "string", foreground: "3B7E48" },
        { token: "number", foreground: "AC5632" },
        { token: "type", foreground: "2B6980" },
        { token: "function", foreground: "1D1C19" },
      ],
      colors: {
        "editor.background": "#FFFFFF",
        "editor.foreground": "#1D1C19",
        "editorLineNumber.foreground": "#B0ABA0",
        "editorLineNumber.activeForeground": "#1D1C19",
        "editor.lineHighlightBackground": "#FBF9F4",
        "editorCursor.foreground": "#B7790A",
        "editor.selectionBackground": "#E3DFD580",
        "editorIndentGuide.background": "#E3DFD5",
        "editorIndentGuide.activeBackground": "#CCC7BA",
      },
    });

    const isLight = document.documentElement.getAttribute("data-theme") === "light";
    monacoInstance.editor.setTheme(isLight ? "interviewos-light" : "interviewos-dark");
  }, []);

  const handleMount = (
    editor: monaco.editor.IStandaloneCodeEditor,
    monacoInstance: typeof monaco
  ) => {
    editorRef.current = editor;
    monacoRef.current = monacoInstance;
    applyTheme(monacoInstance);
    editor.focus();
  };

  // Sync theme changes with Monaco
  useEffect(() => {
    const observer = new MutationObserver(() => {
      if (monacoRef.current) {
        const isLight = document.documentElement.getAttribute("data-theme") === "light";
        monacoRef.current.editor.setTheme(isLight ? "interviewos-light" : "interviewos-dark");
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => observer.disconnect();
  }, []);

  const handleRun = useCallback(() => {
    if (running) return;
    setRunning(true);
    setHasRun(true);
    setTestCollapsed(false);
    setTimeout(() => setRunning(false), 1400);
  }, [running]);

  const handleSubmit = useCallback(() => {
    setRunning(true);
    setHasRun(true);
    setTestCollapsed(false);
    setTimeout(() => {
      setRunning(false);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    }, 1800);
  }, []);

  const handleReset = useCallback(() => {
    const defaultCode =
      INITIAL_CODE[LANG_TO_MONACO[language.name] ?? "cpp"] ?? INITIAL_CODE.cpp;
    setCode(defaultCode);
    editorRef.current?.setValue(defaultCode);
    localStorage.removeItem(STORAGE_KEY);
  }, [language.name]);

  const handleLangChange = (lang: string) => {
    setLanguage({ name: lang });
    const newCode = INITIAL_CODE[LANG_TO_MONACO[lang] ?? "cpp"] ?? INITIAL_CODE.cpp;
    setCode(newCode);
    editorRef.current?.setValue(newCode);
  };

  // Relayout on Full IDE mode toggle
  useEffect(() => {
    const t = setTimeout(() => {
      editorRef.current?.layout();
    }, 60);
    return () => clearTimeout(t);
  }, [isFullIde]);

  const monacoLang = LANG_TO_MONACO[language.name] ?? "cpp";

  return (
    <div className="code-editor-panel">
      <EditorToolbar
        language={language.name}
        onLanguageChange={handleLangChange}
        onRun={handleRun}
        onSubmit={handleSubmit}
        onReset={handleReset}
        running={running}
        submitted={submitted}
        isFullIde={isFullIde}
        onToggleFullIde={onToggleFullIde}
      />

      {/* Monaco Editor */}
      <div className="monaco-wrapper">
        <Editor
          height="100%"
          width="100%"
          language={monacoLang}
          value={code}
          onChange={(v) => setCode(v ?? "")}
          beforeMount={applyTheme}
          onMount={handleMount}
          theme="interviewos-dark"
          loading={
            <div className="editor-loading-screen">
              <span className="editor-running-spinner" aria-hidden="true" />
              <span>Loading Monaco editor...</span>
            </div>
          }
          options={{
            fontSize: 13.5,
            fontFamily:
              "'JetBrains Mono', 'Cascadia Code', 'Fira Code', monospace",
            fontLigatures: true,
            minimap: { enabled: false },
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            wordWrap: "on",
            tabSize: 4,
            automaticLayout: true,
            padding: { top: 14, bottom: 14 },
            scrollbar: {
              verticalScrollbarSize: 5,
              horizontalScrollbarSize: 5,
            },
            renderLineHighlight: "line",
            bracketPairColorization: { enabled: false },
            guides: { bracketPairs: false, indentation: true },
            smoothScrolling: false,
            cursorBlinking: "solid",
            lineHeight: 21,
          }}
        />

        {/* Quiet executing overlay */}
        {running && (
          <div className="editor-running-overlay" role="status">
            <span className="editor-running-spinner" aria-hidden="true" />
            <span>Executing...</span>
          </div>
        )}
      </div>

      {/* Test Results panel */}
      <TestResults
        hasRun={hasRun}
        running={running}
        collapsed={testCollapsed}
        onToggle={() => setTestCollapsed((c) => !c)}
      />
    </div>
  );
};
