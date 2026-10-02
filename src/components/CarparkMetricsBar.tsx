import React from 'react';
import { Carpark, VehicleType } from '../types/carpark';
import { formatDistance } from '../utils/geoUtils';
import { Car, MapPin, DollarSign, Sparkles } from 'lucide-react';

interface CarparkMetricsBarProps {
  carparks: Carpark[];
  vehicleType: VehicleType;
  radiusKm: number;
}

export const CarparkMetricsBar: React.FC<CarparkMetricsBarProps> = ({
  carparks,
  vehicleType,
  radiusKm,
}) => {
  if (carparks.length === 0) return null;

  // Compute aggregate statistics
  const totalAvailable = carparks.reduce(
    (sum, cp) => sum + cp.lots[vehicleType].available,
    0
  );
  const totalLots = carparks.reduce(
    (sum, cp) => sum + cp.lots[vehicleType].total,
    0
  );
  const percentFree = totalLots > 0 ? Math.round((totalAvailable / totalLots) * 100) : 0;

  // Nearest carpark
  const nearest = [...carparks].sort(
    (a, b) => (a.distanceMeters || 999999) - (b.distanceMeters || 999999)
  )[0];

  // Carpark with most vacant lots
  const mostLots = [...carparks].sort(
    (a, b) => b.lots[vehicleType].available - a.lots[vehicleType].available
  )[0];

  return (
    <div className="bg-slate-50/80 border-b border-slate-200/80 px-4 sm:px-6 py-2.5 text-xs text-slate-600 hidden sm:flex items-center justify-between gap-4 overflow-x-auto">
      <div className="flex items-center gap-6 divide-x divide-slate-200">
        <div className="flex items-baseline gap-1.5">
          <span className="text-slate-500 font-medium">Nearby Vacancy:</span>
          <span className="text-slate-900 font-bold font-mono tabular-nums">
            {totalAvailable.toLocaleString()} lots
          </span>
          <span className="text-slate-400 font-mono text-[11px]">
            ({percentFree}% available across {carparks.length} carparks)
          </span>
        </div>

        {nearest && (
          <div className="pl-6 flex items-baseline gap-1.5 truncate">
            <span className="text-slate-500 font-medium">Closest:</span>
            <span className="text-slate-900 font-semibold truncate max-w-[160px]">
              {nearest.name}
            </span>
            <span className="text-blue-600 font-mono font-medium">
              {formatDistance(nearest.distanceMeters ? nearest.distanceMeters / 1000 : 0)}
            </span>
          </div>
        )}

        {mostLots && mostLots.id !== nearest?.id && (
          <div className="pl-6 hidden lg:flex items-baseline gap-1.5 truncate">
            <span className="text-slate-500 font-medium">Highest Availability:</span>
            <span className="text-slate-900 font-semibold truncate max-w-[160px]">
              {mostLots.name}
            </span>
            <span className="text-emerald-700 font-mono font-medium">
              ({mostLots.lots[vehicleType].available} free)
            </span>
          </div>
        )}
      </div>

      <div className="text-[11px] text-slate-400 shrink-0 font-medium">
        EPS Auto-Tracking Active
      </div>
    </div>
  );
};
