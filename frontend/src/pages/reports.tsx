import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { PageHeader } from '@/components/shared/page-header';
import { ReportTypeSelector } from '@/components/reports/report-type-selector';
import { ReportFiltersBar } from '@/components/reports/report-filters';
import { ReportPreview } from '@/components/reports/report-preview';
import { SavedReportsPanel } from '@/components/reports/saved-reports-panel';
import { reportService } from '@/services/report.service';
import { useNotification } from '@/hooks/use-notification';
import type { ReportType, ReportFilters, ReportResult, ReportTemplate } from '@/types/report';
import { FileText, PanelRightClose, PanelRightOpen } from 'lucide-react';

export default function ReportsPage() {
  const { notify } = useNotification();
  const [selectedType, setSelectedType] = useState<ReportType | null>(null);
  const [filters, setFilters] = useState<ReportFilters>({});
  const [report, setReport] = useState<ReportResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);

  const handleGenerate = useCallback(async () => {
    if (!selectedType) {
      notify.error('Select a report type');
      return;
    }
    setLoading(true);
    try {
      const result = await reportService.generateReport(selectedType, filters);
      setReport(result);
    } catch (err) {
      notify.error(err instanceof Error ? err.message : 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  }, [selectedType, filters, notify]);

  const handleExportCSV = useCallback(async () => {
    if (!selectedType) return;
    try {
      const blob = await reportService.exportCSV(selectedType, filters);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedType}_${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      notify.success('CSV exported');
    } catch (err) {
      notify.error(err instanceof Error ? err.message : 'Export failed');
    }
  }, [selectedType, filters, notify]);

  const handleExportExcel = useCallback(async () => {
    if (!selectedType) return;
    try {
      const blob = await reportService.exportExcel(selectedType, filters);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedType}_${Date.now()}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
      notify.success('Excel exported');
    } catch (err) {
      notify.error(err instanceof Error ? err.message : 'Export failed');
    }
  }, [selectedType, filters, notify]);

  const handleLoadTemplate = useCallback((template: ReportTemplate) => {
    setSelectedType(template.report_type);
    setFilters(template.filters);
  }, []);

  return (
    <div className="page-container flex h-full flex-col">
      <PageHeader
        title="Financial Reports"
        description="Generate and export comprehensive financial reports"
        actions={
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm text-secondary-400 hover:text-white transition-colors"
          >
            {showSidebar ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
            {showSidebar ? 'Hide Templates' : 'Templates'}
          </button>
        }
      />

      <div className="flex flex-1 gap-6 overflow-hidden">
        <div className="flex-1 min-w-0 space-y-6 overflow-y-auto">
          <ReportTypeSelector
            selected={selectedType}
            onSelect={(type) => { setSelectedType(type); setReport(null); }}
          />

          {selectedType && (
            <>
              <ReportFiltersBar
                filters={filters}
                onChange={setFilters}
                onGenerate={handleGenerate}
                onExportCSV={handleExportCSV}
                onExportExcel={handleExportExcel}
                loading={loading}
                showExport={!!report}
              />
              <ReportPreview report={report} loading={loading} />
            </>
          )}

          {!selectedType && (
            <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-border">
              <div className="text-center">
                <FileText className="mx-auto h-12 w-12 text-secondary-600" />
                <p className="mt-3 text-sm text-secondary-400">Select a report type above to get started</p>
              </div>
            </div>
          )}
        </div>

        {showSidebar && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="hidden lg:block border-l border-border pl-4 overflow-y-auto shrink-0"
            style={{ width: 320 }}
          >
            <SavedReportsPanel
              onLoadTemplate={handleLoadTemplate}
              currentFilters={filters as Record<string, string | undefined>}
              currentType={selectedType ?? undefined}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
}
