
import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  variant?: 'light' | 'dark' | 'color'; // light=putih, dark=hitam, color=orange
  showText?: boolean; // Opsi mau nampilin teks "Pawon Salam" atau ikon saja
}

export const Logo: React.FC<LogoProps> = ({ 
  className = '', 
  size = 'md', 
  variant = 'light',
  showText = true 
}) => {
  
  // 1. Konfigurasi Ukuran Ikon (Disesuaikan untuk Mobile)
  const sizeClasses = {
    xs: 'w-5 h-5',
    sm: 'w-7 h-7',
    md: 'w-10 h-10',   // Standar header
    lg: 'w-14 h-14',   // Login screen size (was w-16 h-16)
    xl: 'w-24 h-24',
    '2xl': 'w-32 h-32',
  };

  // 2. Konfigurasi Ukuran Teks (Disesuaikan untuk Mobile)
  const textSizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-xl',
    lg: 'text-2xl',    // Login screen size (was text-3xl)
    xl: 'text-4xl',
    '2xl': 'text-5xl',
  };

  // 3. Konfigurasi Warna
  const getColorClass = () => {
    switch (variant) {
      case 'light': return 'text-white';
      case 'dark': return 'text-gray-900';
      case 'color': return 'text-orange-600'; // Warna Brand
      default: return 'text-white';
    }
  };

  const colorClass = getColorClass();
  // Sub-text color logic
  const subTextColorClass = variant === 'light' ? 'text-orange-100 opacity-90' : 'text-orange-600 opacity-90';

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      
      {/* --- BAGIAN IKON (SVG VEKTOR) --- */}
      {/* Langsung SVG tanpa border/background container */}
      <div className={`${sizeClasses[size]} ${colorClass} drop-shadow-md relative flex items-center justify-center transition-transform hover:scale-105 duration-300`}>
        <svg 
          viewBox="0 0 100 100" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className="w-full h-full"
        >
          {/* Lingkaran Luar */}
          <circle cx="50" cy="50" r="45" />
          
          {/* Daun Diagonal */}
          <path d="M28 72 Q 28 28 72 28 Q 72 72 28 72 Z" />
          
          {/* Tulang Daun (Garis Tengah) */}
          <line x1="28" y1="72" x2="72" y2="28" />

          {/* Tangkai Daun (Menempel ke Lingkaran) */}
          <line x1="28" y1="72" x2="19" y2="81" />
        </svg>
      </div>

      {/* --- BAGIAN TEKS (OPSIONAL) --- */}
      {showText && (
        <div className={`text-center mt-2 ${colorClass}`}>
          <h1 
            className={`font-bold tracking-wide leading-none drop-shadow-sm ${textSizeClasses[size]}`}
            style={{ fontFamily: '"Times New Roman", Times, serif' }} 
          >
            Pawon Salam
          </h1>
          {size !== 'xs' && size !== 'sm' && (
            <div className="flex flex-col items-center mt-1">
                <div className={`h-px w-8 my-0.5 ${variant === 'light' ? 'bg-white/40' : 'bg-gray-300'}`}></div>
                <p className={`text-[10px] tracking-[0.25em] uppercase font-medium ${subTextColorClass}`}>
                Resto & Catering
                </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
