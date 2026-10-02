export type VehicleType = 'cars' | 'motorcycles' | 'heavy';

export type CarparkAgency = 'HDB' | 'URA' | 'LTA' | 'Commercial';

export type CarparkType =
  | 'Multi-Storey Carpark (MSCP)'
  | 'Basement Carpark'
  | 'Surface Carpark'
  | 'Mechanized Carpark';

export interface CarparkLotsInfo {
  total: number;
  available: number;
}

export interface CarparkRates {
  weekdayPeak: string;
  weekdayOffPeak: string;
  weekend: string;
  gracePeriodMinutes: number;
  freeParkingDescription: string | null;
  nightParkingScheme: string;
  estimatedCostPerHour: number; // for quick sorting by price
}

export interface Carpark {
  id: string;
  carparkNo: string;
  name: string;
  address: string;
  postalCode?: string;
  region: 'Central / CBD' | 'Orchard' | 'East' | 'West' | 'North' | 'North-East' | 'South';
  agency: CarparkAgency;
  carparkType: CarparkType;
  coordinates: {
    lat: number;
    lng: number;
  };
  lots: {
    cars: CarparkLotsInfo;
    motorcycles: CarparkLotsInfo;
    heavy: CarparkLotsInfo;
  };
  rates: CarparkRates;
  clearanceHeight: number; // in meters (e.g. 2.15)
  evChargers: number;
  wheelchairLots: number;
  hasElectronicParking: boolean;
  lastUpdated: string;
  distanceMeters?: number;
  driveTimeMinutes?: number;
  walkTimeMinutes?: number;
}

export interface UserLocation {
  lat: number;
  lng: number;
  name: string;
  isCustomOrSimulated: boolean;
  accuracy?: number;
}

export interface FilterOptions {
  searchQuery: string;
  vehicleType: VehicleType;
  maxDistanceKm: number; // 0.5, 1, 2, 5, 20 (All)
  onlyAvailable: boolean;
  freeParkingOnly: boolean;
  evChargingOnly: boolean;
  minClearance: number; // e.g. 0, 1.9, 2.1
  agency: string; // 'All' | 'HDB' | 'URA' | 'Commercial'
  sortBy: 'distance' | 'available' | 'cheapest' | 'occupancy';
}

export interface ApiKeyConfig {
  dataGovSgKey: string;
  ltaDatamallKey: string;
  googleMapsKey: string;
  oneMapToken: string;
  dataSourceMode: 'live_hybrid' | 'mock_only' | 'custom_api';
}
