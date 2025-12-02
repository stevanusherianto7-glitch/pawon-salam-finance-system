import React from 'react';

// --- Ikon SVG Manual (Biar ringan & gak perlu import Lucide di tiap file) ---
const Icons = {
  UtensilsCrossed: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <path d="m16 2-2.3 2.3a3 3 0 0 0 0 4.2l1.8 1.8a3 3 0 0 0 4.2 0L22 8V2L16 2zM7 2l5 5M2 8l5 5M2 22l5-5M22 22l-5-5" />
    </svg>
  ),
  ChefHat: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6ZM6 17h12" />
    </svg>
  ),
  Coffee: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <path d="M10 2v2M14 2v2M6 2v2" />
      <path d="M18 8a4 4 0 0 1 0 8H6a4 4 0 0 1 0-8h12Z" />
      <path d="M6 8v9a4 4 0 0 0 4 4h4a4 4 0 0 0 4-4V8" />
      <path d="M19 12h1a2 2 0 0 0 2-2v-1a2 2 0 0 0-2-2h-2" />
    </svg>
  ),
  Soup: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <path d="M12 21a9 9 0 0 0 9-9H3a9 9 0 0 0 9 9Z" />
      <path d="M7 21h10" />
      <path d="M12 6V3" />
      <path d="M8 6V4" />
      <path d="M16 6V4" />
    </svg>
  ),
  Utensils: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
      <path d="M7 2v20" />
      <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
    </svg>
  )
};

export const BackgroundPattern = () => {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-gradient-to-br from-orange-50 via-amber-50 to-rose-50">

      {/* --- WATERMARK MOTIF MAKANAN (Pastel/White) --- */}

      {/* 1. Pojok Kanan Atas (Besar) */}
      <div className="absolute -top-12 -right-12 w-72 h-72 text-orange-300/60 opacity-80 transform rotate-12">
        {Icons.UtensilsCrossed}
      </div>

      {/* 2. Pojok Kiri Bawah (Besar) */}
      <div className="absolute -bottom-8 -left-8 w-64 h-64 text-orange-300/60 opacity-80 transform -rotate-12">
        {Icons.ChefHat}
      </div>

      {/* 3. Kopi (Kiri Atas) */}
      <div className="absolute top-[10%] left-[8%] w-14 h-14 text-orange-400/50 opacity-70 transform -rotate-12">
        {Icons.Coffee}
      </div>

      {/* 4. Sup (Kanan Tengah) */}
      <div className="absolute top-[45%] right-[5%] w-16 h-16 text-orange-400/50 opacity-70 transform rotate-6">
        {Icons.Soup}
      </div>

      {/* 5. Garpu Sendok (Kiri Tengah) */}
      <div className="absolute bottom-[40%] left-[5%] w-20 h-20 text-orange-400/50 opacity-70 transform -rotate-45">
        {Icons.Utensils}
      </div>

      {/* 6. Pojok Kanan Bawah (Kecil) */}
      <div className="absolute bottom-[10%] right-[10%] w-16 h-16 text-orange-400/50 opacity-70 transform rotate-45">
        {Icons.UtensilsCrossed}
      </div>

      {/* --- EFEK CAHAYA/GLOW (BLUR) --- */}
      <div className="absolute top-1/4 left-1/3 w-64 h-64 bg-white rounded-full mix-blend-soft-light filter blur-3xl opacity-60"></div>
      <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-orange-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>

    </div>
  );
};

export default BackgroundPattern;