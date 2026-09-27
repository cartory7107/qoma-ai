import { useState } from 'react';
import {
  Brain,
  Check,
  Edit2,
  Globe,
  Key,
  MessageSquare,
  Plus,
  Search,
  ShieldAlert,
  Trash2,
  X,
} from 'lucide-react';
import {
  ChatSession,
  PersonalityType,
  AppSettings,
} from '../types';
import { getProviderMeta, TOP_20_PROVIDERS } from '../utils/aiProviders';

const PERSONALITIES: { id: PersonalityType; title: string; icon: string }[] = [
  { id: 'balanced', title: 'Balanced', icon: '⚡' },
  { id: 'creative', title: 'Creative', icon: '🎨' },
  { id: 'coder', title: 'Coding Master', icon: '💻' },
  { id: 'analytical', title: 'Analytical', icon: '🔬' },
  { id: 'concise', title: 'Concise', icon: '🎯' },
  { id: 'companion', title: 'Companion', icon: '🤝' },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
  onRenameSession: (id: string, newTitle: string) => void;
  currentPersonality: PersonalityType;
  onSelectPersonality: (p: PersonalityType) => void;
  onOpenSettings: (tab?: 'providers' | 'ollama' | 'custom' | 'memory' | 'web') => void;
  onOpenErrorLogs: () => void;
  onToggleWebSearch?: () => void;
  errorCount?: number;
  memoryTraitCount?: number;
  settings: AppSettings;
}

export default function Sidebar({
  isOpen,
  onClose,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onRenameSession,
  currentPersonality,
  onSelectPersonality,
  onOpenSettings,
  onOpenErrorLogs,
  onToggleWebSearch,
  errorCount = 0,
  memoryTraitCount = 0,
  settings,
}: SidebarProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleStartRename = (session: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(session.id);
    setEditingTitle(session.title);
  };

  const handleSaveRename = (sessionId: string, e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (editingTitle.trim()) {
      onRenameSession(sessionId, editingTitle.trim());
    }
    setEditingId(null);
  };

  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  const activeProv = settings.authMode === 'coupon' ? 'coupon' : (settings.activeProvider || 'openai');
  const meta = getProviderMeta(activeProv);
  const provConfig = settings.providerConfigs?.[activeProv] || {
    endpoint: meta.defaultEndpoint,
    apiKey: '',
    model: meta.defaultModel,
  };

  return (
    <>
      {/* Mobile Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs md:hidden transition-opacity"
      />

      {/* Sidebar (Clean White & Zinc-50 Theme) */}
      <aside className="fixed inset-y-0 left-0 z-50 flex w-72 md:w-80 flex-col border-r border-zinc-200 bg-zinc-50 p-3.5 backdrop-blur-md transition-transform md:static md:translate-x-0 text-zinc-900 shadow-xs">
        {/* Top Header & Brand */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white font-mono font-bold text-xs shadow-xs">
              Q
            </div>
            <div>
              <h2 className="text-xs font-bold text-zinc-900 tracking-tight">Cartory QOMA AI</h2>
              <p className="text-[10px] text-zinc-500 font-medium">Qoma AI version 7.0</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-200 hover:text-zinc-800 md:hidden cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Primary Navigation Tabs */}
        <div className="pt-3 pb-2 space-y-1 border-b border-zinc-200">
          <button
            onClick={() => {
              if (window.innerWidth < 768) onClose();
            }}
            className="flex w-full items-center justify-between rounded-lg bg-white border border-zinc-200 shadow-xs px-2.5 py-1.5 text-xs font-semibold text-zinc-900 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-indigo-600" />
              <span>Chat Workspace</span>
            </div>
            <span className="text-[10px] font-mono text-zinc-500">{sessions.length} chats</span>
          </button>

          <button
            onClick={() => {
              onOpenSettings('providers');
              if (window.innerWidth < 768) onClose();
            }}
            className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Key className="h-4 w-4 text-zinc-500" />
              <span>AI Providers & Keys</span>
            </div>
            <span className="text-[10px] font-mono rounded bg-zinc-200/70 border border-zinc-300/60 px-1.5 py-0.2 text-zinc-700">
              {TOP_20_PROVIDERS.length}+
            </span>
          </button>

          <button
            onClick={() => {
              onOpenSettings('memory');
              if (window.innerWidth < 768) onClose();
            }}
            className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-purple-600" />
              <span>AI Memory & Persona</span>
            </div>
            <span className="text-[10px] font-mono rounded bg-purple-50 border border-purple-200 px-1.5 py-0.2 text-purple-700 font-semibold">
              {memoryTraitCount} Traits
            </span>
          </button>

          {/* Web Search & Real-time Live Data Status */}
          <button
            onClick={() => {
              onOpenSettings('web');
              if (window.innerWidth < 768) onClose();
            }}
            className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Globe className={`h-4 w-4 ${settings.webSearchEnabled ? 'text-cyan-600' : 'text-zinc-400'}`} />
              <span>Web Search & Live Data</span>
            </div>
            <span
              onClick={(e) => {
                e.stopPropagation();
                onToggleWebSearch?.();
              }}
              className={`rounded px-1.5 py-0.2 text-[10px] font-mono font-medium border transition-colors cursor-pointer ${
                settings.webSearchEnabled
                  ? 'bg-cyan-50 text-cyan-700 border-cyan-300'
                  : 'bg-zinc-100 text-zinc-500 border-zinc-200'
              }`}
              title="Click to toggle live web search"
            >
              {settings.webSearchEnabled ? 'Active' : 'Off'}
            </span>
          </button>

          <button
            onClick={() => {
              onOpenErrorLogs();
              if (window.innerWidth < 768) onClose();
            }}
            className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-amber-500" />
              <span>Diagnostics & Error Logs</span>
            </div>
            {errorCount > 0 ? (
              <span className="text-[10px] font-mono rounded bg-amber-100 text-amber-800 border border-amber-200 px-1.5 py-0.2 font-semibold">
                {errorCount}
              </span>
            ) : (
              <span className="text-[10px] font-mono text-emerald-600">Live</span>
            )}
          </button>
        </div>

        {/* New Chat Button */}
        <div className="pt-3">
          <button
            onClick={() => {
              onNewChat();
              if (window.innerWidth < 768) onClose();
            }}
            className="flex w-full items-center justify-between rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs font-semibold text-zinc-800 shadow-xs transition-all hover:bg-zinc-100 hover:text-zinc-950 active:scale-[0.99] cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Plus className="h-4 w-4 text-indigo-600" />
              <span>New Conversation</span>
            </span>
            <kbd className="hidden sm:inline-block rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-mono text-zinc-600 border border-zinc-200">
              ⌘N
            </kbd>
          </button>
        </div>

        {/* Search Chats Input */}
        <div className="relative mt-2.5">
          <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="w-full rounded-lg border border-zinc-200 bg-white py-1.5 pl-8 pr-3 text-xs text-zinc-800 placeholder-zinc-400 focus:border-indigo-500 focus:outline-none shadow-xs"
          />
        </div>

        {/* Session List */}
        <div className="flex-1 overflow-y-auto mt-3 pr-1 space-y-1">
          <div className="px-1 pb-1 text-[10px] font-mono font-medium uppercase tracking-wider text-zinc-500">
            Recent Conversations ({filteredSessions.length})
          </div>

          <div className="space-y-0.5">
            {filteredSessions.length === 0 ? (
              <div className="py-6 text-center text-xs text-zinc-500">
                {searchQuery ? 'No matching chats' : 'No chats yet'}
              </div>
            ) : (
              filteredSessions.map((session) => {
                const isActive = session.id === activeSessionId;
                const isEditing = editingId === session.id;

                return (
                  <div
                    key={session.id}
                    onClick={() => {
                      if (!isEditing) {
                        onSelectSession(session.id);
                        if (window.innerWidth < 768) onClose();
                      }
                    }}
                    className={`group relative flex items-center justify-between rounded-lg px-2.5 py-2 text-xs transition-all cursor-pointer ${
                      isActive
                        ? 'bg-white border border-zinc-200/80 text-zinc-900 font-semibold shadow-xs'
                        : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <MessageSquare
                        className={`h-3.5 w-3.5 shrink-0 ${
                          isActive ? 'text-indigo-600' : 'text-zinc-400'
                        }`}
                      />

                      {isEditing ? (
                        <form
                          onSubmit={(e) => handleSaveRename(session.id, e)}
                          className="flex-1 min-w-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="text"
                            autoFocus
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            onBlur={() => handleSaveRename(session.id)}
                            className="w-full rounded bg-white px-1.5 py-0.5 text-xs text-zinc-900 border border-indigo-500 focus:outline-none"
                          />
                        </form>
                      ) : (
                        <span className="truncate text-xs">{session.title}</span>
                      )}
                    </div>

                    {!isEditing && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => handleStartRename(session, e)}
                          className="rounded p-1 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200 cursor-pointer"
                          title="Rename"
                        >
                          <Edit2 className="h-3 w-3" />
                        </button>
                        {sessions.length > 1 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteSession(session.id);
                            }}
                            className="rounded p-1 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Persona Mode & Active API Status */}
        <div className="mt-auto pt-3 border-t border-zinc-200 space-y-2.5">
          {/* Persona quick switch */}
          <div>
            <div className="mb-1.5 px-1 flex items-center justify-between text-[10px] font-mono font-medium uppercase tracking-wider text-zinc-500">
              <span>Persona Profile</span>
              <span className="text-indigo-600 font-sans normal-case text-[11px] font-semibold">
                {PERSONALITIES.find((p) => p.id === currentPersonality)?.icon}{' '}
                {currentPersonality}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1">
              {PERSONALITIES.slice(0, 3).map((p) => {
                const isSelected = currentPersonality === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => onSelectPersonality(p.id)}
                    className={`rounded-md px-1.5 py-1 text-[10px] text-center font-medium transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                        : 'bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900'
                    }`}
                  >
                    {p.title}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active API System Status Card */}
          <div
            onClick={() => onOpenSettings('providers')}
            className="group cursor-pointer rounded-xl border border-zinc-200 bg-white hover:border-zinc-300 p-2.5 transition-all text-zinc-800 shadow-xs"
          >
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-zinc-900 font-medium">
                  {meta.name}
                </span>
              </span>
              <span className="text-[10px] font-mono text-indigo-600 group-hover:underline font-semibold">
                Configure
              </span>
            </div>
            <p className="mt-1 text-[11px] font-mono text-zinc-500 truncate">
              {settings.authMode === 'coupon' ? 'Qoma AI v7.0' : (provConfig.model || meta.defaultModel)}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
