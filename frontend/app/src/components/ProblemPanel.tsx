export const ProblemPanel = () => {
  return (
    <div style={s.panel}>
      <div style={s.header}>Problem</div>
      <div style={s.body}>
        <div style={s.title}>Two Sum</div>
        <span style={s.difficulty}>Easy</span>
        <p style={s.text}>
          Given an array of integers <code>nums</code> and an integer <code>target</code>,
          return indices of the two numbers that add up to target.
        </p>
        <div style={s.divider} />
        <div style={s.exLabel}>Example</div>
        <pre style={s.example}>Input: nums = [2,7,11,15], target = 9{"\n"}Output: [0,1]</pre>
      </div>
      <div style={s.timer}>⏱ 23:41 remaining</div>
    </div>
  );
};

const s: Record<string, React.CSSProperties> = {
  panel: { width:"260px", flexShrink:0, display:"flex", flexDirection:"column", background:"#141414" },
  header: { padding:"8px 12px", fontSize:"11px", fontWeight:500, color:"#555", borderBottom:"1px solid #2a2a2a", textTransform:"uppercase", letterSpacing:"0.06em" },
  body: { flex:1, padding:"14px 12px", overflowY:"auto" },
  title: { fontSize:"14px", fontWeight:500, color:"#e0e0e0", marginBottom:"6px" },
  difficulty: { display:"inline-block", fontSize:"11px", padding:"2px 8px", borderRadius:"4px", background:"#1b3a2a", color:"#4ec994", marginBottom:"10px" },
  text: { fontSize:"12px", color:"#888", lineHeight:1.7, marginBottom:"12px" },
  divider: { height:"1px", background:"#2a2a2a", margin:"10px 0" },
  exLabel: { fontSize:"11px", fontWeight:500, color:"#555", marginBottom:"6px", textTransform:"uppercase", letterSpacing:"0.04em" },
  example: { fontFamily:"monospace", fontSize:"11px", color:"#c0c0c0", background:"#1a1a1a", border:"1px solid #2a2a2a", borderRadius:"6px", padding:"8px", lineHeight:1.7 },
  timer: { padding:"10px 12px", fontSize:"12px", color:"#555", borderTop:"1px solid #2a2a2a" },
};