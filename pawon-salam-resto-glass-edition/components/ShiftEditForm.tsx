import React, { useState, useEffect } from 'react';
import { X, Clock, CheckCircle2, Calendar, Save } from 'lucide-react';
import { ShiftType, SHIFT_COLORS } from '../types';
import { getShiftTimes } from '../services/api';

interface ShiftEditFormProps {
  employeeName: string;
  date: string;
  currentShiftType: ShiftType;
  onSave: (type: ShiftType) => void;
  onCancel: () => void;
}

export const ShiftEditForm: React.FC<ShiftEditFormProps> = ({
  employeeName,
  date,
  currentShiftType,
  onSave,
  onCancel
}) => {
  const [selectedType, setSelectedType] = useState<ShiftType>(currentShiftType);
  const [times, setTimes] = useState({ start: '', end: '' });

  useEffect(() => {
    setTimes(getShiftTimes(selectedType, date));
  }, [selectedType, date]);

  const dateObj = new Date(date);
  const formattedDate = dateObj.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' });

  const options = [
    { type: ShiftType.OFF, label: 'Libur', color: SHIFT_COLORS.OFF },
    { type: ShiftType.MORNING, label: 'Pagi', color: SHIFT_COLORS.MORNING },
    { type: ShiftType.MIDDLE, label: 'Middle', color: SHIFT_COLORS.MIDDLE },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      {/* Sultan Mode: Dark Glass Modal */}
      <div className="relative bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl w-full max-w-sm shadow-2xl shadow-black/40 overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

        {/* Header */}
        <div className="px-5 py-3 flex justify-between items-center border-b border-white/10">
          <div>
            <h3 className="font-bold text-white text-base">Edit Shift</h3>
            <p className="text-[10px] text-white/60 font-medium">{employeeName}</p>
          </div>
          <button onClick={onCancel} className="p-1 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
            <X size={16} className="text-white/70" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Date Display */}
          <div className="flex items-center gap-2.5 bg-black/20 p-2.5 rounded-xl border border-white/10 text-white/90">
            <Calendar size={16} className="text-orange-300" />
            <span className="font-bold text-xs">{formattedDate}</span>
          </div>

          {/* Sultan Mode: Shift "Gem" Selector */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Tipe Shift</label>
            <div className="grid grid-cols-3 gap-2.5">
              {options.map((opt) => {
                const isSelected = selectedType === opt.type;
                return (
                  <button
                    key={opt.type}
                    onClick={() => setSelectedType(opt.type)}
                    className={`relative group p-2 rounded-xl border transition-all duration-300 ease-out h-16 flex flex-col justify-center items-center backdrop-blur-sm
                                    ${isSelected
                        ? 'shadow-2xl scale-105'
                        : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                      }`}
                    style={{
                      backgroundColor: isSelected ? `${opt.color}30` : undefined,
                      borderColor: isSelected ? `${opt.color}80` : undefined,
                    }}
                  >
                    {isSelected && <div className="absolute -inset-2 rounded-full blur-xl opacity-50" style={{ backgroundColor: opt.color }}></div>}
                    <div
                      className="w-4 h-4 rounded-full mb-1 border border-black/10"
                      style={{ backgroundColor: opt.color }}
                    ></div>
                    <span className={`text-[10px] font-bold transition-colors ${isSelected ? 'text-white' : 'text-white/70'}`}>
                      {opt.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Time Preview */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Jam Kerja</label>
            <div className="flex items-center justify-between p-3 bg-black/20 rounded-xl border border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-black/20 border border-white/10">
                  <Clock size={16} className="text-white/60" />
                </div>
                <div>
                  <p className="font-bold text-white text-base">
                    {selectedType === ShiftType.OFF ? 'LIBUR' : `${times.start} - ${times.end}`}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={() => onSave(selectedType)}
            className="w-full py-3 rounded-xl font-bold text-white shadow-lg active:scale-95 transition-transform flex justify-center items-center gap-1.5 border text-xs"
            style={{
              background: `linear-gradient(to right, ${options.find(o => o.type === selectedType)?.color}60, ${options.find(o => o.type === selectedType)?.color}90)`,
              borderColor: options.find(o => o.type === selectedType)?.color || '#9ca3af',
              boxShadow: `0 8px 25px -5px ${options.find(o => o.type === selectedType)?.color}40`
            }}
          >
            <Save size={16} /> Simpan Perubahan
          </button>
        </div>
      </div>
    </div>
  );
};
