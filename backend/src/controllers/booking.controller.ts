import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { bookingService } from '../services/booking.service';
import { sendSuccess, sendPaginated } from '../utils/response';

export class BookingController {
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const booking = await bookingService.create(req.body, req.user?.userId);
      sendSuccess(res, booking, 'Booking created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async findAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const query = req.query as Record<string, string | undefined>;
      const result = await bookingService.findAll(query);
      sendPaginated(res, result.data, result.meta, 'Bookings retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async findById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const booking = await bookingService.findById(id);
      sendSuccess(res, booking, 'Booking retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const booking = await bookingService.update(id, req.body, req.user?.userId);
      sendSuccess(res, booking, 'Booking updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      await bookingService.delete(id, req.user?.userId);
      sendSuccess(res, null, 'Booking deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async restore(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const booking = await bookingService.restore(id, req.user?.userId);
      sendSuccess(res, booking, 'Booking restored successfully');
    } catch (error) {
      next(error);
    }
  }

  async duplicate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const booking = await bookingService.duplicate(id, req.user?.userId);
      sendSuccess(res, booking, 'Booking duplicated successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async getDashboardMetrics(_req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const metrics = await bookingService.getDashboardMetrics();
      sendSuccess(res, metrics, 'Dashboard metrics retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const bookingController = new BookingController();
