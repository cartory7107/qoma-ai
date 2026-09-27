import { useState, useEffect } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Brain,
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  Globe,
  Info,
  Key,
  Layers,
  Loader2,
  Plus,
  RefreshCw,
  RotateCcw,
  Server,
  Shield,
  ShieldAlert,
  Sliders,
  Sparkles,
  Ticket,
  Trash2,
  User,
  Wrench,
  X,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  AppSettings,
  AIProviderId,
  CustomProvider,
  ErrorDiagnostic,
  FormalityTone,
  FriendlinessLevel,
  MemoryCategory,
  ProviderConfig,
  ResponseLengthPref,
  UserMemoryTrait,
  AIMemoryProfile,
  WebSource,
} from '../types';
import { AI_PROVIDERS, getProviderMeta, TOP_20_PROVIDERS } from '../utils/aiProviders';
import { executeWebSearch } from '../utils/clientWebSearch';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (newSettings: AppSettings) => void;
  initialProvider?: AIProviderId;
  initialTab?: 'providers' | 'ollama' | 'custom' | 'memory' | 'web';
  memoryProfile: AIMemoryProfile;
  onSaveMemoryProfile: (newProfile: AIMemoryProfile) => void;
  onOpenErrorLogs?: () => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  initialProvider,
  initialTab = 'providers',
  memoryProfile,
  onSaveMemoryProfile,
  onOpenErrorLogs,
}: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'providers' | 'ollama' | 'custom' | 'memory' | 'web'>(initialTab);
  const [formData, setFormData] = useState<AppSettings>(settings);
  const [selectedProviderId, setSelectedProviderId] = useState<AIProviderId>(
    initialProvider || settings.activeProvider || 'openai'
  );
  const [showApiKey, setShowApiKey] = useState(false);
  const [showOllamaSecret, setShowOllamaSecret] = useState(false);
  const [customModelInput, setCustomModelInput] = useState('');

  // Memory Profile editing state
  const [localProfile, setLocalProfile] = useState<AIMemoryProfile>(memoryProfile);
  const [newTraitText, setNewTraitText] = useState('');
  const [newTraitCategory, setNewTraitCategory] = useState<MemoryCategory>('technical');
  const [editingTraitId, setEditingTraitId] = useState<string | null>(null);
  const [editingTraitText, setEditingTraitText] = useState('');

  // Custom provider creation state
  const [newCustomName, setNewCustomName] = useState('');
  const [newCustomEndpoint, setNewCustomEndpoint] = useState('https://api.openai.com/v1');
  const [newCustomApiKey, setNewCustomApiKey] = useState('');
  const [newCustomModel, setNewCustomModel] = useState('gpt-4o');

  // Connection probe test state
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    ok?: boolean;
    message?: string;
    error?: string;
    errorCode?: string;
    errorTitle?: string;
    exactProblem?: string;
    solution?: string;
    endpointAttempted?: string;
    httpStatus?: number | string;
    providerName?: string;
    models?: string[];
  } | null>(null);

  // Real-time Web Search test state
  const [testSearchQuery, setTestSearchQuery] = useState('');
  const [isSearchingWeb, setIsSearchingWeb] = useState(false);
  const [searchTestResults, setSearchTestResults] = useState<WebSource[] | null>(null);
  const [searchFeedback, setSearchFeedback] = useState<string | null>(null);

  const handleTestWebSearch = async () => {
    if (!testSearchQuery.trim()) return;
    setIsSearchingWeb(true);
    setSearchFeedback(null);
    try {
      const resp = await executeWebSearch(testSearchQuery.trim());
      if (resp.ok && resp.results.length > 0) {
        setSearchTestResults(resp.results);
        setSearchFeedback(`Retrieved ${resp.results.length} live citations via DuckDuckGo at ${new Date().toLocaleTimeString()}`);
      } else {
        setSearchTestResults([]);
        setSearchFeedback('No live results found. Check query or network connection.');
      }
    } catch (e: any) {
      setSearchFeedback(`Search probe failed: ${e.message}`);
    } finally {
      setIsSearchingWeb(false);
    }
  };

  useEffect(() => {
    setFormData(settings);
    if (initialProvider) {
      setSelectedProviderId(initialProvider);
    } else if (settings.activeProvider) {
      setSelectedProviderId(settings.activeProvider);
    }
    setTestResult(null);
  }, [settings, isOpen, initialProvider]);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);

  useEffect(() => {
    setLocalProfile(memoryProfile);
  }, [memoryProfile]);

  if (!isOpen) return null;

  const activeMeta = getProviderMeta(selectedProviderId);
  const currentProviderConfig: ProviderConfig = formData.providerConfigs[selectedProviderId] || {
    endpoint: activeMeta.defaultEndpoint,
    apiKey: '',
    model: activeMeta.defaultModel,
    temperature: 0.7,
  };

  const updateCurrentProviderConfig = (updates: Partial<ProviderConfig>) => {
    setFormData((prev) => {
      const existing = prev.providerConfigs[selectedProviderId] || {
        endpoint: activeMeta.defaultEndpoint,
        apiKey: '',
        model: activeMeta.defaultModel,
        temperature: 0.7,
      };
      return {
        ...prev,
        providerConfigs: {
          ...prev.providerConfigs,
          [selectedProviderId]: {
            ...existing,
            ...updates,
          },
        },
      };
    });
  };

  const updateOllamaSettings = (updates: Partial<typeof formData.ollamaSettings>) => {
    setFormData((prev) => ({
      ...prev,
      ollamaSettings: {
        ...prev.ollamaSettings,
        ...updates,
      },
    }));
  };

  // Test connection for current active configuration
  const handleTestConnection = async (targetProviderId?: string, overrideConfig?: any) => {
    const provId = targetProviderId || selectedProviderId;
    const meta = getProviderMeta(provId);
    const cfg = overrideConfig || (provId === 'ollama' ? formData.ollamaSettings : formData.providerConfigs[provId] || {});

    setIsTesting(true);
    setTestResult(null);

    const payload = {
      provider: provId,
      endpoint: cfg.endpoint || meta.defaultEndpoint,
      apiKey: (cfg.apiKey || cfg.secretKey || '').trim(),
      model: cfg.model || meta.defaultModel,
    };

    try {
      const res = await fetch('/api/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.ok) {
        setTestResult({
          ok: true,
          message: data.message || `Successfully connected to ${meta.name}!`,
          providerName: meta.name,
          models: data.models,
        });
        confetti({
          particleCount: 30,
          spread: 55,
          origin: { y: 0.7 },
          colors: ['#4f46e5', '#10b981', '#6366f1'],
        });
      } else {
        setTestResult({
          ok: false,
          error: data.error || 'Connection probe failed.',
          errorCode: data.errorCode || 'UNKNOWN_ERROR',
          errorTitle: data.errorTitle || `${meta.name} Connection Error`,
          exactProblem: data.exactProblem || 'Server returned an error.',
          solution: data.solution || 'Verify your credentials and try again.',
          endpointAttempted: data.endpointAttempted || payload.endpoint,
          httpStatus: data.httpStatus || res.status,
          providerName: meta.name,
        });
      }
    } catch (err: any) {
      setTestResult({
        ok: false,
        error: err.message,
        errorCode: 'NETWORK_ERROR',
        errorTitle: 'Network / CORS Error',
        exactProblem: `Failed to fetch from ${payload.endpoint}. Check your internet connection or local CORS rules.`,
        solution: 'Make sure the endpoint is accessible publicly or tunnelled via ngrok.',
        endpointAttempted: payload.endpoint,
        httpStatus: 'Connection Failed',
        providerName: meta.name,
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveAll = () => {
    const finalSettings = { ...formData, hasPromptedApiKey: true };
    if (customModelInput.trim()) {
      updateCurrentProviderConfig({ model: customModelInput.trim() });
      finalSettings.providerConfigs[selectedProviderId].model = customModelInput.trim();
    }
    onSaveSettings(finalSettings);
    onSaveMemoryProfile(localProfile);
    onClose();
  };

  // Memory Profile handlers
  const handleUpdatePersonaConfig = (updates: Partial<typeof localProfile.config>) => {
    setLocalProfile((prev) => ({
      ...prev,
      config: {
        ...prev.config,
        ...updates,
      },
    }));
  };

  const handleAddCustomTrait = () => {
    if (!newTraitText.trim()) return;
    const newTrait: UserMemoryTrait = {
      id: `trait-manual-${Date.now()}`,
      category: newTraitCategory,
      trait: newTraitText.trim(),
      confidence: 100,
      timestamp: Date.now(),
      source: 'User configured manually',
    };
    setLocalProfile((prev) => ({
      ...prev,
      traits: [newTrait, ...prev.traits],
    }));
    setNewTraitText('');
  };

  const handleDeleteTrait = (id: string) => {
    setLocalProfile((prev) => ({
      ...prev,
      traits: prev.traits.filter((t) => t.id !== id),
    }));
  };

  const handleSaveEditTrait = (id: string) => {
    if (!editingTraitText.trim()) return;
    setLocalProfile((prev) => ({
      ...prev,
      traits: prev.traits.map((t) => (t.id === id ? { ...t, trait: editingTraitText.trim() } : t)),
    }));
    setEditingTraitId(null);
  };

  const handleClearAllTraits = () => {
    if (confirm('Clear all learned user traits and memory context? The AI will forget previously learned preferences.')) {
      setLocalProfile((prev) => ({
        ...prev,
        traits: [],
      }));
    }
  };

  // Custom provider creation
  const handleAddCustomProvider = () => {
    if (!newCustomName.trim() || !newCustomEndpoint.trim()) return;
    const newP: CustomProvider = {
      id: `custom-${Date.now()}`,
      name: newCustomName.trim(),
      endpoint: newCustomEndpoint.trim(),
      apiKey: newCustomApiKey.trim(),
      model: newCustomModel.trim() || 'default-model',
      temperature: 0.7,
    };
    setFormData((prev) => ({
      ...prev,
      customProviders: [...prev.customProviders, newP],
      activeCustomProviderId: newP.id,
      activeProvider: 'custom',
    }));
    setNewCustomName('');
    setNewCustomEndpoint('https://api.openai.com/v1');
    setNewCustomApiKey('');
    setNewCustomModel('gpt-4o');
  };

  const handleDeleteCustomProvider = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      customProviders: prev.customProviders.filter((p) => p.id !== id),
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative flex flex-col w-full max-w-3xl max-h-[90vh] rounded-2xl border border-zinc-200 bg-white text-zinc-900 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 bg-zinc-50">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white font-mono font-bold text-xs shadow-xs">
              Q
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 tracking-tight">Cartory QOMA AI Settings</h2>
              <p className="text-xs text-zinc-500">
                Configure Top 20 Global Providers, Ollama Instances, Custom Endpoints & Dynamic Memory
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-200 hover:text-zinc-800 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-zinc-200 bg-zinc-50 px-6 overflow-x-auto text-xs font-medium">
          <button
            onClick={() => setActiveTab('providers')}
            className={`flex items-center gap-2 border-b-2 px-3 py-3 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'providers'
                ? 'border-indigo-600 text-indigo-700 font-semibold'
                : 'border-transparent text-zinc-500 hover:text-zinc-900'
            }`}
          >
            <Key className="h-3.5 w-3.5 text-indigo-600" />
            <span>Top 20 Providers</span>
          </button>

          <button
            onClick={() => setActiveTab('ollama')}
            className={`flex items-center gap-2 border-b-2 px-3 py-3 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'ollama'
                ? 'border-indigo-600 text-indigo-700 font-semibold'
                : 'border-transparent text-zinc-500 hover:text-zinc-900'
            }`}
          >
            <Server className="h-3.5 w-3.5 text-emerald-600" />
            <span>Ollama Integration</span>
          </button>

          <button
            onClick={() => setActiveTab('custom')}
            className={`flex items-center gap-2 border-b-2 px-3 py-3 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'custom'
                ? 'border-indigo-600 text-indigo-700 font-semibold'
                : 'border-transparent text-zinc-500 hover:text-zinc-900'
            }`}
          >
            <Wrench className="h-3.5 w-3.5 text-amber-600" />
            <span>Custom Provider</span>
          </button>

          <button
            onClick={() => setActiveTab('memory')}
            className={`flex items-center gap-2 border-b-2 px-3 py-3 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'memory'
                ? 'border-indigo-600 text-indigo-700 font-semibold'
                : 'border-transparent text-zinc-500 hover:text-zinc-900'
            }`}
          >
            <Brain className="h-3.5 w-3.5 text-purple-600" />
            <span>AI Personality & Memory ({localProfile.traits.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('web')}
            className={`flex items-center gap-2 border-b-2 px-3 py-3 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'web'
                ? 'border-indigo-600 text-indigo-700 font-semibold'
                : 'border-transparent text-zinc-500 hover:text-zinc-900'
            }`}
          >
            <Globe className="h-3.5 w-3.5 text-cyan-600" />
            <span>Web Search & Live Data</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: TOP 20 GLOBAL PROVIDERS */}
          {activeTab === 'providers' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-white">Pre-Configured Top 20 Global Providers</h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Base endpoints and format specifications are hardcoded. Simply provide your API key.
                </p>
              </div>

              {/* Provider Quick Picker Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2">
                {TOP_20_PROVIDERS.map((prov) => {
                  const isSelected = selectedProviderId === prov.id;
                  const hasKey = Boolean(formData.providerConfigs[prov.id]?.apiKey);
                  return (
                    <button
                      key={prov.id}
                      onClick={() => {
                        setSelectedProviderId(prov.id);
                        setTestResult(null);
                        setCustomModelInput('');
                      }}
                      className={`relative flex flex-col items-start p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-950/30 text-white shadow-xs'
                          : 'border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-semibold text-xs text-zinc-200 truncate">{prov.name}</span>
                        {hasKey && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" title="API key configured" />}
                      </div>
                      <span className="text-[10px] text-zinc-500 font-mono mt-0.5 truncate">{prov.defaultModel}</span>
                    </button>
                  );
                })}
              </div>

              {/* Selected Provider Form */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">{activeMeta.name}</h4>
                      {activeMeta.badge && (
                        <span className="rounded bg-indigo-500/10 border border-indigo-500/30 px-2 py-0.5 text-[10px] font-mono text-indigo-300 font-semibold">
                          {activeMeta.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-400 mt-1">{activeMeta.description}</p>
                  </div>

                  {activeMeta.docsUrl && (
                    <a
                      href={activeMeta.docsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                    >
                      <span>Get API Key</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>

                {/* Base Endpoint (Hardcoded info) */}
                <div>
                  <label className="block text-xs font-mono font-medium text-zinc-400 mb-1">
                    Hardcoded Base Endpoint (No configuration required)
                  </label>
                  <div className="flex items-center gap-2 bg-zinc-950 px-3 py-2 rounded-lg border border-zinc-800 text-xs font-mono text-zinc-400">
                    <Server className="h-3.5 w-3.5 text-zinc-600 shrink-0" />
                    <span className="truncate">{activeMeta.defaultEndpoint}</span>
                  </div>
                </div>

                {/* API Key Input */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-zinc-300">
                      API Key
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="text-[11px] text-zinc-500 hover:text-zinc-300 flex items-center gap-1 cursor-pointer"
                    >
                      {showApiKey ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      <span>{showApiKey ? 'Hide' : 'Reveal'}</span>
                    </button>
                  </div>
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={currentProviderConfig.apiKey}
                    onChange={(e) => updateCurrentProviderConfig({ apiKey: e.target.value })}
                    placeholder={activeMeta.keyPlaceholder || 'Enter your API key...'}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-zinc-100 placeholder-zinc-600 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                {/* Model Selector */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1">
                      Model Selection
                    </label>
                    <select
                      value={currentProviderConfig.model || activeMeta.defaultModel}
                      onChange={(e) => updateCurrentProviderConfig({ model: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-zinc-100 focus:border-indigo-500 focus:outline-none cursor-pointer"
                    >
                      {activeMeta.models.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1">
                      Custom Model ID (Optional)
                    </label>
                    <input
                      type="text"
                      value={customModelInput}
                      onChange={(e) => {
                        setCustomModelInput(e.target.value);
                        updateCurrentProviderConfig({ model: e.target.value });
                      }}
                      placeholder="e.g. gpt-4o-2024-11-20"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-zinc-100 placeholder-zinc-600 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Test Connection Probe Button & Set Active */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => handleTestConnection()}
                    disabled={isTesting}
                    className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isTesting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                    <span>Test API Key & Connection</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        authMode: 'byok',
                        activeProvider: selectedProviderId,
                        activeModel: currentProviderConfig.model || activeMeta.defaultModel,
                      }));
                    }}
                    className={`flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors cursor-pointer ${
                      formData.activeProvider === selectedProviderId
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                    }`}
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span>{formData.activeProvider === selectedProviderId ? 'Active Engine' : 'Set as Active Engine'}</span>
                  </button>
                </div>

                {/* Inline Test Result Banner */}
                {testResult && (
                  <div
                    className={`rounded-xl border p-4 text-xs ${
                      testResult.ok
                        ? 'border-emerald-500/30 bg-emerald-950/20 text-emerald-200'
                        : 'border-rose-500/30 bg-rose-950/20 text-rose-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-semibold">
                      {testResult.ok ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                          <span>{testResult.message}</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="h-4 w-4 text-rose-400" />
                          <span>{testResult.errorTitle} ({testResult.errorCode})</span>
                        </>
                      )}
                    </div>
                    {!testResult.ok && (
                      <div className="mt-2 space-y-1.5 text-zinc-300">
                        <p>{testResult.exactProblem}</p>
                        {testResult.solution && (
                          <p className="text-indigo-300">
                            <strong>Recommendation:</strong> {testResult.solution}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: OLLAMA INTEGRATION */}
          {activeTab === 'ollama' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-white">Ollama Local & Tunnel Integration</h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Connect local Ollama servers or remote tunnels via secure bearer tokens.
                </p>
              </div>

              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-4">
                {/* Base URL input */}
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Ollama Base URL / Endpoint
                  </label>
                  <input
                    type="text"
                    value={formData.ollamaSettings.endpoint}
                    onChange={(e) => updateOllamaSettings({ endpoint: e.target.value })}
                    placeholder="http://localhost:11434 or https://tunnel.yourdomain.com"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-zinc-100 placeholder-zinc-600 focus:border-indigo-500 focus:outline-none"
                  />
                  <p className="text-[11px] text-zinc-500 mt-1">
                    Default is <code className="font-mono text-zinc-400">http://localhost:11434</code>. For remote tunnels, use Cloudflare Tunnels or Ngrok.
                  </p>
                </div>

                {/* Secret Key / Bearer Token */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-zinc-300">
                      Secret Key / Bearer Token (Optional)
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowOllamaSecret(!showOllamaSecret)}
                      className="text-[11px] text-zinc-500 hover:text-zinc-300 flex items-center gap-1 cursor-pointer"
                    >
                      {showOllamaSecret ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      <span>{showOllamaSecret ? 'Hide' : 'Reveal'}</span>
                    </button>
                  </div>
                  <input
                    type={showOllamaSecret ? 'text' : 'password'}
                    value={formData.ollamaSettings.secretKey || ''}
                    onChange={(e) => updateOllamaSettings({ secretKey: e.target.value })}
                    placeholder="Bearer token or tunnel access secret..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-zinc-100 placeholder-zinc-600 focus:border-indigo-500 focus:outline-none"
                  />
                  <p className="text-[11px] text-zinc-500 mt-1">
                    Used if you protect your Ollama instance behind an authenticated reverse proxy or tunnel.
                  </p>
                </div>

                {/* Model Name */}
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Model Tag
                  </label>
                  <input
                    type="text"
                    value={formData.ollamaSettings.model}
                    onChange={(e) => updateOllamaSettings({ model: e.target.value })}
                    placeholder="e.g. llama3.3:latest, deepseek-r1:7b, qwen2.5:latest"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-zinc-100 placeholder-zinc-600 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                {/* Test & Set Active */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => handleTestConnection('ollama', formData.ollamaSettings)}
                    disabled={isTesting}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isTesting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                    <span>Ping Ollama (Test Connection)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        authMode: 'ollama',
                        activeProvider: 'ollama',
                        activeModel: prev.ollamaSettings.model,
                      }));
                    }}
                    className={`flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors cursor-pointer ${
                      formData.activeProvider === 'ollama'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-zinc-800 hover:bg-zinc-700 text-white'
                    }`}
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span>{formData.activeProvider === 'ollama' ? 'Ollama Active' : 'Activate Ollama'}</span>
                  </button>
                </div>

                {/* Inline Test Result Banner */}
                {testResult && (
                  <div
                    className={`rounded-xl border p-4 text-xs ${
                      testResult.ok
                        ? 'border-emerald-500/30 bg-emerald-950/20 text-emerald-200'
                        : 'border-rose-500/30 bg-rose-950/20 text-rose-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-semibold">
                      {testResult.ok ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                          <span>{testResult.message}</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="h-4 w-4 text-rose-400" />
                          <span>{testResult.errorTitle}</span>
                        </>
                      )}
                    </div>
                    {!testResult.ok && (
                      <div className="mt-2 space-y-1.5 text-zinc-300">
                        <p>{testResult.exactProblem}</p>
                        {testResult.solution && (
                          <p className="text-indigo-300">
                            <strong>Solution:</strong> {testResult.solution}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: CUSTOM PROVIDER */}
          {activeTab === 'custom' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-white">Custom API Provider Mode</h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Plug in any OpenAI-compatible API endpoint (e.g. vLLM, LM Studio, Jan, LocalAI, private gateways).
                </p>
              </div>

              {/* Add New Custom Provider Form */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Add New Endpoint</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1">
                      Provider Name
                    </label>
                    <input
                      type="text"
                      value={newCustomName}
                      onChange={(e) => setNewCustomName(e.target.value)}
                      placeholder="e.g. GPU Cluster / LM Studio"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder-zinc-600 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1">
                      Model Name
                    </label>
                    <input
                      type="text"
                      value={newCustomModel}
                      onChange={(e) => setNewCustomModel(e.target.value)}
                      placeholder="e.g. meta-llama/Llama-3.3-70B-Instruct"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-zinc-100 placeholder-zinc-600 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Base URL / Endpoint
                  </label>
                  <input
                    type="text"
                    value={newCustomEndpoint}
                    onChange={(e) => setNewCustomEndpoint(e.target.value)}
                    placeholder="https://your-custom-endpoint.com/v1"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-zinc-100 placeholder-zinc-600 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    API Key / Secret Token (Optional)
                  </label>
                  <input
                    type="password"
                    value={newCustomApiKey}
                    onChange={(e) => setNewCustomApiKey(e.target.value)}
                    placeholder="Bearer token or API key..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-zinc-100 placeholder-zinc-600 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleAddCustomProvider}
                  disabled={!newCustomName.trim() || !newCustomEndpoint.trim()}
                  className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Save & Add Custom Provider</span>
                </button>
              </div>

              {/* Saved Custom Providers List */}
              {formData.customProviders.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-zinc-400">Configured Custom Endpoints</h4>
                  {formData.customProviders.map((cp) => (
                    <div
                      key={cp.id}
                      className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/40"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-white">{cp.name}</span>
                          <span className="text-[10px] font-mono text-zinc-500">model: {cp.model}</span>
                        </div>
                        <p className="text-[11px] font-mono text-zinc-400 mt-0.5 truncate">{cp.endpoint}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              authMode: 'custom',
                              activeProvider: 'custom',
                              activeCustomProviderId: cp.id,
                              activeModel: cp.model,
                            }));
                          }}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                            formData.activeCustomProviderId === cp.id
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
                          }`}
                        >
                          {formData.activeCustomProviderId === cp.id ? 'Active' : 'Select'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCustomProvider(cp.id)}
                          className="p-1.5 text-zinc-500 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                          title="Delete custom provider"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: AI PERSONALITY & DYNAMIC PERSISTENT MEMORY */}
          {activeTab === 'memory' && (
            <div className="space-y-6">
              {/* Header with Auto-Learning Toggle */}
              <div className="flex items-start justify-between gap-4 p-4 rounded-xl border border-purple-500/30 bg-purple-950/20">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 shrink-0">
                    <Brain className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">Dynamic Persistent Memory System</h3>
                    <p className="text-xs text-zinc-300 mt-0.5">
                      Learns your communication habits, preferences, and technical stack across every chat session and injects them in real-time.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-medium text-zinc-300">Auto-Learn:</span>
                  <button
                    type="button"
                    onClick={() =>
                      handleUpdatePersonaConfig({
                        autoLearnEnabled: !localProfile.config.autoLearnEnabled,
                      })
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                      localProfile.config.autoLearnEnabled ? 'bg-indigo-600' : 'bg-zinc-800'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        localProfile.config.autoLearnEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Manual Persona Toggles */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Manual Behavioral Toggles
                </h4>

                {/* 1. Tone / Formality */}
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-2">
                    Tone / Formality
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {([
                      { id: 'casual', label: 'Casual', desc: 'Relaxed & everyday talk' },
                      { id: 'friendly', label: 'Friendly', desc: 'Warm & welcoming' },
                      { id: 'formal', label: 'Formal', desc: 'Polite & dignified' },
                      { id: 'professional', label: 'Professional', desc: 'Crisp & respectful' },
                    ] as { id: FormalityTone; label: string; desc: string }[]).map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => handleUpdatePersonaConfig({ tone: t.id })}
                        className={`p-2.5 rounded-lg text-left transition-all cursor-pointer ${
                          localProfile.config.tone === t.id
                            ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                            : 'bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        <div className="text-xs font-medium">{t.label}</div>
                        <div className="text-[10px] text-zinc-400 opacity-80 mt-0.5">{t.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Friendliness & Emoji Style */}
                <div className="space-y-3 pt-1 border-t border-zinc-800/60">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-medium text-zinc-200 flex items-center gap-1.5">
                        <span>Friendliness & Emoji Style</span>
                        <span className="text-amber-400">✨</span>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        Toggle warm conversational friendly mode with emojis vs. direct mode.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        handleUpdatePersonaConfig({
                          warmEmojiMode: !localProfile.config.warmEmojiMode,
                          friendliness: !localProfile.config.warmEmojiMode ? 'friendly' : 'direct',
                        })
                      }
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                        localProfile.config.warmEmojiMode ? 'bg-amber-500' : 'bg-zinc-800'
                      }`}
                      title={localProfile.config.warmEmojiMode ? 'Warm Conversational with Emojis Active' : 'Direct Mode (No emojis)'}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          localProfile.config.warmEmojiMode ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {[
                      { id: 'friendly' as FriendlinessLevel, title: 'Warm & Friendly 😊', desc: 'Positive, empathetic, supportive' },
                      { id: 'neutral' as FriendlinessLevel, title: 'Neutral / Balanced', desc: 'Objective, calm, analytical' },
                      { id: 'direct' as FriendlinessLevel, title: 'Direct Mode', desc: 'Straightforward, zero fluff' },
                    ].map((lvl) => (
                      <button
                        key={lvl.id}
                        type="button"
                        onClick={() => handleUpdatePersonaConfig({ friendliness: lvl.id })}
                        className={`p-2.5 rounded-lg text-left transition-all cursor-pointer ${
                          localProfile.config.friendliness === lvl.id
                            ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                            : 'bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        <div className="text-xs font-medium">{lvl.title}</div>
                        <div className="text-[10px] text-zinc-400 opacity-80 mt-0.5">{lvl.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Response Length */}
                <div className="pt-1 border-t border-zinc-800/60">
                  <label className="block text-xs font-medium text-zinc-300 mb-2">
                    Response Length
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      { id: 'ultra_concise' as ResponseLengthPref, title: 'Ultra-Concise ⚡', desc: 'Short, punchy replies (1-3 sentences or tight bullets)' },
                      { id: 'balanced' as ResponseLengthPref, title: 'Balanced 📖', desc: 'Clear, natural, and helpful explanations' },
                    ].map((len) => (
                      <button
                        key={len.id}
                        type="button"
                        onClick={() => handleUpdatePersonaConfig({ responseLength: len.id })}
                        className={`p-2.5 rounded-lg text-left transition-all cursor-pointer ${
                          localProfile.config.responseLength === len.id
                            ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                            : 'bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        <div className="text-xs font-medium">{len.title}</div>
                        <div className="text-[10px] text-zinc-400 opacity-80 mt-0.5">{len.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Custom Directives */}
                <div className="pt-1 border-t border-zinc-800/60">
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Custom Directives & Persistent User Rules
                  </label>
                  <textarea
                    rows={2}
                    value={localProfile.config.customDirectives}
                    onChange={(e) => handleUpdatePersonaConfig({ customDirectives: e.target.value })}
                    placeholder="e.g. Call me Sarah, explain recipes simply, and give step-by-step instructions when asked."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-xs text-zinc-100 placeholder-zinc-600 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Learned Memory Traits List */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                      Persistent Learned Memory Traits ({localProfile.traits.length})
                    </h4>
                    <p className="text-[11px] text-zinc-500">
                      Permanent facts remembered across all chats (name, preferences, role, location)
                    </p>
                  </div>

                  {localProfile.traits.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearAllTraits}
                      className="text-xs text-rose-400 hover:text-rose-300 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Clear All Memories</span>
                    </button>
                  )}
                </div>

                {/* Add Custom Trait Input */}
                <div className="flex gap-2">
                  <select
                    value={newTraitCategory}
                    onChange={(e) => setNewTraitCategory(e.target.value as MemoryCategory)}
                    className="bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-zinc-300 focus:outline-none"
                  >
                    <option value="fact">Fact / Identity</option>
                    <option value="preference">Preference</option>
                    <option value="communication">Communication</option>
                    <option value="directive">Directive</option>
                    <option value="technical">Specialty</option>
                  </select>

                  <input
                    type="text"
                    value={newTraitText}
                    onChange={(e) => setNewTraitText(e.target.value)}
                    placeholder="Add personal fact (e.g. User's name is Sarah, User is an algebra teacher)..."
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-600 focus:border-indigo-500 focus:outline-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomTrait();
                      }
                    }}
                  />

                  <button
                    type="button"
                    onClick={handleAddCustomTrait}
                    disabled={!newTraitText.trim()}
                    className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                {/* Traits list */}
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {localProfile.traits.length === 0 ? (
                    <div className="py-6 text-center text-xs text-zinc-500">
                      No memory traits recorded yet. Chat naturally and Cartory QOMA AI will learn your habits!
                    </div>
                  ) : (
                    localProfile.traits.map((t) => {
                      const isEditing = editingTraitId === t.id;
                      return (
                        <div
                          key={t.id}
                          className="flex items-center justify-between p-2.5 rounded-lg border border-zinc-800 bg-zinc-950/70 text-xs"
                        >
                          <div className="flex items-center gap-2.5 flex-1 min-w-0 mr-2">
                            <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] font-mono uppercase text-zinc-400 shrink-0">
                              {t.category}
                            </span>

                            {isEditing ? (
                              <input
                                type="text"
                                value={editingTraitText}
                                onChange={(e) => setEditingTraitText(e.target.value)}
                                className="flex-1 bg-zinc-900 border border-indigo-500 rounded px-2 py-0.5 text-xs text-white"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveEditTrait(t.id);
                                }}
                              />
                            ) : (
                              <span className="text-zinc-200 truncate">{t.trait}</span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-[10px] font-mono text-zinc-500">
                              {t.confidence}% conf
                            </span>
                            {isEditing ? (
                              <button
                                type="button"
                                onClick={() => handleSaveEditTrait(t.id)}
                                className="text-emerald-400 hover:text-emerald-300 text-xs font-semibold px-2 cursor-pointer"
                              >
                                Save
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingTraitId(t.id);
                                  setEditingTraitText(t.trait);
                                }}
                                className="p-1 text-zinc-500 hover:text-zinc-300 cursor-pointer"
                                title="Edit memory"
                              >
                                Edit
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleDeleteTrait(t.id)}
                              className="p-1 text-zinc-500 hover:text-rose-400 cursor-pointer"
                              title="Delete memory"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: WEB SEARCH & CRAWL */}
          {activeTab === 'web' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-white">Live Real-Time Web Search & DuckDuckGo Engine</h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Allows models to break past static training cutoffs by fetching real-time facts, current news, and live URLs.
                </p>
              </div>

              {/* Master Web Search Toggle */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-semibold text-white flex items-center gap-2">
                      <Globe className="h-4 w-4 text-cyan-400" />
                      <span>Enable DuckDuckGo Live Search Engine</span>
                    </h4>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Queries public web sources and crawls top articles to inject fresh context into the prompt.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        webSearchEnabled: !prev.webSearchEnabled,
                      }))
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                      formData.webSearchEnabled ? 'bg-indigo-600' : 'bg-zinc-800'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        formData.webSearchEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Real-Time System Timestamp Status */}
                <div className="rounded-lg bg-zinc-950/80 border border-zinc-800 p-3 text-xs text-zinc-300 space-y-1 font-mono">
                  <div className="flex items-center justify-between text-zinc-400">
                    <span className="text-[11px] uppercase tracking-wider font-semibold text-indigo-400">
                      Live Temporal Anchor
                    </span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                      Synchronized
                    </span>
                  </div>
                  <div className="text-[11px] text-zinc-200">
                    System Timestamp: {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} • {new Date().toLocaleTimeString()}
                  </div>
                  <p className="text-[10px] text-zinc-500 font-sans">
                    Every outgoing model prompt automatically receives this dynamic timestamp to prevent outdated temporal reasoning.
                  </p>
                </div>
              </div>

              {/* Interactive Live Search Tester */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-3.5">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Test Live Web Search Tool
                  </h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Execute a test search via DuckDuckGo to verify real-time search fetching and citation parsing.
                  </p>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={testSearchQuery}
                    onChange={(e) => setTestSearchQuery(e.target.value)}
                    placeholder="Enter query to test (e.g. Next.js 15 features, World news today)..."
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder-zinc-600 focus:border-indigo-500 focus:outline-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleTestWebSearch();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleTestWebSearch}
                    disabled={isSearchingWeb || !testSearchQuery.trim()}
                    className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer"
                  >
                    {isSearchingWeb ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Globe className="h-3.5 w-3.5" />}
                    <span>{isSearchingWeb ? 'Searching...' : 'Search'}</span>
                  </button>
                </div>

                {searchFeedback && (
                  <p className="text-xs text-indigo-300 font-mono">{searchFeedback}</p>
                )}

                {/* Results Preview */}
                {searchTestResults && searchTestResults.length > 0 && (
                  <div className="space-y-2 mt-2 max-h-48 overflow-y-auto pr-1">
                    {searchTestResults.map((src, i) => (
                      <div
                        key={i}
                        className="rounded-lg border border-zinc-800 bg-zinc-950 p-2.5 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <a
                            href={src.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-indigo-400 hover:underline flex items-center gap-1 truncate max-w-[80%]"
                          >
                            <span>{src.title}</span>
                            <ExternalLink className="h-3 w-3 shrink-0" />
                          </a>
                        </div>
                        {src.snippet && (
                          <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                            {src.snippet}
                          </p>
                        )}
                        <span className="text-[10px] text-zinc-600 font-mono truncate block">
                          {src.url}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-zinc-200 px-6 py-4 bg-zinc-50 text-xs">
          <div className="flex items-center gap-2">
            {onOpenErrorLogs && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenErrorLogs();
                }}
                className="flex items-center gap-1.5 text-zinc-600 hover:text-amber-600 font-mono transition-colors cursor-pointer"
              >
                <ShieldAlert className="h-3.5 w-3.5 text-amber-500" />
                <span>View Real-Time Error Logs</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-700 font-medium transition-colors cursor-pointer shadow-xs"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveAll}
              className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors cursor-pointer shadow-xs"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
