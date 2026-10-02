export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export function formatDistance(distanceKm?: number): string {
  if (distanceKm === undefined || distanceKm === null) return '--';
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

export function estimateDriveTimeMinutes(distanceKm?: number): number {
  if (!distanceKm) return 1;
  // Singapore city driving speed avg ~ 32 km/h + 2 min ingress/traffic
  const driveMinutes = Math.round((distanceKm / 32) * 60) + 2;
  return Math.max(2, driveMinutes);
}

export function estimateWalkTimeMinutes(distanceKm?: number): number {
  if (!distanceKm) return 1;
  // Avg walking speed ~ 4.8 km/h
  const walkMinutes = Math.round((distanceKm / 4.8) * 60);
  return Math.max(1, walkMinutes);
}

export type AvailabilityTier = 'high' | 'moderate' | 'low' | 'full';

export function getAvailabilityTier(
  available: number,
  total: number
): AvailabilityTier {
  if (available <= 0) return 'full';
  if (available < 10) return 'low';
  const percentage = total > 0 ? (available / total) * 100 : 0;
  if (available >= 30 || percentage >= 25) return 'high';
  return 'moderate';
}

export function getTierColorClasses(tier: AvailabilityTier): {
  bg: string;
  text: string;
  border: string;
  dot: string;
  badgeBg: string;
  ring: string;
} {
  switch (tier) {
    case 'high':
      return {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        dot: 'bg-emerald-500',
        badgeBg: 'bg-emerald-600',
        ring: 'ring-emerald-500/20',
      };
    case 'moderate':
      return {
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        dot: 'bg-amber-500',
        badgeBg: 'bg-amber-500',
        ring: 'ring-amber-500/20',
      };
    case 'low':
      return {
        bg: 'bg-rose-50',
        text: 'text-rose-700',
        border: 'border-rose-200',
        dot: 'bg-rose-500',
        badgeBg: 'bg-rose-600',
        ring: 'ring-rose-500/20',
      };
    case 'full':
      return {
        bg: 'bg-slate-100',
        text: 'text-slate-700',
        border: 'border-slate-300',
        dot: 'bg-slate-500',
        badgeBg: 'bg-slate-700',
        ring: 'ring-slate-500/20',
      };
  }
}

export function getTierLabel(tier: AvailabilityTier): string {
  switch (tier) {
    case 'high':
      return 'Available';
    case 'moderate':
      return 'Filling Fast';
    case 'low':
      return 'Limited Lots';
    case 'full':
      return 'Carpark Full';
  }
}
