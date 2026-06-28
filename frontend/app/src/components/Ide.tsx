import Editor from "@monaco-editor/react";

interface IdeProps {
  onMount?: (editor: any, monaco: any) => void;
}

export const Ide = ({ onMount }: IdeProps) => {
  return (
    <Editor
      height="90vh"
      defaultLanguage="javascript"
      defaultValue="// write your code here"
      onMount={onMount}
    />
  );
};
