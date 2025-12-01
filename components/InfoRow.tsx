
import React from 'react';

interface InfoRowProps {
  icon: React.ElementType;
  label: string;
  value: string;
  isEditing?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  isProtected?: boolean;
  error?: string;
  type?: 'text' | 'tel' | 'email';
}

export const InfoRow: React.FC<InfoRowProps> = ({
  icon: Icon,
  label,
  value,
  isEditing,
  onChange,
  placeholder,
  isProtected = false,
  error,
  type = 'text',
}) => {
  const isEditable = isEditing && !isProtected;

  return (
    <div className="relative">
      <div className="flex items-center gap-2 text-xs text-white/60 mb-1.5 px-1">
        <Icon size={14} />
        <label className="font-bold uppercase tracking-wider">{label}</label>
      </div>
      <div
        className={`relative w-full flex items-center bg-black/20 rounded-xl border transition-all duration-300
                    ${isEditable && error ? 'border-red-500/50' : 'border-white/10'}
                    ${isEditable ? 'focus-within:border-orange-400/50 focus-within:bg-black/30' : ''}`}
      >
        <input
          type={type}
          value={value}
          onChange={onChange}
          disabled={!isEditable}
          placeholder={placeholder}
          className={`w-full px-4 py-3 bg-transparent font-bold outline-none transition-colors duration-300
                      ${isEditable ? 'text-white placeholder-white/40' : 'text-white/80 cursor-default'}`}
        />
      </div>
      {isEditable && error && (
        <p className="text-xs text-red-400 mt-1.5 ml-1 animate-shake">{error}</p>
      )}
    </div>
  );
};
