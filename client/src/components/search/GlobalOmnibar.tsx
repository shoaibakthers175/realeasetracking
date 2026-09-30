import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Rocket, Building2, Bug, Layers, Users, ArrowRight, X, Loader2 } from 'lucide-react';
import { searchApi } from '../../api/endpoints';
import { Badge } from '../common/Badge';

interface GlobalOmnibarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalOmnibar: React.FC<GlobalOmnibarProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{
    universities: any[];
    features: any[];
    releases: any[];
    bugs: any[];
    leads: any[];
    total: number;
  }>({ universities: [], features: [], releases: [], bugs: [], leads: [], total: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      setQuery('');
      setResults({ universities: [], features: [], releases: [], bugs: [], leads: [], total: 0 });
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setResults({ universities: [], features: [], releases: [], bugs: [], leads: [], total: 0 });
      setIsLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await searchApi.globalSearch(query.trim());
        if (res.success && res.data) {
          setResults(res.data);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (url: string) => {
    onClose();
    navigate(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 pb-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Omnibar Box */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-2xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-150">
        {/* Search Input */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-dark-border bg-slate-50/50 dark:bg-dark-card/50">
          <Search className="w-5 h-5 text-slate-400 mr-3 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search universities, releases, features, bug tickets, test leads..."
            className="w-full bg-transparent border-none text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-dark-muted text-sm sm:text-base focus:outline-none"
          />
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin text-brand-primary mr-2" />
          ) : query ? (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-white mr-1"
            >
              <X className="w-4 h-4" />
            </button>
          ) : null}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[11px] font-semibold text-slate-400 bg-slate-100 dark:bg-dark-border rounded border border-slate-300 dark:border-dark-border">
            ESC
          </kbd>
        </div>

        {/* Results Container */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {query.trim().length >= 2 && results.total === 0 && !isLoading && (
            <div className="text-center py-8 text-slate-500 dark:text-dark-muted text-sm">
              No results found for <span className="font-semibold text-slate-800 dark:text-white">"{query}"</span>
            </div>
          )}

          {query.trim().length < 2 && (
            <div className="text-xs text-slate-400 dark:text-dark-muted px-2 py-4 text-center">
              Type at least 2 characters to search across releases, tickets, universities, and leads.
            </div>
          )}

          {/* Releases */}
          {results.releases.length > 0 && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-dark-muted px-2 mb-1.5 flex items-center gap-1.5">
                <Rocket className="w-3.5 h-3.5 text-brand-primary" /> Live Releases ({results.releases.length})
              </div>
              <div className="space-y-1">
                {results.releases.map((rel) => (
                  <div
                    key={rel._id}
                    onClick={() => handleSelect(`/releases/${rel._id}`)}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-dark-card cursor-pointer group transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-2 h-2 rounded-full bg-brand-primary flex-shrink-0" />
                      <div className="truncate">
                        <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-brand-primary transition-colors truncate">
                          {rel.title}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-dark-muted flex items-center gap-2 mt-0.5">
                          <span>{rel.university?.code || 'University'}</span>
                          <span>•</span>
                          <span>{new Date(rel.releaseDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge variant={rel.releaseType.toLowerCase() as any} size="xs">
                        {rel.releaseType}
                      </Badge>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand-primary transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bugs */}
          {results.bugs.length > 0 && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-dark-muted px-2 mb-1.5 flex items-center gap-1.5">
                <Bug className="w-3.5 h-3.5 text-red-500" /> Bug Tickets ({results.bugs.length})
              </div>
              <div className="space-y-1">
                {results.bugs.map((bug) => (
                  <div
                    key={bug._id}
                    onClick={() => handleSelect(`/bug-tickets`)}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-dark-card cursor-pointer group transition-colors"
                  >
                    <div>
                      <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        <span className="text-brand-primary font-mono">{bug.ticketId}</span>
                        <span className="text-slate-400">•</span>
                        <span>{bug.title}</span>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-dark-muted mt-0.5">
                        University: {bug.university?.code || 'N/A'} • Status: {bug.status}
                      </div>
                    </div>
                    <Badge variant={bug.status === 'RESOLVED' ? 'passed' : 'failed'} size="xs">
                      {bug.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Universities */}
          {results.universities.length > 0 && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-dark-muted px-2 mb-1.5 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-indigo-400" /> Universities ({results.universities.length})
              </div>
              <div className="space-y-1">
                {results.universities.map((uni) => (
                  <div
                    key={uni._id}
                    onClick={() => handleSelect(`/universities/${uni._id}`)}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-dark-card cursor-pointer group transition-colors"
                  >
                    <div>
                      <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-brand-primary">
                        {uni.code} — {uni.name}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-dark-muted mt-0.5">
                        {uni.type} • {uni.primaryEnvironment}
                      </div>
                    </div>
                    <Badge variant={uni.primaryEnvironment.toLowerCase() as any} size="xs">
                      {uni.primaryEnvironment}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Features */}
          {results.features.length > 0 && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-dark-muted px-2 mb-1.5 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-amber-500" /> Master Features ({results.features.length})
              </div>
              <div className="space-y-1">
                {results.features.map((feat) => (
                  <div
                    key={feat._id}
                    onClick={() => handleSelect(`/features/${feat._id}`)}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-dark-card cursor-pointer group transition-colors"
                  >
                    <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-brand-primary">
                      {feat.name} <span className="text-xs font-mono text-slate-400">[{feat.code}]</span>
                    </div>
                    <Badge variant="feature" size="xs">
                      {feat.category}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Leads */}
          {results.leads.length > 0 && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-dark-muted px-2 mb-1.5 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-emerald-500" /> Test Leads ({results.leads.length})
              </div>
              <div className="space-y-1">
                {results.leads.map((lead) => (
                  <div
                    key={lead._id}
                    onClick={() => handleSelect(`/leads`)}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-dark-card cursor-pointer group transition-colors"
                  >
                    <div>
                      <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 font-mono">
                        {lead.leadId} — {lead.program} ({lead.university?.code || 'Uni'})
                      </div>
                      <div className="text-xs text-slate-500 dark:text-dark-muted mt-0.5">
                        Source: {lead.source} • LSQ: {lead.lsqStatus} • Opp: {lead.opportunityStatus}
                      </div>
                    </div>
                    <Badge variant={lead.verificationStatus === 'SUCCESS' ? 'passed' : 'failed'} size="xs">
                      {lead.verificationStatus}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
