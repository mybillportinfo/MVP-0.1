import { useEffect, useState } from "react";
import { auth } from "../../../lib/firebaseConfig";
import { logoutUser } from "../../../services/auth.js";

export default function AuthDashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(setUser);
    return () => unsub();
  }, []);

  if (!user) return <p>Loading or not logged in...</p>;

  return (
    <div>
      <h1>Welcome, {user.email}</h1>
      <button onClick={() => {
        logoutUser();
        window.location.href = "/login";
      }}>Logout</button>
    </div>
  );
}