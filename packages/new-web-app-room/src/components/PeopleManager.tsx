'use client';

import { useState, useEffect } from 'react';
import { Plus, X, Users, ArrowRight, Zap } from 'lucide-react';
import type { ReceiptData, Person, ReceiptItem } from '@/types';

type Props = {
  receiptData: ReceiptData;
  people: Person[];
  setPeople: (people: Person[]) => void;
  splitMode: 'equal' | 'item';
  setSplitMode: (mode: 'equal' | 'item') => void;
  onContinue: () => void;
  onBack: () => void;
};

const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
  '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788'
];

export default function PeopleManager({ 
  receiptData, 
  people, 
  setPeople, 
  splitMode, 
  setSplitMode,
  onContinue, 
  onBack 
}: Props) {
  const [newPersonName, setNewPersonName] = useState('');
  const [showPeople, setShowPeople] = useState(false);

  useEffect(() => {
    setTimeout(() => setShowPeople(true), 100);
  }, []);

  const handleAddPerson = () => {
    if (newPersonName.trim() && people.length < 10) {
      const newPerson: Person = {
        id: Date.now().toString(),
        name: newPersonName.trim(),
        color: COLORS[people.length % COLORS.length]
      };
      setPeople([...people, newPerson]);
      setNewPersonName('');
    }
  };

  const handleRemovePerson = (id: string) => {
    setPeople(people.filter(p => p.id !== id));
  };

  const handleItemClick = (itemId: string, personId: string) => {
    if (splitMode !== 'item') return;

    const updatedItems = receiptData.items.map((item: ReceiptItem) => {
      if (item.id === itemId) {
        const isAssigned = item.assignedTo.includes(personId);
        return {
          ...item,
          assignedTo: isAssigned
            ? item.assignedTo.filter((id: string) => id !== personId)
            : [...item.assignedTo, personId]
        };
      }
      return item;
    });

    receiptData.items = updatedItems;
  };



  return (
    <div className="max-w-6xl mx-auto animate-slide-up">
      <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border-2 border-white/20 shadow-2xl">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-black text-white mb-2">
            Who ate what? 🍽️
          </h2>
          <p className="text-blue-200 text-lg">
            Add people and choose how to split the bill
          </p>
        </div>

        {/* Split Mode Toggle */}
        <div className="flex gap-4 mb-8 max-w-2xl mx-auto">
          <button
            onClick={() => setSplitMode('equal')}
            className={`flex-1 py-4 px-6 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
              splitMode === 'equal'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/50 scale-105'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            <Zap className="w-5 h-5" />
            Equal Split
          </button>
          <button
            onClick={() => setSplitMode('item')}
            className={`flex-1 py-4 px-6 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
              splitMode === 'item'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/50 scale-105'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            <Users className="w-5 h-5" />
            Item Split
          </button>
        </div>

        {/* Add People */}
        <div className="mb-8">
          <div className="flex gap-3 mb-6">
            <input
              type="text"
              value={newPersonName}
              onChange={(e) => setNewPersonName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddPerson()}
              placeholder="Enter person's name..."
              className="flex-1 bg-white/10 border-2 border-white/20 rounded-xl px-6 py-4 text-white placeholder-white/50 focus:outline-none focus:border-cyan-400 transition-colors text-lg"
              maxLength={20}
            />
            <button
              onClick={handleAddPerson}
              disabled={!newPersonName.trim() || people.length >= 10}
              className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl font-bold text-white shadow-lg hover:shadow-green-500/50 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add
            </button>
          </div>

          {/* People Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {people.map((person, idx) => (
              <div
                key={person.id}
                className={`relative group ${showPeople ? 'animate-pop-in' : 'opacity-0'}`}
                style={{ animationDelay: `${idx * 80}ms` }}
              >
                <div 
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border-2 transition-all duration-300 hover:scale-105"
                  style={{ borderColor: person.color + '80' }}
                >
                  <div 
                    className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center text-white font-bold text-xl shadow-lg"
                    style={{ backgroundColor: person.color }}
                  >
                    {person.name[0].toUpperCase()}
                  </div>
                  <p className="text-white text-center font-semibold truncate">
                    {person.name}
                  </p>
                  <button
                    onClick={() => handleRemovePerson(person.id)}
                    className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {people.length === 0 && (
            <div className="text-center py-12 text-white/50">
              <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Add at least 2 people to continue</p>
            </div>
          )}
        </div>

        {/* Item Assignment (only in item split mode) */}
        {splitMode === 'item' && people.length > 0 && (
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-white mb-4 text-center">
              Click items to assign to people
            </h3>
            <div className="space-y-3">
              {receiptData.items.map((item: ReceiptItem) => (
                <div
                  key={item.id}
                  className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-white font-semibold text-lg">{item.name}</span>
                    <span className="text-cyan-400 font-bold text-xl">${item.price.toFixed(2)}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {people.map((person) => {
                      const isAssigned = item.assignedTo.includes(person.id);
                      return (
                        <button
                          key={person.id}
                          onClick={() => handleItemClick(item.id, person.id)}
                          className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                            isAssigned
                              ? 'text-white shadow-lg scale-105'
                              : 'bg-white/10 text-white/50 hover:bg-white/20'
                          }`}
                          style={isAssigned ? { backgroundColor: person.color } : {}}
                        >
                          {person.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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
            disabled={people.length < 2}
            className="flex-1 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl font-bold text-white shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
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
          from { opacity: 0; transform: scale(0.8) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-pop-in {
          animation: pop-in 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
}





