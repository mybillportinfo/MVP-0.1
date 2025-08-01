import BottomNavigation from "../components/bottom-navigation";
import { User, Settings, Bell, CreditCard, Shield, HelpCircle, LogOut } from "lucide-react";

export default function Profile() {
  const menuItems = [
    { icon: User, label: "Personal Information", href: "#" },
    { icon: CreditCard, label: "Payment Methods", href: "#" },
    { icon: Bell, label: "Notifications", href: "#" },
    { icon: Shield, label: "Security", href: "#" },
    { icon: Settings, label: "App Settings", href: "#" },
    { icon: HelpCircle, label: "Help & Support", href: "#" },
  ];

  return (
    <>
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 shadow-lg">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm p-1">
            <img 
              src="/logo.png" 
              alt="MyBillPort Logo" 
              className="w-8 h-8 object-contain"
            />
          </div>
          <h1 className="text-xl font-bold">MyBillPort</h1>
        </div>
        <h2 className="text-lg font-semibold">Profile</h2>
      </header>

      {/* Content */}
      <div className="flex-1 p-4 pb-20 overflow-y-auto bg-gray-50">
        {/* User Info */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
              <User className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">John Doe</h2>
              <p className="text-gray-500">johndoe@example.com</p>
              <p className="text-sm text-green-600 font-medium">Verified Account</p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="space-y-3">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => alert(`${item.label} - Feature coming soon!`)}
              className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-gray-600" />
                </div>
                <span className="font-medium text-gray-800">{item.label}</span>
              </div>
              <i className="fas fa-chevron-right text-gray-400"></i>
            </button>
          ))}
        </div>

        {/* Logout Button */}
        <button 
          onClick={() => {
            // Add logout functionality here
            window.location.href = "/login";
          }}
          className="w-full mt-6 bg-red-50 text-red-600 rounded-2xl p-4 flex items-center justify-center space-x-2 hover:bg-red-100 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sign Out</span>
        </button>

        {/* App Version */}
        <div className="text-center mt-6 text-gray-400 text-sm">
          MyBillPort v1.0.0
        </div>
      </div>

      <BottomNavigation activeTab="profile" />
    </>
  );
}
