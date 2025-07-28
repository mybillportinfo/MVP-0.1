import { useEffect, useState } from "react";
// @ts-ignore
import { auth } from "../../../lib/firebaseConfig.js";

export default function TestDashboard() {
  const [user, setUser] = useState<any>(null);
  const [authState, setAuthState] = useState<string>("checking");

  useEffect(() => {
    console.log("TestDashboard: Setting up auth listener");
    
    const unsubscribe = auth.onAuthStateChanged((currentUser: any) => {
      console.log("TestDashboard: Auth state changed:", currentUser?.email || "no user");
      
      if (currentUser) {
        setUser(currentUser);
        setAuthState("authenticated");
        console.log("TestDashboard: User authenticated successfully");
      } else {
        setAuthState("not-authenticated");
        console.log("TestDashboard: No user found");
        // Don't redirect immediately - let user see the state
        setTimeout(() => {
          console.log("TestDashboard: Redirecting to login");
          window.location.href = "/login";
        }, 2000);
      }
    });

    return () => {
      console.log("TestDashboard: Cleaning up auth listener");
      unsubscribe();
    };
  }, []);

  console.log("TestDashboard: Rendering with state:", authState, user?.email);

  if (authState === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <div className="text-center max-w-md p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <h1 className="mt-4 text-xl font-bold text-gray-800">Checking Authentication</h1>
          <p className="mt-2 text-gray-600">Please wait while we verify your login...</p>
        </div>
      </div>
    );
  }

  if (authState === "not-authenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center max-w-md p-8">
          <h1 className="text-xl font-bold text-red-800">Not Authenticated</h1>
          <p className="mt-2 text-red-600">Redirecting to login in 2 seconds...</p>
          <button 
            onClick={() => window.location.href = "/login"}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Go to Login Now
          </button>
        </div>
      </div>
    );
  }

  if (authState === "authenticated" && user) {
    return (
      <div className="min-h-screen bg-green-50">
        <div className="p-8">
          <div className="bg-white rounded-lg shadow-sm p-6 max-w-md mx-auto">
            <h1 className="text-2xl font-bold text-green-800 mb-4">✅ Dashboard Loaded Successfully!</h1>
            <div className="space-y-2 text-sm">
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>User ID:</strong> {user.uid}</p>
              <p><strong>Auth State:</strong> {authState}</p>
              <p><strong>Time:</strong> {new Date().toLocaleTimeString()}</p>
            </div>
            <div className="mt-6 space-y-3">
              <button 
                onClick={() => window.location.href = "/enhanced-dashboard"}
                className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
              >
                Try Enhanced Dashboard
              </button>
              <button 
                onClick={() => {
                  auth.signOut().then(() => {
                    window.location.href = "/login";
                  });
                }}
                className="w-full bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-xl font-bold text-gray-800">Unknown State</h1>
        <p className="text-gray-600">Auth State: {authState}</p>
        <p className="text-gray-600">User: {user ? "exists" : "null"}</p>
      </div>
    </div>
  );
}