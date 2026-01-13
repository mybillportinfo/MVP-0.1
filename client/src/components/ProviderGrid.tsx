import { useState } from "react";
import { Search, Zap, Phone, Wifi, CreditCard, Droplets, Tv, Home, Shield } from "lucide-react";
import { Input } from "@/components/ui/input";

interface Provider {
  id: string;
  name: string;
  category: string;
  icon: any;
  color: string;
}

const canadianProviders: Provider[] = [
  { id: 'hydro-one', name: 'Hydro One', category: 'Electric', icon: Zap, color: 'bg-yellow-100 text-yellow-600' },
  { id: 'toronto-hydro', name: 'Toronto Hydro', category: 'Electric', icon: Zap, color: 'bg-yellow-100 text-yellow-600' },
  { id: 'enbridge', name: 'Enbridge', category: 'Gas', icon: Home, color: 'bg-orange-100 text-orange-600' },
  { id: 'alectra', name: 'Alectra', category: 'Electric', icon: Zap, color: 'bg-yellow-100 text-yellow-600' },
  { id: 'rogers', name: 'Rogers', category: 'Phone/Internet', icon: Wifi, color: 'bg-red-100 text-red-600' },
  { id: 'bell', name: 'Bell', category: 'Phone/Internet', icon: Phone, color: 'bg-blue-100 text-blue-600' },
  { id: 'telus', name: 'Telus', category: 'Phone/Internet', icon: Phone, color: 'bg-purple-100 text-purple-600' },
  { id: 'fido', name: 'Fido', category: 'Mobile', icon: Phone, color: 'bg-green-100 text-green-600' },
  { id: 'koodo', name: 'Koodo', category: 'Mobile', icon: Phone, color: 'bg-pink-100 text-pink-600' },
  { id: 'virgin-plus', name: 'Virgin Plus', category: 'Mobile', icon: Phone, color: 'bg-red-100 text-red-600' },
  { id: 'freedom', name: 'Freedom Mobile', category: 'Mobile', icon: Phone, color: 'bg-blue-100 text-blue-600' },
  { id: 'td-bank', name: 'TD Bank', category: 'Credit Card', icon: CreditCard, color: 'bg-green-100 text-green-600' },
  { id: 'rbc', name: 'RBC', category: 'Credit Card', icon: CreditCard, color: 'bg-blue-100 text-blue-600' },
  { id: 'scotiabank', name: 'Scotiabank', category: 'Credit Card', icon: CreditCard, color: 'bg-red-100 text-red-600' },
  { id: 'cibc', name: 'CIBC', category: 'Credit Card', icon: CreditCard, color: 'bg-red-100 text-red-600' },
  { id: 'bmo', name: 'BMO', category: 'Credit Card', icon: CreditCard, color: 'bg-blue-100 text-blue-600' },
  { id: 'water-toronto', name: 'Toronto Water', category: 'Water', icon: Droplets, color: 'bg-cyan-100 text-cyan-600' },
  { id: 'netflix', name: 'Netflix', category: 'Streaming', icon: Tv, color: 'bg-red-100 text-red-600' },
  { id: 'disney-plus', name: 'Disney+', category: 'Streaming', icon: Tv, color: 'bg-blue-100 text-blue-600' },
  { id: 'crave', name: 'Crave', category: 'Streaming', icon: Tv, color: 'bg-purple-100 text-purple-600' },
  { id: 'insurance', name: 'Insurance', category: 'Insurance', icon: Shield, color: 'bg-teal-100 text-teal-600' },
  { id: 'other', name: 'Other', category: 'Other', icon: Home, color: 'bg-gray-100 text-gray-600' },
];

interface ProviderGridProps {
  onSelect: (provider: Provider) => void;
  selectedId?: string;
}

export default function ProviderGrid({ onSelect, selectedId }: ProviderGridProps) {
  const [search, setSearch] = useState('');

  const filteredProviders = canadianProviders.filter(
    provider => 
      provider.name.toLowerCase().includes(search.toLowerCase()) ||
      provider.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <Input
          type="text"
          placeholder="Search providers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 rounded-xl border-gray-200 focus:border-teal-500 focus:ring-teal-500"
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        {filteredProviders.map((provider) => {
          const Icon = provider.icon;
          const isSelected = selectedId === provider.id;
          
          return (
            <button
              key={provider.id}
              onClick={() => onSelect(provider)}
              className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
                isSelected 
                  ? 'border-teal-500 bg-teal-50' 
                  : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm'
              }`}
            >
              <div className={`w-12 h-12 ${provider.color.split(' ')[0]} rounded-xl flex items-center justify-center mb-2`}>
                <Icon className={`w-6 h-6 ${provider.color.split(' ')[1]}`} />
              </div>
              <span className="text-sm font-medium text-gray-900 text-center leading-tight">{provider.name}</span>
              <span className="text-xs text-gray-500">{provider.category}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export { canadianProviders, type Provider };
