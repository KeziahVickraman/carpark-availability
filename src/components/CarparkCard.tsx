import React from 'react';
import { Carpark, VehicleType } from '../types/carpark';
import {
  formatDistance,
  estimateDriveTimeMinutes,
  getAvailabilityTier,
  getTierColorClasses,
  getTierLabel,
} from '../utils/geoUtils';
import {
  Navigation,
  Car,
  Zap,
  Star,
  ChevronRight,
  ShieldCheck,
  Clock,
  ArrowUpRight,
} from 'lucide-react';

interface CarparkCardProps {
  carpark: Carpark;
  vehicleType: VehicleType;
  isSelected: boolean;
  isFavorite: boolean;
  onSelect: (carpark: Carpark) => void;
  onToggleFavorite: (carparkId: string, e: React.MouseEvent) => void;
}

export const CarparkCard: React.FC<CarparkCardProps> = ({
  carpark,
  vehicleType,
  isSelected,
  isFavorite,
  onSelect,
  onToggleFavorite,
}) => {
  const lots = carpark.lots[vehicleType];
  const tier = getAvailabilityTier(lots.available, lots.total);
  const colors = getTierColorClasses(tier);
  const label = getTierLabel(tier);
  const percentAvailable =
    lots.total > 0 ? Math.round((lots.available / lots.total) * 100) : 0;
  const distanceKm = carpark.distanceMeters ? carpark.distanceMeters / 1000 : undefined;
  const driveMinutes = estimateDriveTimeMinutes(distanceKm);

  return (
    <div
      onClick={() => onSelect(carpark)}
      className={`relative p-4 rounded-xl border transition-all cursor-pointer text-left ${
        isSelected
          ? 'bg-blue-50/50 border-blue-500 shadow-sm ring-1 ring-blue-500/20'
          : 'bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-xs'
      }`}
    >
      {/* Top Header Row */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="font-semibold text-slate-700">{carpark.agency}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-slate-500 font-medium">{carpark.carparkNo}</span>
            <span aria-hidden="true">·</span>
            <span className="truncate">{carpark.carparkType}</span>
          </div>

          <h3 className="mt-1 text-base font-semibold text-slate-900 truncate leading-snug">
            {carpark.name}
          </h3>

          <p className="text-xs text-slate-500 truncate mt-0.5">{carpark.address}</p>
        </div>

        {/* Favorite Bookmark Button */}
        <button
          type="button"
          onClick={(e) => onToggleFavorite(carpark.id, e)}
          className={`p-1.5 rounded-lg border transition-colors ${
            isFavorite
              ? 'text-amber-500 bg-amber-50 border-amber-200'
              : 'text-slate-400 bg-slate-50 border-slate-200 hover:text-slate-600'
          }`}
          title={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
        >
          <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-400' : ''}`} />
        </button>
      </div>

      {/* Lot Count & Availability Metric */}
      <div className="mt-3.5 flex items-end justify-between border-t border-slate-100 pt-3">
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
              {lots.available}
            </span>
            <span className="text-xs text-slate-500">
              / {lots.total} lots
            </span>
          </div>

          {/* Unboxed Status Text with colored indicator dot */}
          <div className="flex items-center gap-1.5 mt-1 text-xs font-medium">
            <span className={`w-2 h-2 rounded-full ${colors.dot}`}></span>
            <span className={colors.text}>{label}</span>
            <span className="text-slate-400 font-mono text-[11px]">({percentAvailable}% free)</span>
          </div>
        </div>

        {/* Distance & ETA info */}
        <div className="text-right">
          <div className="text-xs font-semibold text-slate-800">
            {formatDistance(distanceKm)}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            ~{driveMinutes} min drive
          </div>
        </div>
      </div>

      {/* Mini Progress Bar */}
      <div className="mt-2.5 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ${
            tier === 'high'
              ? 'bg-emerald-500'
              : tier === 'moderate'
              ? 'bg-amber-500'
              : 'bg-rose-500'
          }`}
          style={{ width: `${Math.min(100, Math.max(4, percentAvailable))}%` }}
        />
      </div>

      {/* Key Highlights: Rate, Grace, EV, Clearance */}
      <div className="mt-3 flex flex-wrap items-center gap-y-1.5 gap-x-2 text-[11px] text-slate-600">
        <span className="text-slate-700 font-medium">
          {carpark.rates.weekdayPeak.split('(')[0].trim()}
        </span>

        {carpark.rates.gracePeriodMinutes > 0 && (
          <>
            <span className="text-slate-300" aria-hidden="true">·</span>
            <span>{carpark.rates.gracePeriodMinutes}m grace</span>
          </>
        )}

        {carpark.evChargers > 0 && (
          <>
            <span className="text-slate-300" aria-hidden="true">·</span>
            <span className="flex items-center gap-0.5 text-emerald-700">
              <Zap className="w-3 h-3 text-emerald-600" />
              {carpark.evChargers} EV
            </span>
          </>
        )}

        {carpark.rates.freeParkingDescription && (
          <>
            <span className="text-slate-300" aria-hidden="true">·</span>
            <span className="text-blue-600 font-medium">Free Sun/PH</span>
          </>
        )}

        <span className="text-slate-300" aria-hidden="true">·</span>
        <span>{carpark.clearanceHeight.toFixed(2)}m max</span>
      </div>
    </div>
  );
};
