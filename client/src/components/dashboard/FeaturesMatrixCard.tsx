import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FeatureMatrixData } from '../../types';
import { Check, X } from 'lucide-react';
import { Skeleton } from '../common/Skeleton';

interface FeaturesMatrixCardProps {
  matrix: FeatureMatrixData;
  isLoading?: boolean;
}

export const FeaturesMatrixCard: React.FC<FeaturesMatrixCardProps> = ({ matrix, isLoading = false }) => {
  const navigate = useNavigate();

  const universities = matrix?.universities || [];
  const features = matrix?.features || [];

  return (
    <div className="bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-border rounded-2xl p-5 shadow-sm flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-dark-border">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-5 bg-brand-primary rounded-full" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Features by University</h3>
        </div>
        <Link
          to="/features"
          className="text-xs font-semibold text-brand-primary hover:text-brand-700 dark:hover:text-brand-400 flex items-center gap-1"
        >
          <span>View All</span>
          <span>→</span>
        </Link>
      </div>

      {/* Dynamic Matrix Table */}
      <div className="overflow-x-auto mt-2">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 dark:border-dark-border/60 text-[11px] font-bold text-slate-400 dark:text-dark-muted uppercase tracking-wider">
              <th className="py-2.5 px-2">Feature</th>
              {universities.map((u) => (
                <th key={u.code} className="py-2.5 px-2 text-center">
                  {u.code}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-dark-border/40">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={6} className="py-3 px-2">
                    <Skeleton className="h-5 w-full" />
                  </td>
                </tr>
              ))
            ) : features.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-6 text-center text-slate-400">
                  No feature matrix data available.
                </td>
              </tr>
            ) : (
              features.map((f) => (
                <tr
                  key={f.featureId}
                  onClick={() => navigate(`/features/${f.featureId}`)}
                  className="hover:bg-slate-50 dark:hover:bg-dark-card/50 cursor-pointer transition-colors group"
                >
                  {/* Feature Name */}
                  <td className="py-2.5 px-2 font-medium text-slate-800 dark:text-slate-200 group-hover:text-brand-primary transition-colors whitespace-nowrap">
                    {f.featureName}
                  </td>

                  {/* University Checkmarks */}
                  {universities.map((u) => {
                    const isLive = f.universities[u.code];
                    return (
                      <td key={u.code} className="py-2.5 px-2 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center">
                          {isLive ? (
                            <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </div>
                          ) : (
                            <div className="w-4 h-4 rounded-full bg-rose-500/20 text-rose-500 flex items-center justify-center">
                              <X className="w-2.5 h-2.5 stroke-[3]" />
                            </div>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
