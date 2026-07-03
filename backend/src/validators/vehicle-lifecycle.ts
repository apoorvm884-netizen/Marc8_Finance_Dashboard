import { z } from 'zod';

export const vehicleIdParamsSchema = z.object({
  id: z.string().uuid('Invalid vehicle ID'),
});

export const timelineEventIdParamsSchema = z.object({
  id: z.string().uuid('Invalid event ID'),
});

export const createTimelineEventSchema = z.object({
  event_type: z.string().min(1, 'Event type is required').max(100),
  event_date: z.string().min(1, 'Event date is required'),
  title: z.string().min(1, 'Title is required').max(500),
  description: z.string().max(5000).optional().nullable(),
  reference_type: z.string().max(50).optional().nullable(),
  reference_id: z.string().uuid().optional().nullable(),
  metadata: z.record(z.unknown()).optional().nullable(),
});
