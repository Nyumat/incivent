import { NextFunction, Request, Response } from "express";

export const loggerMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const startTime = Date.now();
  res.on("finish", () => {
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    const method = req.method;
    const url = req.originalUrl;
    const status = res.statusCode;
    const host = req.hostname;
    const clientIp = req.ip;

    let statusColor: string;
    if (status >= 200 && status < 300) {
      statusColor = "\x1b[32m";
    } else if (status >= 300 && status < 400) {
      statusColor = "\x1b[36m";
    } else if (status >= 400 && status < 500) {
      statusColor = "\x1b[33m";
    } else {
      statusColor = "\x1b[31m";
    }

    console.log(
      `${method} ${url} ${statusColor}${status}\x1b[0m - ${responseTime}ms - Host: ${host} - Client IP: ${clientIp}`
    );
  });
  next();
};