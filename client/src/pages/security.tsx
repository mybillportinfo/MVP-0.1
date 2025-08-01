import { useState } from "react";
import { ArrowLeft, Shield, Lock, Smartphone, Eye, EyeOff, Key } from "lucide-react";

export default function Security() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert("Please fill in all password fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("New passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      alert("Password must be at least 6 characters long");
      return;
    }
    alert("Password changed successfully!");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleToggle2FA = () => {
    if (!twoFactorEnabled) {
      alert("Two-factor authentication setup would normally require:\n\n1. Download an authenticator app\n2. Scan QR code\n3. Enter verification code\n\nFor this demo, 2FA is now enabled!");
    } else {
      if (confirm("Are you sure you want to disable two-factor authentication?")) {
        alert("Two-factor authentication has been disabled");
      } else {
        return;
      }
    }
    setTwoFactorEnabled(!twoFactorEnabled);
  };

  const Switch = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? 'bg-green-600' : 'bg-gray-200'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <button onClick={() => window.history.back()} className="p-1 text-gray-600 hover:text-blue-600">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <img src="/logo.png" alt="MyBillPort Logo" className="w-8 h-8 object-contain" />
            <div>
              <h1 className="text-xl font-bold text-gray-800">Security</h1>
              <p className="text-sm text-gray-600">Protect your account</p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-md mx-auto p-4">
        {/* Security Status */}
        <div className={`rounded-lg p-4 mb-4 border ${twoFactorEnabled ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
          <div className="flex items-center space-x-3">
            <Shield className={`w-6 h-6 ${twoFactorEnabled ? 'text-green-600' : 'text-yellow-600'}`} />
            <div>
              <p className={`font-medium ${twoFactorEnabled ? 'text-green-800' : 'text-yellow-800'}`}>
                {twoFactorEnabled ? 'Account Well Protected' : 'Account Protection Incomplete'}
              </p>
              <p className={`text-sm ${twoFactorEnabled ? 'text-green-600' : 'text-yellow-600'}`}>
                {twoFactorEnabled ? 'Two-factor authentication is active' : 'Enable 2FA for better security'}
              </p>
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div className="bg-white rounded-lg p-6 mb-4 border border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Lock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Change Password</h3>
              <p className="text-sm text-gray-500">Update your account password</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
              <div className="relative">
                <input
                  type={showPasswords ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 pr-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Enter current password"
                />
                <button
                  onClick={() => setShowPasswords(!showPasswords)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input
                type={showPasswords ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Enter new password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
              <input
                type={showPasswords ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Confirm new password"
              />
            </div>

            <button
              onClick={handleChangePassword}
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Update Password
            </button>
          </div>
        </div>

        {/* Two-Factor Authentication */}
        <div className="bg-white rounded-lg p-6 mb-4 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Two-Factor Authentication</h3>
                <p className="text-sm text-gray-500">Add extra security to your account</p>
              </div>
            </div>
            <Switch checked={twoFactorEnabled} onChange={handleToggle2FA} />
          </div>

          {twoFactorEnabled && (
            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-green-700">
                ✓ Two-factor authentication is active. You'll need your authenticator app to sign in.
              </p>
            </div>
          )}
        </div>

        {/* Security Tips */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Key className="w-5 h-5 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-800">Security Tips</h3>
          </div>

          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start space-x-2">
              <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
              <p>Use a unique password that you don't use anywhere else</p>
            </div>
            <div className="flex items-start space-x-2">
              <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
              <p>Enable two-factor authentication for maximum security</p>
            </div>
            <div className="flex items-start space-x-2">
              <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
              <p>Never share your login credentials with anyone</p>
            </div>
            <div className="flex items-start space-x-2">
              <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
              <p>Log out from shared or public devices</p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-4 bg-gray-100 rounded-lg p-4">
          <h4 className="font-medium text-gray-800 mb-2">Recent Security Activity</h4>
          <div className="space-y-2 text-sm text-gray-600">
            <p>✓ Last login: Today at 11:45 PM</p>
            <p>✓ Password last changed: 30 days ago</p>
            <p>✓ No suspicious activity detected</p>
          </div>
        </div>
      </div>
    </div>
  );
}