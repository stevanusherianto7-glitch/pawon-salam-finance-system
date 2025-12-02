import React from 'react';
import { Trophy, Star } from 'lucide-react';
import { LEVEL_THRESHOLDS, LevelTier } from '../../types';

interface Props {
    currentPoints: number;
    level: number;
    totalEarnedPoints: number;
}

export const GamificationProgressBar: React.FC<Props> = ({
    currentPoints,
    level,
    totalEarnedPoints
}) => {
    // Find current level data
    const currentLevelData = LEVEL_THRESHOLDS.find(l => l.level === level) || LEVEL_THRESHOLDS[0];

    // Find next level
    const nextLevel = LEVEL_THRESHOLDS.find(l => l.level === level + 1);
    const nextLevelPoints = nextLevel?.minPoints || currentLevelData.minPoints;

    // Calculate progress within current level
    const pointsInCurrentLevel = currentPoints - currentLevelData.minPoints;
    const pointsNeededForNextLevel = nextLevel ? nextLevelPoints - currentLevelData.minPoints : 1;
    const progress = nextLevel ? (pointsInCurrentLevel / pointsNeededForNextLevel) * 100 : 100;

    return (
        <div className="glass-card p-4">
            {/* Level Badge */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div
                        className="p-3 rounded-xl border-2"
                        style={{
                            backgroundColor: `${currentLevelData.color}20`,
                            borderColor: currentLevelData.color
                        }}
                    >
                        <Trophy size={24} style={{ color: currentLevelData.color }} strokeWidth={2.5} />
                    </div>
                    <div>
                        <p className="font-bold text-sm text-gray-800">{currentLevelData.title}</p>
                        <p className="text-xs text-gray-500">Level {level}</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="font-bold text-2xl text-orange-600">{currentPoints}</p>
                    <p className="text-xs text-gray-500">poin</p>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-orange-500 to-pink-500 transition-all duration-500"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                />
            </div>

            {nextLevel ? (
                <p className="text-xs text-gray-500 mt-2">
                    {nextLevelPoints - currentPoints} poin lagi ke <span className="font-bold">Level {level + 1} ({nextLevel.title})</span>
                </p>
            ) : (
                <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                    <Star size={12} className="fill-current" />
                    <span className="font-bold">Level Maksimal!</span>
                </p>
            )}

            {/* Stats Footer */}
            <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
                <div>
                    <p className="text-xs text-gray-500">Total Earned</p>
                    <p className="font-bold text-sm">{totalEarnedPoints} poin</p>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 bg-orange-50 rounded-lg border border-orange-200">
                    <Star size={14} className="text-orange-500" />
                    <span className="text-xs font-bold text-orange-600">+{currentPoints} bulan ini</span>
                </div>
            </div>
        </div>
    );
};
