import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Carpark,
  FilterOptions,
  UserLocation,
  ApiKeyConfig,
  VehicleType,
} from './types/carpark';
import { SINGAPORE_CARPARKS, PRESET_SINGAPORE_LOCATIONS } from './data/singaporeCarparks';
import { calculateDistanceKm } from './utils/geoUtils';
import {
  getStoredApiConfig,
  saveApiConfig,
  getStoredFavorites,
  toggleStoredFavorite,
  fetchLiveCarparkData,
} from './services/carparkService';
import { TopBar } from './components/TopBar';
import { FilterBar } from './components/FilterBar';
import { CarparkMetricsBar } from './components/CarparkMetricsBar';
import { CarparkCard } from './components/CarparkCard';
import { CarparkMap } from './components/CarparkMap';
import { CarparkDetailModal } from './components/CarparkDetailModal';
import { ApiKeyModal } from './components/ApiKeyModal';
import { MobileNav } from './components/MobileNav';
import {
  MapPin,
  Car,
  AlertCircle,
  RefreshCw,
  Search,
  Star,
  Frown,
  SlidersHorizontal,
  Navigation,
} from 'lucide-react';

const INITIAL_LOCATION: UserLocation = {
  lat: 1.2838,
  lng: 103.8515,
  name: 'Central / CBD (Raffles Place)',
  isCustomOrSimulated: true,
};

const INITIAL_FILTERS: FilterOptions = {
  searchQuery: '',
  vehicleType: 'cars',
  maxDistanceKm: 5.0,
  onlyAvailable: false,
  freeParkingOnly: false,
  evChargingOnly: false,
  minClearance: 0,
  agency: 'All',
  sortBy: 'distance',
};

export default function App() {
  const [carparks, setCarparks] = useState<Carpark[]>(SINGAPORE_CARPARKS);
  const [userLocation, setUserLocation] = useState<UserLocation>(INITIAL_LOCATION);
  const [filters, setFilters] = useState<FilterOptions>(INITIAL_FILTERS);
  const [selectedCarpark, setSelectedCarpark] = useState<Carpark | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'split' | 'map' | 'list'>('split');
  const [mobileTab, setMobileTab] = useState<'map' | 'list'>('list');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<string[]>(getStoredFavorites());
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [apiConfig, setApiConfig] = useState<ApiKeyConfig>(getStoredApiConfig());
  const [apiStatusMessage, setApiStatusMessage] = useState<string>(
    'Front-end ready · Live SG carpark telemetry active'
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Recalculate distances relative to user location
  const carparksWithDistance = useMemo(() => {
    return carparks.map((cp) => {
      const distKm = calculateDistanceKm(
        userLocation.lat,
        userLocation.lng,
        cp.coordinates.lat,
        cp.coordinates.lng
      );
      return {
        ...cp,
        distanceMeters: Math.round(distKm * 1000),
      };
    });
  }, [carparks, userLocation]);

  // Filter & Sort
  const filteredCarparks = useMemo(() => {
    const query = filters.searchQuery.toLowerCase().trim();

    return carparksWithDistance
      .filter((cp) => {
        // Favorites filter
        if (showFavoritesOnly && !favoriteIds.includes(cp.id)) {
          return false;
        }

        // Search text matching
        if (query) {
          const matchName = cp.name.toLowerCase().includes(query);
          const matchAddr = cp.address.toLowerCase().includes(query);
          const matchNo = cp.carparkNo.toLowerCase().includes(query);
          const matchRegion = cp.region.toLowerCase().includes(query);
          const matchPostal = cp.postalCode?.toLowerCase().includes(query);
          if (!matchName && !matchAddr && !matchNo && !matchRegion && !matchPostal) {
            return false;
          }
        }

        // Distance filter
        if (filters.maxDistanceKm < 20) {
          const distKm = (cp.distanceMeters || 0) / 1000;
          if (distKm > filters.maxDistanceKm) {
            return false;
          }
        }

        // Agency filter
        if (filters.agency !== 'All' && cp.agency !== filters.agency) {
          return false;
        }

        // Available lots only
        if (filters.onlyAvailable) {
          const avail = cp.lots[filters.vehicleType].available;
          if (avail < 10) return false;
        }

        // Free parking only
        if (filters.freeParkingOnly && !cp.rates.freeParkingDescription) {
          return false;
        }

        // EV Charging
        if (filters.evChargingOnly && cp.evChargers <= 0) {
          return false;
        }

        // Min clearance
        if (filters.minClearance > 0 && cp.clearanceHeight < filters.minClearance) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === 'distance') {
          return (a.distanceMeters || 0) - (b.distanceMeters || 0);
        }
        if (filters.sortBy === 'available') {
          return (
            b.lots[filters.vehicleType].available -
            a.lots[filters.vehicleType].available
          );
        }
        if (filters.sortBy === 'cheapest') {
          return a.rates.estimatedCostPerHour - b.rates.estimatedCostPerHour;
        }
        if (filters.sortBy === 'occupancy') {
          const pctA =
            a.lots[filters.vehicleType].total > 0
              ? a.lots[filters.vehicleType].available /
                a.lots[filters.vehicleType].total
              : 0;
          const pctB =
            b.lots[filters.vehicleType].total > 0
              ? b.lots[filters.vehicleType].available /
                b.lots[filters.vehicleType].total
              : 0;
          return pctB - pctA;
        }
        return 0;
      });
  }, [carparksWithDistance, filters, showFavoritesOnly, favoriteIds]);

  // Handle Refreshing Live Data
  const refreshData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const res = await fetchLiveCarparkData(carparks, apiConfig);
      setCarparks(res.carparks);
      setApiStatusMessage(res.apiStatusMessage);
    } catch (err) {
      console.error('Failed to sync live carpark data', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [carparks, apiConfig]);

  // Fetch initial live data on mount
  useEffect(() => {
    refreshData();
    // Auto-poll every 60 seconds
    const interval = setInterval(() => {
      refreshData();
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Request browser GPS Geolocation
  const handleRequestBrowserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const { latitude, longitude } = pos.coords;

        // Check if inside or near Singapore bounds (approx lat 1.15 to 1.48, lng 103.55 to 104.1)
        const isNearSingapore =
          latitude >= 1.15 &&
          latitude <= 1.5 &&
          longitude >= 103.55 &&
          longitude <= 104.1;

        if (isNearSingapore) {
          setUserLocation({
            lat: latitude,
            lng: longitude,
            name: 'Current GPS Location',
            isCustomOrSimulated: false,
            accuracy: pos.coords.accuracy,
          });
        } else {
          // If user is testing outside Singapore, center on Singapore CBD with notification
          setUserLocation({
            lat: 1.2838,
            lng: 103.8515,
            name: 'Central / CBD (Simulated)',
            isCustomOrSimulated: true,
          });
          setLocationError(
            `You appear to be outside Singapore (${latitude.toFixed(2)}, ${longitude.toFixed(2)}). Defaulting to Central / CBD Singapore for testing.`
          );
          setTimeout(() => setLocationError(null), 6000);
        }
      },
      (err) => {
        setIsLocating(false);
        setLocationError(`Location request failed: ${err.message}. Choose a Singapore preset.`);
        setTimeout(() => setLocationError(null), 5000);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );
  }, []);

  // Toggle Favorite
  const handleToggleFavorite = (carparkId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = toggleStoredFavorite(carparkId);
    setFavoriteIds(updated);
  };

  // Open Carpark details
  const handleSelectCarpark = (carpark: Carpark) => {
    setSelectedCarpark(carpark);
    setIsDetailModalOpen(true);
  };

  // Save API config
  const handleSaveApiConfig = (newConfig: ApiKeyConfig) => {
    saveApiConfig(newConfig);
    setApiConfig(newConfig);
    refreshData();
  };

  return (
    <div className="flex flex-col h-screen w-full bg-slate-50 text-slate-900 overflow-hidden font-sans">
      {/* 1. Universal Top Bar */}
      <TopBar
        viewMode={viewMode}
        onChangeViewMode={(mode) => {
          setViewMode(mode);
          setShowFavoritesOnly(false);
        }}
        showFavoritesOnly={showFavoritesOnly}
        onToggleFavoritesOnly={() => setShowFavoritesOnly(!showFavoritesOnly)}
        favoritesCount={favoriteIds.length}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        onRefreshData={refreshData}
        isRefreshing={isRefreshing}
        hasCustomKey={Boolean(apiConfig.dataGovSgKey || apiConfig.ltaDatamallKey)}
      />

      {/* 2. Interactive Search & Filters Bar */}
      <FilterBar
        filters={filters}
        onChangeFilters={setFilters}
        userLocation={userLocation}
        onChangeLocation={setUserLocation}
        onRequestBrowserLocation={handleRequestBrowserLocation}
        isLocating={isLocating}
        totalCarparksCount={carparksWithDistance.length}
        filteredCarparksCount={filteredCarparks.length}
      />

      {/* Location warning banner if outside SG or permission denied */}
      {locationError && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{locationError}</span>
          </div>
          <button
            type="button"
            onClick={() => setLocationError(null)}
            className="text-amber-700 font-bold px-2"
          >
            ×
          </button>
        </div>
      )}

      {/* 3. High-Density Metrics Bar */}
      <CarparkMetricsBar
        carparks={filteredCarparks}
        vehicleType={filters.vehicleType}
        radiusKm={filters.maxDistanceKm}
      />

      {/* 4. Main Body: Split View / Map / List */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* DESKTOP SPLIT VIEW: Left List + Right Map */}
        <div className="hidden md:flex w-full h-full">
          {/* Left Column: Carpark Cards List */}
          {(viewMode === 'split' || viewMode === 'list') && (
            <div
              className={`h-full flex flex-col border-r border-slate-200 bg-slate-50/60 overflow-hidden ${
                viewMode === 'list' ? 'w-full max-w-4xl mx-auto border-r-0' : 'w-[440px] xl:w-[480px] shrink-0'
              }`}
            >
              <div className="p-3 bg-white border-b border-slate-200/80 flex items-center justify-between text-xs text-slate-500 shrink-0">
                <span className="font-semibold text-slate-700">
                  {showFavoritesOnly ? 'Saved Favorites' : 'Nearby Carparks'}
                </span>
                <span className="font-mono tabular-nums">
                  {filteredCarparks.length} locations found
                </span>
              </div>

              {/* Scrollable Cards Grid */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {filteredCarparks.length > 0 ? (
                  filteredCarparks.map((cp) => (
                    <CarparkCard
                      key={cp.id}
                      carpark={cp}
                      vehicleType={filters.vehicleType}
                      isSelected={selectedCarpark?.id === cp.id}
                      isFavorite={favoriteIds.includes(cp.id)}
                      onSelect={handleSelectCarpark}
                      onToggleFavorite={handleToggleFavorite}
                    />
                  ))
                ) : (
                  <div className="py-16 px-4 text-center">
                    <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                      <Search className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-semibold text-slate-800">
                      No carparks found
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                      Try expanding your search radius (e.g. 5km or All SG) or clearing active filters.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setFilters({
                          ...filters,
                          searchQuery: '',
                          maxDistanceKm: 30,
                          onlyAvailable: false,
                          agency: 'All',
                        });
                        setShowFavoritesOnly(false);
                      }}
                      className="mt-4 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                      Reset filters & expand radius
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Right Column: Interactive Leaflet Map */}
          {(viewMode === 'split' || viewMode === 'map') && (
            <div className="flex-1 h-full relative">
              <CarparkMap
                carparks={filteredCarparks}
                userLocation={userLocation}
                selectedCarpark={selectedCarpark}
                onSelectCarpark={handleSelectCarpark}
                radiusKm={filters.maxDistanceKm}
                vehicleType={filters.vehicleType}
                onRecenterToUser={() => {
                  setUserLocation({ ...userLocation });
                }}
              />
            </div>
          )}
        </div>

        {/* MOBILE VIEW (<768px): Toggles between Map & List via Bottom Navigation */}
        <div className="md:hidden flex flex-col w-full h-full pb-14">
          {mobileTab === 'list' && (
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
              {filteredCarparks.length > 0 ? (
                filteredCarparks.map((cp) => (
                  <CarparkCard
                    key={cp.id}
                    carpark={cp}
                    vehicleType={filters.vehicleType}
                    isSelected={selectedCarpark?.id === cp.id}
                    isFavorite={favoriteIds.includes(cp.id)}
                    onSelect={handleSelectCarpark}
                    onToggleFavorite={handleToggleFavorite}
                  />
                ))
              ) : (
                <div className="py-16 text-center">
                  <p className="text-xs text-slate-500">No carparks match your filters.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setFilters({
                        ...filters,
                        searchQuery: '',
                        maxDistanceKm: 30,
                        onlyAvailable: false,
                      });
                      setShowFavoritesOnly(false);
                    }}
                    className="mt-3 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 rounded-lg"
                  >
                    Reset filters
                  </button>
                </div>
              )}
            </div>
          )}

          {mobileTab === 'map' && (
            <div className="flex-1 h-full relative">
              <CarparkMap
                carparks={filteredCarparks}
                userLocation={userLocation}
                selectedCarpark={selectedCarpark}
                onSelectCarpark={handleSelectCarpark}
                radiusKm={filters.maxDistanceKm}
                vehicleType={filters.vehicleType}
                onRecenterToUser={() => {
                  setUserLocation({ ...userLocation });
                }}
              />
            </div>
          )}
        </div>
      </main>

      {/* 5. Mobile Bottom Tab Bar */}
      <MobileNav
        currentTab={mobileTab}
        onChangeTab={setMobileTab}
        showFavoritesOnly={showFavoritesOnly}
        onToggleFavorites={() => {
          setShowFavoritesOnly(!showFavoritesOnly);
          setMobileTab('list');
        }}
        favoritesCount={favoriteIds.length}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
      />

      {/* 6. Carpark Detail Modal / Drawer */}
      <CarparkDetailModal
        carpark={selectedCarpark}
        vehicleType={filters.vehicleType}
        isFavorite={selectedCarpark ? favoriteIds.includes(selectedCarpark.id) : false}
        onClose={() => {
          setIsDetailModalOpen(false);
        }}
        onToggleFavorite={handleToggleFavorite}
      />

      {/* 7. API Keys & Live Data Sources Modal */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        config={apiConfig}
        onSaveConfig={handleSaveApiConfig}
        apiStatusMessage={apiStatusMessage}
      />
    </div>
  );
}
