
import React from 'react';
import { ChevronRight } from 'lucide-react';

interface PremiumGlassCardProps {
  title: string;
  subtitle: string;
  icon: React.ElementType;
  onClick: () => void;
  themeColor?: 'green' | 'blue' | 'orange' | 'purple' | 'red' | 'teal';
}

export const PremiumGlassCard: React.FC<PremiumGlassCardProps> = ({
  title,
  subtitle,
  icon: Icon,
  onClick,
  themeColor = 'blue',
}) => {
  const themeMap = {
    green: { glow: 'bg-emerald-400/20', iconContainer: 'shadow-emerald-500/20 text-emerald-600', hoverShadow: 'hover:shadow-emerald-500/20' },
    blue: { glow: 'bg-blue-400/20', iconContainer: 'shadow-blue-500/20 text-blue-600', hoverShadow: 'hover:shadow-blue-500/20' },
    orange: { glow: 'bg-orange-400/20', iconContainer: 'shadow-orange-500/20 text-orange-600', hoverShadow: 'hover:shadow-orange-500/20' },
    purple: { glow: 'bg-purple-400/20', iconContainer: 'shadow-purple-500/20 text-purple-600', hoverShadow: 'hover:shadow-purple-500/20' },
    red: { glow: 'bg-red-400/20', iconContainer: 'shadow-red-500/20 text-red-600', hoverShadow: 'hover:shadow-red-500/20' },
    teal: { glow: 'bg-teal-400/20', iconContainer: 'shadow-teal-500/20 text-teal-600', hoverShadow: 'hover:shadow-teal-500/20' },
  };

  const t = themeMap[themeColor];

  return (
    <button
      onClick={onClick}
      className={`group relative w-full h-40 p-4 text-left
                 flex flex-col items-start justify-between
                 bg-white/10 backdrop-blur-xl border border-white/20 
                 rounded-3xl shadow-2xl shadow-black/5
                 overflow-hidden transition-all duration-300 ease-out 
                 hover:-translate-y-2 hover:scale-[1.02] 
                 hover:border-white/40 ${t.hoverShadow}
                 cursor-pointer`}
    >
      {/* Ambient Lighting */}
      <div className={`absolute -top-10 -left-10 w-24 h-24 rounded-full blur-2xl pointer-events-none 
                       group-hover:w-32 group-hover:h-32 group-hover:bg-white/10
                       transition-all duration-500 ${t.glow}`}></div>

      {/* Pop-out Icon */}
      <div className={`bg-white rounded-2xl p-4 shadow-lg 
                       transition-all duration-300
                       group-hover:shadow-xl group-hover:scale-105
                       ${t.iconContainer}`}>
        <Icon size={28} />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full flex items-end justify-between">
        <div className="flex flex-col items-start min-w-0">
          <h4 className="text-sm font-extrabold text-gray-800 tracking-tight truncate">{title}</h4>
          <p className="text-[10px] text-gray-500 font-medium mt-0.5 truncate">{subtitle}</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-white/50 backdrop-blur-sm flex items-center justify-center 
                       border border-white/50 group-hover:bg-white group-hover:text-orange-500 
                       transition-colors shadow-sm">
          <ChevronRight size={14} className="opacity-60 group-hover:opacity-100" />
        </div>
      </div>
    </button>
  );
};
