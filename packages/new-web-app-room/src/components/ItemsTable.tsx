'use client';

import { useState, useEffect } from 'react';
import { Check, Edit2, Trash2, Plus, ArrowRight } from 'lucide-react';
import type { ReceiptData, ReceiptItem } from '@/types';

type Props = {
  receiptData: ReceiptData;
  onContinue: () => void;
  onBack: () => void;
};

export default function ItemsTable({ receiptData, onContinue, onBack }: Props) {
  const [items, setItems] = useState(receiptData.items);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [showItems, setShowItems] = useState(false);

  useEffect(() => {
    // Stagger animation for items
    setTimeout(() => setShowItems(true), 100);
  }, []);

  const handleEdit = (id: string, name: string, price: number) => {
    setEditingId(id);
    setEditName(name);
    setEditPrice(price.toFixed(2));
  };

  const handleSave = (id: string) => {
    setItems(items.map((item: ReceiptItem) => 
      item.id === id 
        ? { ...item, name: editName, price: parseFloat(editPrice) }
        : item
    ));
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    setItems(items.filter((item: ReceiptItem) => item.id !== id));
  };

  const handleAddItem = () => {
    const newItem = {
      id: Date.now().toString(),
      name: 'New Item',
      price: 0,
      assignedTo: []
    };
    setItems([...items, newItem]);
    handleEdit(newItem.id, newItem.name, newItem.price);
  };

  return (
    <div className="max-w-4xl mx-auto animate-slide-up">
      <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border-2 border-white/20 shadow-2xl">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-black text-white mb-2">
            Review Your Items
          </h2>
          <p className="text-blue-200 text-lg">
            Edit, add, or remove items before splitting
          </p>
        </div>

        {/* Items Table */}
        <div className="space-y-3 mb-6">
          {items.map((item: ReceiptItem, idx: number) => (
            <div
              key={item.id}
              className={`bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-cyan-400/50 transition-all duration-300 ${
                showItems ? 'animate-pop-in' : 'opacity-0'
              }`}
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              {editingId === item.id ? (
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:border-cyan-400 transition-colors"
                    placeholder="Item name"
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-white/70 text-lg">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                      className="w-24 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:border-cyan-400 transition-colors"
                      placeholder="0.00"
                    />
                  </div>
                  <button
                    onClick={() => handleSave(item.id)}
                    className="p-2 bg-green-500 hover:bg-green-600 rounded-lg transition-colors"
                  >
                    <Check className="w-5 h-5 text-white" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <span className="text-white font-semibold text-lg">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-cyan-400 font-bold text-xl">
                      ${item.price.toFixed(2)}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(item.id, item.name, item.price)}
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors group"
                      >
                        <Edit2 className="w-4 h-4 text-white/70 group-hover:text-white" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 bg-white/10 hover:bg-red-500/50 rounded-lg transition-colors group"
                      >
                        <Trash2 className="w-4 h-4 text-white/70 group-hover:text-white" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add Item Button */}
        <button
          onClick={handleAddItem}
          className="w-full py-3 bg-white/5 border-2 border-dashed border-white/30 rounded-xl text-white/70 hover:text-white hover:border-cyan-400 hover:bg-white/10 transition-all duration-300 flex items-center justify-center gap-2 font-semibold"
        >
          <Plus className="w-5 h-5" />
          Add Item
        </button>

        {/* Summary */}
        <div className="mt-8 pt-6 border-t-2 border-white/20">
          <div className="space-y-3">
            <div className="flex justify-between text-white/80">
              <span className="text-lg">Subtotal</span>
              <span className="text-lg font-semibold">${receiptData.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-white/80">
              <span className="text-lg">Tax</span>
              <span className="text-lg font-semibold">${receiptData.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-white/80">
              <span className="text-lg">Tip</span>
              <span className="text-lg font-semibold">${receiptData.tip.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-white pt-3 border-t-2 border-white/20">
              <span className="text-2xl font-bold">Total</span>
              <span className="text-2xl font-black text-cyan-400">${receiptData.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 mt-8">
          <button
            onClick={onBack}
            className="flex-1 py-4 bg-white/10 backdrop-blur-sm rounded-xl font-bold text-white border-2 border-white/30 hover:bg-white/20 hover:border-white/50 transition-all duration-300"
          >
            Back
          </button>
          <button
            onClick={onContinue}
            className="flex-1 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl font-bold text-white shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
          >
            Continue
            <ArrowRight className="w-5 h-5" />
          </button>
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
          from { opacity: 0; transform: scale(0.9) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-pop-in {
          animation: pop-in 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
}




