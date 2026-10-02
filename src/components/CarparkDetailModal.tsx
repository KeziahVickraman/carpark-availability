import React, { useState } from 'react';
import { Carpark, VehicleType } from '../types/carpark';
import {
  formatDistance,
  estimateDriveTimeMinutes,
  estimateWalkTimeMinutes,
  getAvailabilityTier,
  getTierColorClasses,
  getTierLabel,
} from '../utils/geoUtils';
import {
  X,
  Navigation,
  Car,
  Bike,
  Truck,
  Zap,
  Star,
  Clock,
  ShieldCheck,
  MapPin,
  ExternalLink,
  Info,
  Check,
  Copy,
  Share2,
  DollarSign,
  Compass,
} from 'lucide-react';

interface CarparkDetailModalProps {
  carpark: Carpark | null;
  vehicleType: VehicleType;
  isFavorite: boolean;
  onClose: () => void;
  onToggleFavorite: (carparkId: string) => void;
}

export const CarparkDetailModal: React.FC<CarparkDetailModalProps> = ({
  carpark,
  vehicleType,
  isFavorite,
  onClose,
  onToggleFavorite,
}) => {
  const [copiedAddress, setCopiedAddress] = useState(false);

  if (!carpark) return null;

  const currentLots = carpark.lots[vehicleType];
  const tier = getAvailabilityTier(currentLots.available, currentLots.total);
  const colors = getTierColorClasses(tier);
  const tierLabel = getTierLabel(tier);
  const percentFree =
    currentLots.total > 0
      ? Math.round((currentLots.available / currentLots.total) * 100)
      : 0;

  const distanceKm = carpark.distanceMeters ? carpark.distanceMeters / 1000 : undefined;
  const driveMinutes = estimateDriveTimeMinutes(distanceKm);
  const walkMinutes = estimateWalkTimeMinutes(distanceKm);

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${carpark.coordinates.lat},${carpark.coordinates.lng}`;
  const appleMapsUrl = `https://maps.apple.com/?daddr=${carpark.coordinates.lat},${carpark.coordinates.lng}`;
  const wazeUrl = `https://waze.com/ul?ll=${carpark.coordinates.lat},${carpark.coordinates.lng}&navigate=yes`;

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(`${carpark.name}, ${carpark.address}, Singapore`);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div
        className="w-full sm:max-w-xl max-h-[90vh] bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="px-6 pt-5 pb-4 border-b border-slate-100 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="font-semibold text-slate-700">{carpark.agency}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono text-slate-600 font-semibold">{carpark.carparkNo}</span>
              <span aria-hidden="true">·</span>
              <span>{carpark.carparkType}</span>
            </div>

            <h2 className="text-xl font-bold text-slate-900 mt-1 leading-snug">
              {carpark.name}
            </h2>

            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{carpark.address}</span>
              <button
                type="button"
                onClick={handleCopyAddress}
                className="ml-1 p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
                title="Copy Address"
              >
                {copiedAddress ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => onToggleFavorite(carpark.id)}
              className={`p-2 rounded-lg border transition-colors ${
                isFavorite
                  ? 'text-amber-500 bg-amber-50 border-amber-200'
                  : 'text-slate-400 bg-slate-50 border-slate-200 hover:text-slate-600'
              }`}
              title="Save to favorites"
            >
              <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-400' : ''}`} />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
              title="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Main Availability Banner */}
          <div className={`p-4 rounded-xl border ${colors.border} ${colors.bg}`}>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Current Availability · {vehicleType.toUpperCase()}
                </div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold font-mono tabular-nums text-slate-900">
                    {currentLots.available}
                  </span>
                  <span className="text-sm text-slate-500 font-medium">
                    of {currentLots.total} lots vacant
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold ${colors.badgeBg} text-white shadow-xs`}>
                  {tierLabel}
                </span>
                <div className="text-xs text-slate-500 mt-1 font-mono">
                  {percentFree}% unoccupied
                </div>
              </div>
            </div>

            {/* Progress Visual */}
            <div className="mt-3 w-full bg-white/80 rounded-full h-2 overflow-hidden shadow-inner">
              <div
                className={`h-full transition-all duration-500 ${
                  tier === 'high'
                    ? 'bg-emerald-500'
                    : tier === 'moderate'
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
                style={{ width: `${Math.min(100, Math.max(5, percentFree))}%` }}
              />
            </div>

            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
              <span>{carpark.lastUpdated}</span>
              <span>Updated automatically</span>
            </div>
          </div>

          {/* Breakdown for All Vehicle Types */}
          <div>
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-2">
              Vehicle Lots Breakdown
            </h4>
            <div className="grid grid-cols-3 gap-2">
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50">
                <div className="flex items-center gap-1.5 text-xs text-slate-600 mb-1">
                  <Car className="w-3.5 h-3.5 text-blue-600" />
                  <span className="font-medium">Cars</span>
                </div>
                <div className="text-lg font-bold font-mono tabular-nums text-slate-900">
                  {carpark.lots.cars.available}
                  <span className="text-xs font-normal text-slate-400 ml-1">/ {carpark.lots.cars.total}</span>
                </div>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50">
                <div className="flex items-center gap-1.5 text-xs text-slate-600 mb-1">
                  <Bike className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="font-medium">Motorcycles</span>
                </div>
                <div className="text-lg font-bold font-mono tabular-nums text-slate-900">
                  {carpark.lots.motorcycles.available}
                  <span className="text-xs font-normal text-slate-400 ml-1">/ {carpark.lots.motorcycles.total}</span>
                </div>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50">
                <div className="flex items-center gap-1.5 text-xs text-slate-600 mb-1">
                  <Truck className="w-3.5 h-3.5 text-amber-600" />
                  <span className="font-medium">Heavy</span>
                </div>
                <div className="text-lg font-bold font-mono tabular-nums text-slate-900">
                  {carpark.lots.heavy.total > 0 ? carpark.lots.heavy.available : 'N/A'}
                  {carpark.lots.heavy.total > 0 && (
                    <span className="text-xs font-normal text-slate-400 ml-1">/ {carpark.lots.heavy.total}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Rates & Operating Schemes */}
          <div>
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-2">
              Parking Rates & Schemes
            </h4>
            <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden text-sm">
              <div className="p-3 flex items-start justify-between bg-white">
                <div className="text-slate-600 font-medium">Weekday Daytime</div>
                <div className="text-right font-semibold text-slate-900">
                  {carpark.rates.weekdayPeak}
                </div>
              </div>

              <div className="p-3 flex items-start justify-between bg-white">
                <div className="text-slate-600 font-medium">Weekday Evening / Night</div>
                <div className="text-right font-semibold text-slate-900">
                  {carpark.rates.weekdayOffPeak}
                </div>
              </div>

              <div className="p-3 flex items-start justify-between bg-white">
                <div className="text-slate-600 font-medium">Weekend & PH</div>
                <div className="text-right font-semibold text-slate-900">
                  {carpark.rates.weekend}
                </div>
              </div>

              <div className="p-3 flex items-start justify-between bg-slate-50/60">
                <div className="text-slate-600 font-medium">Grace Period</div>
                <div className="text-right font-semibold text-slate-900">
                  {carpark.rates.gracePeriodMinutes} mins free drop-off
                </div>
              </div>

              {carpark.rates.freeParkingDescription && (
                <div className="p-3 flex items-start justify-between bg-emerald-50/50">
                  <div className="text-emerald-800 font-medium">Free Parking Scheme</div>
                  <div className="text-right font-semibold text-emerald-900 text-xs sm:text-sm">
                    {carpark.rates.freeParkingDescription}
                  </div>
                </div>
              )}

              <div className="p-3 flex items-start justify-between bg-slate-50/60">
                <div className="text-slate-600 font-medium">Night Parking Cap</div>
                <div className="text-right font-semibold text-slate-900 text-xs sm:text-sm">
                  {carpark.rates.nightParkingScheme}
                </div>
              </div>
            </div>
          </div>

          {/* Physical Specifications & Amenities */}
          <div>
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-2">
              Carpark Specifications
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-3 border border-slate-200 rounded-lg bg-slate-50/50">
                <div className="text-slate-500">Max Height</div>
                <div className="text-sm font-bold text-slate-900 mt-0.5">
                  {carpark.clearanceHeight.toFixed(2)} m
                </div>
              </div>

              <div className="p-3 border border-slate-200 rounded-lg bg-slate-50/50">
                <div className="text-slate-500">EV Charging</div>
                <div className="text-sm font-bold text-slate-900 mt-0.5 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-emerald-600" />
                  {carpark.evChargers > 0 ? `${carpark.evChargers} chargers` : 'None'}
                </div>
              </div>

              <div className="p-3 border border-slate-200 rounded-lg bg-slate-50/50">
                <div className="text-slate-500">Accessible Lots</div>
                <div className="text-sm font-bold text-slate-900 mt-0.5">
                  {carpark.wheelchairLots} lots
                </div>
              </div>

              <div className="p-3 border border-slate-200 rounded-lg bg-slate-50/50">
                <div className="text-slate-500">Barrier System</div>
                <div className="text-sm font-bold text-slate-900 mt-0.5">
                  Electronic (EPS)
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Actions Bar */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-600">
            <span className="font-semibold text-slate-800">{formatDistance(distanceKm)}</span> away
            <span className="mx-1.5" aria-hidden="true">·</span>
            <span>~{driveMinutes} min drive</span>
            <span className="mx-1.5" aria-hidden="true">·</span>
            <span>~{walkMinutes} min walk</span>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Navigate in Google Maps</span>
              <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
            </a>

            <a
              href={wazeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg shadow-xs transition-colors"
            >
              <span>Waze</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
