import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Check, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import ProviderGrid, { type Provider } from "@/components/ProviderGrid";
import { apiRequest } from "@/lib/queryClient";

interface BillData {
  name: string;
  company: string;
  accountNumber: string;
  amount: string;
  dueDate: string;
  priority: string;
  icon: string;
}

type Step = 1 | 2 | 3;

export default function AddBillStepper() {
  const [step, setStep] = useState<Step>(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [customProviderName, setCustomProviderName] = useState("");
  const queryClient = useQueryClient();

  const [billData, setBillData] = useState<BillData>({
    name: "",
    company: "",
    accountNumber: "",
    amount: "",
    dueDate: "",
    priority: "medium",
    icon: "📄"
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  const isOtherProvider = selectedProvider?.id === 'other';

  const addBillMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/bills", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bills"] });
      setShowSuccess(true);
      
      toast({
        title: "Bill Added Successfully",
        description: `${billData.name} has been added to your dashboard!`,
      });
      
      setTimeout(() => {
        setShowSuccess(false);
        window.location.href = "/app";
      }, 2500);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Add Bill",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleProviderSelect = (provider: Provider) => {
    setSelectedProvider(provider);
    if (provider.id !== 'other') {
      const providerName = provider.name;
      setBillData(prev => ({ 
        ...prev, 
        name: providerName,
        company: providerName
      }));
      setCustomProviderName("");
    } else {
      setBillData(prev => ({ 
        ...prev, 
        name: customProviderName,
        company: customProviderName
      }));
    }
  };
  
  const handleCustomProviderChange = (name: string) => {
    setCustomProviderName(name);
    setBillData(prev => ({ 
      ...prev, 
      name: name,
      company: name
    }));
  };

  const handleInputChange = (field: keyof BillData, value: string) => {
    setBillData(prev => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep2 = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!billData.amount || parseFloat(billData.amount) <= 0) {
      errors.amount = "Amount must be greater than 0";
    }
    if (!billData.dueDate) {
      errors.dueDate = "Due date is required";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const nextStep = () => {
    if (step === 1 && !selectedProvider) {
      toast({ title: "Please select a provider", variant: "destructive" });
      return;
    }
    if (step === 1 && isOtherProvider && !customProviderName.trim()) {
      toast({ title: "Please enter a provider name", variant: "destructive" });
      return;
    }
    if (step === 2 && !validateStep2()) {
      return;
    }
    if (step < 3) setStep((step + 1) as Step);
  };

  const prevStep = () => {
    if (step > 1) setStep((step - 1) as Step);
  };

  const handleSave = async () => {
    await addBillMutation.mutateAsync({
      name: billData.name,
      company: billData.company || billData.name,
      amount: billData.amount,
      dueDate: billData.dueDate,
      priority: billData.priority,
      icon: getProviderIcon(billData.name)
    });
  };

  const getProviderIcon = (name: string): string => {
    const n = name.toLowerCase();
    if (n.includes('hydro') || n.includes('electric')) return '⚡';
    if (n.includes('gas') || n.includes('enbridge')) return '🔥';
    if (n.includes('water')) return '💧';
    if (n.includes('phone') || n.includes('rogers') || n.includes('bell') || n.includes('telus')) return '📱';
    if (n.includes('internet') || n.includes('wifi')) return '📶';
    if (n.includes('credit') || n.includes('bank')) return '💳';
    if (n.includes('netflix') || n.includes('disney') || n.includes('crave')) return '📺';
    if (n.includes('insurance')) return '🛡️';
    return '📄';
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Bill Added!</h2>
          <p className="text-gray-600 mb-4">
            {billData.name} has been successfully added to your dashboard.
          </p>
          <div className="animate-pulse text-sm text-gray-500">
            Redirecting you back...
          </div>
        </div>
      </div>
    );
  }

  const stepTitles = {
    1: "Choose Provider",
    2: "Bill Details",
    3: "Confirm & Save"
  };

  const displayName = isOtherProvider ? customProviderName : selectedProvider?.name;

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-md mx-auto flex items-center p-4">
          <button 
            onClick={() => step > 1 ? prevStep() : window.history.back()}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors mr-3"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">{stepTitles[step]}</h1>
            <p className="text-sm text-gray-500">Step {step} of 3</p>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="max-w-md mx-auto px-4 pb-4">
          <div className="flex items-center space-x-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex-1 flex items-center">
                <div className={`h-2 flex-1 rounded-full transition-colors ${
                  s <= step ? 'bg-teal-500' : 'bg-gray-200'
                }`} />
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-md mx-auto p-4 pb-32">
        {/* Step 1: Provider Selection */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-4">
            <ProviderGrid 
              onSelect={handleProviderSelect} 
              selectedId={selectedProvider?.id}
            />
            
            {/* Custom Provider Name Input */}
            {isOtherProvider && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter Provider Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., My Custom Provider"
                  value={customProviderName}
                  onChange={(e) => handleCustomProviderChange(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  autoFocus
                />
              </div>
            )}
          </div>
        )}

        {/* Step 2: Bill Details */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-gray-100">
                <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                  <Check className="w-6 h-6 text-teal-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{displayName}</h3>
                  <p className="text-sm text-gray-500">{selectedProvider?.category}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Account Number (Optional)</label>
                  <input
                    type="text"
                    placeholder="Enter account number"
                    value={billData.accountNumber}
                    onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amount (CAD) *</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    step="0.01"
                    value={billData.amount}
                    onChange={(e) => handleInputChange('amount', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                  {validationErrors.amount && (
                    <p className="text-red-600 text-sm mt-1">{validationErrors.amount}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Due Date *</label>
                  <input
                    type="date"
                    value={billData.dueDate}
                    onChange={(e) => handleInputChange('dueDate', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                  {validationErrors.dueDate && (
                    <p className="text-red-600 text-sm mt-1">{validationErrors.dueDate}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <select
                    value={billData.priority}
                    onChange={(e) => handleInputChange('priority', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Your Bill</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-600">Provider</span>
                  <span className="font-semibold text-gray-900">{displayName}</span>
                </div>
                {billData.accountNumber && (
                  <div className="flex justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-600">Account</span>
                    <span className="font-semibold text-gray-900">{billData.accountNumber}</span>
                  </div>
                )}
                <div className="flex justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-600">Amount</span>
                  <span className="font-semibold text-teal-600 text-xl">${parseFloat(billData.amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-600">Due Date</span>
                  <span className="font-semibold text-gray-900">
                    {new Date(billData.dueDate).toLocaleDateString('en-CA', { 
                      year: 'numeric', month: 'long', day: 'numeric' 
                    })}
                  </span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="text-gray-600">Priority</span>
                  <span className="font-semibold text-gray-900 capitalize">{billData.priority}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4">
        <div className="max-w-md mx-auto flex space-x-3">
          {step > 1 && (
            <Button 
              variant="outline" 
              onClick={prevStep}
              className="flex-1 py-6 rounded-xl"
            >
              Back
            </Button>
          )}
          
          {step < 3 ? (
            <Button 
              onClick={nextStep}
              className="flex-1 bg-teal-600 hover:bg-teal-700 py-6 rounded-xl"
            >
              Continue
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          ) : (
            <Button 
              onClick={handleSave}
              disabled={addBillMutation.isPending}
              className="flex-1 bg-teal-600 hover:bg-teal-700 py-6 rounded-xl"
            >
              {addBillMutation.isPending ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                  Saving...
                </div>
              ) : (
                <>
                  <Check className="w-5 h-5 mr-2" />
                  Save Bill
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
