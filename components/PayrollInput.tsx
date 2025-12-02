import React from 'react';

interface PayrollInputProps {
  label: string;
  id: string;
  name: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: 'text' | 'number';
  placeholder?: string;
  isCurrency?: boolean;
  inputMode?: 'numeric' | 'tel' | 'text';
  error?: string;
  maxLength?: number;
}

const PayrollInput: React.FC<PayrollInputProps> = ({
  label,
  id,
  name,
  value,
  onChange,
  type = 'text',
  placeholder = '',
  isCurrency = false,
  inputMode,
  error,
  maxLength,
}) => {
  return (
    <div className="flex flex-col">
      <label htmlFor={id} className="mb-1 text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="relative">
        {isCurrency && (
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 text-sm">
            Rp
          </span>
        )}
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          inputMode={inputMode}
          maxLength={maxLength}
          className={`w-full px-3 py-1.5 text-sm border rounded-md shadow-sm focus:outline-none focus:ring-2 transition-colors ${error
              ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
              : 'border-gray-300 focus:ring-orange-500 focus:border-orange-500'
            } ${isCurrency ? 'pl-9' : ''}`}
        />
      </div>
      {error && (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      )}
    </div>
  );
};

export default PayrollInput;
