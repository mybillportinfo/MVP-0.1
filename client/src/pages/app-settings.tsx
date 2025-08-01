import { useState } from "react";
import { ArrowLeft, Settings, Moon, Sun, DollarSign, Globe, Smartphone } from "lucide-react";

export default function AppSettings() {
  const [settings, setSettings] = useState({
    theme: 'light',
    currency: 'USD',
    language: 'en',
    autoPayReminders: true,
    biometricLogin: false,
    dataUsage: 'wifi',
    soundEffects: true
  });

  const handleSave = () => {
    alert("Settings saved successfully!");
  };

  const Switch = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? 'bg-blue-600' : 'bg-gray-200'
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
              <h1 className="text-xl font-bold text-gray-800">App Settings</h1>
              <p className="text-sm text-gray-600">Customize your experience</p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-md mx-auto p-4">
        {/* Appearance */}
        <div className="bg-white rounded-lg p-6 mb-4 border border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              {settings.theme === 'light' ? 
                <Sun className="w-5 h-5 text-purple-600" /> : 
                <Moon className="w-5 h-5 text-purple-600" />
              }
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Appearance</h3>
              <p className="text-sm text-gray-500">Choose your preferred theme</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setSettings({...settings, theme: 'light'})}
                  className={`p-3 rounded-lg border text-center ${
                    settings.theme === 'light' 
                      ? 'border-blue-500 bg-blue-50 text-blue-700' 
                      : 'border-gray-200 bg-white text-gray-700'
                  }`}
                >
                  <Sun className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-sm font-medium">Light</span>
                </button>
                <button
                  onClick={() => setSettings({...settings, theme: 'dark'})}
                  className={`p-3 rounded-lg border text-center ${
                    settings.theme === 'dark' 
                      ? 'border-blue-500 bg-blue-50 text-blue-700' 
                      : 'border-gray-200 bg-white text-gray-700'
                  }`}
                >
                  <Moon className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-sm font-medium">Dark</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Currency & Language */}
        <div className="bg-white rounded-lg p-6 mb-4 border border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Globe className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Region & Currency</h3>
              <p className="text-sm text-gray-500">Set your location preferences</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
              <select
                value={settings.currency}
                onChange={(e) => setSettings({...settings, currency: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="USD">USD - US Dollar ($)</option>
                <option value="EUR">EUR - Euro (€)</option>
                <option value="GBP">GBP - British Pound (£)</option>
                <option value="CAD">CAD - Canadian Dollar (C$)</option>
                <option value="AUD">AUD - Australian Dollar (A$)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
              <select
                value={settings.language}
                onChange={(e) => setSettings({...settings, language: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="pt">Portuguese</option>
              </select>
            </div>
          </div>
        </div>

        {/* Smart Features */}
        <div className="bg-white rounded-lg p-6 mb-4 border border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Smart Features</h3>
              <p className="text-sm text-gray-500">Enhance your app experience</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-700 font-medium">Auto-pay reminders</p>
                <p className="text-sm text-gray-500">Get smart suggestions for bill payments</p>
              </div>
              <Switch 
                checked={settings.autoPayReminders} 
                onChange={() => setSettings({...settings, autoPayReminders: !settings.autoPayReminders})} 
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-700 font-medium">Biometric login</p>
                <p className="text-sm text-gray-500">Use fingerprint or face ID to sign in</p>
              </div>
              <Switch 
                checked={settings.biometricLogin} 
                onChange={() => setSettings({...settings, biometricLogin: !settings.biometricLogin})} 
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-700 font-medium">Sound effects</p>
                <p className="text-sm text-gray-500">Play sounds for app interactions</p>
              </div>
              <Switch 
                checked={settings.soundEffects} 
                onChange={() => setSettings({...settings, soundEffects: !settings.soundEffects})} 
              />
            </div>
          </div>
        </div>

        {/* Data Usage */}
        <div className="bg-white rounded-lg p-6 mb-4 border border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-4">Data Usage</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Download updates</label>
            <select
              value={settings.dataUsage}
              onChange={(e) => setSettings({...settings, dataUsage: e.target.value})}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="wifi">Wi-Fi only</option>
              <option value="always">Wi-Fi and mobile data</option>
              <option value="never">Never automatically</option>
            </select>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Save Settings
        </button>

        {/* App Info */}
        <div className="mt-4 p-4 bg-gray-100 rounded-lg">
          <div className="text-center text-sm text-gray-600 space-y-1">
            <p><strong>MyBillPort</strong> v1.0.0</p>
            <p>Build 2025.01.01</p>
            <p>© 2025 MyBillPort. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}