import React from 'react';
import clsx from 'clsx';

interface SkeletonProps {
  className?: string;
  count?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = 'h-4 w-full', count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={clsx(
            'animate-pulse bg-slate-200 dark:bg-dark-card/80 rounded-md',
            className
          )}
        />
      ))}
    </>
  );
};
