import { AppSettings, ChatSession, ChatMessage, CustomProvider, OllamaSettings } from '../types';
import { createDefaultProviderConfigs, getProviderMeta } from './aiProviders';

const SETTINGS_KEY = 'omniai_hub_settings_v1';
const SESSIONS_KEY = 'omniai_hub_sessions_v1';
const ACTIVE_SESSION_KEY = 'omniai_hub_active_session_v1';

export const DEFAULT_OLLAMA_SETTINGS: OllamaSettings = {
  endpoint: 'http://localhost:11434',
  secretKey: '',
  model: 'llama3.3:latest',
  temperature: 0.7,
};

export const DEFAULT_CUSTOM_PROVIDERS: CustomProvider[] = [
  {
    id: 'custom-vllm-sample',
    name: 'Private vLLM Cluster',
    endpoint: 'https://vllm.example.com/v1',
    apiKey: '',
    model: 'meta-llama/Llama-3.3-70B-Instruct',
    temperature: 0.7,
  },
];

export const DEFAULT_SETTINGS: AppSettings = {
  authMode: 'byok',
  activeProvider: 'openai',
  activeModel: 'gpt-4o',
  providerConfigs: createDefaultProviderConfigs(),
  ollamaSettings: DEFAULT_OLLAMA_SETTINGS,
  customProviders: DEFAULT_CUSTOM_PROVIDERS,
  couponCode: 'CARTORY-VIP',
  couponData: {
    valid: true,
    couponCode: 'CARTORY-VIP',
    name: 'Cartory QOMA AI Hosted Access Pass',
    description: 'Hosted high-speed cloud engine unlocked with live web search & persistent memory.',
  },
  provider: 'gemini',
  ollamaConfig: {
    endpoint: 'http://localhost:11434',
    apiKey: '',
    model: 'llama3.3:latest',
    temperature: 0.7,
  },
  personality: 'balanced',
  soundEnabled: true,
  autoScroll: true,
  webSearchEnabled: true,
  speechRate: 1.0,
  customSystemPrompt: '',
  hasPromptedApiKey: false,
};

const INITIAL_WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome-msg-1',
  role: 'assistant',
  content: `### Welcome to Cartory QOMA AI

I am **Qoma AI version 7.0**, an advanced artificial intelligence developed exclusively by Cartory.

I'm here to chat warmly, answer questions, brainstorm ideas, assist with daily plans, or solve problems. Feel free to ask me anything or say hello! 😊`,
  timestamp: Date.now(),
  status: 'done',
  modelUsed: 'Cartory QOMA AI v7.0 • Ready',
};

export function loadSettings(): AppSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);

    const defaultConfigs = createDefaultProviderConfigs();
    const mergedConfigs = { ...defaultConfigs, ...(parsed.providerConfigs || {}) };

    // Migrate legacy or partial settings
    const activeProv = parsed.activeProvider || 'openai';
    const activeMeta = getProviderMeta(activeProv);
    const activeModel = parsed.activeModel || mergedConfigs[activeProv]?.model || activeMeta.defaultModel;

    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      activeProvider: activeProv,
      activeModel,
      providerConfigs: mergedConfigs,
      ollamaSettings: {
        ...DEFAULT_OLLAMA_SETTINGS,
        ...(parsed.ollamaSettings || {}),
        endpoint: parsed.ollamaSettings?.endpoint || parsed.ollamaConfig?.endpoint || DEFAULT_OLLAMA_SETTINGS.endpoint,
        secretKey: parsed.ollamaSettings?.secretKey || parsed.ollamaConfig?.apiKey || '',
        model: parsed.ollamaSettings?.model || parsed.ollamaConfig?.model || DEFAULT_OLLAMA_SETTINGS.model,
      },
      customProviders: Array.isArray(parsed.customProviders) ? parsed.customProviders : DEFAULT_CUSTOM_PROVIDERS,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings:', err);
  }
}

export function createInitialSession(): ChatSession {
  return {
    id: `session-${Date.now()}`,
    title: 'Welcome to Cartory QOMA AI',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    messages: [INITIAL_WELCOME_MESSAGE],
    personality: 'balanced',
  };
}

export function loadSessions(): ChatSession[] {
  if (typeof window === 'undefined') return [createInitialSession()];
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    if (!raw) {
      const initial = [createInitialSession()];
      saveSessions(initial);
      return initial;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      const initial = [createInitialSession()];
      saveSessions(initial);
      return initial;
    }
    return parsed;
  } catch {
    return [createInitialSession()];
  }
}

export function saveSessions(sessions: ChatSession[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  } catch (err) {
    console.error('Failed to save sessions:', err);
  }
}

export function loadActiveSessionId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACTIVE_SESSION_KEY);
}

export function saveActiveSessionId(id: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ACTIVE_SESSION_KEY, id);
}

const ERROR_LOGS_KEY = 'omniai_hub_error_logs_v1';

export function loadErrorLogs(): import('../types').ErrorLogItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(ERROR_LOGS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveErrorLogs(logs: import('../types').ErrorLogItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ERROR_LOGS_KEY, JSON.stringify(logs.slice(0, 50)));
  } catch (err) {
    console.error('Failed to save error logs:', err);
  }
}

export function appendErrorLog(
  item: Omit<import('../types').ErrorLogItem, 'id' | 'timestamp'>
): import('../types').ErrorLogItem {
  const newLog: import('../types').ErrorLogItem = {
    ...item,
    id: `err-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: Date.now(),
  };
  const current = loadErrorLogs();
  const updated = [newLog, ...current].slice(0, 50);
  saveErrorLogs(updated);
  return newLog;
}

export function clearErrorLogs(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ERROR_LOGS_KEY);
}

