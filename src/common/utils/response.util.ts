import { Response } from 'express';

interface ResponsePayload<T> {
  status?: number;
  message: string;
  data?: T | null;
  metadata?: any;
}

export function create_response<T>(
  res: Response,
  { status, message, data = null, metadata = {} }: ResponsePayload<T>,
) {
  const finalStatus = status || res.statusCode || 200; // Default to response status or 200

  return res.status(finalStatus).json({
    status: finalStatus,
    message,
    data,
    metadata,
  });
}
