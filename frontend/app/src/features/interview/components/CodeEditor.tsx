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
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ sessionId: _ }) => {
  const { language, setLanguage } = useLanguageStore();
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<typeof monaco | null>(null);

  const getInitialCode = (): string => {
    return localStorage.getItem(STORAGE_KEY) ?? INITIAL_CODE[LANG_TO_MONACO[language.name] ?? "cpp"] ?? INITIAL_CODE.cpp;
  };

  const [code, setCode] = useState(getInitialCode);
  const [running, setRunning] = useState(false);
  const [submitted, setSubmitted] = useState(false);
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

  const handleMount = (editor: monaco.editor.IStandaloneCodeEditor, monacoInstance: typeof monaco) => {
    editorRef.current = editor;
    monacoRef.current = monacoInstance;
    editor.focus();
  };

  const handleRun = useCallback(() => {
    if (running) return;
    setRunning(true);
    setTestCollapsed(false);
    setTimeout(() => setRunning(false), 1800);
  }, [running]);

  const handleSubmit = useCallback(() => {
    setRunning(true);
    setTimeout(() => {
      setRunning(false);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    }, 2000);
  }, []);

  const handleReset = useCallback(() => {
    const defaultCode = INITIAL_CODE[LANG_TO_MONACO[language.name] ?? "cpp"] ?? INITIAL_CODE.cpp;
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
      />

      {/* Monaco Editor */}
      <div className="monaco-wrapper">
        <Editor
          height="100%"
          language={monacoLang}
          value={code}
          onChange={(v) => setCode(v ?? "")}
          onMount={handleMount}
          theme="vs-dark"
          options={{
            fontSize: 13.5,
            fontFamily: "'JetBrains Mono', 'Cascadia Code', 'Fira Code', monospace",
            fontLigatures: true,
            minimap: { enabled: false },
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            wordWrap: "on",
            tabSize: 4,
            automaticLayout: true,
            padding: { top: 16, bottom: 16 },
            scrollbar: {
              verticalScrollbarSize: 6,
              horizontalScrollbarSize: 6,
            },
            renderLineHighlight: "gutter",
            bracketPairColorization: { enabled: true },
            guides: { bracketPairs: true, indentation: true },
            smoothScrolling: true,
            cursorBlinking: "smooth",
            cursorSmoothCaretAnimation: "on",
            lineHeight: 22,
          }}
        />

        {/* Running overlay */}
        {running && (
          <div className="editor-running-overlay">
            <div className="editor-running-spinner" />
            <span>Executing...</span>
          </div>
        )}
      </div>

      {/* Test Results */}
      <TestResults
        collapsed={testCollapsed}
        onToggle={() => setTestCollapsed((c) => !c)}
      />
    </div>
  );
};
