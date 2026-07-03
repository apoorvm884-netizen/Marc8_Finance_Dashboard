import * as XLSX from 'xlsx';
import { reportsService } from './report.service';
import type { ReportType, ReportFilters } from '../types/report';

export class ExportService {
  async exportCSV(reportType: ReportType, filters: ReportFilters = {}): Promise<{ data: string; filename: string }> {
    const report = await reportsService.generateReport(reportType, filters);
    const headers = report.columns.map(c => c.label);
    const rows = report.rows.map(row => headers.map(h => {
      const key = report.columns.find(c => c.label === h)?.key || '';
      const val = row[key];
      if (val === null || val === undefined) return '';
      return String(val);
    }));
    const csvContent = [headers.join(','), ...rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))].join('\n');
    const filename = `${report.report_type.replace(/_/g, '-')}-${Date.now()}.csv`;
    return { data: csvContent, filename };
  }

  async exportExcel(reportType: ReportType, filters: ReportFilters = {}): Promise<{ data: Buffer; filename: string }> {
    const report = await reportsService.generateReport(reportType, filters);
    const wb = XLSX.utils.book_new();

    const summaryData = [['Report:', report.report_name], ['Generated:', report.generated_at], ['Type:', report.report_type], []];
    if (report.summary) {
      summaryData.push(['Summary']);
      for (const [key, value] of Object.entries(report.summary)) {
        summaryData.push([key.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()), String(value ?? '')]);
      }
      summaryData.push([]);
    }

    summaryData.push(report.columns.map(c => c.label));
    for (const row of report.rows) {
      summaryData.push(report.columns.map(c => String(row[c.key] ?? '')));
    }

    const ws = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, ws, 'Report');

    if (report.charts) {
      const chartData = [['Chart Data']];
      for (const chart of report.charts) {
        chartData.push([]);
        chartData.push([chart.title]);
        chartData.push(['Label', ...chart.datasets.map(d => d.label)]);
        for (let i = 0; i < chart.labels.length; i++) {
          chartData.push([chart.labels[i], ...chart.datasets.map(d => String(d.data[i] ?? ''))]);
        }
      }
      const chartWs = XLSX.utils.aoa_to_sheet(chartData);
      XLSX.utils.book_append_sheet(wb, chartWs, 'Charts');
    }

    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    const filename = `${report.report_type.replace(/_/g, '-')}-${Date.now()}.xlsx`;
    return { data: buf, filename };
  }
}

export const exportService = new ExportService();
