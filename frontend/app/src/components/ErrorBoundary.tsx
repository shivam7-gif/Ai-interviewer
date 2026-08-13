import React, { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught runtime error in component tree:", error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = "/";
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={s.container}>
          <div style={s.card}>
            <div style={s.iconWrapper}>⚠️</div>
            <h2 style={s.title}>Something went wrong</h2>
            <p style={s.desc}>
              An unexpected error occurred in the application. You can try refreshing the page or returning to the home screen.
            </p>
            {this.state.error && (
              <div style={s.errorDetails}>
                <code>{this.state.error.message}</code>
              </div>
            )}
            <div style={s.btnGroup}>
              <button style={s.primaryBtn} onClick={this.handleReload}>
                Refresh Page
              </button>
              <button style={s.secondaryBtn} onClick={this.handleGoHome}>
                Go to Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const s: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#09090b",
    color: "#f4f4f5",
    fontFamily: "'Inter', system-ui, sans-serif",
    padding: "20px",
  },
  card: {
    maxWidth: "480px",
    width: "100%",
    background: "#18181b",
    border: "1px solid #27272a",
    borderRadius: "12px",
    padding: "32px",
    textAlign: "center",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)",
  },
  iconWrapper: {
    fontSize: "36px",
    marginBottom: "16px",
  },
  title: {
    fontSize: "20px",
    fontWeight: 600,
    marginBottom: "8px",
  },
  desc: {
    fontSize: "14px",
    color: "#a1a1aa",
    lineHeight: "1.5",
    marginBottom: "20px",
  },
  errorDetails: {
    background: "#09090b",
    border: "1px solid #27272a",
    borderRadius: "6px",
    padding: "10px 14px",
    fontSize: "12px",
    color: "#f87171",
    textAlign: "left",
    marginBottom: "24px",
    overflowX: "auto",
  },
  btnGroup: {
    display: "flex",
    gap: "12px",
    justifyContent: "center",
  },
  primaryBtn: {
    background: "#2563eb",
    color: "#fff",
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: 500,
    cursor: "pointer",
  },
  secondaryBtn: {
    background: "transparent",
    color: "#a1a1aa",
    border: "1px solid #3f3f46",
    padding: "10px 20px",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: 500,
    cursor: "pointer",
  },
};
