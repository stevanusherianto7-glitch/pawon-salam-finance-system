import React, { useEffect, useState, useRef } from 'react';
import { useMessageStore } from '../../store/messageStore';
import { useAuthStore } from '../../store/authStore';
import { Message, MessageAudience, UserRole, Employee } from '../../types';
import { Send, MessageSquare, ArrowLeft, Users, Shield, Crown, X, Loader2 } from 'lucide-react';
import { BackgroundPattern } from '../../components/layout/BackgroundPattern';

const getAudienceInfo = (audience: MessageAudience) => {
    switch (audience) {
        case MessageAudience.ALL_STAFF:
            return { label: 'UNTUK SEMUA STAFF', icon: Users, color: 'text-blue-400' };
        case MessageAudience.ALL_MANAGERS:
            return { label: 'UNTUK SEMUA MANAJER', icon: Shield, color: 'text-purple-400' };
        case MessageAudience.BUSINESS_OWNER:
            return { label: 'UNTUK BUSINESS OWNER', icon: Crown, color: 'text-amber-400' };
        default:
            return { label: 'UMUM', icon: Users, color: 'text-gray-400' };
    }
};

// Message Card Component
const MessageCard: React.FC<{ message: Message; isUnread: boolean; onRead: () => void }> = ({ message, isUnread, onRead }) => {
    const AudienceIcon = getAudienceInfo(message.audience).icon;
    const audienceColor = getAudienceInfo(message.audience).color;

    useEffect(() => {
        if (isUnread) {
            // Mark as read after a short delay to allow user to see it
            const timer = setTimeout(() => {
                onRead();
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [isUnread, onRead]);

    return (
        <div className={`group relative bg-gradient-to-br from-black/40 to-black/10 backdrop-blur-xl border rounded-2xl p-4 transition-all duration-500 overflow-hidden ${isUnread ? 'border-orange-400/50 shadow-lg shadow-orange-500/20' : 'border-white/10 hover:border-white/20'}`}>
            {/* Ambient Glow */}
            <div className="absolute -top-16 -left-16 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl opacity-50 group-hover:opacity-70 transition-opacity duration-500"></div>

            {isUnread && <div className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-orange-400 shadow-[0_0_8px_theme(colors.orange.400)] animate-pulse"></div>}
            
            <div className="relative flex items-start gap-4">
                <img src={message.senderAvatarUrl} alt={message.senderName} className="w-10 h-10 rounded-full object-cover border-2 border-white/20 bg-gray-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="font-bold text-white text-sm truncate">{message.senderName}</p>
                            <p className="text-xs text-white/60">{message.senderRole.replace(/_/g, ' ')}</p>
                        </div>
                         <span className="text-[10px] text-white/50 flex-shrink-0 ml-2">{new Date(message.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-white/90 text-sm mt-3 leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    <div className={`flex items-center gap-1.5 mt-4 text-[10px] font-bold uppercase tracking-wider ${audienceColor}`}>
                        <AudienceIcon size={12} />
                        {getAudienceInfo(message.audience).label}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Main Screen Component
export const BroadcastScreen: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
    const { user } = useAuthStore();
    const { messages, isLoading, isSending, fetchMessages, sendMessage, markMessageAsRead } = useMessageStore();
    const [showForm, setShowForm] = useState(false);
    const [content, setContent] = useState('');
    const [audience, setAudience] = useState<MessageAudience>(MessageAudience.ALL_STAFF);
    const listRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (user) {
            fetchMessages(user.id, user.role);
        }
    }, [user]);
    
    const handleSendMessage = async () => {
        if (!user || !content.trim()) return;
        const success = await sendMessage(user, content, audience);
        if (success) {
            setContent('');
            setShowForm(false);
        }
    };

    const canSendMessage = user && [
        UserRole.BUSINESS_OWNER,
        UserRole.HR_MANAGER,
        UserRole.RESTAURANT_MANAGER,
        UserRole.SUPER_ADMIN,
    ].includes(user.role);
    
    const availableAudiences = [
        { value: MessageAudience.ALL_STAFF, label: "Semua Staff" },
        { value: MessageAudience.ALL_MANAGERS, label: "Semua Manajer" },
    ];
    if (user?.role !== UserRole.BUSINESS_OWNER) {
         availableAudiences.push({ value: MessageAudience.BUSINESS_OWNER, label: "Business Owner" });
    }

    return (
        <div className="min-h-screen w-full relative overflow-hidden font-sans">
            <BackgroundPattern />

            <div className="relative z-10 px-6 pt-10 h-screen flex flex-col">
                <div className="flex items-center gap-3 mb-4 flex-shrink-0">
                    {onBack && <button onClick={onBack} className="p-2 bg-white/10 rounded-full text-white/80 hover:bg-white/20 transition-colors"><ArrowLeft size={20} /></button>}
                    <div className="p-2 bg-white/10 rounded-xl"><MessageSquare size={20} className="text-white"/></div>
                    <h2 className="text-xl font-bold text-white">Ruang Pengumuman</h2>
                </div>

                {isLoading ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center text-white/60">
                        <Loader2 size={24} className="animate-spin" />
                        <p className="text-xs mt-2">Memuat pesan...</p>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center text-white/60">
                        <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-3 border border-white/10"><MessageSquare size={24} className="text-white/20" /></div>
                        <p className="font-medium">Tidak ada pengumuman</p>
                        <p className="text-xs">Semua pesan akan muncul di sini.</p>
                    </div>
                ) : (
                    <div ref={listRef} className="flex-1 overflow-y-auto space-y-3 pr-1 pb-32">
                        {messages.map(msg => (
                            <MessageCard 
                                key={msg.id} 
                                message={msg}
                                isUnread={user ? !msg.readBy.includes(user.id) : false}
                                onRead={() => user && markMessageAsRead(msg.id, user.id)}
                            />
                        ))}
                    </div>
                )}
                
                {canSendMessage && (
                    <div className="fixed bottom-[110px] left-6 right-6 z-20">
                        {!showForm ? (
                            <button onClick={() => setShowForm(true)} className="w-full py-3.5 bg-white/10 backdrop-blur-xl border border-white/20 text-white font-bold rounded-2xl shadow-lg shadow-black/20 flex items-center justify-center gap-2 active:scale-95 transition-all hover:bg-white/20 hover:border-white/30">
                                Tulis Pengumuman Baru
                            </button>
                        ) : (
                            <div className="bg-black/50 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 space-y-3 animate-fade-in">
                                <div className="flex justify-between items-center">
                                    <h4 className="text-sm font-bold text-white">Pesan Baru</h4>
                                    <button onClick={() => setShowForm(false)} className="p-1 rounded-full bg-white/10 hover:bg-white/20"><X size={16} className="text-white/70"/></button>
                                </div>
                                <textarea
                                    value={content}
                                    onChange={e => setContent(e.target.value)}
                                    rows={3}
                                    placeholder="Ketik pesan Anda di sini..."
                                    className="w-full bg-white/5 text-white placeholder:text-white/40 border border-white/10 rounded-lg p-2 text-sm outline-none focus:border-orange-400/50"
                                />
                                <div className="flex gap-2">
                                    <select
                                      value={audience}
                                      onChange={e => setAudience(e.target.value as MessageAudience)}
                                      className="flex-1 bg-white/5 text-white/80 border border-white/10 rounded-lg p-2 text-xs outline-none"
                                    >
                                       {availableAudiences.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                    </select>
                                    <button onClick={handleSendMessage} disabled={isSending || !content.trim()} className="px-4 py-2 bg-orange-500 text-white font-bold rounded-lg flex items-center justify-center gap-1.5 active:scale-95 transition-transform disabled:opacity-60">
                                        {isSending ? <Loader2 size={16} className="animate-spin"/> : <Send size={16}/>} Kirim
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};