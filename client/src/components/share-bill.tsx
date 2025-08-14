import React, { useState } from 'react';
import { Copy, Share2, MessageCircle, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface ShareBillProps {
  bill: {
    id: string;
    title: string;
    totalAmount: number;
    people: Array<{
      id: string;
      name: string;
      emoji: string;
      amount: number;
      paid: boolean;
    }>;
  };
  onClose: () => void;
}

export default function ShareBill({ bill, onClose }: ShareBillProps) {
  const { toast } = useToast();
  const [shareText, setShareText] = useState('');

  React.useEffect(() => {
    const text = `💰 ${bill.title}\n\nTotal: $${bill.totalAmount.toFixed(2)}\n\n` +
      bill.people.map(p => `${p.emoji} ${p.name}: $${p.amount.toFixed(2)} ${p.paid ? '✅' : '❌'}`).join('\n') +
      '\n\nSplit with MyBillPort 📱\nDownload: mybillport.com';
    setShareText(text);
  }, [bill]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareText);
    toast({
      title: "Copied! 📋",
      description: "Bill details copied to clipboard."
    });
  };

  const shareViaWebShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Bill Split: ${bill.title}`,
        text: shareText
      });
    } else {
      copyToClipboard();
    }
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent(`Bill Split: ${bill.title}`);
    const body = encodeURIComponent(shareText);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const shareViaSMS = () => {
    const body = encodeURIComponent(shareText);
    window.open(`sms:?body=${body}`);
  };

  const generateQRCode = () => {
    // Generate a simple share URL that could be converted to QR code
    const shareUrl = `https://mybillport.com/split/${bill.id}`;
    toast({
      title: "QR Code Feature Coming Soon! 📱",
      description: "QR code sharing will be available in the next update."
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Share Bill Split</h3>
        
        {/* Bill Summary */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h4 className="font-medium text-gray-800 mb-2">{bill.title}</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p>Total: <span className="font-semibold">${bill.totalAmount.toFixed(2)}</span></p>
            <p>Split between {bill.people.length} people</p>
          </div>
        </div>

        {/* Share Options */}
        <div className="space-y-3 mb-4">
          <Button
            onClick={shareViaWebShare}
            className="w-full justify-start"
            variant="outline"
            data-testid="button-share-native"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share via Apps
          </Button>

          <Button
            onClick={copyToClipboard}
            className="w-full justify-start"
            variant="outline"
            data-testid="button-copy-link"
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy to Clipboard
          </Button>

          <Button
            onClick={shareViaSMS}
            className="w-full justify-start"
            variant="outline"
            data-testid="button-share-sms"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Send via Text
          </Button>

          <Button
            onClick={shareViaEmail}
            className="w-full justify-start"
            variant="outline"
            data-testid="button-share-email"
          >
            <Mail className="w-4 h-4 mr-2" />
            Send via Email
          </Button>

          <Button
            onClick={generateQRCode}
            className="w-full justify-start"
            variant="outline"
            data-testid="button-qr-code"
          >
            <div className="w-4 h-4 mr-2 border border-gray-400 rounded"></div>
            Generate QR Code
          </Button>
        </div>

        {/* Preview */}
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <p className="text-xs text-gray-600 mb-2">Preview:</p>
          <div className="text-xs text-gray-700 whitespace-pre-line font-mono">
            {shareText.substring(0, 150)}...
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
            data-testid="button-close-share"
          >
            Close
          </Button>
          <Button
            onClick={shareViaWebShare}
            className="flex-1 bg-purple-600 hover:bg-purple-700"
            data-testid="button-share-now"
          >
            Share Now
          </Button>
        </div>
      </div>
    </div>
  );
}