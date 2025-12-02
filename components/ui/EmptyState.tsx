import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description?: string;
    actionLabel?: string;
    onAction?: () => void;
    className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    icon: Icon,
    title,
    description,
    actionLabel,
    onAction,
    className = '',
}) => {
    return (
        <div className={`flex flex-col items-center justify-center py-12 px-4 ${className}`}>
            <div className="glass-card rounded-3xl p-8 max-w-sm w-full text-center">
                {/* Icon */}
                <div className="mb-4 flex justify-center">
                    <div className="p-4 bg-orange-500/10 rounded-2xl border border-orange-500/20">
                        <Icon size={48} className="text-orange-500" strokeWidth={1.5} />
                    </div>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                    {title}
                </h3>

                {/* Description */}
                {description && (
                    <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                        {description}
                    </p>
                )}

                {/* Action Button */}
                {actionLabel && onAction && (
                    <button
                        onClick={onAction}
                        className="w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 active:scale-95 transition-all flex items-center justify-center gap-2 text-sm"
                    >
                        {actionLabel}
                    </button>
                )}
            </div>
        </div>
    );
};
