import React, { useState } from 'react';
import { ApiKeyConfig } from '../types/carpark';
import {
  X,
  Key,
  ShieldCheck,
  ExternalLink,
  Check,
  AlertCircle,
  Server,
  Layers,
  Sparkles,
} from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ApiKeyConfig;
  onSaveConfig: (newConfig: ApiKeyConfig) => void;
  apiStatusMessage: string;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  apiStatusMessage,
}) => {
  const [dataGovSgKey, setDataGovSgKey] = useState(config.dataGovSgKey);
  const [ltaDatamallKey, setLtaDatamallKey] = useState(config.ltaDatamallKey);
  const [googleMapsKey, setGoogleMapsKey] = useState(config.googleMapsKey);
  const [oneMapToken, setOneMapToken] = useState(config.oneMapToken);
  const [dataSourceMode, setDataSourceMode] = useState<
    'live_hybrid' | 'mock_only' | 'custom_api'
  >(config.dataSourceMode);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig({
      dataGovSgKey: dataGovSgKey.trim(),
      ltaDatamallKey: ltaDatamallKey.trim(),
      googleMapsKey: googleMapsKey.trim(),
      oneMapToken: oneMapToken.trim(),
      dataSourceMode,
    });
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1000);
  };

  const handleClear = () => {
    setDataGovSgKey('');
    setLtaDatamallKey('');
    setGoogleMapsKey('');
    setOneMapToken('');
    onSaveConfig({
      dataGovSgKey: '',
      ltaDatamallKey: '',
      googleMapsKey: '',
      oneMapToken: '',
      dataSourceMode: 'live_hybrid',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                API Keys & Live Data Sources
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Front-end is fully functional now. Add your keys whenever ready.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          {/* Current Status banner */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2.5 text-xs">
            <Server className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-slate-800">
                Data Connection Status
              </div>
              <div className="text-slate-500 mt-0.5 font-mono text-[11px]">
                {apiStatusMessage}
              </div>
            </div>
          </div>

          {/* Key 1: Data.gov.sg */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                <span>Data.gov.sg API Key</span>
                <span className="text-[10px] font-normal text-slate-500">(Optional)</span>
              </label>
              <a
                href="https://data.gov.sg/developers"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-blue-600 hover:underline flex items-center gap-0.5"
              >
                <span>Get free key</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <input
              type="password"
              placeholder="e.g. dsg_live_••••••••••••••••"
              value={dataGovSgKey}
              onChange={(e) => setDataGovSgKey(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-800 placeholder-slate-400"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Connects directly to the Singapore Government Carpark Availability endpoint.
            </p>
          </div>

          {/* Key 2: LTA DataMall AccountKey */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                <span>LTA DataMall AccountKey</span>
                <span className="text-[10px] font-normal text-slate-500">(Optional)</span>
              </label>
              <a
                href="https://datamall.lta.gov.sg/content/datamall/en/request-for-api.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-blue-600 hover:underline flex items-center gap-0.5"
              >
                <span>Request LTA Key</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <input
              type="password"
              placeholder="e.g. lta_acc_••••••••••••••••"
              value={ltaDatamallKey}
              onChange={(e) => setLtaDatamallKey(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-800 placeholder-slate-400"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              For Land Transport Authority real-time mall & commercial carpark feeds.
            </p>
          </div>

          {/* Key 3: Google Maps Platform API Key */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                <span>Google Maps API Key</span>
                <span className="text-[10px] font-normal text-slate-500">(Optional)</span>
              </label>
              <a
                href="https://developers.google.com/maps/documentation/javascript/get-api-key"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-blue-600 hover:underline flex items-center gap-0.5"
              >
                <span>Google Console</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <input
              type="password"
              placeholder="e.g. AIzaSy••••••••••••••••••••••••"
              value={googleMapsKey}
              onChange={(e) => setGoogleMapsKey(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-800 placeholder-slate-400"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              For native Google Maps JavaScript SDK and Places search integration.
            </p>
          </div>

          {/* Local storage privacy notice */}
          <div className="pt-2 text-[11px] text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>All keys are securely preserved in your local browser storage.</span>
          </div>

          {/* Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleClear}
              className="px-3 py-2 text-xs text-slate-600 hover:text-slate-800 transition-colors"
            >
              Reset to Defaults
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
              >
                {saveSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <span>Save Configuration</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
