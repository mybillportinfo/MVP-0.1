import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Send, Bot, User, Smile, Paperclip, Phone, MessageCircle } from "lucide-react";

export default function LiveChat() {
  // Rotating AI assistant names
  const aiAssistants = [
    { name: "Alex", personality: "friendly and helpful" },
    { name: "Jordan", personality: "analytical and precise" },
    { name: "Sam", personality: "encouraging and supportive" },
    { name: "Casey", personality: "knowledgeable and patient" },
    { name: "Riley", personality: "energetic and motivating" },
    { name: "Taylor", personality: "calm and reassuring" }
  ];

  // Select random assistant for this session
  const [currentAssistant] = useState(() => 
    aiAssistants[Math.floor(Math.random() * aiAssistants.length)]
  );

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "bot",
      message: `Hello! I'm ${currentAssistant.name}, your MyBillPort assistant. How can I help you save money on your bills today?`,
      timestamp: new Date().toLocaleTimeString(),
      type: "text"
    },
    {
      id: 2,
      sender: "bot", 
      message: "I can help you with:\n• Bill payment questions\n• Savings suggestions\n• Account management\n• Technical support\n• Canadian provider comparisons",
      timestamp: new Date().toLocaleTimeString(),
      type: "text"
    }
  ]);
  
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Quick reply suggestions
  const quickReplies = [
    "Help me save money 💰",
    "Payment issues 💳", 
    "Add new bill 📄",
    "Technical support 🔧",
    "Compare providers 📊"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (messageText?: string) => {
    const message = messageText || inputMessage.trim();
    if (!message) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      sender: "user",
      message,
      timestamp: new Date().toLocaleTimeString(),
      type: "text"
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const botResponse = generateBotResponse(message);
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const generateBotResponse = (userMessage: string) => {
    const message = userMessage.toLowerCase();
    let response = "";

    if (message.includes("save") || message.includes("money") || message.includes("💰")) {
      response = "Great question! I've analyzed your bills and found several ways to save money:\n\n💡 Switch Rogers plan: Save $15/month\n⚡ Hydro One off-peak timing: Save $8.50/month\n🤖 Enable auto-pay discounts: Save $12/month\n\nTotal potential savings: $35.50/month or $426/year!\n\nWould you like me to help you implement any of these savings?";
    } else if (message.includes("payment") || message.includes("💳")) {
      response = "I can help you with payment issues! Here are some common solutions:\n\n• **Late payment:** I can help you set up automatic payments\n• **Payment failed:** Check your payment method in Settings\n• **Dispute charges:** I'll guide you through the process\n• **Payment history:** View all transactions in your dashboard\n\nWhat specific payment issue are you experiencing?";
    } else if (message.includes("add") || message.includes("bill") || message.includes("📄")) {
      response = "Adding a new bill is easy! You have several options:\n\n📱 **AI Camera Scan:** Take a photo of your bill for instant recognition\n📝 **Manual Entry:** Add bill details manually\n🔗 **Provider Integration:** Connect directly with Canadian providers\n\nI recommend using our AI scanner - it's 95% accurate and saves time! Would you like me to open the camera scanner for you?";
    } else if (message.includes("technical") || message.includes("support") || message.includes("🔧")) {
      response = "I'm here to help with technical issues! Common solutions:\n\n📱 **App Issues:** Try refreshing or restarting the app\n🔐 **Login Problems:** Reset password or check your email\n💾 **Data Sync:** Check your internet connection\n🔔 **Notifications:** Enable permissions in phone settings\n\nIf you need human support, I can connect you with our technical team. What specific issue are you facing?";
    } else if (message.includes("compare") || message.includes("provider") || message.includes("📊")) {
      response = "I can help you compare Canadian providers! Here are current top options:\n\n📱 **Mobile:**\n• Rogers, Bell, Telus (Premium)\n• Fido, Koodo, Virgin (Mid-range)\n• Freedom, Public Mobile (Budget)\n\n⚡ **Utilities:**\n• Hydro One, BC Hydro, SaskPower\n• Enbridge, Union Gas\n\n💳 **Banking:**\n• RBC, TD, BMO, Scotiabank, CIBC\n• Tangerine, PC Financial (Online)\n\nWhich category would you like detailed comparisons for?";
    } else if (message.includes("hello") || message.includes("hi") || message.includes("hey")) {
      response = `Hello! Nice to meet you!\n\nI'm ${currentAssistant.name}, your personal bill management assistant. I'm here 24/7 to help you:\n\n💰 Save money on bills\n📱 Manage payments\n🔍 Find better deals\n📊 Track spending\n🤖 Automate processes\n\nWhat would you like to work on today?`;
    } else {
      response = "I understand you're asking about: \"" + userMessage + "\"\n\nLet me help you with that! Based on your MyBillPort account, I can provide personalized assistance.\n\nWould you like me to:\n• Check your current bills for savings opportunities\n• Help you manage payments and due dates\n• Find better deals from Canadian providers\n• Set up automation features\n\nJust let me know what specific area you'd like help with! 😊";
    }

    return {
      id: Date.now(),
      sender: "bot",
      message: response,
      timestamp: new Date().toLocaleTimeString(),
      type: "text"
    };
  };

  const handleQuickReply = (reply: string) => {
    handleSendMessage(reply);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button onClick={() => window.history.back()} className="p-1 text-gray-600 hover:text-blue-600">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <img src="/logo.png" alt="MyBillPort Logo" className="w-8 h-8 object-contain" />
              <div>
                <h1 className="text-xl font-bold text-gray-800">Live Chat</h1>
                <p className="text-sm text-gray-600">{currentAssistant.name} • Assistant</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs text-green-600 font-medium">Online</span>
            </div>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 max-w-md mx-auto w-full p-4 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex items-start space-x-2 max-w-xs ${msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  msg.sender === 'user' ? 'bg-blue-600' : 'bg-green-100'
                }`}>
                  {msg.sender === 'user' ? 
                    <User className="w-4 h-4 text-white" /> : 
                    <Bot className="w-4 h-4 text-green-600" />
                  }
                </div>
                <div className={`rounded-2xl px-4 py-2 ${
                  msg.sender === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white border border-gray-200 text-gray-800'
                }`}>
                  <p className="text-sm whitespace-pre-line">{msg.message}</p>
                  <p className={`text-xs mt-1 ${
                    msg.sender === 'user' ? 'text-blue-100' : 'text-gray-400'
                  }`}>
                    {msg.timestamp}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-2">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-green-600" />
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl px-4 py-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Replies */}
      {!isTyping && (
        <div className="max-w-md mx-auto w-full p-4">
          <div className="flex flex-wrap gap-2 mb-4">
            {quickReplies.map((reply, index) => (
              <button
                key={index}
                onClick={() => handleQuickReply(reply)}
                className="bg-white border border-gray-200 text-gray-700 px-3 py-2 rounded-full text-sm hover:bg-gray-50 transition-colors"
              >
                {reply}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center space-x-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your message..."
                className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <Smile className="w-5 h-5" />
              </button>
            </div>
            <button className="p-1 text-gray-400 hover:text-gray-600">
              <Paperclip className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleSendMessage()}
              className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          {/* Support Options */}
          <div className="flex justify-center space-x-4 mt-4">
            <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-600 text-sm">
              <Phone className="w-4 h-4" />
              <span>Call Support</span>
            </button>
            <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-600 text-sm">
              <MessageCircle className="w-4 h-4" />
              <span>Email Us</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}