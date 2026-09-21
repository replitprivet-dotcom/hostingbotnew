import React, { useState, useEffect } from 'react';
import { Shield, Lock, Delete, Unlock, AlertTriangle, KeyRound } from 'lucide-react';
import { getSecurityPin, removeSecurityPin } from '../utils/privacy';

interface PrivacyLockOverlayProps {
  isLocked: boolean;
  onUnlock: () => void;
  onResetSession: () => void;
}

export const PrivacyLockOverlay: React.FC<PrivacyLockOverlayProps> = ({
  isLocked,
  onUnlock,
  onResetSession,
}) => {
  const [pinInput, setPinInput] = useState<string>('');
  const [hasError, setHasError] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  useEffect(() => {
    if (isLocked) {
      setPinInput('');
      setHasError(false);
    }
  }, [isLocked]);

  if (!isLocked) return null;

  const currentPin = getSecurityPin() || '1234';

  const handleDigit = (digit: string) => {
    if (pinInput.length < 4) {
      const next = pinInput + digit;
      setPinInput(next);
      setHasError(false);

      if (next.length === 4) {
        if (next === currentPin) {
          onUnlock();
          setPinInput('');
        } else {
          setHasError(true);
          setTimeout(() => {
            setPinInput('');
            setHasError(false);
          }, 800);
        }
      }
    }
  };

  const handleBackspace = () => {
    setPinInput((prev) => prev.slice(0, -1));
    setHasError(false);
  };

  const handleConfirmReset = () => {
    removeSecurityPin();
    setShowForgotModal(false);
    onResetSession();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0f172a]/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-white select-none animate-in fade-in duration-200">
      <div className="w-full max-w-xs flex flex-col items-center space-y-6">
        {/* Security Lock Header */}
        <div className="w-16 h-16 rounded-3xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-xl shadow-blue-500/10">
          <Lock className="w-8 h-8" />
        </div>

        <div className="text-center space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-white">Kaalix Cloud Locked</h2>
          <p className="text-xs text-slate-400">Enter your 4-digit security PIN to unlock</p>
        </div>

        {/* 4 Dot Indicators */}
        <div className={`flex items-center justify-center gap-4 py-2 ${hasError ? 'animate-shake' : ''}`}>
          {[0, 1, 2, 3].map((idx) => {
            const isFilled = idx < pinInput.length;
            return (
              <div
                key={idx}
                className={`w-4 h-4 rounded-full transition-all duration-150 ${
                  hasError
                    ? 'bg-rose-500 ring-4 ring-rose-500/20'
                    : isFilled
                    ? 'bg-blue-500 scale-110 shadow-sm shadow-blue-500/50'
                    : 'bg-slate-700/60 border border-slate-600/40'
                }`}
              />
            );
          })}
        </div>

        {hasError && (
          <div className="text-xs text-rose-400 font-semibold animate-in fade-in">
            Incorrect PIN. Try again.
          </div>
        )}

        {/* Numeric Keypad */}
        <div className="grid grid-cols-3 gap-3 w-full pt-2">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              onClick={() => handleDigit(digit)}
              className="h-14 rounded-2xl bg-slate-800/80 hover:bg-slate-700/90 active:scale-95 border border-slate-700/50 text-xl font-bold text-slate-100 flex items-center justify-center transition-all cursor-pointer shadow-xs"
            >
              {digit}
            </button>
          ))}
          <div />
          <button
            onClick={() => handleDigit('0')}
            className="h-14 rounded-2xl bg-slate-800/80 hover:bg-slate-700/90 active:scale-95 border border-slate-700/50 text-xl font-bold text-slate-100 flex items-center justify-center transition-all cursor-pointer shadow-xs"
          >
            0
          </button>
          <button
            onClick={handleBackspace}
            className="h-14 rounded-2xl bg-slate-800/40 hover:bg-slate-800 active:scale-95 text-slate-400 hover:text-slate-200 flex items-center justify-center transition-all cursor-pointer"
            title="Backspace"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {/* Forgot PIN / Reset Link */}
        <div className="pt-3">
          <button
            onClick={() => setShowForgotModal(true)}
            className="text-xs text-slate-400 hover:text-blue-400 underline transition-colors cursor-pointer"
          >
            Forgot PIN or Lockout?
          </button>
        </div>
      </div>

      {/* Forgot PIN confirmation modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-2.5 text-amber-400">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="font-bold text-base">Reset Security PIN?</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              If you forgot your PIN, resetting will wipe the local lock and sign you out for your protection. You can log back in with Google securely.
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setShowForgotModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReset}
                className="px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-xl cursor-pointer shadow-xs"
              >
                Reset & Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
