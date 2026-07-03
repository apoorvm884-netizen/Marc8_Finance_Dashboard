import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { settingsService } from '../services/settings.service';
import { sendSuccess } from '../utils/response';

export class SettingsController {
  async getAll(_req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const settings = await settingsService.getAll();
      sendSuccess(res, settings, 'Settings retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getCompany(_req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const settings = await settingsService.getCompany();
      sendSuccess(res, settings, 'Company profile retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getDashboard(_req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const settings = await settingsService.getDashboard();
      sendSuccess(res, settings, 'Dashboard settings retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getFinancial(_req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const settings = await settingsService.getFinancial();
      sendSuccess(res, settings, 'Financial settings retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getNotifications(_req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const settings = await settingsService.getNotifications();
      sendSuccess(res, settings, 'Notification settings retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getPreferences(_req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const settings = await settingsService.getPreferences();
      sendSuccess(res, settings, 'User preferences retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getSecurity(_req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const settings = await settingsService.getSecurity();
      sendSuccess(res, settings, 'Security settings retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateCompany(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const settings = await settingsService.updateCompany(req.body, req.user?.userId);
      sendSuccess(res, settings, 'Company profile updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateDashboard(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const settings = await settingsService.updateDashboard(req.body, req.user?.userId);
      sendSuccess(res, settings, 'Dashboard settings updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateFinancial(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const settings = await settingsService.updateFinancial(req.body, req.user?.userId);
      sendSuccess(res, settings, 'Financial settings updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateNotifications(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const settings = await settingsService.updateNotifications(req.body, req.user?.userId);
      sendSuccess(res, settings, 'Notification settings updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async updatePreferences(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const settings = await settingsService.updatePreferences(req.body, req.user?.userId);
      sendSuccess(res, settings, 'User preferences updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateSecurity(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const settings = await settingsService.updateSecurity(req.body, req.user?.userId);
      sendSuccess(res, settings, 'Security settings updated successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const settingsController = new SettingsController();
