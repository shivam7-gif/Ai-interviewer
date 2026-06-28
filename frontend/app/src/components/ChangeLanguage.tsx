import { useState, useRef, useEffect } from "react";

const languages = [
  { name: "JavaScript", color: "#f7c948" },
  { name: "TypeScript", color: "#3178c6" },
  { name: "Python",     color: "#3572A5" },
  { name: "Java",       color: "#b07219" },
  { name: "C++",        color: "#f34b7d" },
  { name: "C",          color: "#555555" },
  { name: "C#",         color: "#178600" },
  { name: "Go",         color: "#00ADD8" },
  { name: "Rust",       color: "#dea584" },
  { name: "Kotlin",     color: "#A97BFF" },
  { name: "Swift",      color: "#F05138" },
  { name: "Ruby",       color: "#701516" },
  { name: "PHP",        color: "#4F5D95" },
  { name: "Scala",      color: "#c22d40" },
  { name: "Dart",       color: "#00B4AB" },
];

interface ChangeLangProps {
  onChange?: (lang: string) => void; 
}

export const ChangeLang = ({ onChange }: ChangeLangProps) => {
  const [selected, setSelected] = useState(languages[0]);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function select(lang: typeof languages[0]) {
    setSelected(lang);
    setOpen(false);
    onChange?.(lang.name);
  }

  return (
    <div ref={rootRef} style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "6px 12px",
          background: "#1e1e1e",
          border: "1px solid #3e3e3e",
          borderRadius: "6px",
          color: "#fff",
          fontSize: "14px",
          fontWeight: 500,
          cursor: "pointer",
          minWidth: "160px",
          justifyContent: "space-between",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: selected.color, display: "inline-block" }} />
          {selected.name}
        </span>
        <span style={{ fontSize: 12, opacity: 0.6, transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}>▾</span>
      </button>

      {open && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 4px)",
          left: 0,
          minWidth: "200px",
          background: "#1e1e1e",
          border: "1px solid #3e3e3e",
          borderRadius: "6px",
          zIndex: 100,
          maxHeight: "280px",
          overflowY: "auto",
        }}>
          <div style={{ padding: "6px 10px", fontSize: 11, color: "#666", borderBottom: "1px solid #3e3e3e", letterSpacing: "0.04em" }}>
            LANGUAGE
          </div>
          {languages.map(lang => (
            <button
              key={lang.name}
              onClick={() => select(lang)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "8px 12px",
                width: "100%",
                background: lang.name === selected.name ? "#2a2d2e" : "transparent",
                border: "none",
                color: lang.name === selected.name ? "#fff" : "#ccc",
                fontSize: "14px",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: lang.color, flexShrink: 0, display: "inline-block" }} />
              {lang.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};