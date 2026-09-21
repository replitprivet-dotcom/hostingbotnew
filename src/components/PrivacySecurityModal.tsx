import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Eye, 
  EyeOff, 
  X, 
  Check, 
  KeyRound, 
  Trash2, 
  ShieldAlert, 
  Sparkles, 
  CheckCircle2,
  HardDrive,
  RefreshCw,
  Zap,
  Globe
} from 'lucide-react';
import { 
  getPrivacyMode, 
  setPrivacyMode, 
  getSecurityPin, 
  setSecurityPin, 
  removeSecurityPin,
  getBlurMediaPref,
  setBlurMediaPref,
  maskEmail
} from '../utils/privacy';
import { DriveUser } from '../types';

interface PrivacySecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: DriveUser;
  isPrivacyMode: boolean;
  onTogglePrivacyMode: (enabled: boolean) => void;
  onLockAppNow: () => void;
  onPurgeSession: () => void;
}

export const PrivacySecurityModal: React.FC<PrivacySecurityModalProps> = ({
  isOpen,
  onClose,
  user,
  isPrivacyMode,
  onTogglePrivacyMode,
  onLockAppNow,
  onPurgeSession,
}) => {
  const [blurMedia, setBlurMedia] = useState(getBlurMediaPref());
  const [currentPin, setCurrentPin] = useState(getSecurityPin());
  const [newPinInput, setNewPinInput] = useState('');
  const [showPinInput, setShowPinInput] = useState(false);
  const [pinSuccessMsg, setPinSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleToggleBlur = (checked: boolean) => {
    setBlurMedia(checked);
    setBlurMediaPref(checked);
  };

  const handleSavePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPinInput.length === 4 && /^\d{4}$/.test(newPinInput)) {
      setSecurityPin(newPinInput);
      setCurrentPin(newPinInput);
      setNewPinInput('');
      setShowPinInput(false);
      setPinSuccessMsg('Security PIN enabled!');
      setTimeout(() => setPinSuccessMsg(''), 2500);
    }
  };

  const handleRemovePin = () => {
    removeSecurityPin();
    setCurrentPin(null);
    setPinSuccessMsg('PIN removed');
    setTimeout(() => setPinSuccessMsg(''), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs text-slate-800 select-none animate-in fade-in duration-150">
      <div 
        className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-2xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 tracking-tight">Privacy & Security Vault</h3>
              <p className="text-[11px] text-slate-500 font-medium">Manage screen disguise, locks & encryption</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Master Stealth Privacy Mode Switch */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50/60 to-indigo-50/40 border border-blue-100/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                {isPrivacyMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </div>
              <div>
                <div className="font-bold text-sm text-slate-900">Stealth Privacy Mode</div>
                <div className="text-[11px] text-slate-500">Hide account identity & sensitive info on screen</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isPrivacyMode}
                onChange={(e) => onTogglePrivacyMode(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0b57d0]"></div>
            </label>
          </div>

          <div className="text-xs text-slate-600 space-y-1.5 pt-1 pl-1">
            <div className="flex items-center gap-2 text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>
                Account Email: <strong className="font-mono text-slate-800">{isPrivacyMode ? maskEmail(user.email, true) : user.email}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Masked API keys and hidden personal identifiers</span>
            </div>
          </div>
        </div>

        {/* 2. Media Thumbnail Blur / Anti-Shoulder Surfing */}
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <span>Anti-Peeking Thumbnail Blur</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Blurs photos & videos in file browser until you tap or hover them.
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={blurMedia}
              onChange={(e) => handleToggleBlur(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>
        </div>

        {/* 3. Security 4-Digit PIN Lock */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-purple-600" />
              <div>
                <span className="text-xs font-bold text-slate-900">4-Digit Security Lock</span>
                <div className="text-[11px] text-slate-500">
                  {currentPin ? 'PIN protection active' : 'No PIN configured'}
                </div>
              </div>
            </div>

            {currentPin ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={onLockAppNow}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Lock className="w-3 h-3" />
                  <span>Lock Now</span>
                </button>
                <button
                  onClick={handleRemovePin}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Remove PIN"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowPinInput(!showPinInput)}
                className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#0b57d0] text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Set PIN
              </button>
            )}
          </div>

          {showPinInput && (
            <form onSubmit={handleSavePin} className="pt-2 flex items-center gap-2">
              <input
                type="password"
                maxLength={4}
                value={newPinInput}
                onChange={(e) => setNewPinInput(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 4 digits"
                className="w-32 px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={newPinInput.length !== 4}
                className="px-4 py-2 bg-[#0b57d0] hover:bg-blue-700 text-white rounded-xl text-xs font-semibold disabled:opacity-50 cursor-pointer"
              >
                Enable
              </button>
            </form>
          )}

          {pinSuccessMsg && (
            <div className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              <span>{pinSuccessMsg}</span>
            </div>
          )}
        </div>

        {/* 4. Privacy & Zero-Tracking Guarantee */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-600 space-y-2">
          <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
            Zero-Telemetry Guarantee
          </div>
          <div className="space-y-1.5 text-[11px]">
            <div className="flex items-start gap-2">
              <Zap className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
              <span><strong>Direct Google APIs:</strong> Your files never pass through intermediate servers or third-party databases.</span>
            </div>
            <div className="flex items-start gap-2">
              <Globe className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Zero Analytics / No Tracking:</strong> No Facebook Pixel, Google Tag Manager, or telemetry trackers installed.</span>
            </div>
          </div>
        </div>

        {/* 5. Wipe Session */}
        <div className="pt-2 flex items-center justify-between border-t border-slate-100">
          <button
            onClick={onPurgeSession}
            className="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Wipe Local Session & Cache</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
