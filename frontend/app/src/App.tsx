import { Routes, Route } from "react-router-dom";
import { Project } from "./pages/Project";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Dashboard } from "./pages/Dashboard";
import { LoginPage } from "./pages/Login";
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
        <Route path="/login" element={<LoginPage />} />
        <Route path="/project/:id" element={<Project />} />
      </Routes>
    </div>
  );
}

export default App;
