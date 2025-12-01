import React, { useState } from 'react';
import { colors } from '../../theme/colors';
import { performanceApi } from '../../services/api';
import { ArrowLeft, Users, FileText, Save } from 'lucide-react';

interface Props {
  onBack: () => void;
}

export const HRSpCoachingFormScreen: React.FC<Props> = ({ onBack }) => {
  const [spType, setSpType] = useState('SP1');
  const [spDesc, setSpDesc] = useState('');
  const [spEmpName, setSpEmpName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSaveSP = async () => {
    if (!spEmpName || !spDesc) {
      alert("Mohon lengkapi nama karyawan dan keterangan.");
      return;
    }
    setIsSubmitting(true);
    await performanceApi.saveHRRecord({ type: spType, desc: spDesc, empName: spEmpName });
    setIsSubmitting(false);
    alert('Catatan HR Tersimpan');
    setSpEmpName('');
    setSpDesc('');
    onBack();
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm px-4 py-4">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div className="flex-1">
            <h2 className="font-bold text-gray-800 text-lg leading-tight">Input SP / Coaching</h2>
            <p className="text-xs text-gray-500 font-medium mt-0.5">Catat pelanggaran atau sesi coaching</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">Nama Karyawan</label>
              <div className="relative">
                <Users size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari nama karyawan..."
                  className="w-full p-3 pl-10 border rounded-xl text-sm bg-gray-50 outline-none focus:border-orange-500 transition-colors"
                  value={spEmpName}
                  onChange={(e) => setSpEmpName(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">Jenis Catatan</label>
              <div className="relative">
                 <FileText size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
                <select
                  className="w-full p-3 pl-10 border rounded-xl text-sm bg-gray-50 outline-none focus:border-orange-500 appearance-none"
                  value={spType}
                  onChange={(e) => setSpType(e.target.value)}
                >
                  <option value="SP1">Surat Peringatan 1</option>
                  <option value="SP2">Surat Peringatan 2</option>
                  <option value="SP3">Surat Peringatan 3</option>
                  <option value="COACHING">Coaching / Counseling</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">Keterangan Pelanggaran / Hasil Coaching</label>
              <textarea
                rows={6}
                placeholder="Jelaskan secara detail..."
                className="w-full p-3 border rounded-xl text-sm bg-gray-50 outline-none focus:border-orange-500 resize-none"
                value={spDesc}
                onChange={(e) => setSpDesc(e.target.value)}
              />
            </div>
            
            <div className="pt-2">
                <button
                onClick={handleSaveSP}
                disabled={isSubmitting}
                className="w-full py-3.5 bg-red-500 text-white font-bold rounded-xl shadow-lg shadow-red-500/30 active:scale-95 transition-transform flex items-center justify-center gap-2 disabled:opacity-70"
                >
                {isSubmitting ? (
                    'Menyimpan...'
                ) : (
                    <>
                    <Save size={16} /> Simpan Catatan
                    </>
                )}
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
