import React, { useState, useEffect } from 'react';
import { StorageService } from '../../services/storage';
import type { CurrencyType } from '../../types';
import {
  Settings,
  X,
  Key,
  DollarSign,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency: CurrencyType;
  onCurrencyChange: (c: CurrencyType) => void;
  onResetDemo: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currency,
  onCurrencyChange,
  onResetDemo,
}) => {
  const [apiKey, setApiKey] = useState(StorageService.getApiKey());
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.setApiKey(apiKey);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };



  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150"
    >
      <div className="bg-[#FCFBF7] w-full max-w-lg rounded-[24px] neo-border neo-shadow-lg p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-black/10">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-[#FDF189] neo-border flex items-center justify-center text-[#171717]">
              <Settings className="w-4 h-4 stroke-[2.2]" />
            </span>
            <h2 id="settings-modal-title" className="font-mono-code text-lg font-bold text-[#171717]">
              Settings & AI Engine
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close settings"
            className="p-1.5 hover:bg-black/10 rounded-full cursor-pointer text-[#171717]"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Gemini API Key Configuration */}
        <div className="p-4 bg-white rounded-xl neo-border space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono-code font-bold text-xs text-[#171717] flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5" /> Google Gemini API Key
            </span>
            <span className="text-[10px] font-mono-code bg-[#C2F2B0] text-[#171717] px-2 py-0.5 rounded-full border border-black/10">
              Optional
            </span>
          </div>
          <p className="text-[11px] text-[#565656]">
            Enter your key to unlock live Google Gemini models. If left blank, Celebrato seamlessly utilizes its high-precision deterministic offline AI generator.
          </p>

          <form onSubmit={handleSaveApiKey} className="flex gap-2">
            <input
              type="password"
              id="gemini-api-key"
              aria-label="Google Gemini API Key"
              placeholder="Paste Gemini API key..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="flex-1 bg-white p-2 text-xs rounded-lg neo-border focus:outline-none font-mono-code"
            />
            <button
              type="submit"
              className="px-3.5 py-2 bg-[#171717] text-white text-xs font-mono-code font-bold rounded-lg hover:bg-[#2b2b2b] cursor-pointer shrink-0"
            >
              {savedSuccess ? 'Saved!' : 'Save Key'}
            </button>
          </form>
        </div>

        {/* Currency Preference */}
        <div className="p-4 bg-white rounded-xl neo-border space-y-2">
          <span className="font-mono-code font-bold text-xs text-[#171717] flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5" /> Display Currency
          </span>
          <div className="grid grid-cols-3 gap-2">
            {(['INR', 'USD', 'EUR'] as const).map((curr) => (
              <button
                key={curr}
                type="button"
                onClick={() => onCurrencyChange(curr)}
                className={`py-2 rounded-lg neo-border font-mono-code text-xs font-bold transition-all cursor-pointer ${
                  currency === curr
                    ? 'bg-[#FDF189] text-[#171717] neo-shadow-sm'
                    : 'bg-white hover:bg-gray-50'
                }`}
              >
                {curr === 'INR' ? 'INR (₹)' : curr === 'USD' ? 'USD ($)' : 'EUR (€)'}
              </button>
            ))}
          </div>
        </div>


      </div>
    </div>
  );
};
