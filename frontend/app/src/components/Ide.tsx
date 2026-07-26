import Editor from "@monaco-editor/react";
import { useMonacoLanguage } from "../stores/LanguageStore";

interface IdeProps {
  onMount?: (editor: any, monaco: any) => void;
  defaultValue?: string;
}

export const Ide = ({
  onMount,
  defaultValue = "// Write your solution here\n",
}: IdeProps) => {
  // Reads the selected language from the store and converts it to Monaco's
  // id format ("C++" -> "cpp"). Re-renders automatically whenever ChangeLang
  // calls setLanguage — no prop needs to be threaded through.
  const monacoLanguage = useMonacoLanguage();

  return (
    <Editor
      height="100%"
      language={monacoLanguage}
      defaultValue={defaultValue}
      onMount={onMount}
      theme="vs-dark"
      options={{
        fontSize: 14,
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        minimap: { enabled: false },
        lineNumbers: "on",
        scrollBeyondLastLine: false,
        wordWrap: "on",
        tabSize: 2,
        automaticLayout: true,
      }}
    />
  );
};
