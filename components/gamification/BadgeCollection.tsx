import React from 'react';
import { Award, Lock } from 'lucide-react';
import { Badge, BadgeType } from '../types';

interface BadgeCriteria {
    type: BadgeType;
    name: string;
    icon: string;
    color: 'gold' | 'silver' | 'bronze';
    description: string;
}

const BADGE_CRITERIA: BadgeCriteria[] = [
    {
        type: 'PUNCTUAL_HERO',
        name: 'Punctual Hero',
        icon: '⏰',
        color: 'gold',
        description: '50x tepat waktu'
    },
    {
        type: 'OVERTIME_CHAMPION',
        name: 'Overtime Champion',
        icon: '💪',
        color: 'silver',
        description: '20x lembur'
    },
    {
        type: 'PERFECT_MONTH',
        name: 'Perfect Month',
        icon: '🏆',
        color: 'gold',
        description: '1 bulan full hadir'
    },
    {
        type: 'STREAK_WARRIOR',
        name: 'Streak Warrior',
        icon: '🔥',
        color: 'bronze',
        description: '30 hari beruntun'
    }
];

interface Props {
    badges: Badge[];
}

export const BadgeCollection: React.FC<Props> = ({ badges }) => {
    const getBadgeColor = (color: 'gold' | 'silver' | 'bronze') => {
        switch (color) {
            case 'gold':
                return 'from-yellow-50 to-orange-50 border-yellow-300';
            case 'silver':
                return 'from-gray-50 to-slate-100 border-gray-300';
            case 'bronze':
                return 'from-orange-50 to-amber-50 border-orange-300';
        }
    };

    return (
        <div className="glass-card p-4">
            <h3 className="font-bold mb-3 flex items-center gap-2 text-gray-800">
                <Award size={18} className="text-orange-500" />
                Badge Collection
            </h3>

            <div className="grid grid-cols-2 gap-3">
                {BADGE_CRITERIA.map(criteria => {
                    const earned = badges.find(b => b.badgeType === criteria.type);

                    return (
                        <div
                            key={criteria.type}
                            className={`p-4 rounded-xl text-center transition-all ${earned
                                    ? `bg-gradient-to-br ${getBadgeColor(criteria.color)} border-2 shadow-sm`
                                    : 'bg-gray-100 opacity-40 border border-gray-200'
                                }`}
                        >
                            <div className="text-4xl mb-2">{earned ? criteria.icon : <Lock size={32} className="mx-auto text-gray-400" />}</div>
                            <p className="text-xs font-bold text-gray-800 leading-tight">{criteria.name}</p>
                            <p className="text-[10px] text-gray-500 mt-1">{criteria.description}</p>

                            {earned && (
                                <p className="text-[9px] text-gray-400 mt-2">
                                    {new Date(earned.earnedAt).toLocaleDateString('id-ID', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric'
                                    })}
                                </p>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Progress Summary */}
            <div className="mt-4 pt-3 border-t border-gray-200">
                <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-600">Badge Progress</p>
                    <p className="text-sm font-bold">
                        <span className="text-orange-600">{badges.length}</span>
                        <span className="text-gray-400"> / {BADGE_CRITERIA.length}</span>
                    </p>
                </div>
                <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-orange-500 to-pink-500 transition-all"
                        style={{ width: `${(badges.length / BADGE_CRITERIA.length) * 100}%` }}
                    />
                </div>
            </div>
        </div>
    );
};
