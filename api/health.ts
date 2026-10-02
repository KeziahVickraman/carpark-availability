import type { Request, Response } from 'express';

export interface HealthResponse {
  status: 'ok' | 'degraded';
  timestamp: string;
  uptimeSeconds: number;
  service: string;
  ltaKeyConfigured: boolean;
  endpoints: {
    carparkAvailability: string;
    health: string;
  };
}

/**
 * Serverless / Express health check endpoint.
 * GET /api/health
 */
export default async function handler(req: Request | any, res: Response | any) {
  const ltaKey = process.env.LTA_ACCOUNT_KEY || req.headers?.['accountkey'];
  const isLtaKeyConfigured = Boolean(ltaKey && ltaKey.trim().length > 0);

  const payload: HealthResponse = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    service: 'ParkSG LTA DataMall Connector',
    ltaKeyConfigured: isLtaKeyConfigured,
    endpoints: {
      carparkAvailability: '/api/carparkavailability',
      health: '/api/health',
    },
  };

  if (typeof res.status === 'function') {
    return res.status(200).json(payload);
  } else if (typeof res.setHeader === 'function') {
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    return res.end(JSON.stringify(payload));
  }
}
