import { AIProviderId, ProviderMeta, ProviderConfig, PredefinedProviderId, ErrorDiagnostic } from '../types';

export const TOP_20_PROVIDERS: ProviderMeta[] = [
  {
    id: 'openai',
    name: 'OpenAI (GPT)',
    category: 'Frontier AI',
    badge: 'GPT-4o & o3',
    defaultEndpoint: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4o',
    models: [
      'gpt-4o',
      'gpt-4o-mini',
      'o3-mini',
      'o1',
      'o1-mini',
      'gpt-4-turbo',
      'chatgpt-4o-latest',
    ],
    keyPlaceholder: 'sk-proj-... or sk-...',
    keyPrefix: 'sk-',
    docsUrl: 'https://platform.openai.com/api-keys',
    description: 'Industry-standard frontier models by OpenAI including GPT-4o and o3 reasoning.',
    requiresKey: true,
    isOpenAICompatible: true,
    format: 'openai',
  },
  {
    id: 'anthropic',
    name: 'Anthropic Claude',
    category: 'Frontier AI',
    badge: 'Claude 3.7',
    defaultEndpoint: 'https://api.anthropic.com/v1',
    defaultModel: 'claude-3-7-sonnet-20250219',
    models: [
      'claude-3-7-sonnet-20250219',
      'claude-3-5-sonnet-20241022',
      'claude-3-5-haiku-20241022',
      'claude-3-opus-20240229',
    ],
    keyPlaceholder: 'sk-ant-api03-...',
    keyPrefix: 'sk-ant-',
    docsUrl: 'https://console.anthropic.com/settings/keys',
    description: 'Anthropic frontier reasoning models featuring Claude 3.7 Sonnet hybrid reasoning.',
    requiresKey: true,
    isOpenAICompatible: false,
    format: 'anthropic',
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    category: 'Frontier AI',
    badge: 'Gemini 2.5',
    defaultEndpoint: 'https://generativelanguage.googleapis.com',
    defaultModel: 'gemini-2.5-flash',
    models: [
      'gemini-2.5-flash',
      'gemini-2.5-pro',
      'gemini-2.0-flash',
      'gemini-1.5-pro',
      'gemini-1.5-flash',
    ],
    keyPlaceholder: 'AIzaSy...',
    keyPrefix: 'AIza',
    docsUrl: 'https://aistudio.google.com/app/apikey',
    description: 'Google AI Studio frontier multimodal models with massive context windows.',
    requiresKey: true,
    isOpenAICompatible: false,
    format: 'gemini',
  },
  {
    id: 'groq',
    name: 'Groq Cloud',
    category: 'Ultra Fast',
    badge: '500+ tok/s LPU',
    defaultEndpoint: 'https://api.groq.com/openai/v1',
    defaultModel: 'llama-3.3-70b-versatile',
    models: [
      'llama-3.3-70b-versatile',
      'deepseek-r1-distill-llama-70b',
      'llama-3.1-8b-instant',
      'mixtral-8x7b-32768',
      'gemma2-9b-it',
    ],
    keyPlaceholder: 'gsk_...',
    keyPrefix: 'gsk_',
    docsUrl: 'https://console.groq.com/keys',
    description: 'Blazing fast deterministic inference engine powered by Groq LPUs.',
    requiresKey: true,
    isOpenAICompatible: true,
    format: 'openai',
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    category: 'Cloud Gateway',
    badge: '200+ Models',
    defaultEndpoint: 'https://openrouter.ai/api/v1',
    defaultModel: 'openai/gpt-4o',
    models: [
      'openai/gpt-4o',
      'anthropic/claude-3.7-sonnet',
      'deepseek/deepseek-r1',
      'meta-llama/llama-3.3-70b-instruct',
      'google/gemini-2.0-flash-001',
      'mistralai/mistral-large-2411',
      'qwen/qwen-2.5-72b-instruct',
    ],
    keyPlaceholder: 'sk-or-v1-...',
    keyPrefix: 'sk-or-',
    docsUrl: 'https://openrouter.ai/keys',
    description: 'Unified aggregator providing access to every global AI model with one secret key.',
    requiresKey: true,
    isOpenAICompatible: true,
    format: 'openai',
  },
  {
    id: 'mistral',
    name: 'Mistral AI',
    category: 'Frontier AI',
    badge: 'Codestral & Large',
    defaultEndpoint: 'https://api.mistral.ai/v1',
    defaultModel: 'mistral-large-latest',
    models: [
      'mistral-large-latest',
      'mistral-small-latest',
      'codestral-latest',
      'ministral-8b-latest',
      'pixtral-large-latest',
    ],
    keyPlaceholder: 'Paste your Mistral API key...',
    docsUrl: 'https://console.mistral.ai/api-keys/',
    description: 'European frontier models by Mistral AI, including high-capability Codestral.',
    requiresKey: true,
    isOpenAICompatible: true,
    format: 'openai',
  },
  {
    id: 'deepseek',
    name: 'DeepSeek Direct',
    category: 'Frontier AI',
    badge: 'DeepSeek V3/R1',
    defaultEndpoint: 'https://api.deepseek.com/v1',
    defaultModel: 'deepseek-chat',
    models: [
      'deepseek-chat',
      'deepseek-reasoner',
    ],
    keyPlaceholder: 'sk-...',
    keyPrefix: 'sk-',
    docsUrl: 'https://platform.deepseek.com/api_keys',
    description: 'Direct official API for DeepSeek V3 Chat and R1 DeepSeek Reasoner.',
    requiresKey: true,
    isOpenAICompatible: true,
    format: 'openai',
  },
  {
    id: 'cohere',
    name: 'Cohere',
    category: 'Specialized',
    badge: 'Command R+',
    defaultEndpoint: 'https://api.cohere.com/v2',
    defaultModel: 'command-r-plus',
    models: [
      'command-r-plus',
      'command-r',
      'command-light',
    ],
    keyPlaceholder: 'Paste your Cohere API key...',
    docsUrl: 'https://dashboard.cohere.com/api-keys',
    description: 'Cohere Command R+ enterprise conversational model with RAG excellence.',
    requiresKey: true,
    isOpenAICompatible: true,
    format: 'openai',
  },
  {
    id: 'together',
    name: 'Together AI',
    category: 'Cloud Gateway',
    badge: 'Open Weights',
    defaultEndpoint: 'https://api.together.xyz/v1',
    defaultModel: 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
    models: [
      'meta-llama/Llama-3.3-70B-Instruct-Turbo',
      'deepseek-ai/DeepSeek-R1',
      'mistralai/Mixtral-8x7B-Instruct-v0.1',
      'Qwen/Qwen2.5-72B-Instruct-Turbo',
    ],
    keyPlaceholder: 'Paste your Together AI API key...',
    docsUrl: 'https://api.together.ai/settings/api-keys',
    description: 'High-speed cloud inference for open-source AI models.',
    requiresKey: true,
    isOpenAICompatible: true,
    format: 'openai',
  },
  {
    id: 'fireworks',
    name: 'Fireworks AI',
    category: 'Ultra Fast',
    badge: 'Fast Inference',
    defaultEndpoint: 'https://api.fireworks.ai/inference/v1',
    defaultModel: 'accounts/fireworks/models/llama-v3p3-70b-instruct',
    models: [
      'accounts/fireworks/models/llama-v3p3-70b-instruct',
      'accounts/fireworks/models/deepseek-r1',
      'accounts/fireworks/models/mixtral-8x22b-instruct',
      'accounts/fireworks/models/qwen2p5-72b-instruct',
    ],
    keyPlaceholder: 'fw_...',
    keyPrefix: 'fw_',
    docsUrl: 'https://fireworks.ai/api-keys',
    description: 'Production-grade fast generative AI inference platform.',
    requiresKey: true,
    isOpenAICompatible: true,
    format: 'openai',
  },
  {
    id: 'xai',
    name: 'xAI (Grok)',
    category: 'Frontier AI',
    badge: 'Grok-2',
    defaultEndpoint: 'https://api.x.ai/v1',
    defaultModel: 'grok-2-latest',
    models: [
      'grok-2-latest',
      'grok-2-vision-latest',
      'grok-beta',
    ],
    keyPlaceholder: 'xai-...',
    keyPrefix: 'xai-',
    docsUrl: 'https://console.x.ai',
    description: 'xAI Grok official API with real-time reasoning and unfiltered knowledge.',
    requiresKey: true,
    isOpenAICompatible: true,
    format: 'openai',
  },
  {
    id: 'perplexity',
    name: 'Perplexity AI',
    category: 'Specialized',
    badge: 'Search Grounded',
    defaultEndpoint: 'https://api.perplexity.ai',
    defaultModel: 'sonar-pro',
    models: [
      'sonar-pro',
      'sonar',
      'sonar-reasoning',
    ],
    keyPlaceholder: 'pplx-...',
    keyPrefix: 'pplx-',
    docsUrl: 'https://www.perplexity.ai/settings/api',
    description: 'Perplexity Sonar search-grounded models with cited live web data.',
    requiresKey: true,
    isOpenAICompatible: true,
    format: 'openai',
  },
  {
    id: 'huggingface',
    name: 'Hugging Face Inference',
    category: 'Cloud Gateway',
    badge: 'Serverless API',
    defaultEndpoint: 'https://api-inference.huggingface.co/v1',
    defaultModel: 'meta-llama/Llama-3.3-70B-Instruct',
    models: [
      'meta-llama/Llama-3.3-70B-Instruct',
      'Qwen/Qwen2.5-72B-Instruct',
      'mistralai/Mistral-7B-Instruct-v0.3',
    ],
    keyPlaceholder: 'hf_...',
    keyPrefix: 'hf_',
    docsUrl: 'https://huggingface.co/settings/tokens',
    description: 'Direct serverless access to Hugging Face model repository.',
    requiresKey: true,
    isOpenAICompatible: true,
    format: 'openai',
  },
  {
    id: 'voyage',
    name: 'Voyage AI',
    category: 'Specialized',
    badge: 'State-of-art Embed/Chat',
    defaultEndpoint: 'https://api.voyageai.com/v1',
    defaultModel: 'voyage-3',
    models: [
      'voyage-3',
      'voyage-3-lite',
      'voyage-code-3',
    ],
    keyPlaceholder: 'pa-...',
    docsUrl: 'https://dash.voyageai.com/api-keys',
    description: 'Industry-leading embedding and contextual AI models.',
    requiresKey: true,
    isOpenAICompatible: true,
    format: 'openai',
  },
  {
    id: 'ai21',
    name: 'AI21 Labs',
    category: 'Specialized',
    badge: 'Jamba Mamba+Transformer',
    defaultEndpoint: 'https://api.ai21.com/studio/v1',
    defaultModel: 'jamba-1.5-large',
    models: [
      'jamba-1.5-large',
      'jamba-1.5-mini',
    ],
    keyPlaceholder: 'Paste your AI21 API key...',
    docsUrl: 'https://studio.ai21.com/account/api-key',
    description: 'Hybrid SSM-Transformer Jamba models with 256K token context windows.',
    requiresKey: true,
    isOpenAICompatible: true,
    format: 'openai',
  },
  {
    id: 'replicate',
    name: 'Replicate',
    category: 'Cloud Gateway',
    badge: 'Multi-Model',
    defaultEndpoint: 'https://api.replicate.com/v1',
    defaultModel: 'meta/meta-llama-3-70b-instruct',
    models: [
      'meta/meta-llama-3-70b-instruct',
      'deepseek-ai/deepseek-r1',
      'mistralai/mixtral-8x7b-instruct-v0.1',
    ],
    keyPlaceholder: 'r8_...',
    keyPrefix: 'r8_',
    docsUrl: 'https://replicate.com/account/api-tokens',
    description: 'Cloud API runner for open-source AI models.',
    requiresKey: true,
    isOpenAICompatible: true,
    format: 'openai',
  },
  {
    id: 'anyscale',
    name: 'Anyscale Endpoints',
    category: 'Ultra Fast',
    badge: 'Ray Powered',
    defaultEndpoint: 'https://api.endpoints.anyscale.com/v1',
    defaultModel: 'meta-llama/Llama-3.3-70B-Instruct',
    models: [
      'meta-llama/Llama-3.3-70B-Instruct',
      'mistralai/Mixtral-8x7B-Instruct-v0.1',
      'codellama/CodeLlama-70b-Instruct-hf',
    ],
    keyPlaceholder: 'esecret_...',
    docsUrl: 'https://app.endpoints.anyscale.com/credentials',
    description: 'Ray-powered fast, scalable open LLM serving platform.',
    requiresKey: true,
    isOpenAICompatible: true,
    format: 'openai',
  },
  {
    id: 'deepinfra',
    name: 'DeepInfra',
    category: 'Cloud Gateway',
    badge: 'Cost-Effective',
    defaultEndpoint: 'https://api.deepinfra.com/v1/openai',
    defaultModel: 'meta-llama/Meta-Llama-3.3-70B-Instruct',
    models: [
      'meta-llama/Meta-Llama-3.3-70B-Instruct',
      'deepseek-ai/DeepSeek-R1',
      'Qwen/Qwen2.5-72B-Instruct',
    ],
    keyPlaceholder: 'Paste DeepInfra token...',
    docsUrl: 'https://deepinfra.com/dash/api_keys',
    description: 'Simple, fast, and cost-effective cloud AI API infrastructure.',
    requiresKey: true,
    isOpenAICompatible: true,
    format: 'openai',
  },
  {
    id: 'cerebras',
    name: 'Cerebras',
    category: 'Ultra Fast',
    badge: 'Wafer-Scale 2000 tok/s',
    defaultEndpoint: 'https://api.cerebras.ai/v1',
    defaultModel: 'llama3.3-70b',
    models: [
      'llama3.3-70b',
      'llama3.1-8b',
    ],
    keyPlaceholder: 'csk-...',
    keyPrefix: 'csk-',
    docsUrl: 'https://cloud.cerebras.ai',
    description: 'World record inference speeds powered by Cerebras Wafer-Scale Engine chips.',
    requiresKey: true,
    isOpenAICompatible: true,
    format: 'openai',
  },
  {
    id: 'sambanova',
    name: 'SambaNova',
    category: 'Ultra Fast',
    badge: 'SN40L RDU Speed',
    defaultEndpoint: 'https://api.sambanova.ai/v1',
    defaultModel: 'Meta-Llama-3.3-70B-Instruct',
    models: [
      'Meta-Llama-3.3-70B-Instruct',
      'DeepSeek-R1',
      'Meta-Llama-3.1-8B-Instruct',
    ],
    keyPlaceholder: 'Paste SambaNova key...',
    docsUrl: 'https://cloud.sambanova.ai/apis',
    description: 'High-speed generative AI chips built for frontier model inference.',
    requiresKey: true,
    isOpenAICompatible: true,
    format: 'openai',
  },
];

export const OLLAMA_META: ProviderMeta = {
  id: 'ollama',
  name: 'Ollama (Local & Remote)',
  category: 'Local / Self-Hosted',
  badge: 'Local & Cloud Tunnel',
  defaultEndpoint: 'http://localhost:11434',
  defaultModel: 'llama3.3:latest',
  models: [
    'llama3.3:latest',
    'deepseek-r1:latest',
    'llama3.1:8b',
    'mistral:latest',
    'qwen2.5:latest',
    'phi4:latest',
    'codellama:latest',
  ],
  keyPlaceholder: 'Optional secret key / bearer token if proxied...',
  docsUrl: 'https://ollama.com',
  description: 'Connect your local machine (http://localhost:11434) or secure remote tunnel (ngrok / Cloudflare).',
  requiresKey: false,
  isOpenAICompatible: false,
  format: 'ollama',
};

export const COUPON_META: ProviderMeta = {
  id: 'coupon',
  name: 'Cartory QOMA AI Hosted Cloud',
  category: 'Frontier AI',
  badge: 'Instant Access Pass',
  defaultEndpoint: 'Cartory QOMA AI Hosted Cloud',
  defaultModel: 'Qoma AI v7.0',
  models: ['Qoma AI v7.0', 'Qoma AI Turbo'],
  keyPlaceholder: 'CARTORY-VIP',
  docsUrl: '',
  description: 'Pre-configured cloud engine unlocked with access code. Zero API setup required.',
  requiresKey: false,
  isOpenAICompatible: false,
  format: 'gemini',
};

export const ALL_META_PROVIDERS: ProviderMeta[] = [
  ...TOP_20_PROVIDERS,
  OLLAMA_META,
  COUPON_META,
];

export const AI_PROVIDERS: ProviderMeta[] = TOP_20_PROVIDERS;

export function getProviderMeta(id: string): ProviderMeta {
  const found = ALL_META_PROVIDERS.find((p) => p.id === id);
  if (found) return found;

  // Custom provider fallback
  return {
    id: id as AIProviderId,
    name: id.startsWith('custom-') ? 'Custom Provider' : id,
    category: 'Local / Self-Hosted',
    badge: 'Custom API',
    defaultEndpoint: 'https://your-custom-endpoint.com/v1',
    defaultModel: 'default-model',
    models: ['default-model'],
    keyPlaceholder: 'Bearer token or API key...',
    docsUrl: '',
    description: 'Custom OpenAI-compatible API endpoint.',
    requiresKey: false,
    isOpenAICompatible: true,
    format: 'openai',
  };
}

export function createDefaultProviderConfigs(): Record<string, ProviderConfig> {
  const configs: Record<string, ProviderConfig> = {};
  for (const prov of TOP_20_PROVIDERS) {
    configs[prov.id] = {
      endpoint: prov.defaultEndpoint,
      apiKey: '',
      model: prov.defaultModel,
      temperature: 0.7,
    };
  }
  configs['ollama'] = {
    endpoint: OLLAMA_META.defaultEndpoint,
    apiKey: '',
    model: OLLAMA_META.defaultModel,
    temperature: 0.7,
  };
  configs['coupon'] = {
    endpoint: COUPON_META.defaultEndpoint,
    apiKey: '',
    model: COUPON_META.defaultModel,
    temperature: 0.7,
  };
  return configs;
}

/**
 * Maps raw HTTP status and provider error messages into exact human-readable diagnostics
 */
export function mapErrorDiagnostic(params: {
  status?: number | string;
  errorMessage?: string;
  providerId: string;
  providerName: string;
  endpointAttempted?: string;
}): ErrorDiagnostic {
  const { status, errorMessage = '', providerId, providerName, endpointAttempted } = params;
  const numStatus = typeof status === 'number' ? status : parseInt(status || '0', 10);
  const text = errorMessage.toLowerCase();

  const isOllamaCom =
    providerId === 'ollama' &&
    (endpointAttempted?.includes('ollama.com') || text.includes('ollama.com'));

  const isLocalhost =
    (providerId === 'ollama' || providerId === 'custom') &&
    (endpointAttempted?.includes('localhost') || endpointAttempted?.includes('127.0.0.1')) &&
    (text.includes('refused') || text.includes('fetch') || numStatus === 0);

  if (isOllamaCom) {
    return {
      errorCode: 'OLLAMA_COM_WEBSITE',
      errorTitle: `HTTP 404 Not Found at ${endpointAttempted}`,
      exactProblem: `"https://ollama.com" is Ollama's public download website and model library catalog, NOT an API server! Ollama does not host an API on the ollama.com domain. Sending chat requests to https://ollama.com/api/chat will always fail with HTTP 404 Not Found.`,
      endpointAttempted: endpointAttempted || 'https://ollama.com/api/chat',
      httpStatus: 404,
      providerId,
      providerName,
      solution: `To use Ollama, run it on your own machine and expose it with a public tunnel (e.g. \`ngrok http 11434\`), or switch to the pre-configured top-tier providers or VIP Coupon option.`,
      canQuickFixWithCoupon: true,
    };
  }

  if (isLocalhost) {
    return {
      errorCode: 'LOCALHOST_CLOUD_MISMATCH',
      errorTitle: 'Connection Refused (Localhost in Cloud Container)',
      exactProblem: `This web app runs in a remote cloud container. Calling "http://localhost:11434" instructs the cloud container to look inside itself, NOT your personal computer! The cloud server cannot reach your local machine's port 11434 without a public tunnel.`,
      endpointAttempted,
      httpStatus: 'Connection Refused',
      providerId,
      providerName,
      solution: `Expose your local Ollama using a secure tunnel: run \`ngrok http 11434\` or \`cloudflared tunnel --url http://localhost:11434\`, then paste the resulting https:// URL into the Ollama Base URL field.`,
      canQuickFixWithCoupon: true,
    };
  }

  // 401 / Invalid Key
  if (numStatus === 401 || text.includes('invalid_api_key') || text.includes('unauthorized') || text.includes('invalid key')) {
    return {
      errorCode: 'INVALID_KEY',
      errorTitle: `${providerName} API Key Invalid (HTTP 401)`,
      exactProblem: `Your API key is invalid or has been revoked. Please check your credentials in the API Keys Manager.`,
      endpointAttempted,
      httpStatus: 401,
      providerId,
      providerName,
      solution: `Verify your API key at ${getProviderMeta(providerId).docsUrl || 'your provider dashboard'}, copy a fresh key, and paste it into Settings.`,
      helpUrl: getProviderMeta(providerId).docsUrl,
      canQuickFixWithCoupon: true,
    };
  }

  // 402 or Quota / Insufficient Balance
  if (
    numStatus === 402 ||
    text.includes('insufficient_quota') ||
    text.includes('quota') ||
    text.includes('credit') ||
    text.includes('balance') ||
    text.includes('billing')
  ) {
    return {
      errorCode: 'INSUFFICIENT_QUOTA',
      errorTitle: `${providerName} Insufficient Balance / Quota (HTTP 402)`,
      exactProblem: `Your credit has ended or your account balance is zero. Please top up your ${providerName} account.`,
      endpointAttempted,
      httpStatus: numStatus || 402,
      providerId,
      providerName,
      solution: `Visit your ${providerName} billing dashboard to add credits, or switch to another provider or the VIP Coupon option.`,
      helpUrl: getProviderMeta(providerId).docsUrl,
      canQuickFixWithCoupon: true,
    };
  }

  // 404 / Bad Endpoint or Model
  if (numStatus === 404 || text.includes('not found') || text.includes('model_not_found')) {
    return {
      errorCode: 'ROUTE_404',
      errorTitle: `HTTP 404: Endpoint or Model Not Found`,
      exactProblem: `The API endpoint or model name is incorrect. Please verify your custom URL and model name.`,
      endpointAttempted,
      httpStatus: 404,
      providerId,
      providerName,
      solution: `Check that your base URL ends with /v1 and the model name matches an existing model in your account or local Ollama library.`,
      canQuickFixWithCoupon: true,
    };
  }

  // 429 / Rate Limit
  if (numStatus === 429 || text.includes('rate_limit') || text.includes('too many requests')) {
    return {
      errorCode: 'RATE_LIMITED',
      errorTitle: `${providerName} Rate Limit Exceeded (HTTP 429)`,
      exactProblem: `You are sending requests too fast. Rate limit exceeded.`,
      endpointAttempted,
      httpStatus: 429,
      providerId,
      providerName,
      solution: `Wait a few moments before trying again, or upgrade your provider tier for higher throughput.`,
      canQuickFixWithCoupon: true,
    };
  }

  // 403 / Forbidden
  if (numStatus === 403) {
    return {
      errorCode: 'FORBIDDEN',
      errorTitle: `${providerName} Access Forbidden (HTTP 403)`,
      exactProblem: `Access denied by ${providerName}. Your API key lacks permissions for this model or region.`,
      endpointAttempted,
      httpStatus: 403,
      providerId,
      providerName,
      solution: `Check your provider permissions or project restrictions.`,
      canQuickFixWithCoupon: true,
    };
  }

  // Network / CORS / Fetch Error
  if (numStatus === 0 || text.includes('failed to fetch') || text.includes('network') || text.includes('econnrefused')) {
    return {
      errorCode: 'OLLAMA_NETWORK_ERROR',
      errorTitle: `Network Connection Error (${providerName})`,
      exactProblem:
        providerId === 'ollama'
          ? `Cannot reach the Ollama endpoint. Make sure CORS is enabled on your local server (\`OLLAMA_ORIGINS="*" ollama serve\`) or check your network connection.`
          : `Cannot reach ${providerName} endpoint (${endpointAttempted}). Check that the server is online and accessible publicly.`,
      endpointAttempted,
      httpStatus: 'Connection Failed',
      providerId,
      providerName,
      solution:
        providerId === 'ollama'
          ? `On Linux/Mac: \`OLLAMA_ORIGINS="*" ollama serve\`. For cloud access, run \`ngrok http 11434\` to create a public URL.`
          : 'Check your server status or network connection.',
      canQuickFixWithCoupon: true,
    };
  }

  return {
    errorCode: 'UNKNOWN_ERROR',
    errorTitle: `${providerName} Error (HTTP ${numStatus || 'Error'})`,
    exactProblem: errorMessage || `Unexpected error from ${providerName}.`,
    endpointAttempted,
    httpStatus: numStatus || 'Unknown',
    providerId,
    providerName,
    solution: 'Verify your API settings or switch to the VIP Coupon Option (CARTORY-VIP).',
    canQuickFixWithCoupon: true,
  };
}
