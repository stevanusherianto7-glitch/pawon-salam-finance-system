import React, { useState, useEffect } from 'react';

interface Period {
  month: number; // 1-12
  year: number;
}

interface PeriodFilterProps {
  onPeriodChange: (period: Period) => void;
}

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

// Tahun awal aplikasi dimulai
const START_YEAR = 2021;

export const PeriodFilter: React.FC<PeriodFilterProps> = ({ onPeriodChange }) => {
  // Inisialisasi state dengan tanggal hari ini secara langsung (best practice)
  const [selectedMonth, setSelectedMonth] = useState<number>(() => new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(() => new Date().getFullYear());

  // Generate opsi tahun secara dinamis
  // Dari START_YEAR sampai tahun sekarang + 1 (untuk perencanaan ke depan)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from(
    { length: (currentYear + 1) - START_YEAR + 1 },
    (_, i) => START_YEAR + i
  ).reverse(); // Urutkan dari tahun terbaru

  // Kirim perubahan ke parent component setiap kali state berubah
  useEffect(() => {
    onPeriodChange({
      month: selectedMonth,
      year: selectedYear,
    });
  }, [selectedMonth, selectedYear, onPeriodChange]);
  
  return (
    <div className="flex gap-2">
      <select
        value={selectedMonth}
        onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
        className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-200 transition"
        aria-label="Pilih Bulan"
      >
        {MONTH_NAMES.map((name, index) => (
          <option key={index} value={index + 1}>
            {name}
          </option>
        ))}
      </select>
      <select
        value={selectedYear}
        onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
        className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-200 transition"
        aria-label="Pilih Tahun"
      >
        {yearOptions.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
    </div>
  );
};
