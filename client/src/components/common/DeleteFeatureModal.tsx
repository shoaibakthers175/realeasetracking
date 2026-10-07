import React, { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Badge } from './Badge';
import { Feature } from '../../types';
import { featuresApi } from '../../api/endpoints';
import { useNotification } from '../../context/NotificationContext';
import { PowerOff, Trash2, ShieldAlert, CheckCircle2 } from 'lucide-react';

export interface DeleteFeatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: Feature | null;
  onDeleted: () => void;
}

export const DeleteFeatureModal: React.FC<DeleteFeatureModalProps> = ({
  isOpen,
  onClose,
  feature,
  onDeleted,
}) => {
  const [deleteMode, setDeleteMode] = useState<'deactivate' | 'cascade'>('deactivate');
  const [confirmCode, setConfirmCode] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const { showToast } = useNotification();

  if (!feature) return null;

  const isCascade = deleteMode === 'cascade';
  const isCodeConfirmed = !isCascade || confirmCode.trim().toUpperCase() === feature.code.toUpperCase();

  const handleDelete = async () => {
    if (!isCodeConfirmed) {
      showToast({
        type: 'error',
        title: 'Confirmation Mismatch',
        message: `Please type "${feature.code}" to confirm permanent deletion.`,
      });
      return;
    }

    setIsDeleting(true);
    try {
      if (deleteMode === 'deactivate') {
        const res = await featuresApi.delete(feature._id, false);
        if (res.success) {
          showToast({
            type: 'warning',
            title: 'Feature Deactivated',
            message: `${feature.name} (${feature.code}) status set to INACTIVE.`,
          });
          onDeleted();
          onClose();
        }
      } else {
        const res = await featuresApi.delete(feature._id, true);
        if (res.success) {
          showToast({
            type: 'success',
            title: 'Feature Deleted',
            message: `${feature.name} (${feature.code}) permanently removed.`,
          });
          onDeleted();
          onClose();
        }
      }
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Action Failed',
        message: err.message || 'Failed to delete feature.',
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
      title="Delete / Manage Feature"
      description="Select how you want to handle removing or deactivating this master feature."
      maxWidth="lg"
    >
      <div className="space-y-5">
        {/* Feature Info Card */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-dark-card border border-slate-200 dark:border-dark-border flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                {feature.name}
              </span>
              <Badge variant="feature" size="xs">
                {feature.category}
              </Badge>
              <span className="font-mono text-xs text-slate-400">[{feature.code}]</span>
            </div>
            {feature.description && (
              <p className="text-xs text-slate-500 dark:text-dark-muted mt-1 font-medium line-clamp-1">
                {feature.description}
              </p>
            )}
          </div>
          <Badge variant={feature.isActive ? 'live' : 'failed'} size="xs">
            {feature.isActive ? 'ACTIVE' : 'INACTIVE'}
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
                    Deactivate Feature (Soft Delete - Recommended)
                  </span>
                  {deleteMode === 'deactivate' && (
                    <CheckCircle2 className="w-4 h-4 text-amber-500" />
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-dark-muted mt-1 leading-relaxed">
                  Marks feature as <strong>INACTIVE</strong>. It will be hidden from new release pickers,
                  while preserving all historical release logs and availability records.
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
                  Irreversibly removes this master feature along with all associated releases and linked test records.
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
              Type the feature code <span className="font-mono font-bold">{feature.code}</span> below to confirm permanent deletion:
            </p>
            <input
              type="text"
              value={confirmCode}
              onChange={(e) => setConfirmCode(e.target.value)}
              placeholder={`Type "${feature.code}"`}
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
            {isCascade ? 'Delete Permanently' : 'Deactivate Feature'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
