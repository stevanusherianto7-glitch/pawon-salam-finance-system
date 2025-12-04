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

  // 1. Konfigurasi Ukuran Ikon
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
    '2xl': 'w-32 h-32',
  };

  // 2. Konfigurasi Ukuran Teks
  const textSizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-3xl',
    '2xl': 'text-4xl',
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
  // Menggunakan opacity class dari Tailwind untuk sub-text
  const subTextColorClass = variant === 'light' ? 'text-orange-50 opacity-80' : 'text-orange-600 opacity-80';

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>

      {/* --- BAGIAN IKON (SVG VEKTOR) --- */}
      <div className={`${sizeClasses[size]} ${colorClass} drop-shadow-sm relative flex items-center justify-center transition-transform hover:scale-105 duration-300 aspect-square`}>
        <svg
          width="100"
          height="100"
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid meet"
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-full h-full object-contain"
          style={{ maxWidth: '100%', maxHeight: '100%' }}
        >
          {/* Lingkaran Luar */}
          <circle cx="50" cy="50" r="44" />

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
            className={`font-bold tracking-tight drop-shadow-sm ${textSizeClasses[size]}`}
            style={{ fontFamily: '"Times New Roman", Times, serif' }}
          >
            Pawon Salam
          </h1>
          {size !== 'xs' && size !== 'sm' && (
            <p className={`text-[10px] tracking-widest uppercase font-medium ${subTextColorClass}`}>
              Resto & Catering
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Logo;
