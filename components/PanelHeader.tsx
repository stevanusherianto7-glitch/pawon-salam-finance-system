import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { colors } from '../theme/colors';

interface PanelHeaderProps {
    title: string;
    icon: any;
    onBack: () => void;
}

export const PanelHeader: React.FC<PanelHeaderProps> = ({ title, icon: Icon, onBack }) => (
    <div className="pt-10 pb-8 px-4 rounded-b-[2rem] shadow-sm relative z-0 mb-4 overflow-hidden" style={{ background: colors.gradientMain }}>
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/food.png")' }}></div>
        <div className="flex items-center gap-3 text-white relative z-10">
            <button onClick={onBack} className="p-1.5 bg-white/20 rounded-full hover:bg-white/30 transition-colors backdrop-blur-sm">
                <ArrowLeft size={18} />
            </button>
            <div className="flex items-center gap-2">
                <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                    <Icon size={16} />
                </div>
                <h2 className="text-base font-bold">{title}</h2>
            </div>
        </div>
    </div>
);
