export type Role = 'user' | 'assistant' | 'system';

export interface WebSource {
  title: string;
  url: string;
  snippet?: string;
}

export type PredefinedProviderId =
  | 'openai'
  | 'anthropic'
  | 'gemini'
  | 'groq'
  | 'openrouter'
  | 'mistral'
  | 'deepseek'
  | 'cohere'
  | 'together'
  | 'fireworks'
  | 'xai'
  | 'perplexity'
  | 'huggingface'
  | 'voyage'
  | 'ai21'
  | 'replicate'
  | 'anyscale'
  | 'deepinfra'
  | 'cerebras'
  | 'sambanova';

export type AIProviderId =
  | PredefinedProviderId
  | 'ollama'
  | 'custom'
  | 'coupon';

export interface CustomProvider {
  id: string;
  name: string;
  endpoint: string;
  apiKey: string;
  model: string;
  temperature?: number;
}

export interface OllamaSettings {
  endpoint: string;
  secretKey?: string; // Optional Bearer token or secret tunnel key
  model: string;
  temperature?: number;
}

export interface ProviderConfig {
  endpoint: string;
  apiKey: string;
  model: string;
  temperature?: number;
}

export interface ProviderMeta {
  id: AIProviderId;
  name: string;
  category: 'Frontier AI' | 'Ultra Fast' | 'Cloud Gateway' | 'Specialized' | 'Local / Self-Hosted';
  badge?: string;
  defaultEndpoint: string;
  defaultModel: string;
  models: string[];
  keyPlaceholder: string;
  keyPrefix?: string;
  docsUrl: string;
  description: string;
  requiresKey: boolean;
  isOpenAICompatible: boolean;
  format?: 'openai' | 'anthropic' | 'gemini' | 'cohere' | 'ollama';
}

export interface ErrorDiagnostic {
  errorCode:
    | 'INVALID_KEY' // 401
    | 'INSUFFICIENT_QUOTA' // 402 or 429 quota
    | 'ROUTE_404' // 404 bad endpoint/model
    | 'RATE_LIMITED' // 429
    | 'OLLAMA_NETWORK_ERROR' // Failed to fetch / CORS
    | 'OLLAMA_COM_WEBSITE'
    | 'LOCALHOST_CLOUD_MISMATCH'
    | 'AUTH_REJECTED'
    | 'FORBIDDEN' // 403
    | 'MODEL_NOT_FOUND'
    | 'SERVER_ERROR' // 500/503
    | 'TIMEOUT'
    | 'NETWORK_ERROR'
    | 'UNKNOWN_ERROR';
  errorTitle: string;
  exactProblem: string;
  endpointAttempted?: string;
  httpStatus?: number | string;
  providerId?: string;
  providerName?: string;
  solution: string;
  helpUrl?: string;
  canQuickFixWithCoupon: boolean;
}

export interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
  status?: 'sending' | 'streaming' | 'done' | 'error';
  modelUsed?: string;
  providerUsed?: string;
  durationMs?: number;
  errorMsg?: string;
  errorDiagnostic?: ErrorDiagnostic;
  feedback?: 'like' | 'dislike' | null;
  sources?: WebSource[];
  statusUpdate?: string;
}

export type PersonalityType =
  | 'balanced'
  | 'creative'
  | 'coder'
  | 'analytical'
  | 'concise'
  | 'companion';

export interface OllamaConfig {
  endpoint: string;
  apiKey: string;
  model: string;
  temperature: number;
}

export interface CouponData {
  valid: boolean;
  couponCode: string;
  name: string;
  description: string;
}

export interface AppSettings {
  authMode: 'coupon' | 'byok' | 'ollama' | 'custom' | 'native';
  activeProvider: AIProviderId;
  activeModel: string;
  providerConfigs: Record<string, ProviderConfig>;
  ollamaSettings: OllamaSettings;
  customProviders: CustomProvider[];
  activeCustomProviderId?: string;
  couponCode: string;
  couponData: CouponData | null;
  // Legacy fields preserved:
  provider?: 'ollama' | 'gemini';
  ollamaConfig?: OllamaConfig;
  personality: PersonalityType;
  soundEnabled: boolean;
  autoScroll: boolean;
  webSearchEnabled: boolean;
  speechVoiceUri?: string;
  speechRate: number;
  customSystemPrompt?: string;
  hasPromptedApiKey?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
  personality: PersonalityType;
}

export type MemoryCategory =
  | 'preference'
  | 'technical'
  | 'communication'
  | 'directive'
  | 'fact';

export interface UserMemoryTrait {
  id: string;
  category: MemoryCategory;
  trait: string;
  confidence: number; // 0-100
  timestamp: number;
  source?: string;
}

export type FormalityTone = 'casual' | 'formal' | 'friendly' | 'professional' | 'direct';
export type FriendlinessLevel = 'friendly' | 'warm' | 'neutral' | 'direct';
export type ResponseLengthPref = 'ultra_concise' | 'concise' | 'balanced' | 'comprehensive';

export interface UserPersonaConfig {
  tone: FormalityTone;
  friendliness: FriendlinessLevel;
  warmEmojiMode: boolean; // Friendly conversation mode with natural emojis vs. direct mode
  responseLength: ResponseLengthPref;
  customDirectives: string;
  autoLearnEnabled: boolean;
}

export interface AIMemoryProfile {
  config: UserPersonaConfig;
  traits: UserMemoryTrait[];
  lastLearnedAt?: number;
  totalInteractionsAnalyzed: number;
}

export interface ErrorLogItem {
  id: string;
  timestamp: number;
  providerId: string;
  providerName: string;
  endpoint: string;
  model: string;
  statusCode?: number | string;
  errorCode: string;
  errorTitle: string;
  message: string;
  solution?: string;
}

