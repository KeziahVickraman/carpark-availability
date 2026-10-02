import React, { useState } from 'react';
import { FilterOptions, UserLocation, VehicleType } from '../types/carpark';
import { PRESET_SINGAPORE_LOCATIONS } from '../data/singaporeCarparks';
import {
  Search,
  X,
  MapPin,
  Car,
  Bike,
  Truck,
  ArrowUpDown,
  Zap,
  Clock,
  Locate,
  SlidersHorizontal,
} from 'lucide-react';

interface FilterBarProps {
  filters: FilterOptions;
  onChangeFilters: (newFilters: FilterOptions) => void;
  userLocation: UserLocation;
  onChangeLocation: (location: UserLocation) => void;
  onRequestBrowserLocation: () => void;
  isLocating: boolean;
  totalCarparksCount: number;
  filteredCarparksCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onChangeFilters,
  userLocation,
  onChangeLocation,
  onRequestBrowserLocation,
  isLocating,
  totalCarparksCount,
  filteredCarparksCount,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChangeFilters({ ...filters, searchQuery: e.target.value });
  };

  const handleClearSearch = () => {
    onChangeFilters({ ...filters, searchQuery: '' });
  };

  const handleVehicleChange = (vehicleType: VehicleType) => {
    onChangeFilters({ ...filters, vehicleType });
  };

  const handleDistanceChange = (maxDistanceKm: number) => {
    onChangeFilters({ ...filters, maxDistanceKm });
  };

  const handleSortChange = (sortBy: FilterOptions['sortBy']) => {
    onChangeFilters({ ...filters, sortBy });
  };

  const handleAgencyChange = (agency: string) => {
    onChangeFilters({ ...filters, agency });
  };

  const handleToggle = (key: keyof FilterOptions) => {
    onChangeFilters({
      ...filters,
      [key]: !filters[key],
    });
  };

  return (
    <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 space-y-3 shrink-0">
      {/* Top Search & Primary Location Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search carparks by name, HDB block, road, or area (e.g. Bugis, TM14, Orchard)..."
            value={filters.searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-800 placeholder-slate-400"
          />
          {filters.searchQuery && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Location Selector Dropdown */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="relative flex-1 sm:w-56">
            <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-blue-600 pointer-events-none" />
            <select
              value={userLocation.name}
              onChange={(e) => {
                const selected = PRESET_SINGAPORE_LOCATIONS.find(
                  (p) => p.name === e.target.value
                );
                if (selected) {
                  onChangeLocation({
                    lat: selected.lat,
                    lng: selected.lng,
                    name: selected.name,
                    isCustomOrSimulated: true,
                  });
                }
              }}
              className="w-full pl-8 pr-7 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg appearance-none text-slate-800 cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              {!PRESET_SINGAPORE_LOCATIONS.some((p) => p.name === userLocation.name) && (
                <option value={userLocation.name}>{userLocation.name}</option>
              )}
              {PRESET_SINGAPORE_LOCATIONS.map((preset) => (
                <option key={preset.id} value={preset.name}>
                  {preset.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
              ▾
            </div>
          </div>

          {/* Browser GPS Geolocation Button */}
          <button
            type="button"
            onClick={onRequestBrowserLocation}
            disabled={isLocating}
            className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors flex items-center justify-center shrink-0"
            title="Detect my current location via GPS"
          >
            <Locate className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Second Row: Vehicle Segmented Control, Radius, and Sort */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-0.5">
        {/* Vehicle Type Segmented Control */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
          <button
            type="button"
            onClick={() => handleVehicleChange('cars')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              filters.vehicleType === 'cars'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            <span>Cars</span>
          </button>
          <button
            type="button"
            onClick={() => handleVehicleChange('motorcycles')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              filters.vehicleType === 'motorcycles'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bike className="w-3.5 h-3.5" />
            <span>Motorcycles</span>
          </button>
          <button
            type="button"
            onClick={() => handleVehicleChange('heavy')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              filters.vehicleType === 'heavy'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Heavy</span>
          </button>
        </div>

        {/* Radius Filter Tabs */}
        <div className="flex items-center gap-1 text-xs">
          <span className="text-slate-400 hidden sm:inline mr-1">Radius:</span>
          {[
            { label: '500m', value: 0.5 },
            { label: '1 km', value: 1.0 },
            { label: '2 km', value: 2.0 },
            { label: '5 km', value: 5.0 },
            { label: 'All SG', value: 30.0 },
          ].map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => handleDistanceChange(item.value)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                filters.maxDistanceKm === item.value
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Sort & Filter Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs">
            <ArrowUpDown className="w-3 h-3 text-slate-500" />
            <select
              value={filters.sortBy}
              onChange={(e) => handleSortChange(e.target.value as FilterOptions['sortBy'])}
              className="bg-transparent text-slate-800 font-medium cursor-pointer focus:outline-hidden text-xs pr-1"
            >
              <option value="distance">Nearest to Me</option>
              <option value="available">Most Lots Available</option>
              <option value="cheapest">Cheapest Rate</option>
              <option value="occupancy">Highest % Vacant</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-colors ${
              showAdvanced ||
              filters.onlyAvailable ||
              filters.freeParkingOnly ||
              filters.evChargingOnly ||
              filters.agency !== 'All'
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
            title="Toggle advanced filters"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Filters</span>
          </button>
        </div>
      </div>

      {/* Advanced Filter Row (Expandable) */}
      {showAdvanced && (
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
          {/* Agency */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
            <span className="text-slate-400">Agency:</span>
            <select
              value={filters.agency}
              onChange={(e) => handleAgencyChange(e.target.value)}
              className="bg-transparent text-slate-800 font-medium cursor-pointer focus:outline-hidden"
            >
              <option value="All">All Agencies</option>
              <option value="HDB">HDB Only</option>
              <option value="URA">URA Only</option>
              <option value="Commercial">Malls / Commercial</option>
            </select>
          </div>

          {/* Quick Toggles */}
          <button
            type="button"
            onClick={() => handleToggle('onlyAvailable')}
            className={`px-2.5 py-1 rounded-md transition-colors border ${
              filters.onlyAvailable
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 font-medium'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Available Lots Only (&gt;10)
          </button>

          <button
            type="button"
            onClick={() => handleToggle('freeParkingOnly')}
            className={`px-2.5 py-1 rounded-md transition-colors border ${
              filters.freeParkingOnly
                ? 'bg-blue-50 text-blue-700 border-blue-300 font-medium'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Free Parking Scheme (Sun/PH)
          </button>

          <button
            type="button"
            onClick={() => handleToggle('evChargingOnly')}
            className={`px-2.5 py-1 rounded-md transition-colors border flex items-center gap-1 ${
              filters.evChargingOnly
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 font-medium'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Zap className="w-3 h-3 text-emerald-600" />
            <span>EV Charging</span>
          </button>

          {/* Clear Filters */}
          <button
            type="button"
            onClick={() => {
              onChangeFilters({
                ...filters,
                onlyAvailable: false,
                freeParkingOnly: false,
                evChargingOnly: false,
                minClearance: 0,
                agency: 'All',
              });
            }}
            className="text-slate-400 hover:text-slate-600 text-[11px] ml-auto underline"
          >
            Reset filters
          </button>
        </div>
      )}

      {/* Result Count and Unboxed Metadata */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-0.5">
        <div>
          Showing <span className="font-semibold text-slate-800 tabular-nums">{filteredCarparksCount}</span> of{' '}
          <span className="tabular-nums">{totalCarparksCount}</span> carparks
          {filters.maxDistanceKm < 20 && ` within ${filters.maxDistanceKm}km`}
        </div>

        <div className="flex items-center gap-2">
          <span>Real-time EPS telemetry</span>
          <span aria-hidden="true">·</span>
          <span>Singapore Standard Time</span>
        </div>
      </div>
    </div>
  );
};
