import { useAuth } from "../context/AuthContext";

export function Profile() {
  const { user } = useAuth();
  if (!user) return null;
  return (
    <div>
      <img src={user.picture} alt="avatar" />
      <p>{user.name}</p>
      <p>Google Id : {user.sub}</p>
    </div>
  );
}
