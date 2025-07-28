import { useEffect, useState } from "react";
// @ts-ignore
import { auth } from "../../../lib/firebaseConfig.js";

export default function SimpleDashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser: any) => {
      console.log("Auth state changed:", currentUser);
      if (currentUser) {
        setUser(currentUser);
        setLoading(false);
      } else {
        // Redirect to login if not authenticated
        window.location.href = "/login";
      }
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p>Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">MyBillPort</h1>
            <p className="text-blue-100 text-sm">Welcome, {user.email}</p>
          </div>
          <button 
            onClick={() => {
              auth.signOut().then(() => {
                window.location.href = "/login";
              });
            }}
            className="text-blue-100 hover:text-white text-sm font-medium"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Dashboard</h2>
          <p className="text-gray-600">You are successfully logged in!</p>
          <p className="text-sm text-gray-500 mt-2">Email: {user.email}</p>
          <p className="text-sm text-gray-500">User ID: {user.uid}</p>
          
          <div className="mt-6 space-y-3">
            <button 
              onClick={() => window.location.href = "/signup"}
              className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700"
            >
              Go to Signup
            </button>
            <button 
              onClick={() => window.location.href = "/login"}
              className="w-full bg-gray-600 text-white py-3 rounded-xl hover:bg-gray-700"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}