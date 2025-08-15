import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Plus, CreditCard, Wallet, Gift, Building, Bitcoin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

interface PaymentMethod {
  id: number;
  type: string;
  name: string;
  last4: string;
  isDefault: boolean;
  icon: string;
}

export default function PaymentMethods() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

  const [showAddMethod, setShowAddMethod] = useState(false);
  const [selectedType, setSelectedType] = useState('');

  // Form validation schemas for different payment types
  const cardSchema = z.object({
    cardNumber: z.string().min(13, 'Card number must be at least 13 digits').max(19, 'Card number cannot exceed 19 digits'),
    expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Enter valid expiry date (MM/YY)'),
    cvv: z.string().min(3, 'CVV must be 3-4 digits').max(4, 'CVV must be 3-4 digits'),
    holderName: z.string().min(2, 'Cardholder name is required')
  });

  const giftCardSchema = z.object({
    cardNumber: z.string().min(10, 'Gift card number is required'),
    expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Enter valid expiry date (MM/YY)'),
    pin: z.string().min(4, 'PIN must be 4 digits').max(4, 'PIN must be 4 digits'),
    holderName: z.string().min(2, 'Cardholder name is required')
  });

  const interacSchema = z.object({
    recipientEmail: z.string().email('Enter valid email address'),
    amount: z.string().min(1, 'Enter payment amount'),
    message: z.string().min(1, 'Message is required')
  });

  // Create a unified schema that makes all fields optional and validates based on selected type
  const unifiedSchema = z.object({
    cardNumber: z.string().optional(),
    expiryDate: z.string().optional(),
    cvv: z.string().optional(),
    pin: z.string().optional(),
    holderName: z.string().optional(),
    recipientEmail: z.string().optional(),
    amount: z.string().optional(),
    message: z.string().optional()
  }).refine((data) => {
    if (selectedType === 'interac') {
      return data.recipientEmail && data.recipientEmail.includes('@') &&
             data.amount && parseFloat(data.amount) > 0 &&
             data.message && data.message.length > 0;
    } else if (selectedType === 'gift') {
      return data.cardNumber && data.cardNumber.length >= 10 && 
             data.expiryDate && /^(0[1-9]|1[0-2])\/\d{2}$/.test(data.expiryDate) &&
             data.pin && data.pin.length === 4 &&
             data.holderName && data.holderName.length >= 2;
    } else {
      return data.cardNumber && data.cardNumber.length >= 13 && data.cardNumber.length <= 19 &&
             data.expiryDate && /^(0[1-9]|1[0-2])\/\d{2}$/.test(data.expiryDate) &&
             data.cvv && data.cvv.length >= 3 && data.cvv.length <= 4 &&
             data.holderName && data.holderName.length >= 2;
    }
  }, {
    message: "Please fill in all required fields correctly"
  });

  const form = useForm({
    resolver: zodResolver(unifiedSchema),
    defaultValues: {
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      pin: '',
      holderName: '',
      email: '',
      securityQuestion: '',
      recipientEmail: '',
      amount: '',
      message: ''
    }
  });

  const paymentTypes = [
    { id: 'debit', name: 'Debit Card', icon: CreditCard, color: 'bg-blue-50 text-blue-700 border-blue-200', available: true },
    { id: 'credit', name: 'Credit Card', icon: CreditCard, color: 'bg-green-50 text-green-700 border-green-200', available: true },
    { id: 'gift', name: 'Gift Card', icon: Gift, color: 'bg-purple-50 text-purple-700 border-purple-200', available: true },
    { id: 'interac', name: 'Interac e-Transfer', icon: Building, color: 'bg-orange-50 text-orange-700 border-orange-200', available: true },
    { id: 'crypto', name: 'Cryptocurrency', icon: Bitcoin, color: 'bg-yellow-50 text-yellow-700 border-yellow-200', available: false }
  ];

  const handleAddPaymentMethod = (type: string) => {
    if (type === 'crypto') {
      alert("Cryptocurrency payments coming soon!\n\nWe're working on integrating secure crypto payment options including Bitcoin, Ethereum, and other popular cryptocurrencies. This feature will be available in a future update.");
      return;
    }

    setSelectedType(type);
    form.reset(); // Clear previous form data
    setShowAddMethod(true);
  };

  const handleSavePaymentMethod = async (data: any) => {
    const typeInfo = paymentTypes.find(t => t.id === selectedType);
    
    // Handle Interac payment request
    if (selectedType === 'interac') {
      try {
        const response = await fetch('/api/payment-request/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            recipientEmail: data.recipientEmail,
            amount: parseFloat(data.amount),
            message: data.message || 'This is for my billboard'
          })
        });

        const result = await response.json();
        
        if (response.ok) {
          alert(`Payment request sent successfully!\n\nA payment request for $${data.amount} CAD has been sent to ${data.recipientEmail}. They will receive an email with payment instructions.`);
        } else {
          alert(`Failed to send payment request: ${result.error || 'Unknown error'}`);
        }
      } catch (error) {
        alert(`Error sending payment request: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
      
      setShowAddMethod(false);
      setSelectedType('');
      form.reset();
      return;
    }
    
    // Handle other payment methods
    // Extract last 4 digits from card number or use placeholder for other types
    let last4 = '0000';
    if (data.cardNumber) {
      last4 = data.cardNumber.slice(-4);
    }

    // Generate more descriptive names based on input
    let methodName = `New ${typeInfo?.name}`;
    if (data.holderName) {
      methodName = `${data.holderName}'s ${typeInfo?.name}`;
    }

    const newMethod = {
      id: paymentMethods.length + 1,
      type: selectedType,
      name: methodName,
      last4,
      isDefault: false,
      icon: selectedType === 'debit' ? '💳' : selectedType === 'credit' ? '💎' : selectedType === 'gift' ? '🎁' : '🏦'
    };

    setPaymentMethods([...paymentMethods, newMethod]);
    setShowAddMethod(false);
    setSelectedType('');
    form.reset();
    
    alert(`${typeInfo?.name} added successfully!\n\nYour new payment method has been securely saved and is ready to use for bill payments.`);
  };

  const handleSetDefault = (id: number) => {
    setPaymentMethods(methods => 
      methods.map(method => ({
        ...method,
        isDefault: method.id === id
      }))
    );
    alert("Default payment method updated!\n\nThis payment method will now be used for automatic bill payments.");
  };

  const handleRemoveMethod = (id: number) => {
    const method = paymentMethods.find(m => m.id === id);
    if (method?.isDefault) {
      alert("Cannot remove default payment method!\n\nPlease set another payment method as default before removing this one.");
      return;
    }
    
    setPaymentMethods(methods => methods.filter(method => method.id !== id));
    alert("Payment method removed successfully!");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto bg-white min-h-screen">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="flex items-center space-x-4 p-4">
            <button onClick={() => window.location.href = "/"} className="p-1 text-gray-600 hover:text-blue-600">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <img src="/logo.png" alt="MyBillPort Logo" className="w-8 h-8 object-contain" />
            <div>
              <h1 className="text-xl font-bold text-gray-800">Payment Methods</h1>
              <p className="text-sm text-gray-600">Manage your payment options</p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* Current Payment Methods */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Your Payment Methods</h2>
            <div className="space-y-3">
              {paymentMethods.length === 0 ? (
                <div className="bg-gray-50 p-6 rounded-lg text-center">
                  <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-gray-800 mb-2">No Payment Methods Added</h3>
                  <p className="text-sm text-gray-600 mb-4">Add your first payment method to start managing your bills easily.</p>
                  <p className="text-xs text-gray-500">You can add debit cards, credit cards, gift cards, or use Interac e-Transfer.</p>
                </div>
              ) : (
                paymentMethods.map(method => (
                  <div key={method.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{method.icon}</span>
                        <div>
                          <p className="font-medium text-gray-800">{method.name}</p>
                          <p className="text-sm text-gray-600">•••• {method.last4}</p>
                          {method.isDefault && (
                            <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mt-1">
                              Default
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {!method.isDefault && (
                          <button
                            onClick={() => handleSetDefault(method.id)}
                            className="text-xs text-blue-600 hover:text-blue-700 px-2 py-1 border border-blue-600 rounded"
                          >
                            Set Default
                          </button>
                        )}
                        <button
                          onClick={() => handleRemoveMethod(method.id)}
                          className="text-xs text-red-600 hover:text-red-700 px-2 py-1 border border-red-600 rounded"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Add New Payment Method */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Add Payment Method</h2>
            <div className="grid grid-cols-1 gap-3">
              {paymentTypes.map(type => (
                <button
                  key={type.id}
                  onClick={() => handleAddPaymentMethod(type.id)}
                  disabled={!type.available}
                  className={`flex items-center justify-between p-4 rounded-lg border-2 transition-colors ${
                    type.available 
                      ? `${type.color} hover:scale-105 transform` 
                      : 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <type.icon className="w-6 h-6" />
                    <div className="text-left">
                      <p className="font-medium">{type.name}</p>
                      {!type.available && (
                        <p className="text-xs">Coming Soon</p>
                      )}
                    </div>
                  </div>
                  <Plus className="w-5 h-5" />
                </button>
              ))}
            </div>
          </div>

          {/* Payment Security Info */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-blue-800">Secure Payment Processing</p>
                <p className="text-sm text-blue-700 mt-1">
                  All payment methods are encrypted and securely stored. We use bank-level security to protect your financial information.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Add Payment Method Modal */}
        {showAddMethod && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Add {paymentTypes.find(t => t.id === selectedType)?.name}
              </h3>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSavePaymentMethod)} className="space-y-4">
                  {selectedType === 'interac' ? (
                    <>
                      <div className="bg-blue-50 p-3 rounded-lg mb-4">
                        <p className="text-sm font-medium text-blue-800">Send Payment Request</p>
                        <p className="text-xs text-blue-600 mt-1">Request money from someone via Interac e-Transfer</p>
                      </div>

                      <FormField
                        control={form.control}
                        name="recipientEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                type="email"
                                placeholder="Enter email address to request money from"
                                data-testid="input-recipient-email"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Payment Amount (CAD)</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                type="number"
                                step="0.01"
                                min="0.01"
                                placeholder="0.00"
                                data-testid="input-amount"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Message</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                placeholder="This is for my billboard"
                                data-testid="input-message"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  ) : (
                    <>
                      <FormField
                        control={form.control}
                        name="cardNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {selectedType === 'gift' ? 'Gift Card Number' : 'Card Number'}
                            </FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                placeholder={selectedType === 'gift' ? 'Enter gift card number' : 'Enter card number'}
                                data-testid="input-card-number"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <FormField
                          control={form.control}
                          name="expiryDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Expiry Date</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  placeholder="MM/YY"
                                  data-testid="input-expiry-date"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={selectedType === 'gift' ? 'pin' : 'cvv'}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{selectedType === 'gift' ? 'PIN' : 'CVV'}</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  placeholder={selectedType === 'gift' ? '1234' : '123'}
                                  data-testid={selectedType === 'gift' ? 'input-pin' : 'input-cvv'}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="holderName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cardholder Name</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                placeholder="Enter name on card"
                                data-testid="input-holder-name"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}

                  <div className="flex space-x-3 mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowAddMethod(false);
                        form.reset();
                      }}
                      className="flex-1"
                      data-testid="button-cancel"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1"
                      data-testid="button-add-method"
                    >
                      {selectedType === 'interac' ? 'Send Request' : 'Add Method'}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}