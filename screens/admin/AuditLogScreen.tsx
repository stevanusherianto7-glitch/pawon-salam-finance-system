import React, { useEffect, useState } from 'react';
import { ArrowLeft, Shield, User, Clock, Search, Activity } from 'lucide-react';
import { colors } from '../../theme/colors';
import { adminApi } from '../../services/api';
import { AuditLog } from '../../types';

interface Props {
  onBack: () => void;
}

export const AuditLogScreen: React.FC<Props> = ({ onBack }) => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadLogs = async () => {
        setLoading(true);
        const res = await adminApi.getAuditLogs();
        if (res.success && res.data) {
            setLogs(res.data);
        }
        setLoading(false);
    };
    loadLogs();
  }, []);

  const filteredLogs = logs.filter(log => 
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.performedBy.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                  <Shield size={20} className="text-white/80"/>
                  <h2 className="text-xl font-bold">Audit Logs</h2>
              </div>
          </div>
          
          <div className="relative z-10">
              <Search size={16} className="absolute left-3 top-3 text-white/60" />
              <input 
                type="text" 
                placeholder="Cari log aktivitas..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 text-sm outline-none focus:bg-white/20 transition-colors"
              />
          </div>
      </div>

      <div className="px-4 -mt-6 relative z-10 space-y-3">
          {loading ? (
              <div className="text-center py-10 text-gray-400">Memuat log...</div>
          ) : filteredLogs.length === 0 ? (
              <div className="text-center py-10 text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
                  <Activity size={32} className="mx-auto mb-2 opacity-20"/>
                  <p>Tidak ada aktivitas ditemukan.</p>
              </div>
          ) : (
              filteredLogs.map((log) => (
                  <div key={log.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                      <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-bold border border-gray-200">
                                  {log.action}
                              </span>
                              {log.impersonatingUser && (
                                  <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[10px] font-bold border border-indigo-100">
                                      Impersonation
                                  </span>
                              )}
                          </div>
                          <span className="text-[10px] text-gray-400 flex items-center gap-1">
                              <Clock size={10}/> {new Date(log.timestamp).toLocaleString('id-ID')}
                          </span>
                      </div>
                      
                      <p className="text-sm text-gray-800 font-medium leading-snug mb-2">
                          {log.details}
                      </p>

                      <div className="flex items-center gap-2 pt-2 border-t border-gray-50">
                          <User size={12} className="text-gray-400"/>
                          <p className="text-xs text-gray-500">
                              Actor: <span className="font-bold text-gray-700">{log.performedBy}</span>
                              {log.impersonatingUser && (
                                  <> as <span className="text-indigo-600 font-bold">{log.targetEntity}</span></>
                              )}
                          </p>
                      </div>
                  </div>
              ))
          )}
      </div>
    </div>
  );
};