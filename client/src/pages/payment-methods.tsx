import { useState } from "react";
import { ArrowLeft, CreditCard, Plus, Trash2, Shield } from "lucide-react";

export default function PaymentMethods() {
  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: 1,
      type: "card",
      name: "Visa ending in 4567",
      last4: "4567",
      expiry: "12/26",
      isDefault: true
    },
    {
      id: 2,
      type: "card", 
      name: "Mastercard ending in 8901",
      last4: "8901",
      expiry: "09/25",
      isDefault: false
    }
  ]);

  const [showAddCard, setShowAddCard] = useState(false);
  const [newCard, setNewCard] = useState({
    number: "",
    expiry: "",
    cvv: "",
    name: ""
  });

  const handleAddCard = () => {
    if (!newCard.number || !newCard.expiry || !newCard.cvv || !newCard.name) {
      alert("Please fill in all card details");
      return;
    }
    
    const last4 = newCard.number.slice(-4);
    const newPaymentMethod = {
      id: Date.now(),
      type: "card",
      name: `Card ending in ${last4}`,
      last4,
      expiry: newCard.expiry,
      isDefault: false
    };
    
    setPaymentMethods([...paymentMethods, newPaymentMethod]);
    setNewCard({ number: "", expiry: "", cvv: "", name: "" });
    setShowAddCard(false);
    alert("Payment method added successfully!");
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to remove this payment method?")) {
      setPaymentMethods(paymentMethods.filter(method => method.id !== id));
    }
  };

  const handleSetDefault = (id: number) => {
    setPaymentMethods(paymentMethods.map(method => ({
      ...method,
      isDefault: method.id === id
    })));
    alert("Default payment method updated!");
  };

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
              <h1 className="text-xl font-bold text-gray-800">Payment Methods</h1>
              <p className="text-sm text-gray-600">Manage your cards & accounts</p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-md mx-auto p-4">
        {/* Security Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 flex items-start space-x-3">
          <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <p className="text-sm text-blue-800 font-medium">Secure & Encrypted</p>
            <p className="text-xs text-blue-600">All payment information is encrypted and secure</p>
          </div>
        </div>

        {/* Payment Methods List */}
        <div className="space-y-3 mb-4">
          {paymentMethods.map((method) => (
            <div key={method.id} className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{method.name}</p>
                    <p className="text-sm text-gray-500">Expires {method.expiry}</p>
                    {method.isDefault && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Default</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(method.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {!method.isDefault && (
                <button
                  onClick={() => handleSetDefault(method.id)}
                  className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Set as Default
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Add New Card Button */}
        {!showAddCard ? (
          <button
            onClick={() => setShowAddCard(true)}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Add Payment Method</span>
          </button>
        ) : (
          /* Add Card Form */
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Add New Card</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  value={newCard.number}
                  onChange={(e) => setNewCard({...newCard, number: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cardholder Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={newCard.name}
                  onChange={(e) => setNewCard({...newCard, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiry</label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    value={newCard.expiry}
                    onChange={(e) => setNewCard({...newCard, expiry: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                  <input
                    type="text"
                    placeholder="123"
                    value={newCard.cvv}
                    onChange={(e) => setNewCard({...newCard, cvv: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-6">
                <button
                  onClick={() => setShowAddCard(false)}
                  className="bg-gray-200 text-gray-800 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCard}
                  className="bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Add Card
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}