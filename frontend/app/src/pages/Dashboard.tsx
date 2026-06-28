import { useNavigate } from "react-router-dom";
import { Profile } from "../components/Profile";

export const Dashboard = () => {
  const navigate = useNavigate();

  function handleNavigation() {
    navigate("/project/123");
  }

  return (
    <div>
      <h1>hello from dashboard page</h1>
      <div className="testing">
        <Profile />
        <button onClick={handleNavigation}>Redirect to ide</button>
      </div>
    </div>
  );
};
