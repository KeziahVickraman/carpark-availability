import type { Request, Response } from 'express';

const LTA_CARPARK_ENDPOINT =
  'https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2';

export interface LTARawCarparkItem {
  CarParkID: string;
  Area: string;
  Development: string;
  Location: string; // Format: "1.2935 103.8572"
  AvailableLots: number;
  LotType: 'C' | 'H' | 'Y' | string; // C: Car, H: Heavy, Y: Motorcycle
  Agency: 'HDB' | 'LTA' | 'URA' | string;
}

export interface LTACarparkResponse {
  'odata.metadata'?: string;
  value: LTARawCarparkItem[];
}

export interface NormalizedCarparkItem {
  carparkId: string;
  development: string;
  area: string;
  agency: string;
  lotType: string;
  availableLots: number;
  coordinates: {
    lat: number | null;
    lng: number | null;
  };
}

/**
 * Serverless / Express handler for LTA CarParkAvailabilityv2.
 * GET /api/carparkavailabilty
 */
export default async function handler(req: Request | any, res: Response | any) {
  // Support CORS if called directly from another client
  if (typeof res.setHeader === 'function') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'AccountKey, Content-Type');
  }

  if (req.method === 'OPTIONS') {
    if (typeof res.status === 'function') return res.status(204).end();
    res.statusCode = 204;
    return res.end();
  }

  // 1. Resolve AccountKey: environment variable takes precedence, followed by incoming header / query
  const ltaAccountKey =
    process.env.LTA_ACCOUNT_KEY?.trim() ||
    req.headers?.['accountkey']?.toString().trim() ||
    req.headers?.['x-account-key']?.toString().trim() ||
    req.query?.accountKey?.toString().trim() ||
    '';

  // 2. If no key is configured, return an actionable message (do not crash)
  if (!ltaAccountKey) {
    const errorPayload = {
      status: 'unconfigured',
      error: 'Missing LTA DataMall AccountKey',
      message:
        'Please set the LTA_ACCOUNT_KEY environment variable in your server environment or provide the AccountKey header to access live LTA DataMall data.',
      endpoint: LTA_CARPARK_ENDPOINT,
      docsUrl: 'https://datamall.lta.gov.sg/content/datamall/en/request-for-api.html',
    };

    if (typeof res.status === 'function') {
      return res.status(503).json(errorPayload);
    } else {
      res.statusCode = 503;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify(errorPayload));
    }
  }

  // 3. Construct LTA Request URL with optional OData $skip parameter
  const skip = req.query?.$skip || req.query?.skip;
  let targetUrl = LTA_CARPARK_ENDPOINT;
  if (skip) {
    targetUrl += `?$skip=${encodeURIComponent(String(skip))}`;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const ltaResponse = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        AccountKey: ltaAccountKey,
        accept: 'application/json',
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!ltaResponse.ok) {
      const errText = await ltaResponse.text();
      const status = ltaResponse.status;
      const errorMsg =
        status === 401 || status === 403
          ? 'Invalid LTA DataMall AccountKey or unauthorized request.'
          : `LTA DataMall upstream returned error HTTP ${status}: ${errText.slice(0, 150)}`;

      const errPayload = {
        status: 'error',
        statusCode: status,
        error: errorMsg,
      };

      if (typeof res.status === 'function') {
        return res.status(status).json(errPayload);
      } else {
        res.statusCode = status;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify(errPayload));
      }
    }

    const data: LTACarparkResponse = await ltaResponse.json();
    const rawItems = data?.value || [];

    // 4. Parse & Normalize for convenient client consumption
    const normalized: NormalizedCarparkItem[] = rawItems.map((item) => {
      let lat: number | null = null;
      let lng: number | null = null;
      if (item.Location && typeof item.Location === 'string') {
        const parts = item.Location.trim().split(/\s+/);
        if (parts.length >= 2) {
          const parsedLat = parseFloat(parts[0]);
          const parsedLng = parseFloat(parts[1]);
          if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
            lat = parsedLat;
            lng = parsedLng;
          }
        }
      }

      return {
        carparkId: item.CarParkID,
        development: item.Development,
        area: item.Area,
        agency: item.Agency,
        lotType: item.LotType,
        availableLots: Number(item.AvailableLots) || 0,
        coordinates: { lat, lng },
      };
    });

    // Compute summary statistics
    const totalAvailableLots = normalized.reduce(
      (acc, curr) => acc + curr.availableLots,
      0
    );

    const responsePayload = {
      status: 'success',
      timestamp: new Date().toISOString(),
      count: normalized.length,
      totalAvailableLots,
      data: normalized,
      raw: data, // Preserve original OData format
    };

    if (typeof res.status === 'function') {
      return res.status(200).json(responsePayload);
    } else {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify(responsePayload));
    }
  } catch (error: any) {
    const isTimeout = error.name === 'AbortError';
    const errorPayload = {
      status: 'error',
      error: isTimeout
        ? 'LTA DataMall request timed out (8s limit).'
        : `Failed to connect to LTA DataMall: ${error.message || 'Unknown network error'}`,
    };

    if (typeof res.status === 'function') {
      return res.status(502).json(errorPayload);
    } else {
      res.statusCode = 502;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify(errorPayload));
    }
  }
}
