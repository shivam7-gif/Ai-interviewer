import { useAuth } from "../context/AuthContext";

interface TopBarProps {
  sessionId?: string;
  onRun: () => void;
}

export const TopBar = ({ sessionId, onRun }: TopBarProps) => {
  const { user, logout } = useAuth();

  return (
    <div style={s.bar}>
      <div style={s.left}>
        <span style={s.title}>AI Interview</span>
        {sessionId && <span style={s.id}>· Session #{sessionId}</span>}
      </div>
      <div style={s.right}>
        {user?.picture && (
          <img src={user.picture} alt={user.name} style={s.avatar} />
        )}
        <button style={s.run} onClick={onRun}>Run</button>
        <button style={s.submit}>Submit</button>
        <button style={s.logout} onClick={logout}>Logout</button>
      </div>
    </div>
  );
};

const s: Record<string, React.CSSProperties> = {
  bar: { display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 16px", height:"44px", background:"#141414", borderBottom:"1px solid #2a2a2a" },
  left: { display:"flex", alignItems:"center", gap:"8px" },
  right: { display:"flex", alignItems:"center", gap:"8px" },
  title: { fontSize:"13px", fontWeight:500, color:"#e0e0e0" },
  id: { fontSize:"12px", color:"#555" },
  avatar: { width:"28px", height:"28px", borderRadius:"50%", objectFit:"cover" },
  run: { padding:"4px 14px", fontSize:"12px", background:"transparent", color:"#4ec994", border:"1px solid #2d5c40", borderRadius:"6px", cursor:"pointer" },
  submit: { padding:"4px 14px", fontSize:"12px", background:"transparent", color:"#6c8eff", border:"1px solid #2d3a6e", borderRadius:"6px", cursor:"pointer" },
  logout: { padding:"4px 10px", fontSize:"12px", background:"transparent", color:"#666", border:"1px solid #2a2a2a", borderRadius:"6px", cursor:"pointer" },
};