import { useGoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      const profile = await fetch(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        { headers: { Authorization: `Bearer ${tokenResponse.access_token}` } }
      ).then((res) => res.json());

      login({
        ...profile,
        access_token: tokenResponse.access_token,
        expires_in: tokenResponse.expires_in,
      });

      navigate("/dashboard");
    },
    onError: () => console.log("Login failed"), // ← comma not semicolon
  });

  return (
    <div
      style={{ display: "flex", justifyContent: "center", marginTop: "40px" }}
    >
      <button
        onClick={() => googleLogin()}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "10px 24px",
          fontSize: "15px",
          fontWeight: 500,
          border: "1px solid #ddd",
          borderRadius: "6px",
          background: "#fff",
          cursor: "pointer",
        }}
      >
        <img
          src="https://www.google.com/favicon.ico"
          width={18}
          height={18}
          alt="Google"
        />
        Sign in with Google
      </button>
    </div>
  );
};
