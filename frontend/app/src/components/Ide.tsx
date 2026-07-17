import Editor from "@monaco-editor/react";

interface IdeProps {
  onMount?: (editor: any, monaco: any) => void;
  language?: string;
  defaultValue?: string;
}

export const Ide = ({
  onMount,
  language = "javascript",
  defaultValue = "// Write your solution here\n",
}: IdeProps) => {
  return (
    <Editor
      height="100%"
      language={language}
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
