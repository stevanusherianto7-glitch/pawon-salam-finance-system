import React, { useEffect, useState } from 'react';
import { ArrowLeft, Save, ToggleLeft, ToggleRight, Settings, RefreshCw } from 'lucide-react';
import { colors } from '../../theme/colors';
import { adminApi } from '../../services/api';
import { SystemSetting } from '../../types';

interface Props {
  onBack: () => void;
}

export const SystemSettingsScreen: React.FC<Props> = ({ onBack }) => {
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    setLoading(true);
    const res = await adminApi.getSystemSettings();
    if (res.success && res.data) {
      setSettings(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleToggle = async (key: string, currentValue: any) => {
    const newValue = !currentValue;
    // Optimistic update
    setSettings(prev => prev.map(s => s.key === key ? { ...s, value: newValue } : s));
    
    const res = await adminApi.updateSystemSetting(key, newValue);
    if (!res.success) {
        // Revert on fail
        setSettings(prev => prev.map(s => s.key === key ? { ...s, value: currentValue } : s));
        alert('Failed to update setting');
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      {/* Header */}
      <div className="pt-12 pb-12 px-6 rounded-b-[3rem] shadow-md relative z-0 overflow-hidden" style={{ background: colors.gradientMain }}>
          {/* Watermark */}
          <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/food.png")' }}></div>
          
          <div className="flex items-center gap-3 text-white mb-4 relative z-10">
              <button onClick={onBack} className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors backdrop-blur-sm">
                  <ArrowLeft size={20} />
              </button>
              <div className="flex items-center gap-2">
                  <Settings size={20} className="text-white/80"/>
                  <h2 className="text-xl font-bold">System Settings</h2>
              </div>
          </div>
          <p className="text-white/90 text-sm px-1 relative z-10">Konfigurasi Global Aplikasi</p>
      </div>

      <div className="px-4 -mt-8 relative z-10 space-y-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                 <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <Settings size={16} className="text-gray-400" /> General Config
                 </h3>
                 <button onClick={fetchSettings} className="p-1 text-gray-400 hover:text-orange-500"><RefreshCw size={14}/></button>
              </div>

              {loading ? (
                  <div className="text-center py-8 text-gray-400">Memuat pengaturan...</div>
              ) : (
                  <div className="space-y-4">
                      {settings.map((setting) => (
                          <div key={setting.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                              <div className="pr-4">
                                  <p className="text-sm font-bold text-gray-800">{setting.label}</p>
                                  <p className="text-xs text-gray-500 leading-tight mt-0.5">{setting.description}</p>
                              </div>
                              
                              {typeof setting.value === 'boolean' ? (
                                  <button 
                                    onClick={() => handleToggle(setting.key, setting.value)}
                                    className={`transition-colors ${setting.value ? 'text-green-500' : 'text-gray-300'}`}
                                  >
                                      {setting.value ? <ToggleRight size={32} fill="currentColor" className="text-green-100"/> : <ToggleLeft size={32} />}
                                  </button>
                              ) : (
                                  <div className="bg-white px-2 py-1 rounded border text-xs font-mono">
                                      {String(setting.value)}
                                  </div>
                              )}
                          </div>
                      ))}
                  </div>
              )}
          </div>

          <div className="bg-red-50 p-4 rounded-xl border border-red-100 text-center">
              <p className="text-xs font-bold text-red-600 uppercase mb-1">Danger Zone</p>
              <p className="text-[10px] text-red-500 mb-3">Tindakan di bawah ini tidak dapat dibatalkan.</p>
              <button className="w-full py-2 bg-white border border-red-200 text-red-600 font-bold text-xs rounded-lg hover:bg-red-50">
                  Reset All Data (Mock)
              </button>
          </div>
      </div>
    </div>
  );
};