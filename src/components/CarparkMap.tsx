import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Carpark, UserLocation, VehicleType } from '../types/carpark';
import { getAvailabilityTier, getTierColorClasses, formatDistance } from '../utils/geoUtils';
import { Navigation2, Layers, LocateFixed, Eye, Sparkles } from 'lucide-react';

interface CarparkMapProps {
  carparks: Carpark[];
  userLocation: UserLocation;
  selectedCarpark: Carpark | null;
  onSelectCarpark: (carpark: Carpark) => void;
  radiusKm: number;
  vehicleType: VehicleType;
  onRecenterToUser: () => void;
}

export const CarparkMap: React.FC<CarparkMapProps> = ({
  carparks,
  userLocation,
  selectedCarpark,
  onSelectCarpark,
  radiusKm,
  vehicleType,
  onRecenterToUser,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const radiusCircleRef = useRef<L.Circle | null>(null);
  const [mapTileStyle, setMapTileStyle] = useState<'positron' | 'osm'>('positron');

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [userLocation.lat, userLocation.lng],
        zoom: 14,
        zoomControl: false,
        attributionControl: false,
      });

      // CartoDB Positron tile layer (clean minimal design, no API key needed)
      const tileUrl =
        mapTileStyle === 'positron'
          ? 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
          : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

      const tileLayer = L.tileLayer(tileUrl, {
        maxZoom: 19,
        subdomains: 'abcd',
      });
      tileLayer.addTo(map);

      // Attribution
      L.control
        .attribution({
          position: 'bottomright',
          prefix: '<span class="text-[10px] text-slate-400">© OpenStreetMap · ParkSG</span>',
        })
        .addTo(map);

      // Custom Zoom Control top-right
      L.control
        .zoom({
          position: 'topright',
        })
        .addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markersGroup;
      mapInstanceRef.current = map;

      // Clean up on unmount
      return () => {
        map.remove();
        mapInstanceRef.current = null;
      };
    }
  }, []);

  // Update Tile Layer if toggled
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // Remove existing tile layers
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    const tileUrl =
      mapTileStyle === 'positron'
        ? 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    L.tileLayer(tileUrl, {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);
  }, [mapTileStyle]);

  // Update User Location Marker & Radius Circle
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
    }
    if (radiusCircleRef.current) {
      radiusCircleRef.current.remove();
    }

    const userHtml = `
      <div class="relative flex items-center justify-center">
        <span class="absolute w-8 h-8 rounded-full bg-blue-500/25 animate-ping"></span>
        <span class="relative flex items-center justify-center w-5 h-5 bg-blue-600 border-2 border-white rounded-full shadow-md text-white">
          <span class="w-1.5 h-1.5 bg-white rounded-full"></span>
        </span>
      </div>
    `;

    const userIcon = L.divIcon({
      html: userHtml,
      className: 'custom-user-pin',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    const userMarker = L.marker([userLocation.lat, userLocation.lng], {
      icon: userIcon,
      zIndexOffset: 1000,
    }).addTo(map);

    userMarker.bindTooltip(
      `<div class="text-xs font-semibold px-1 py-0.5">${userLocation.name} (Your Location)</div>`,
      { direction: 'top', offset: [0, -10] }
    );

    userMarkerRef.current = userMarker;

    // Show radius circle if radius is active (< 20 km)
    if (radiusKm < 20) {
      const circle = L.circle([userLocation.lat, userLocation.lng], {
        radius: radiusKm * 1000,
        color: '#3b82f6',
        weight: 1.5,
        dashArray: '4, 6',
        fillColor: '#60a5fa',
        fillOpacity: 0.08,
      }).addTo(map);
      radiusCircleRef.current = circle;
    }
  }, [userLocation, radiusKm]);

  // Update Carpark Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;
    const markersGroup = markersLayerRef.current;
    markersGroup.clearLayers();

    carparks.forEach((cp) => {
      const lotsData = cp.lots[vehicleType];
      const tier = getAvailabilityTier(lotsData.available, lotsData.total);
      const isSelected = selectedCarpark?.id === cp.id;

      let colorClass = 'bg-emerald-600 text-white border-emerald-700';
      if (tier === 'moderate') colorClass = 'bg-amber-500 text-white border-amber-600';
      if (tier === 'low') colorClass = 'bg-rose-600 text-white border-rose-700';
      if (tier === 'full') colorClass = 'bg-slate-700 text-white border-slate-800';

      const selectedStyles = isSelected
        ? 'ring-4 ring-blue-500 ring-offset-2 scale-110 z-50'
        : 'hover:scale-105';

      const pinHtml = `
        <div class="relative group cursor-pointer transition-transform ${selectedStyles}">
          <div class="flex items-center gap-1.5 px-2 py-1 rounded-full shadow-md border ${colorClass} text-xs font-semibold tracking-tight">
            <span class="font-mono tabular-nums">${lotsData.available}</span>
            <span class="text-[10px] opacity-90 uppercase">${vehicleType === 'cars' ? 'lots' : 'bays'}</span>
          </div>
          <div class="w-1.5 h-1.5 rotate-45 mx-auto -mt-1 ${colorClass.split(' ')[0]}"></div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: pinHtml,
        className: 'custom-carpark-pin',
        iconSize: [70, 32],
        iconAnchor: [35, 30],
      });

      const marker = L.marker([cp.coordinates.lat, cp.coordinates.lng], {
        icon: customIcon,
        zIndexOffset: isSelected ? 900 : 100,
      });

      // Tooltip preview
      const tooltipContent = `
        <div class="p-1 max-w-[200px]">
          <div class="font-semibold text-xs text-slate-900 truncate">${cp.name}</div>
          <div class="text-[11px] text-slate-500 mt-0.5">${cp.agency} · ${formatDistance(cp.distanceMeters ? cp.distanceMeters / 1000 : undefined)} away</div>
          <div class="mt-1 flex items-center justify-between text-xs pt-1 border-t border-slate-100">
            <span class="font-medium text-slate-700">${lotsData.available} lots free</span>
            <span class="font-mono text-slate-500">${cp.carparkNo}</span>
          </div>
        </div>
      `;

      marker.bindTooltip(tooltipContent, {
        direction: 'top',
        offset: [0, -20],
        opacity: 0.95,
      });

      marker.on('click', () => {
        onSelectCarpark(cp);
      });

      markersGroup.addLayer(marker);
    });
  }, [carparks, selectedCarpark, vehicleType, onSelectCarpark]);

  // Center on Selected Carpark when user chooses from list
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedCarpark) return;
    mapInstanceRef.current.panTo([
      selectedCarpark.coordinates.lat,
      selectedCarpark.coordinates.lng,
    ], { animate: true, duration: 0.6 });
  }, [selectedCarpark]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-100">
      {/* Map DOM Container */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[360px]" />

      {/* Floating Map Controls & Quick Actions */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
        <button
          onClick={onRecenterToUser}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-800 bg-white/95 backdrop-blur-md rounded-lg shadow-md border border-slate-200/80 hover:bg-slate-50 hover:text-blue-600 transition-colors"
          title="Center on my location"
        >
          <LocateFixed className="w-4 h-4 text-blue-600" />
          <span className="hidden sm:inline">Near Me</span>
        </button>

        <button
          onClick={() => setMapTileStyle((prev) => (prev === 'positron' ? 'osm' : 'positron'))}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white/95 backdrop-blur-md rounded-lg shadow-md border border-slate-200/80 hover:bg-slate-50 transition-colors"
          title="Switch Map Tiles"
        >
          <Layers className="w-4 h-4 text-slate-600" />
          <span className="hidden sm:inline">
            {mapTileStyle === 'positron' ? 'Light Road' : 'Street Map'}
          </span>
        </button>
      </div>

      {/* Quick Legend at bottom left of map */}
      <div className="absolute bottom-4 left-4 z-20 hidden md:flex items-center gap-3 px-3 py-1.5 bg-white/90 backdrop-blur-md rounded-lg border border-slate-200/80 text-[11px] shadow-sm">
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          <span className="text-slate-600">Ample (&gt;30)</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          <span className="text-slate-600">Moderate</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
          <span className="text-slate-600">Limited (&lt;10)</span>
        </div>
      </div>
    </div>
  );
};
