import React from 'react';

type SkeletonVariant = 'card' | 'list' | 'table' | 'text';

interface SkeletonLoaderProps {
    variant?: SkeletonVariant;
    count?: number;
    className?: string;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
    variant = 'card',
    count = 3,
    className = '',
}) => {
    const items = Array.from({ length: count }, (_, i) => i);

    const SkeletonCard = () => (
        <div className="glass-button rounded-2xl p-4 animate-pulse">
            <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-gray-300/50 rounded-xl"></div>
                <div className="flex-1">
                    <div className="h-4 bg-gray-300/50 rounded-lg w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-300/50 rounded-lg w-1/2"></div>
                </div>
            </div>
            <div className="space-y-2">
                <div className="h-3 bg-gray-300/50 rounded-lg w-full"></div>
                <div className="h-3 bg-gray-300/50 rounded-lg w-5/6"></div>
            </div>
        </div>
    );

    const SkeletonList = () => (
        <div className="glass-button rounded-xl p-3 animate-pulse">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-300/50 rounded-full"></div>
                <div className="flex-1">
                    <div className="h-3 bg-gray-300/50 rounded-lg w-2/3 mb-2"></div>
                    <div className="h-2 bg-gray-300/50 rounded-lg w-1/2"></div>
                </div>
                <div className="w-8 h-8 bg-gray-300/50 rounded-lg"></div>
            </div>
        </div>
    );

    const SkeletonTable = () => (
        <div className="glass-button rounded-xl overflow-hidden animate-pulse">
            <div className="grid grid-cols-4 gap-3 p-3 bg-gray-100/50">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-3 bg-gray-300/50 rounded-lg"></div>
                ))}
            </div>
            <div className="p-3 space-y-2">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="grid grid-cols-4 gap-3">
                        {[1, 2, 3, 4].map((j) => (
                            <div key={j} className="h-3 bg-gray-300/50 rounded-lg"></div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );

    const SkeletonText = () => (
        <div className="space-y-2 animate-pulse">
            <div className="h-3 bg-gray-300/50 rounded-lg w-full"></div>
            <div className="h-3 bg-gray-300/50 rounded-lg w-5/6"></div>
            <div className="h-3 bg-gray-300/50 rounded-lg w-4/6"></div>
        </div>
    );

    const renderSkeleton = () => {
        switch (variant) {
            case 'card':
                return <SkeletonCard />;
            case 'list':
                return <SkeletonList />;
            case 'table':
                return <SkeletonTable />;
            case 'text':
                return <SkeletonText />;
            default:
                return <SkeletonCard />;
        }
    };

    if (variant === 'table') {
        return (
            <div className={className}>
                <SkeletonTable />
            </div>
        );
    }

    return (
        <div className={`space-y-3 ${className}`}>
            {items.map((i) => (
                <div key={i}>
                    {renderSkeleton()}
                </div>
            ))}
        </div>
    );
};
