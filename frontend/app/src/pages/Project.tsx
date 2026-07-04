import { useParams } from "react-router-dom";
import { useRef, useState } from "react";
import { Ide } from "../components/Ide";
import { ChangeLang } from "../components/ChangeLanguage";
import { TopBar } from "../components/TopBar";
import { ProblemPanel } from "../components/ProblemPanel";
import {useAuth} from "../context/AuthContext";

export const Project = () => {
  const { id } = useParams();
  const {user} = useAuth();
  
  const editorRef = useRef(null);
  const [language, setLanguage] = useState("javascript");

  function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor;
  }

  function handleRun() {
    console.log("language:", language);
    console.log("code:", editorRef.current?.getValue());
  }

  return (
    <div style={s.shell}>
      <TopBar sessionId={id} onRun={handleRun} />

      <div style={s.body}>
        {/* LEFT — you'll build this */}
        <div style={s.left}>
          <div style={s.panelHeader}>AI interviewer</div>
          <div style={s.aiPlaceholder}>
            {/* your AI interviewer goes here */}
          </div>
        </div>

        {/* CENTER — editor */}
        <div style={s.center}>
          <div style={s.editorBar}>
            <ChangeLang onChange={(lang) => setLanguage(lang.toLowerCase())} />
          </div>
          <div style={{ flex: 1 }}>
            <Ide onMount={handleEditorDidMount} language={language} />
          </div>
        </div>

        {/* RIGHT — problem */}
        <ProblemPanel />
      </div>
    </div>
  );
};

const s: Record<string, React.CSSProperties> = {
  shell: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    background: "#0f0f10",
    fontFamily: "Inter, sans-serif",
  },
  body: {
    display: "flex",
    flex: 1,
    overflow: "hidden",
  },
  left: {
    width: "240px",
    flexShrink: 0,
    borderRight: "1px solid #2a2a2a",
    display: "flex",
    flexDirection: "column",
    background: "#141414",
  },
  center: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    borderRight: "1px solid #2a2a2a",
  },
  editorBar: {
    display: "flex",
    alignItems: "center",
    padding: "6px 12px",
    background: "#1a1a1a",
    borderBottom: "1px solid #2a2a2a",
  },
  panelHeader: {
    padding: "8px 12px",
    fontSize: "11px",
    fontWeight: 500,
    color: "#555",
    borderBottom: "1px solid #2a2a2a",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
  aiPlaceholder: {
    flex: 1,
  },
};
