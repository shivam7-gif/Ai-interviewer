import { Sidebar } from "./Sidebar";
import { TopNav } from "./TopNav";

interface AppLayoutProps {
  title: string;
  children: React.ReactNode;
}

export function AppLayout({ title, children }: AppLayoutProps) {
  return (
    <div style={s.shell}>
      <Sidebar />
      <div style={s.main}>
        <TopNav title={title} />
        <div style={s.content}>{children}</div>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  shell: {
    display: "flex",
    minHeight: "100vh",
    background: "var(--bg)",
  },
  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  content: {
    flex: 1,
    overflow: "auto",
  },
};
