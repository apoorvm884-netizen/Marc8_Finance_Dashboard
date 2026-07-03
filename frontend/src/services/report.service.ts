import { api } from './api-client';
import { appConfig } from '@/config';
import type { ReportType, ReportFilters, ReportResult, ReportTemplate, ReportHistory } from '@/types/report';

function getApiUrl(path: string): string {
  const base = appConfig.apiUrl.replace(/\/+$/, '');
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

export const reportService = {
  async generateReport(reportType: ReportType, filters?: ReportFilters): Promise<ReportResult> {
    return api.post<ReportResult>('/reports/generate', { report_type: reportType, filters: filters || {} });
  },

  async getReportByType(reportType: ReportType, params?: Record<string, string | undefined>): Promise<ReportResult> {
    const queryParams: Record<string, string | number | boolean | undefined> = {};
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams[key] = value;
      });
    }
    return api.get<ReportResult>(`/reports/${reportType}`, { params: queryParams });
  },

  async exportCSV(reportType: ReportType, filters?: ReportFilters): Promise<Blob> {
    const response = await fetch(getApiUrl('/reports/export/csv'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ report_type: reportType, filters: filters || {} }),
    });
    return response.blob();
  },

  async exportExcel(reportType: ReportType, filters?: ReportFilters): Promise<Blob> {
    const response = await fetch(getApiUrl('/reports/export/excel'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ report_type: reportType, filters: filters || {} }),
    });
    return response.blob();
  },

  async getTemplates(): Promise<ReportTemplate[]> {
    return api.get<ReportTemplate[]>('/reports');
  },

  async createTemplate(data: { name: string; report_type: ReportType; filters: ReportFilters; is_favorite?: boolean }): Promise<ReportTemplate> {
    return api.post<ReportTemplate>('/reports/templates', data);
  },

  async updateTemplate(id: string, data: Partial<{ name: string; filters: ReportFilters; is_favorite: boolean }>): Promise<ReportTemplate> {
    return api.put<ReportTemplate>(`/reports/templates/${id}`, data);
  },

  async deleteTemplate(id: string): Promise<void> {
    return api.delete<void>(`/reports/templates/${id}`);
  },

  async getHistory(): Promise<ReportHistory[]> {
    return api.get<ReportHistory[]>('/reports/history');
  },
};
