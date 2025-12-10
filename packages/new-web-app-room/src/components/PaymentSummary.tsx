'use client';

import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import { Copy, Share2, RotateCcw, Check, DollarSign } from 'lucide-react';
import type { ReceiptData, Person, ReceiptItem } from '@/types';

type Props = {
  receiptData: ReceiptData;
  people: Person[];
  splitMode: 'equal' | 'item';
  onStartOver: () => void;
};

type PersonTotal = {
  person: Person;
  subtotal: number;
  taxShare: number;
  tipShare: number;
  total: number;
  items: string[];
};

export default function PaymentSummary({ receiptData, people, splitMode, onStartOver }: Props) {
  const [copied, setCopied] = useState<string | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [animatedTotals, setAnimatedTotals] = useState<Record<string, number>>({});

  const calculateSplits = (): PersonTotal[] => {
    if (splitMode === 'equal') {
      const perPerson = receiptData.total / people.length;
      const subtotalPerPerson = receiptData.subtotal / people.length;
      const taxPerPerson = receiptData.tax / people.length;
      const tipPerPerson = receiptData.tip / people.length;

      return people.map(person => ({
        person,
        subtotal: subtotalPerPerson,
        taxShare: taxPerPerson,
        tipShare: tipPerPerson,
        total: perPerson,
        items: ['Equal split of all items']
      }));
    } else {
      // Item split mode
      const personTotals: Record<string, { subtotal: number; items: string[] }> = {};
      
      people.forEach(person => {
        personTotals[person.id] = { subtotal: 0, items: [] };
      });

      receiptData.items.forEach((item: ReceiptItem) => {
        if (item.assignedTo.length > 0) {
          const pricePerPerson = item.price / item.assignedTo.length;
          item.assignedTo.forEach((personId: string) => {
            if (personTotals[personId]) {
              personTotals[personId].subtotal += pricePerPerson;
              personTotals[personId].items.push(item.name);
            }
          });
        }
      });

      return people.map(person => {
        const subtotal = personTotals[person.id]?.subtotal || 0;
        const proportion = subtotal / receiptData.subtotal;
        const taxShare = receiptData.tax * proportion;
        const tipShare = receiptData.tip * proportion;
        const total = subtotal + taxShare + tipShare;

        return {
          person,
          subtotal,
          taxShare,
          tipShare,
          total,
          items: personTotals[person.id]?.items || []
        };
      });
    }
  };

  const splits = calculateSplits();

  useEffect(() => {
    // Trigger confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#22D3EE', '#3B82F6', '#A855F7', '#EC4899']
    });

    setTimeout(() => setShowSummary(true), 200);

    // Animate numbers counting up
    splits.forEach(split => {
      let current = 0;
      const target = split.total;
      const increment = target / 30;
      const interval = setInterval(() => {
        current += increment;
        if (current >= target) {
          current = target;
          clearInterval(interval);
        }
        setAnimatedTotals(prev => ({ ...prev, [split.person.id]: current }));
      }, 30);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const generatePaymentLink = (person: Person, amount: number) => {
    return `venmo://paycharge?txn=pay&recipients=${person.name}&amount=${amount.toFixed(2)}&note=SplitSmart`;
  };

  const generateSummaryText = () => {
    let text = '💸 SplitSmart Payment Summary\n\n';
    splits.forEach(split => {
      text += `${split.person.name}: $${split.total.toFixed(2)}\n`;
      if (split.items.length > 0 && splitMode === 'item') {
        text += `  Items: ${split.items.join(', ')}\n`;
      }
      text += '\n';
    });
    text += `Total: $${receiptData.total.toFixed(2)}`;
    return text;
  };

  return (
    <div className="max-w-6xl mx-auto animate-slide-up">
      <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border-2 border-white/20 shadow-2xl">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block mb-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center animate-bounce-slow shadow-lg shadow-green-500/50">
              <Check className="w-10 h-10 text-white" />
            </div>
          </div>
          <h2 className="text-4xl font-black text-white mb-2">
            Time to pay up! 💸
          </h2>
          <p className="text-blue-200 text-lg">
            Here&apos;s what everyone owes
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {splits.map((split, idx) => (
            <div
              key={split.person.id}
              className={`relative group ${showSummary ? 'animate-pop-in' : 'opacity-0'}`}
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border-2 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                style={{ borderColor: split.person.color + '60' }}
              >
                {/* Person Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div 
                    className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg"
                    style={{ backgroundColor: split.person.color }}
                  >
                    {split.person.name[0].toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-xl">{split.person.name}</h3>
                    <p className="text-white/60 text-sm">owes</p>
                  </div>
                </div>

                {/* Amount */}
                <div className="mb-4">
                  <div className="text-5xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">
                    ${(animatedTotals[split.person.id] || 0).toFixed(2)}
                  </div>
                  
                  {/* Breakdown */}
                  <div className="space-y-1 text-sm text-white/70">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>${split.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax:</span>
                      <span>${split.taxShare.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tip:</span>
                      <span>${split.tipShare.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Items */}
                {splitMode === 'item' && split.items.length > 0 && (
                  <div className="mb-4 p-3 bg-white/5 rounded-lg">
                    <p className="text-white/60 text-xs font-semibold mb-2">ITEMS:</p>
                    <div className="space-y-1">
                      {split.items.map((item, i) => (
                        <p key={i} className="text-white text-sm">• {item}</p>
                      ))}
                    </div>
                  </div>
                )}

                {/* QR Code */}
                <div className="bg-white p-3 rounded-xl mb-4">
                  <QRCodeSVG 
                    value={generatePaymentLink(split.person, split.total)}
                    size={120}
                    className="mx-auto"
                    level="M"
                  />
                </div>

                {/* Payment Buttons */}
                <div className="space-y-2">
                  <button
                    onClick={() => handleCopy(generatePaymentLink(split.person, split.total), split.person.id)}
                    className="w-full py-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg text-white font-semibold hover:shadow-lg hover:shadow-green-500/50 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    {copied === split.person.id ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy Venmo Link
                      </>
                    )}
                  </button>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleCopy(`$${split.total.toFixed(2)}`, `amount-${split.person.id}`)}
                      className="py-2 bg-white/10 rounded-lg text-white text-sm font-semibold hover:bg-white/20 transition-colors flex items-center justify-center gap-1"
                    >
                      {copied === `amount-${split.person.id}` ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        <DollarSign className="w-3 h-3" />
                      )}
                      Amount
                    </button>
                    <button className="py-2 bg-white/10 rounded-lg text-white text-sm font-semibold hover:bg-white/20 transition-colors">
                      CashApp
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => handleCopy(generateSummaryText(), 'summary')}
            className="flex-1 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-bold text-white shadow-lg hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
          >
            {copied === 'summary' ? (
              <>
                <Check className="w-5 h-5" />
                Copied Summary!
              </>
            ) : (
              <>
                <Share2 className="w-5 h-5" />
                Share Summary
              </>
            )}
          </button>
          
          <button
            onClick={onStartOver}
            className="flex-1 py-4 bg-white/10 backdrop-blur-sm rounded-xl font-bold text-white border-2 border-white/30 hover:bg-white/20 hover:border-white/50 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            Start Over
          </button>
        </div>

        {/* Total Summary */}
        <div className="mt-8 pt-6 border-t-2 border-white/20 text-center">
          <p className="text-white/60 text-sm mb-2">TOTAL BILL</p>
          <p className="text-4xl font-black text-white">${receiptData.total.toFixed(2)}</p>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
        }
        @keyframes pop-in {
          from { opacity: 0; transform: scale(0.8) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-pop-in {
          animation: pop-in 0.5s ease-out forwards;
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}







