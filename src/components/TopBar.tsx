import React from 'react';
import { Key, Star, RefreshCw, LayoutGrid, Map as MapIcon, SlidersHorizontal } from 'lucide-react';

interface TopBarProps {
  viewMode: 'split' | 'map' | 'list';
  onChangeViewMode: (mode: 'split' | 'map' | 'list') => void;
  showFavoritesOnly: boolean;
  onToggleFavoritesOnly: () => void;
  favoritesCount: number;
  onOpenApiKeyModal: () => void;
  onRefreshData: () => void;
  isRefreshing: boolean;
  hasCustomKey: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  viewMode,
  onChangeViewMode,
  showFavoritesOnly,
  onToggleFavoritesOnly,
  favoritesCount,
  onOpenApiKeyModal,
  onRefreshData,
  isRefreshing,
  hasCustomKey,
}) => {
  return (
    <header className="h-14 border-b border-slate-200 bg-white px-4 sm:px-6 flex items-center justify-between z-30 shrink-0">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3">
        <a href="/" className="text-lg font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
            P
          </span>
          <span>ParkSG</span>
        </a>
      </div>

      {/* Zone 2: Navigation Links / View Switcher (Single-Line Controls) */}
      <nav className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
        <button
          type="button"
          onClick={() => onChangeViewMode('split')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
            viewMode === 'split' && !showFavoritesOnly
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Split View
        </button>
        <button
          type="button"
          onClick={() => onChangeViewMode('map')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
            viewMode === 'map' && !showFavoritesOnly
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Map Only
        </button>
        <button
          type="button"
          onClick={() => onChangeViewMode('list')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
            viewMode === 'list' && !showFavoritesOnly
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          List Only
        </button>
        <button
          type="button"
          onClick={onToggleFavoritesOnly}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            showFavoritesOnly
              ? 'bg-amber-500 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Star className="w-3.5 h-3.5 fill-current" />
          <span>Saved ({favoritesCount})</span>
        </button>
      </nav>

      {/* Zone 3: Primary Actions */}
      <div className="flex items-center gap-2">
        {/* Refresh Trigger */}
        <button
          type="button"
          onClick={onRefreshData}
          disabled={isRefreshing}
          className="p-2 text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
          title="Refresh real-time lot availability"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
        </button>

        {/* API Key Modal Button */}
        <button
          type="button"
          onClick={onOpenApiKeyModal}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors whitespace-nowrap shadow-2xs"
        >
          <Key className="w-3.5 h-3.5 text-blue-600" />
          <span className="hidden sm:inline">API Keys</span>
          {hasCustomKey && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          )}
        </button>
      </div>
    </header>
  );
};
