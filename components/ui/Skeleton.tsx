import React from 'react';

interface SkeletonProps {
    className?: string;
    width?: string;
    height?: string;
    rounded?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export const Skeleton: React.FC<SkeletonProps> = ({
    className = '',
    width = 'w-full',
    height = 'h-4',
    rounded = 'md'
}) => {
    const roundedClass = {
        sm: 'rounded-sm',
        md: 'rounded-md',
        lg: 'rounded-lg',
        xl: 'rounded-xl',
        full: 'rounded-full'
    }[rounded];

    return (
        <div
            className={`animate-pulse bg-gray-200 ${width} ${height} ${roundedClass} ${className}`}
        />
    );
};

export const TextSkeleton: React.FC<{ lines?: number }> = ({ lines = 3 }) => {
    return (
        <div className="space-y-2">
            {Array.from({ length: lines }).map((_, i) => (
                <Skeleton
                    key={i}
                    width={i === lines - 1 ? 'w-3/4' : 'w-full'}
                    height="h-3"
                />
            ))}
        </div>
    );
};

export const CircleSkeleton: React.FC<{ size?: string }> = ({ size = 'w-12 h-12' }) => {
    return <Skeleton width={size} height={size} rounded="full" />;
};
