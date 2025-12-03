import React from 'react';
import { Skeleton } from './Skeleton';

export const CardSkeleton: React.FC = () => {
    return (
        <div className="glass rounded-2xl p-6 space-y-4">
            {/* Icon skeleton */}
            <div className="flex items-center gap-4">
                <Skeleton width="w-12" height="h-12" rounded="xl" />
                <div className="flex-1 space-y-2">
                    <Skeleton width="w-24" height="h-4" />
                    <Skeleton width="w-32" height="h-3" />
                </div>
            </div>

            {/* Content skeleton */}
            <div className="space-y-2">
                <Skeleton width="w-full" height="h-3" />
                <Skeleton width="w-5/6" height="h-3" />
            </div>
        </div>
    );
};

export const DashboardCardSkeleton: React.FC = () => {
    return (
        <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
                <Skeleton width="w-32" height="h-6" />
                <Skeleton width="w-10" height="h-10" rounded="lg" />
            </div>
            <Skeleton width="w-20" height="h-8" className="mb-2" />
            <Skeleton width="w-24" height="h-4" />
        </div>
    );
};
