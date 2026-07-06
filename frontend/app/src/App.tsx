import { Routes, Route } from "react-router-dom";
import { Project } from "./pages/Project";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Dashboard } from "./pages/Dashboard";
import { LoginPage } from "./pages/Login";
import { LandingPage } from "./pages/LandingPage";
function App() {
  return (
    <div>
      <Routes>
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/project/:projectId" element={<Project />} />
      </Routes>
    </div>
  );
}

export default App;
