import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ConfirmationDialog } from '@/components/shared/confirmation-dialog';
import { reportService } from '@/services/report.service';
import { useNotification } from '@/hooks/use-notification';
import { REPORT_TYPE_LABELS } from '@/types/report';
import type { ReportTemplate, ReportHistory } from '@/types/report';
import { Clock, Heart, Trash2, Star } from 'lucide-react';

interface Props {
  onLoadTemplate: (template: ReportTemplate) => void;
  currentFilters: Record<string, string | undefined>;
  currentType?: string;
}

export function SavedReportsPanel({ onLoadTemplate, currentFilters, currentType }: Props) {
  const { notify } = useNotification();
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [history, setHistory] = useState<ReportHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveName, setSaveName] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<ReportTemplate | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [t, h] = await Promise.all([
        reportService.getTemplates(),
        reportService.getHistory(),
      ]);
      setTemplates(t);
      setHistory(h);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async () => {
    if (!saveName.trim() || !currentType) return;
    try {
      await reportService.createTemplate({
        name: saveName.trim(),
        report_type: currentType as any,
        filters: currentFilters as any,
      });
      notify.success('Template saved');
      setSaveName('');
      fetchData();
    } catch (err) {
      notify.error(err instanceof Error ? err.message : 'Failed to save');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await reportService.deleteTemplate(deleteTarget.id);
      notify.success('Template deleted');
      setDeleteTarget(null);
      fetchData();
    } catch (err) {
      notify.error(err instanceof Error ? err.message : 'Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleFavorite = async (template: ReportTemplate) => {
    try {
      await reportService.updateTemplate(template.id, { is_favorite: !template.is_favorite });
      fetchData();
    } catch {
      notify.error('Failed to update');
    }
  };

  return (
    <div className="space-y-6">
      {currentType && (
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="text-sm font-medium text-white mb-3">Save Current Report</h3>
          <div className="flex gap-2">
            <Input
              placeholder="Template name..."
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              className="flex-1"
            />
            <Button size="sm" onClick={handleSave} disabled={!saveName.trim()}>
              Save
            </Button>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
          <Star className="h-4 w-4 text-amber-400" />
          Saved Templates
        </h3>
        {loading ? (
          <p className="text-sm text-secondary-500">Loading...</p>
        ) : templates.length === 0 ? (
          <p className="text-sm text-secondary-500">No saved templates</p>
        ) : (
          <div className="space-y-2">
            {templates.map((t) => (
              <div key={t.id} className="flex items-center justify-between rounded-lg bg-surface-light p-2.5">
                <button onClick={() => onLoadTemplate(t)} className="flex-1 text-left min-w-0">
                  <p className="text-sm text-white truncate">{t.name}</p>
                  <p className="text-xs text-secondary-400">{REPORT_TYPE_LABELS[t.report_type]}</p>
                </button>
                <div className="flex items-center gap-1 shrink-0 ml-2">
                  <button onClick={() => handleToggleFavorite(t)} className="p-1 rounded hover:bg-surface transition-colors">
                    <Heart className={`h-3.5 w-3.5 ${t.is_favorite ? 'text-red-400 fill-red-400' : 'text-secondary-500'}`} />
                  </button>
                  <button onClick={() => setDeleteTarget(t)} className="p-1 rounded hover:bg-surface transition-colors">
                    <Trash2 className="h-3.5 w-3.5 text-secondary-500 hover:text-red-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
          <Clock className="h-4 w-4 text-blue-400" />
          Recent Reports
        </h3>
        {loading ? (
          <p className="text-sm text-secondary-500">Loading...</p>
        ) : history.length === 0 ? (
          <p className="text-sm text-secondary-500">No report history</p>
        ) : (
          <div className="space-y-1.5">
            {history.slice(0, 10).map((h) => (
              <div key={h.id} className="flex items-center justify-between py-1.5">
                <p className="text-sm text-secondary-300">{REPORT_TYPE_LABELS[h.report_type] || h.report_type}</p>
                <p className="text-xs text-secondary-500">{new Date(h.created_at).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmationDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
        title="Delete Template"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        loading={deleting}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
