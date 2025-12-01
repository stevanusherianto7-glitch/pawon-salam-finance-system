import React, { useEffect, useState, useRef } from 'react';
import { useMessageStore } from '../../store/messageStore';
import { useAuthStore } from '../../store/authStore';
import { useEmployeeStore } from '../../store/employeeStore';
import { Message, MessageAudience, UserRole, Employee, EmployeeArea } from '../../types';
import { Send, MessageSquare, ArrowLeft, Users, Shield, Crown, X, Loader2, Filter, Utensils, Coffee } from 'lucide-react';
import { BackgroundPattern } from '../../components/layout/BackgroundPattern';

const getAudienceInfo = (audience: MessageAudience) => {
    switch (audience) {
        case MessageAudience.ALL_STAFF:
            return { label: 'UNTUK SEMUA STAFF', icon: Users, color: 'text-blue-600' };
        case MessageAudience.ALL_MANAGERS:
            return { label: 'UNTUK SEMUA MANAJER', icon: Shield, color: 'text-purple-600' };
        case MessageAudience.BUSINESS_OWNER:
            return { label: 'UNTUK BUSINESS OWNER', icon: Crown, color: 'text-amber-600' };
        case MessageAudience.FOH_ONLY:
            return { label: 'KHUSUS STAFF FOH', icon: Coffee, color: 'text-orange-600' };
        case MessageAudience.BOH_ONLY:
            return { label: 'KHUSUS STAFF BOH', icon: Utensils, color: 'text-red-600' };
        default:
            return { label: 'UMUM', icon: Users, color: 'text-gray-500' };
    }
};

// Message Card Component - Premium Light Glass
const MessageCard: React.FC<{ message: Message; isUnread: boolean; onRead: () => void }> = ({ message, isUnread, onRead }) => {
    const AudienceIcon = getAudienceInfo(message.audience).icon;
    const audienceInfo = getAudienceInfo(message.audience);

    useEffect(() => {
        if (isUnread) {
            const timer = setTimeout(() => {
                onRead();
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [isUnread, onRead]);

    return (
        <div className={`group relative bg-white/70 backdrop-blur-xl border rounded-3xl p-4 transition-all duration-500 overflow-hidden ${isUnread ? 'border-orange-400 shadow-xl shadow-orange-500/20' : 'border-white/40 shadow-lg shadow-black/5 hover:border-white/60 hover:-translate-y-1'}`}>
            {/* Ambient Glow */}
            <div className={`absolute -top-16 -left-16 w-48 h-48 rounded-full blur-3xl opacity-40 transition-opacity duration-500 pointer-events-none ${isUnread ? 'bg-orange-500/20' : 'bg-blue-500/10 group-hover:bg-blue-500/20'}`}></div>

            {isUnread && <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_8px_theme(colors.orange.500)] animate-pulse"></div>}

            <div className="relative flex items-start gap-3">
                <img src={message.senderAvatarUrl} alt={message.senderName} className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-md flex-shrink-0" />
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="font-extrabold text-gray-800 text-xs truncate">{message.senderName}</p>
                            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">{message.senderRole.replace(/_/g, ' ')}</p>
                        </div>
                        <span className="text-[9px] text-gray-400 flex-shrink-0 ml-2 font-medium bg-white/50 px-1.5 py-0.5 rounded-lg border border-white/20">{new Date(message.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-gray-700 text-xs mt-2 leading-relaxed whitespace-pre-wrap font-medium">{message.content}</p>
                </div>
            </div>
        </div>
    );
};

// Main Screen Component
export const BroadcastScreen: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
    const { user } = useAuthStore();
    const { messages, isLoading, isSending, fetchMessages, sendMessage, markMessageAsRead } = useMessageStore();
    const { employees, fetchEmployees } = useEmployeeStore();

    const [showForm, setShowForm] = useState(false);
    const [content, setContent] = useState('');
    const [audience, setAudience] = useState<MessageAudience>(MessageAudience.ALL_STAFF);
    const [activeFilter, setActiveFilter] = useState<'ALL' | 'MANAGERS' | 'FOH' | 'BOH'>('ALL');

    // Mention State
    const [mentionQuery, setMentionQuery] = useState('');
    const [showMentionList, setShowMentionList] = useState(false);
    const [cursorPosition, setCursorPosition] = useState(0);

    const listRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (user) {
            fetchMessages(user.id, user.role);
            fetchEmployees(); // Fetch for mention list
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

    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        const position = e.target.selectionStart;
        setContent(value);
        setCursorPosition(position);

        // Check for mention trigger '@'
        const lastAtPos = value.lastIndexOf('@', position - 1);
        if (lastAtPos !== -1) {
            const query = value.substring(lastAtPos + 1, position);
            // Only show if no spaces in query (simple name search)
            if (!query.includes(' ')) {
                setMentionQuery(query);
                setShowMentionList(true);
                return;
            }
        }
        setShowMentionList(false);
    };

    const insertMention = (employeeName: string) => {
        const lastAtPos = content.lastIndexOf('@', cursorPosition - 1);
        if (lastAtPos !== -1) {
            const newContent = content.substring(0, lastAtPos) + `@${employeeName} ` + content.substring(cursorPosition);
            setContent(newContent);
            setShowMentionList(false);
            // Focus back to textarea
            if (textareaRef.current) {
                textareaRef.current.focus();
            }
        }
    };

    const filteredMessages = messages.filter(msg => {
        if (activeFilter === 'ALL') return true;
        if (activeFilter === 'MANAGERS') return msg.audience === MessageAudience.ALL_MANAGERS || msg.audience === MessageAudience.BUSINESS_OWNER;
        if (activeFilter === 'FOH') return msg.audience === MessageAudience.FOH_ONLY || (msg.audience === MessageAudience.ALL_STAFF && msg.senderArea === EmployeeArea.FOH); // Show FOH specific or General announcements from FOH
        if (activeFilter === 'BOH') return msg.audience === MessageAudience.BOH_ONLY || (msg.audience === MessageAudience.ALL_STAFF && msg.senderArea === EmployeeArea.BOH); // Show BOH specific or General announcements from BOH
        return true;
    });

    const canSendMessage = user && [
        UserRole.BUSINESS_OWNER,
        UserRole.HR_MANAGER,
        UserRole.RESTAURANT_MANAGER,
        UserRole.SUPER_ADMIN,
    ].includes(user.role);

    const availableAudiences = [
        { value: MessageAudience.ALL_STAFF, label: "Semua Staff" },
        { value: MessageAudience.FOH_ONLY, label: "Khusus Staff FOH" },
        { value: MessageAudience.BOH_ONLY, label: "Khusus Staff BOH" },
        { value: MessageAudience.ALL_MANAGERS, label: "Semua Manajer" },
    ];
    if (user?.role !== UserRole.BUSINESS_OWNER) {
        availableAudiences.push({ value: MessageAudience.BUSINESS_OWNER, label: "Business Owner" });
    }

    const mentionCandidates = employees.filter(e =>
        e.name.toLowerCase().includes(mentionQuery.toLowerCase()) && e.id !== user?.id
    ).slice(0, 5);

    return (
        <div className="min-h-screen w-full relative overflow-hidden font-sans">
            <BackgroundPattern />

            <div className="relative z-10 px-4 pt-8 h-screen flex flex-col">
                {/* Header - Glass Style */}
                <div className="flex flex-col gap-3 mb-4 flex-shrink-0 bg-white/60 backdrop-blur-md p-3 rounded-3xl border border-white/40 shadow-sm">
                    <div className="flex items-center gap-3">
                        {onBack && <button onClick={onBack} className="p-2 bg-white rounded-full text-gray-600 hover:bg-gray-100 transition-colors shadow-sm"><ArrowLeft size={18} /></button>}
                        <div className="p-1.5 bg-orange-100 rounded-xl"><MessageSquare size={18} className="text-orange-600" /></div>
                        <div>
                            <h2 className="text-base font-extrabold text-gray-800 leading-tight">Ruang Pengumuman</h2>
                            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Update & Informasi Tim</p>
                        </div>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                        <button onClick={() => setActiveFilter('ALL')} className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all whitespace-nowrap ${activeFilter === 'ALL' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' : 'bg-white/50 text-gray-600 hover:bg-white'}`}>
                            Semua
                        </button>
                        <button onClick={() => setActiveFilter('MANAGERS')} className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all whitespace-nowrap ${activeFilter === 'MANAGERS' ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30' : 'bg-white/50 text-gray-600 hover:bg-white'}`}>
                            Manajer
                        </button>
                        <button onClick={() => setActiveFilter('FOH')} className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all whitespace-nowrap ${activeFilter === 'FOH' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' : 'bg-white/50 text-gray-600 hover:bg-white'}`}>
                            Staff FOH
                        </button>
                        <button onClick={() => setActiveFilter('BOH')} className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all whitespace-nowrap ${activeFilter === 'BOH' ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' : 'bg-white/50 text-gray-600 hover:bg-white'}`}>
                            Staff BOH
                        </button>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400">
                        <Loader2 size={32} className="animate-spin text-orange-500" />
                        <p className="text-xs mt-3 font-medium">Memuat pesan...</p>
                    </div>
                ) : filteredMessages.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400">
                        <div className="w-20 h-20 rounded-full bg-white/50 flex items-center justify-center mb-4 border border-white/40 shadow-sm"><Filter size={32} className="text-gray-300" /></div>
                        <p className="font-bold text-gray-600 text-lg">Tidak ada pesan</p>
                        <p className="text-xs mt-1 max-w-[200px]">Coba ganti filter atau tunggu pengumuman baru.</p>
                    </div>
                ) : (
                    <div ref={listRef} className="flex-1 overflow-y-auto space-y-4 pr-1 pb-32 scrollbar-hide">
                        {filteredMessages.map(msg => (
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
                    <div className="fixed bottom-[100px] left-4 right-4 z-20">
                        {!showForm ? (
                            <button onClick={() => setShowForm(true)} className="w-full py-3 bg-white/80 backdrop-blur-xl border border-white/50 text-orange-600 font-extrabold rounded-2xl shadow-xl shadow-orange-500/10 flex items-center justify-center gap-2 active:scale-95 transition-all hover:bg-white hover:border-orange-200 group text-sm">
                                <div className="p-1 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors"><Send size={14} className="text-orange-600" /></div>
                                Tulis Pengumuman Baru
                            </button>
                        ) : (
                            <div className="bg-white/90 backdrop-blur-2xl border border-white/60 rounded-3xl p-4 space-y-3 animate-fade-in shadow-2xl shadow-black/10 relative">
                                <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                                    <h4 className="text-xs font-extrabold text-gray-800 flex items-center gap-2">
                                        <div className="w-1.5 h-3 bg-orange-500 rounded-full"></div>
                                        Pesan Baru
                                    </h4>
                                    <button onClick={() => setShowForm(false)} className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500"><X size={14} /></button>
                                </div>

                                <div className="relative">
                                    <textarea
                                        ref={textareaRef}
                                        value={content}
                                        onChange={handleContentChange}
                                        rows={3}
                                        placeholder="Ketik pesan... Gunakan @ untuk mention"
                                        className="w-full bg-gray-50 text-gray-800 placeholder:text-gray-400 border border-gray-200 rounded-xl p-2.5 text-xs outline-none focus:border-orange-400 focus:bg-white transition-all resize-none"
                                    />

                                    {/* Mention Dropdown */}
                                    {showMentionList && mentionCandidates.length > 0 && (
                                        <div className="absolute bottom-full left-0 w-full bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden mb-2 animate-fade-in z-50">
                                            <div className="p-2 bg-gray-50 text-[9px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">Mention User</div>
                                            {mentionCandidates.map(emp => (
                                                <button
                                                    key={emp.id}
                                                    onClick={() => insertMention(emp.name)}
                                                    className="w-full text-left px-3 py-2 hover:bg-orange-50 flex items-center gap-2 transition-colors"
                                                >
                                                    <img src={emp.avatarUrl || `https://ui-avatars.com/api/?name=${emp.name}`} className="w-5 h-5 rounded-full" />
                                                    <span className="text-xs font-medium text-gray-700">{emp.name}</span>
                                                    <span className="text-[9px] text-gray-400 ml-auto">{emp.role.replace(/_/g, ' ')}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <select
                                            value={audience}
                                            onChange={e => setAudience(e.target.value as MessageAudience)}
                                            className="w-full appearance-none bg-gray-50 text-gray-700 font-bold border border-gray-200 rounded-xl px-2.5 py-2 text-[10px] outline-none focus:border-orange-400"
                                        >
                                            {availableAudiences.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                        </select>
                                        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                            <Users size={10} />
                                        </div>
                                    </div>
                                    <button onClick={handleSendMessage} disabled={isSending || !content.trim()} className="px-5 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-60 shadow-lg shadow-orange-500/30 text-xs">
                                        {isSending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} Kirim
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