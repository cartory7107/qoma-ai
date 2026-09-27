import {
  Brain,
  Globe,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Settings,
  Share2,
  ShieldAlert,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { AppSettings, PersonalityType } from '../types';
import { getProviderMeta } from '../utils/aiProviders';

interface HeaderProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onOpenSettings: (tab?: 'providers' | 'ollama' | 'custom' | 'memory' | 'web') => void;
  onOpenErrorLogs: () => void;
  errorCount?: number;
  memoryTraitCount?: number;
  onToggleSidebar: () => void;
  onNewChat: () => void;
  onExportChat: () => void;
  isSidebarOpen: boolean;
}

export default function Header({
  settings,
  onUpdateSettings,
  onOpenSettings,
  onOpenErrorLogs,
  errorCount = 0,
  memoryTraitCount = 0,
  onToggleSidebar,
  onNewChat,
  onExportChat,
  isSidebarOpen,
}: HeaderProps) {
  const activeProv = settings.authMode === 'coupon' ? 'coupon' : (settings.activeProvider || 'openai');
  const activeMeta = getProviderMeta(activeProv);
  const activeProvConfig = settings.providerConfigs?.[activeProv] || {
    endpoint: activeMeta.defaultEndpoint,
    apiKey: '',
    model: activeMeta.defaultModel,
    temperature: 0.7,
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-zinc-200 bg-white/95 px-3 md:px-5 backdrop-blur-md text-zinc-900 shadow-xs">
      {/* Left: Sidebar toggle & Brand Identity */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={onToggleSidebar}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 cursor-pointer"
          title={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
        >
          {isSidebarOpen ? (
            <PanelLeftClose className="h-4 w-4" />
          ) : (
            <PanelLeftOpen className="h-4 w-4" />
          )}
        </button>

        <div className="flex items-center gap-2.5">
          {/* Cartory Qoma AI Logo Mark */}
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white font-mono font-bold text-xs shadow-xs">
            Q
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-bold tracking-tight text-zinc-900 text-sm md:text-base">
                Cartory <span className="text-indigo-600 font-extrabold">QOMA AI</span>
              </span>
              <span className="inline-flex items-center rounded-full bg-indigo-50 border border-indigo-200 px-1.5 py-0.2 text-[10px] font-mono font-semibold text-indigo-700">
                v7.0
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Middle: Active Model & Mode Indicator */}
      <div className="hidden lg:flex items-center gap-2">
        <button
          onClick={() => onOpenSettings('providers')}
          className="flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs text-zinc-700 transition-all hover:border-zinc-300 hover:bg-zinc-100 cursor-pointer shadow-xs"
        >
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-zinc-500 font-medium">Model:</span>
          <span className="font-semibold text-zinc-900">
            {settings.authMode === 'coupon'
              ? `Qoma AI version 7.0`
              : `${activeMeta.name} • ${activeProvConfig.model || activeMeta.defaultModel}`}
          </span>
        </button>

        {/* Dynamic Memory Indicator */}
        <button
          onClick={() => onOpenSettings('memory')}
          className="flex items-center gap-1.5 rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-xs text-purple-700 hover:bg-purple-100 transition-colors cursor-pointer shadow-xs"
          title="Open AI Personality & Dynamic Memory Settings"
        >
          <Brain className="h-3.5 w-3.5 text-purple-600" />
          <span>Memory ({memoryTraitCount} Traits)</span>
        </button>

        {/* Real-time Diagnostics Button */}
        <button
          onClick={onOpenErrorLogs}
          className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-mono transition-colors cursor-pointer shadow-xs ${
            errorCount > 0
              ? 'border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100'
              : 'border-zinc-200 bg-zinc-50 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
          }`}
          title="Open Real-time Error Diagnostics & Logs"
        >
          <ShieldAlert className="h-3.5 w-3.5" />
          <span>Diagnostics {errorCount > 0 ? `(${errorCount})` : ''}</span>
        </button>

        {settings.webSearchEnabled && (
          <div className="flex items-center gap-1 rounded-full border border-cyan-200 bg-cyan-50 px-2.5 py-1 text-[11px] font-medium text-cyan-800">
            <Globe className="h-3 w-3 text-cyan-600" />
            <span>Live Search</span>
          </div>
        )}
      </div>

      {/* Right Action Buttons */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={onNewChat}
          className="hidden sm:flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-medium text-zinc-800 transition-colors hover:bg-zinc-100 hover:text-zinc-950 cursor-pointer shadow-xs"
          title="Start fresh conversation"
        >
          <Plus className="h-3.5 w-3.5 text-zinc-600" />
          <span>New Chat</span>
        </button>

        {/* Audio Mute/Unmute */}
        <button
          onClick={() =>
            onUpdateSettings({ ...settings, soundEnabled: !settings.soundEnabled })
          }
          className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-colors cursor-pointer ${
            settings.soundEnabled
              ? 'border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100'
              : 'border-zinc-200 bg-white text-zinc-400 hover:text-zinc-600'
          }`}
          title={settings.soundEnabled ? 'Audio Chimes Active (Click to mute)' : 'Audio Chimes Muted'}
        >
          {settings.soundEnabled ? (
            <Volume2 className="h-3.5 w-3.5" />
          ) : (
            <VolumeX className="h-3.5 w-3.5" />
          )}
        </button>

        {/* Export / Share */}
        <button
          onClick={onExportChat}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 cursor-pointer shadow-xs"
          title="Export Conversation (Markdown)"
        >
          <Share2 className="h-3.5 w-3.5" />
        </button>

        {/* Settings Button */}
        <button
          onClick={() => onOpenSettings()}
          className="flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer shadow-xs"
          title="API Keys & Settings"
        >
          <Settings className="h-3.5 w-3.5 text-white" />
          <span>Settings</span>
        </button>
      </div>
    </header>
  );
}
