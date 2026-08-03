import { Response } from 'express';

export function sendResponse(
  res: Response,
  statusCode: number,
  success: boolean,
  message: string,
  data: any = null
) {
  res.status(statusCode).json({
    success: success,
    message: message,
    data: data
  });
}