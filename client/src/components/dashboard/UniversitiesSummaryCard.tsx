import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { University } from '../../types';
import { Building2, ChevronRight } from 'lucide-react';
import { Badge } from '../common/Badge';
import { Skeleton } from '../common/Skeleton';

interface UniversitiesSummaryCardProps {
  universities: University[];
  isLoading?: boolean;
}

export const UniversitiesSummaryCard: React.FC<UniversitiesSummaryCardProps> = ({
  universities,
  isLoading = false,
}) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-border rounded-2xl p-5 shadow-sm flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-dark-border">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-5 bg-brand-primary rounded-full" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Universities</h3>
        </div>
        <Link
          to="/universities"
          className="text-xs font-semibold text-brand-primary hover:text-brand-700 dark:hover:text-brand-400 flex items-center gap-1"
        >
          <span>View All</span>
          <span>→</span>
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-x-auto mt-2">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 dark:border-dark-border/60 text-[11px] font-bold text-slate-400 dark:text-dark-muted uppercase tracking-wider">
              <th className="py-2.5 px-2">University</th>
              <th className="py-2.5 px-2">Type</th>
              <th className="py-2.5 px-2">Environment</th>
              <th className="py-2.5 px-2">Status</th>
              <th className="py-2.5 px-2 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-dark-border/40">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={5} className="py-3 px-2">
                    <Skeleton className="h-5 w-full" />
                  </td>
                </tr>
              ))
            ) : universities.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-6 text-center text-slate-400">
                  No universities found.
                </td>
              </tr>
            ) : (
              universities.slice(0, 5).map((uni) => (
                <tr
                  key={uni._id}
                  onClick={() => navigate(`/universities/${uni._id}`)}
                  className="hover:bg-slate-50 dark:hover:bg-dark-card/50 cursor-pointer transition-colors group"
                >
                  <td className="py-2.5 px-2 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white group-hover:text-brand-primary transition-colors">
                      <Building2 className="w-3.5 h-3.5 text-brand-primary" />
                      <span>{uni.code}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-2 whitespace-nowrap text-slate-600 dark:text-slate-300 text-[11px]">
                    {uni.type === 'STANDALONE' ? 'Standalone' : 'Multi-Tenant'}
                  </td>
                  <td className="py-2.5 px-2 whitespace-nowrap">
                    <Badge variant={uni.primaryEnvironment.toLowerCase() as any} size="xs">
                      {uni.primaryEnvironment === 'PRODUCTION' ? 'Production' : uni.primaryEnvironment === 'STAGING' ? 'Staging' : 'Dev'}
                    </Badge>
                  </td>
                  <td className="py-2.5 px-2 whitespace-nowrap">
                    <Badge variant="live" size="xs">
                      Live
                    </Badge>
                  </td>
                  <td className="py-2.5 px-2 text-right">
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-brand-primary group-hover:translate-x-0.5 transition-all inline-block" />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
