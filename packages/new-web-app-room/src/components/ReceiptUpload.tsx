'use client';

import { useState, useRef } from 'react';
import { Upload, Camera, Sparkles, Loader2 } from 'lucide-react';
import type { ReceiptData } from '@/types';

type Props = {
  onReceiptScanned: (data: ReceiptData) => void;
};

const DEMO_RECEIPT = {
  items: [
    { id: '1', name: 'Cheeseburger', price: 12.00, assignedTo: [] },
    { id: '2', name: 'Cheeseburger', price: 12.00, assignedTo: [] },
    { id: '3', name: 'Fries', price: 6.00, assignedTo: [] },
    { id: '4', name: 'Soda', price: 3.00, assignedTo: [] },
    { id: '5', name: 'Soda', price: 3.00, assignedTo: [] },
    { id: '6', name: 'Soda', price: 3.00, assignedTo: [] },
  ],
  subtotal: 39.00,
  tax: 3.51,
  tip: 7.80,
  total: 50.31
};

export default function ReceiptUpload({ onReceiptScanned }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      processFile(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = async (file: File) => {
    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    setIsProcessing(true);

    // Simulate AI processing with realistic delay
    await new Promise(resolve => setTimeout(resolve, 2500));

    // For demo purposes, return mock data
    // In production, this would call Claude API
    setIsProcessing(false);
    onReceiptScanned(DEMO_RECEIPT);
  };

  const handleDemoReceipt = async () => {
    setIsProcessing(true);
    
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsProcessing(false);
    onReceiptScanned(DEMO_RECEIPT);
  };

  return (
    <div className="max-w-2xl mx-auto animate-slide-up">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative group transition-all duration-500 ${
          isDragging ? 'scale-105' : 'scale-100'
        }`}
      >
        {/* Glass card */}
        <div className={`relative bg-white/10 backdrop-blur-xl rounded-3xl p-12 border-2 transition-all duration-300 ${
          isDragging 
            ? 'border-cyan-400 shadow-2xl shadow-cyan-500/50' 
            : 'border-white/20 hover:border-white/40 shadow-xl'
        }`}>
          
          {!preview && !isProcessing && (
            <>
              <div className="text-center">
                <div className="relative inline-block mb-6">
                  <div className={`w-24 h-24 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center transition-all duration-300 ${
                    isDragging ? 'scale-110 animate-pulse' : 'group-hover:scale-110'
                  }`}>
                    <Upload className="w-12 h-12 text-white" />
                  </div>
                  <Sparkles className="w-8 h-8 text-yellow-400 absolute -top-2 -right-2 animate-pulse" />
                </div>

                <h2 className="text-3xl font-bold text-white mb-3">
                  Upload Your Receipt
                </h2>
                <p className="text-lg text-blue-200 mb-8">
                  Drag & drop or click to upload • JPEG, PNG
                </p>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                <div className="flex flex-col gap-4">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="group/btn relative px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl font-bold text-white text-lg shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 hover:scale-105 overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      <Camera className="w-5 h-5" />
                      Choose File
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                  </button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/20"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-transparent text-blue-200 font-medium">or try demo</span>
                    </div>
                  </div>

                  <button
                    onClick={handleDemoReceipt}
                    className="px-8 py-4 bg-white/10 backdrop-blur-sm rounded-xl font-bold text-white text-lg border-2 border-white/30 hover:bg-white/20 hover:border-white/50 transition-all duration-300 hover:scale-105"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <Receipt className="w-5 h-5" />
                      Try Demo Receipt
                    </span>
                  </button>
                </div>
              </div>
            </>
          )}

          {preview && !isProcessing && (
            <div className="text-center animate-fade-in">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={preview} 
                alt="Receipt preview" 
                className="max-w-full max-h-96 mx-auto rounded-xl shadow-2xl mb-6"
              />
              <p className="text-white text-lg">Processing receipt...</p>
            </div>
          )}

          {isProcessing && (
            <div className="text-center animate-fade-in">
              <div className="relative inline-block mb-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center animate-pulse">
                  <Loader2 className="w-12 h-12 text-white animate-spin" />
                </div>
                <Sparkles className="w-8 h-8 text-yellow-400 absolute -top-2 -right-2 animate-bounce" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                AI is reading your receipt...
              </h3>
              <p className="text-blue-200 text-lg">
                Extracting items, prices, tax & tip ✨
              </p>
              
              {/* Loading bar */}
              <div className="mt-8 w-full bg-white/10 rounded-full h-3 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 animate-loading-bar rounded-full"></div>
              </div>
            </div>
          )}
        </div>

        {/* Glow effect */}
        {isDragging && (
          <div className="absolute inset-0 bg-cyan-400/20 rounded-3xl blur-2xl -z-10 animate-pulse"></div>
        )}
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        @keyframes loading-bar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-loading-bar {
          animation: loading-bar 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

function Receipt({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1z" />
      <path d="M16 8h-6M16 12h-6M16 16h-6" />
    </svg>
  );
}



