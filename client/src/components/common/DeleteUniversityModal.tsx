import React, { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Badge } from './Badge';
import { University } from '../../types';
import { universitiesApi } from '../../api/endpoints';
import { useNotification } from '../../context/NotificationContext';
import { AlertTriangle, Trash2, PowerOff, ShieldAlert, CheckCircle2 } from 'lucide-react';

export interface DeleteUniversityModalProps {
  isOpen: boolean;
  onClose: () => void;
  university: University | null;
  onDeleted: () => void;
}

export const DeleteUniversityModal: React.FC<DeleteUniversityModalProps> = ({
  isOpen,
  onClose,
  university,
  onDeleted,
}) => {
  const [deleteMode, setDeleteMode] = useState<'deactivate' | 'cascade'>('deactivate');
  const [confirmCode, setConfirmCode] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const { showToast } = useNotification();

  if (!university) return null;

  const isCascade = deleteMode === 'cascade';
  const isCodeConfirmed = !isCascade || confirmCode.trim().toUpperCase() === university.code.toUpperCase();

  const handleDelete = async () => {
    if (!isCodeConfirmed) {
      showToast({
        type: 'error',
        title: 'Confirmation Mismatch',
        message: `Please type "${university.code}" to confirm permanent deletion.`,
      });
      return;
    }

    setIsDeleting(true);
    try {
      if (deleteMode === 'deactivate') {
        const res = await universitiesApi.delete(university._id, false);
        if (res.success) {
          showToast({
            type: 'warning',
            title: 'University Deactivated',
            message: `${university.code} status set to INACTIVE. Historical records preserved.`,
          });
          onDeleted();
          onClose();
        }
      } else {
        const res = await universitiesApi.delete(university._id, true);
        if (res.success) {
          showToast({
            type: 'success',
            title: 'University Deleted',
            message: `${university.name} (${university.code}) and associated data removed.`,
          });
          onDeleted();
          onClose();
        }
      }
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Action Failed',
        message: err.message || 'Failed to delete university.',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const resetAndClose = () => {
    setConfirmCode('');
    setDeleteMode('deactivate');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={resetAndClose}
      title="Delete / Manage University"
      description="Select how you want to handle removing or deactivating this institution."
      maxWidth="lg"
    >
      <div className="space-y-5">
        {/* University Info Card */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-dark-card border border-slate-200 dark:border-dark-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-primary/10 text-brand-primary font-bold text-sm flex items-center justify-center">
              {university.code.substring(0, 4)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                  {university.code}
                </span>
                <Badge variant={university.type === 'STANDALONE' ? 'standalone' : 'multitenant'} size="xs">
                  {university.type === 'STANDALONE' ? 'Standalone' : 'Multi-Tenant'}
                </Badge>
                <Badge variant={university.status === 'ACTIVE' ? 'live' : 'failed'} size="xs">
                  {university.status}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-dark-muted mt-0.5 font-medium">
                {university.name}
              </p>
            </div>
          </div>
          <Badge variant={university.primaryEnvironment.toLowerCase() as any} size="xs">
            {university.primaryEnvironment}
          </Badge>
        </div>

        {/* Deletion Options */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Choose Action
          </label>

          <div className="grid grid-cols-1 gap-2.5">
            {/* Option 1: Deactivate */}
            <div
              onClick={() => setDeleteMode('deactivate')}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                deleteMode === 'deactivate'
                  ? 'border-amber-500 bg-amber-500/5 dark:bg-amber-500/10'
                  : 'border-slate-200 dark:border-dark-border hover:border-slate-300 dark:hover:border-dark-hover'
              }`}
            >
              <div className="mt-0.5">
                <PowerOff
                  className={`w-5 h-5 ${
                    deleteMode === 'deactivate' ? 'text-amber-500' : 'text-slate-400'
                  }`}
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Deactivate University (Soft Delete - Recommended)
                  </span>
                  {deleteMode === 'deactivate' && (
                    <CheckCircle2 className="w-4 h-4 text-amber-500" />
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-dark-muted mt-1 leading-relaxed">
                  Marks university as <strong>INACTIVE</strong>. It will be hidden from active release forms,
                  while preserving all release logs, bug tickets, sanity tests, and audit trail.
                </p>
              </div>
            </div>

            {/* Option 2: Permanent Purge */}
            <div
              onClick={() => setDeleteMode('cascade')}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                deleteMode === 'cascade'
                  ? 'border-rose-500 bg-rose-500/5 dark:bg-rose-500/10'
                  : 'border-slate-200 dark:border-dark-border hover:border-slate-300 dark:hover:border-dark-hover'
              }`}
            >
              <div className="mt-0.5">
                <Trash2
                  className={`w-5 h-5 ${
                    deleteMode === 'cascade' ? 'text-rose-500' : 'text-slate-400'
                  }`}
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Permanently Delete All Data (Force Purge)
                  </span>
                  {deleteMode === 'cascade' && (
                    <CheckCircle2 className="w-4 h-4 text-rose-500" />
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-dark-muted mt-1 leading-relaxed">
                  Irreversibly removes this university along with all linked releases, sanity reports, bug tickets,
                  and lead verifications.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Permanent Delete Confirmation Input */}
        {isCascade && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 space-y-2">
            <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 text-xs font-bold">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>Warning: This action cannot be undone!</span>
            </div>
            <p className="text-[11px] text-rose-600/90 dark:text-rose-300/80">
              Type the university code <span className="font-mono font-bold">{university.code}</span> below to confirm permanent deletion:
            </p>
            <input
              type="text"
              value={confirmCode}
              onChange={(e) => setConfirmCode(e.target.value)}
              placeholder={`Type "${university.code}"`}
              className="w-full px-3 py-1.5 text-xs bg-white dark:bg-dark-card border border-rose-300 dark:border-rose-800 rounded-lg text-slate-900 dark:text-white font-mono uppercase focus:ring-2 focus:ring-rose-500/40 focus:outline-none"
            />
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-dark-border">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={resetAndClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            size="sm"
            isLoading={isDeleting}
            disabled={!isCodeConfirmed}
            onClick={handleDelete}
            leftIcon={isCascade ? <Trash2 className="w-3.5 h-3.5" /> : <PowerOff className="w-3.5 h-3.5" />}
          >
            {isCascade ? 'Delete Permanently' : 'Deactivate University'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
