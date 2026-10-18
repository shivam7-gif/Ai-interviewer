import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Dashboard } from "./pages/Dashboard";
import { LoginPage } from "./pages/Login";
import { LandingPage } from "./pages/LandingPage";
import { AppLayout } from "./components/layout/AppLayout";
import { InterviewPage } from "./features/interview/InterviewPage";
import { DeviceCheckPage } from "./features/interview/pages/DeviceCheckPage";

// Placeholder for routes not yet built
const Placeholder = ({ title }: { title: string }) => (
  <AppLayout title={title}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "400px", color: "var(--text-muted)", fontSize: "13px" }}>
      {title} — coming soon
    </div>
  </AppLayout>
);

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/interviews"
        element={
          <ProtectedRoute>
            <Placeholder title="Interviews" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <Placeholder title="Reports" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Placeholder title="Settings" />
          </ProtectedRoute>
        }
      />
      {/* Device setup check and interview room */}
      <Route path="/project/:projectId/check" element={<DeviceCheckPage />} />
      <Route path="/project/:projectId" element={<InterviewPage />} />
    </Routes>
  );
}

export default App;
