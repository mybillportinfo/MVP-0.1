import { useState } from "react";
import { ArrowLeft, Bell, Mail, MessageSquare, Calendar } from "lucide-react";

export default function Notifications() {
  const [settings, setSettings] = useState({
    billReminders: true,
    paymentConfirmations: true,
    rewardsUpdates: true,
    securityAlerts: true,
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    reminderDays: 3
  });

  const handleToggle = (setting: string) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting as keyof typeof prev]
    }));
  };

  const handleSave = () => {
    alert("Notification preferences saved successfully!");
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
              <h1 className="text-xl font-bold text-gray-800">Notifications</h1>
              <p className="text-sm text-gray-600">Manage your alerts</p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-md mx-auto p-4">
        {/* Bill Reminders Section */}
        <div className="bg-white rounded-lg p-6 mb-4 border border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Bill Reminders</h3>
              <p className="text-sm text-gray-500">Get notified before bills are due</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Enable bill reminders</span>
              <Switch checked={settings.billReminders} onChange={() => handleToggle('billReminders')} />
            </div>

            {settings.billReminders && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Remind me how many days before due date?
                </label>
                <select
                  value={settings.reminderDays}
                  onChange={(e) => setSettings({...settings, reminderDays: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value={1}>1 day before</option>
                  <option value={2}>2 days before</option>
                  <option value={3}>3 days before</option>
                  <option value={5}>5 days before</option>
                  <option value={7}>1 week before</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Notification Types */}
        <div className="bg-white rounded-lg p-6 mb-4 border border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-4">Notification Types</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700">Payment confirmations</span>
              </div>
              <Switch checked={settings.paymentConfirmations} onChange={() => handleToggle('paymentConfirmations')} />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700">Rewards updates</span>
              </div>
              <Switch checked={settings.rewardsUpdates} onChange={() => handleToggle('rewardsUpdates')} />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700">Security alerts</span>
              </div>
              <Switch checked={settings.securityAlerts} onChange={() => handleToggle('securityAlerts')} />
            </div>
          </div>
        </div>

        {/* Delivery Methods */}
        <div className="bg-white rounded-lg p-6 mb-4 border border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-4">How to receive notifications</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700">Email notifications</span>
              </div>
              <Switch checked={settings.emailNotifications} onChange={() => handleToggle('emailNotifications')} />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <MessageSquare className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700">SMS notifications</span>
              </div>
              <Switch checked={settings.smsNotifications} onChange={() => handleToggle('smsNotifications')} />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700">Push notifications</span>
              </div>
              <Switch checked={settings.pushNotifications} onChange={() => handleToggle('pushNotifications')} />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Save Notification Preferences
        </button>

        {/* Quiet Hours Note */}
        <div className="mt-4 p-4 bg-gray-100 rounded-lg">
          <p className="text-sm text-gray-600">
            <strong>Quiet Hours:</strong> Notifications are automatically silenced between 10 PM and 8 AM to respect your rest time.
          </p>
        </div>
      </div>
    </div>
  );
}