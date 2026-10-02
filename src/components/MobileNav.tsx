import React from 'react';
import { Map, List, Star, Key } from 'lucide-react';

interface MobileNavProps {
  currentTab: 'map' | 'list';
  onChangeTab: (tab: 'map' | 'list') => void;
  showFavoritesOnly: boolean;
  onToggleFavorites: () => void;
  favoritesCount: number;
  onOpenApiKeyModal: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  currentTab,
  onChangeTab,
  showFavoritesOnly,
  onToggleFavorites,
  favoritesCount,
  onOpenApiKeyModal,
}) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 pb-safe">
      <div className="grid grid-cols-4 items-center h-14">
        {/* Map Tab */}
        <button
          type="button"
          onClick={() => {
            if (showFavoritesOnly) onToggleFavorites();
            onChangeTab('map');
          }}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
            currentTab === 'map' && !showFavoritesOnly
              ? 'text-blue-600 font-semibold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Map className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Map</span>
        </button>

        {/* List Tab */}
        <button
          type="button"
          onClick={() => {
            if (showFavoritesOnly) onToggleFavorites();
            onChangeTab('list');
          }}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
            currentTab === 'list' && !showFavoritesOnly
              ? 'text-blue-600 font-semibold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <List className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">List</span>
        </button>

        {/* Saved Tab */}
        <button
          type="button"
          onClick={onToggleFavorites}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors relative ${
            showFavoritesOnly
              ? 'text-amber-500 font-semibold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Star className={`w-5 h-5 ${showFavoritesOnly ? 'fill-amber-400' : ''}`} />
          <span className="text-[10px] mt-0.5">Saved</span>
          {favoritesCount > 0 && (
            <span className="absolute top-2 right-6 w-4 h-4 rounded-full bg-amber-500 text-white text-[9px] font-bold flex items-center justify-center">
              {favoritesCount}
            </span>
          )}
        </button>

        {/* API Settings */}
        <button
          type="button"
          onClick={onOpenApiKeyModal}
          className="flex flex-col items-center justify-center h-full min-h-[44px] text-slate-500 hover:text-slate-900 transition-colors"
        >
          <Key className="w-5 h-5 text-slate-600" />
          <span className="text-[10px] mt-0.5">API Keys</span>
        </button>
      </div>
    </div>
  );
};
