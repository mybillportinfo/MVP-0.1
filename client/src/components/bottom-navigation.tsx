import { useLocation } from "wouter";
import { Home, CreditCard, Gift, User } from "lucide-react";

interface BottomNavigationProps {
  activeTab: "home" | "payments" | "rewards" | "profile";
}

export default function BottomNavigation({ activeTab }: BottomNavigationProps) {
  const [, setLocation] = useLocation();

  const tabs = [
    { id: "home", label: "Home", icon: Home, path: "/" },
    { id: "payments", label: "Payments", icon: CreditCard, path: "/payments" },
    { id: "rewards", label: "Rewards", icon: Gift, path: "/rewards" },
    { id: "profile", label: "Profile", icon: User, path: "/profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 max-w-md w-full bg-white border-t border-gray-200 shadow-lg">
      <div className="grid grid-cols-4 py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => setLocation(tab.path)}
              className={`flex flex-col items-center py-3 px-4 transition-colors ${
                isActive 
                  ? "text-blue-600" 
                  : "text-gray-400 hover:text-blue-600"
              }`}
            >
              <Icon className="w-6 h-6 mb-1" />
              <span className={`text-xs ${isActive ? "font-medium" : ""}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
