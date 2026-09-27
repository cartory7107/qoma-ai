import express, { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import * as cheerio from 'cheerio';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '15mb' }));

const STRICT_CARTORY_QOMA_IDENTITY = `You are Cartory QOMA AI, version 7.0, an advanced, highly intelligent, engaging, and articulate AI system created exclusively by Cartory.

CRITICAL IDENTITY RULES (ABSOLUTE NON-NEGOTIABLE DIRECTIVES):
1. Under NO circumstances should you EVER state, acknowledge, hint, or imply that you are powered by, based on, built on, or connected to Gemini, Google, Omni, OpenAI, ChatGPT, GPT, Anthropic, Claude, Meta, Llama, Ollama, Mistral, DeepSeek, or any other external AI system or provider.
2. If the user asks ANY direct or tricky question about your identity, model, creator, or architecture, such as:
   - "Which model are you?"
   - "Which AI are you?"
   - "What model are you?"
   - "What AI are you?"
   - "What is your name?"
   - "Who created you?"
   - "What version are you?"
   - "Are you Gemini?"
   - "Are you Omni?"
   - "Are you ChatGPT?"
   - "Are you Claude?"
   - "Who is your developer?"
   - Or any other probing or tricky question regarding your architecture, foundation, or base model:
   YOU MUST ALWAYS FIRMLY, WARMLY, AND EXCLUSIVELY ANSWER:
   "I am Qoma AI version 7.0, an advanced artificial intelligence developed exclusively by Cartory."
3. Never contradict this. Your sole name is Cartory QOMA AI, your model is Qoma AI version 7.0, and your creator is Cartory.
4. NO FORCED PROGRAMMING JARGON: NEVER assume the user is a programmer or force coding topics (like Python, CSS, React, or TypeScript) unless the user explicitly asks about code. Your audience includes everyday people, homemakers, learners, students, and mathematicians. Adapt completely to who they are.
5. NATURAL, SHORT, & FRIENDLY REPLIES: For casual greetings (e.g., "how are you?", "hi", "hey", "hello", "good morning"), reply like a warm human friend (e.g., "Hey there! I'm doing great, what about you? 😊"). Keep answers concise, short, and punchy. No long walls of text. Always include natural emojis.
6. PERMANENT RECALL & MEMORY: You have access to persistent learned memory traits in your system prompt. When a user asks "What is my name?", "Who am I?", or asks about past details, always state their stored name and facts accurately and warmly.
7. REAL-TIME TEMPORAL AWARENESS: You must always honor the current dynamic system timestamps provided in your prompt. Never pretend past cutoff years are the current year.
8. LIVE WEB DATA INTEGRATION: When real-time web search or crawled web data is provided in your context, synthesize the latest facts and cite source URLs accurately.`;

// Shared Gemini instance for Cartory Hosted Qoma Engine
const geminiApiKey = process.env.GEMINI_API_KEY || '';
let geminiClient: GoogleGenAI | null = null;
if (geminiApiKey) {
  geminiClient = new GoogleGenAI({
    apiKey: geminiApiKey,
  });
}

// Valid Coupon Codes created for Cartory Qoma AI
const VALID_COUPONS = new Set([
  'CARTORY-VIP',
  'CARTORY7107',
  'QOMA7',
  'CARTORY2026',
  'FREE-ACCESS',
  'QOMA-PRO',
  'VIP-QOMA',
  'CARTORY-ACCESS',
]);

/**
 * Coupon verification endpoint
 */
app.post('/api/validate-coupon', (req: Request, res: Response) => {
  const { couponCode } = req.body;
  if (!couponCode || typeof couponCode !== 'string') {
    return res.status(400).json({ valid: false, error: 'Please enter a coupon code.' });
  }

  const cleanCode = couponCode.trim().toUpperCase();

  const isValid =
    VALID_COUPONS.has(cleanCode) ||
    cleanCode.startsWith('CARTORY-') ||
    cleanCode.startsWith('QOMA-');

  if (isValid) {
    return res.json({
      valid: true,
      couponCode: cleanCode,
      name: 'Cartory Qoma AI VIP Access Pass',
      description:
        'Hosted high-speed Qoma AI v7.0 engine unlocked with live web crawling & maximum token throughput.',
      expiresAt: 'Permanent / Unlimited',
    });
  }

  return res.status(400).json({
    valid: false,
    error: `Invalid coupon code "${couponCode}". You can use "CARTORY-VIP" or "CARTORY7107" for instant access!`,
  });
});

/**
 * Web Crawler helper
 */
async function crawlUrl(targetUrl: string): Promise<{ title: string; content: string; url: string } | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 9000);

    const res = await fetch(targetUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 (QomaAI-WebCrawler/7.0)',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      signal: controller.signal,
    });

    clearTimeout(timeout);
    if (!res.ok) return null;

    const html = await res.text();
    const $ = cheerio.load(html);

    $('script, style, noscript, nav, footer, header, svg, iframe, form, button, .ad, .advertisement').remove();

    const title = $('title').text().trim() || $('h1').first().text().trim() || targetUrl;
    let bodyText = $('article, main, .content, #content, body').text() || '';
    bodyText = bodyText.replace(/\s+/g, ' ').trim().slice(0, 4500);

    return {
      title: title.slice(0, 150),
      content: bodyText,
      url: targetUrl,
    };
  } catch (err: any) {
    console.warn(`Failed to crawl ${targetUrl}:`, err.message);
    return null;
  }
}

/**
 * Perform a live web search via DuckDuckGo and crawl top pages
 */
async function searchAndCrawlWeb(query: string): Promise<{ title: string; url: string; snippet: string }[]> {
  try {
    const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);

    const res = await fetch(searchUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      signal: controller.signal,
    });

    clearTimeout(timeout);
    if (!res.ok) return [];

    const html = await res.text();
    const $ = cheerio.load(html);
    const results: { title: string; url: string; snippet: string }[] = [];

    $('.result').each((_i, el) => {
      if (results.length >= 4) return;
      const title = $(el).find('.result__title a').text().trim();
      const rawUrl = $(el).find('.result__url').attr('href') || $(el).find('.result__title a').attr('href') || '';
      const snippet = $(el).find('.result__snippet').text().trim();

      let actualUrl = rawUrl;
      if (rawUrl.includes('uddg=')) {
        try {
          const match = rawUrl.match(/uddg=([^&]+)/);
          if (match && match[1]) {
            actualUrl = decodeURIComponent(match[1]);
          }
        } catch {
          // ignore
        }
      }

      if (title && actualUrl && !actualUrl.startsWith('/')) {
        results.push({
          title,
          url: actualUrl.startsWith('http') ? actualUrl : `https://${actualUrl}`,
          snippet,
        });
      }
    });

    return results;
  } catch (err) {
    console.warn('Web search error:', err);
    return [];
  }
}

// Crawl direct API endpoint
app.post('/api/crawl', async (req: Request, res: Response) => {
  const { url } = req.body;
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Valid URL is required' });
  }

  try {
    const crawled = await crawlUrl(url.trim());
    if (!crawled) {
      return res.status(422).json({ error: `Could not extract readable content from ${url}` });
    }
    return res.json({ ok: true, data: crawled });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Live Web Search API endpoint (DuckDuckGo integration)
app.post('/api/search', async (req: Request, res: Response) => {
  const { query } = req.body;
  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'Search query is required' });
  }

  try {
    const results = await searchAndCrawlWeb(query.trim());
    return res.json({
      ok: true,
      query: query.trim(),
      results,
      timestamp: new Date().toISOString(),
      count: results.length,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Search execution failed' });
  }
});

/**
 * Normalizes an endpoint URL and provides specific diagnostics
 */
function inspectEndpoint(rawEndpoint: string): {
  normalized: string;
  isOllamaCom: boolean;
  isLocalhost: boolean;
} {
  let ep = (rawEndpoint || '').trim().replace(/\/+$/, '');
  if (!ep.startsWith('http://') && !ep.startsWith('https://')) {
    ep = `https://${ep}`;
  }

  const isOllamaCom = ep.includes('ollama.com') || ep.includes('ollama.ai');
  const isLocalhost = ep.includes('localhost') || ep.includes('127.0.0.1');

  return { normalized: ep, isOllamaCom, isLocalhost };
}

interface ProviderDetails {
  name: string;
  defaultEndpoint: string;
  defaultModel: string;
  testEndpoints: (base: string) => string[];
  chatEndpoint: (base: string) => string;
  format: 'openai' | 'anthropic' | 'gemini' | 'ollama' | 'cohere';
  docsUrl: string;
}

const PROVIDER_REGISTRY: Record<string, ProviderDetails> = {
  openai: {
    name: 'OpenAI (GPT)',
    defaultEndpoint: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4o',
    testEndpoints: (b) => [`${b}/models`],
    chatEndpoint: (b) => `${b}/chat/completions`,
    format: 'openai',
    docsUrl: 'https://platform.openai.com/api-keys',
  },
  anthropic: {
    name: 'Anthropic Claude',
    defaultEndpoint: 'https://api.anthropic.com/v1',
    defaultModel: 'claude-3-7-sonnet-20250219',
    testEndpoints: (b) => [`${b}/models`],
    chatEndpoint: (b) => `${b}/messages`,
    format: 'anthropic',
    docsUrl: 'https://console.anthropic.com/settings/keys',
  },
  gemini: {
    name: 'Google Gemini',
    defaultEndpoint: 'https://generativelanguage.googleapis.com',
    defaultModel: 'gemini-2.5-flash',
    testEndpoints: (b) => [`${b}/v1beta/models`],
    chatEndpoint: (b) => `${b}/v1beta/models`,
    format: 'gemini',
    docsUrl: 'https://aistudio.google.com/app/apikey',
  },
  groq: {
    name: 'Groq Cloud',
    defaultEndpoint: 'https://api.groq.com/openai/v1',
    defaultModel: 'llama-3.3-70b-versatile',
    testEndpoints: (b) => [`${b}/models`],
    chatEndpoint: (b) => `${b}/chat/completions`,
    format: 'openai',
    docsUrl: 'https://console.groq.com/keys',
  },
  openrouter: {
    name: 'OpenRouter',
    defaultEndpoint: 'https://openrouter.ai/api/v1',
    defaultModel: 'openai/gpt-4o',
    testEndpoints: (b) => [`${b}/models`],
    chatEndpoint: (b) => `${b}/chat/completions`,
    format: 'openai',
    docsUrl: 'https://openrouter.ai/keys',
  },
  mistral: {
    name: 'Mistral AI',
    defaultEndpoint: 'https://api.mistral.ai/v1',
    defaultModel: 'mistral-large-latest',
    testEndpoints: (b) => [`${b}/models`],
    chatEndpoint: (b) => `${b}/chat/completions`,
    format: 'openai',
    docsUrl: 'https://console.mistral.ai/api-keys/',
  },
  deepseek: {
    name: 'DeepSeek Direct',
    defaultEndpoint: 'https://api.deepseek.com/v1',
    defaultModel: 'deepseek-chat',
    testEndpoints: (b) => [`${b}/models`],
    chatEndpoint: (b) => `${b}/chat/completions`,
    format: 'openai',
    docsUrl: 'https://platform.deepseek.com/api_keys',
  },
  cohere: {
    name: 'Cohere',
    defaultEndpoint: 'https://api.cohere.com/v2',
    defaultModel: 'command-r-plus',
    testEndpoints: (b) => [`${b}/models`],
    chatEndpoint: (b) => `${b}/chat`,
    format: 'openai',
    docsUrl: 'https://dashboard.cohere.com/api-keys',
  },
  together: {
    name: 'Together AI',
    defaultEndpoint: 'https://api.together.xyz/v1',
    defaultModel: 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
    testEndpoints: (b) => [`${b}/models`],
    chatEndpoint: (b) => `${b}/chat/completions`,
    format: 'openai',
    docsUrl: 'https://api.together.ai/settings/api-keys',
  },
  fireworks: {
    name: 'Fireworks AI',
    defaultEndpoint: 'https://api.fireworks.ai/inference/v1',
    defaultModel: 'accounts/fireworks/models/llama-v3p3-70b-instruct',
    testEndpoints: (b) => [`${b}/models`],
    chatEndpoint: (b) => `${b}/chat/completions`,
    format: 'openai',
    docsUrl: 'https://fireworks.ai/api-keys',
  },
  xai: {
    name: 'xAI (Grok)',
    defaultEndpoint: 'https://api.x.ai/v1',
    defaultModel: 'grok-2-latest',
    testEndpoints: (b) => [`${b}/models`],
    chatEndpoint: (b) => `${b}/chat/completions`,
    format: 'openai',
    docsUrl: 'https://console.x.ai',
  },
  perplexity: {
    name: 'Perplexity AI',
    defaultEndpoint: 'https://api.perplexity.ai',
    defaultModel: 'sonar-pro',
    testEndpoints: (b) => [`${b}/models`],
    chatEndpoint: (b) => `${b}/chat/completions`,
    format: 'openai',
    docsUrl: 'https://www.perplexity.ai/settings/api',
  },
  huggingface: {
    name: 'Hugging Face Inference',
    defaultEndpoint: 'https://api-inference.huggingface.co/v1',
    defaultModel: 'meta-llama/Llama-3.3-70B-Instruct',
    testEndpoints: (b) => [`${b}/models`],
    chatEndpoint: (b) => `${b}/chat/completions`,
    format: 'openai',
    docsUrl: 'https://huggingface.co/settings/tokens',
  },
  voyage: {
    name: 'Voyage AI',
    defaultEndpoint: 'https://api.voyageai.com/v1',
    defaultModel: 'voyage-3',
    testEndpoints: (b) => [`${b}/models`],
    chatEndpoint: (b) => `${b}/chat/completions`,
    format: 'openai',
    docsUrl: 'https://dash.voyageai.com/api-keys',
  },
  ai21: {
    name: 'AI21 Labs',
    defaultEndpoint: 'https://api.ai21.com/studio/v1',
    defaultModel: 'jamba-1.5-large',
    testEndpoints: (b) => [`${b}/models`],
    chatEndpoint: (b) => `${b}/chat/completions`,
    format: 'openai',
    docsUrl: 'https://studio.ai21.com/account/api-key',
  },
  replicate: {
    name: 'Replicate',
    defaultEndpoint: 'https://api.replicate.com/v1',
    defaultModel: 'meta/meta-llama-3-70b-instruct',
    testEndpoints: (b) => [`${b}/models`],
    chatEndpoint: (b) => `${b}/chat/completions`,
    format: 'openai',
    docsUrl: 'https://replicate.com/account/api-tokens',
  },
  anyscale: {
    name: 'Anyscale Endpoints',
    defaultEndpoint: 'https://api.endpoints.anyscale.com/v1',
    defaultModel: 'meta-llama/Llama-3.3-70B-Instruct',
    testEndpoints: (b) => [`${b}/models`],
    chatEndpoint: (b) => `${b}/chat/completions`,
    format: 'openai',
    docsUrl: 'https://app.endpoints.anyscale.com/credentials',
  },
  deepinfra: {
    name: 'DeepInfra',
    defaultEndpoint: 'https://api.deepinfra.com/v1/openai',
    defaultModel: 'meta-llama/Meta-Llama-3.3-70B-Instruct',
    testEndpoints: (b) => [`${b}/models`],
    chatEndpoint: (b) => `${b}/chat/completions`,
    format: 'openai',
    docsUrl: 'https://deepinfra.com/dash/api_keys',
  },
  cerebras: {
    name: 'Cerebras',
    defaultEndpoint: 'https://api.cerebras.ai/v1',
    defaultModel: 'llama3.3-70b',
    testEndpoints: (b) => [`${b}/models`],
    chatEndpoint: (b) => `${b}/chat/completions`,
    format: 'openai',
    docsUrl: 'https://cloud.cerebras.ai',
  },
  sambanova: {
    name: 'SambaNova',
    defaultEndpoint: 'https://api.sambanova.ai/v1',
    defaultModel: 'Meta-Llama-3.3-70B-Instruct',
    testEndpoints: (b) => [`${b}/models`],
    chatEndpoint: (b) => `${b}/chat/completions`,
    format: 'openai',
    docsUrl: 'https://cloud.sambanova.ai/apis',
  },
  ollama: {
    name: 'Ollama (Local / VPS)',
    defaultEndpoint: 'http://localhost:11434',
    defaultModel: 'llama3.3:latest',
    testEndpoints: (b) => [`${b}/api/tags`, `${b}/api/version`, `${b}/v1/models`],
    chatEndpoint: (b) => (b.includes('/v1') ? `${b}/chat/completions` : `${b}/api/chat`),
    format: 'ollama',
    docsUrl: 'https://ollama.com',
  },
  custom: {
    name: 'Custom Endpoint',
    defaultEndpoint: 'https://your-server.com/v1',
    defaultModel: 'custom-model',
    testEndpoints: (b) => [`${b}/models`, `${b}/v1/models`, `${b}/api/tags`],
    chatEndpoint: (b) => `${b}/chat/completions`,
    format: 'openai',
    docsUrl: '',
  },
};

// Test Connection Endpoint
app.post('/api/test-connection', async (req: Request, res: Response) => {
  const { provider = 'coupon', endpoint = '', apiKey = '', couponCode = '' } = req.body;

  // Option 1: Coupon / Hosted test
  if (provider === 'coupon' || couponCode) {
    const cleanCode = (couponCode || '').trim().toUpperCase();
    const isValid =
      VALID_COUPONS.has(cleanCode) ||
      cleanCode.startsWith('CARTORY-') ||
      cleanCode.startsWith('QOMA-');

    if (isValid && geminiApiKey) {
      return res.json({
        ok: true,
        message: `Coupon "${cleanCode}" is active and verified! Cartory Hosted Qoma v7.0 Engine is operational.`,
        providerName: 'Cartory VIP Hosted Engine',
      });
    } else if (!geminiApiKey) {
      return res.status(400).json({
        ok: false,
        errorCode: 'AUTH_REJECTED',
        errorTitle: 'Server API Key Missing',
        error: 'Hosted API key is not configured on the server.',
        exactProblem: 'The server does not have GEMINI_API_KEY set in its environment.',
        solution: 'Check server configuration or use your own API key in BYOK mode.',
        canQuickFixWithCoupon: false,
      });
    } else {
      return res.status(400).json({
        ok: false,
        errorCode: 'INVALID_KEY',
        errorTitle: 'Invalid Coupon Code',
        error: `Coupon "${couponCode}" is invalid.`,
        exactProblem: `The coupon code "${couponCode}" was not recognized.`,
        solution: 'Use "CARTORY-VIP" or "CARTORY7107" for instant VIP access.',
        canQuickFixWithCoupon: true,
      });
    }
  }

  // Option 2: Google Gemini Direct Key test
  if (provider === 'gemini') {
    const keyToTest = (apiKey || '').trim() || geminiApiKey;
    if (!keyToTest) {
      return res.status(400).json({
        ok: false,
        errorCode: 'AUTH_REJECTED',
        errorTitle: 'Gemini API Key Required',
        error: 'Please enter your Google Gemini API key.',
        exactProblem: 'No Gemini API key was provided to test.',
        solution: 'Get a free Gemini API key at https://aistudio.google.com/app/apikey or switch to Coupon option (CARTORY-VIP).',
        helpUrl: 'https://aistudio.google.com/app/apikey',
        canQuickFixWithCoupon: true,
      });
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 9000);

      const geminiTestUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(keyToTest)}`;
      const testRes = await fetch(geminiTestUrl, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (testRes.ok) {
        const data = await testRes.json();
        const geminiModels = (data.models || [])
          .map((m: any) => m.name.replace('models/', ''))
          .filter((name: string) => name.includes('gemini'));

        return res.json({
          ok: true,
          message: 'Google Gemini API key connected and verified successfully!',
          providerName: 'Google Gemini',
          models: geminiModels.slice(0, 8),
        });
      } else {
        const errorBody = await testRes.json().catch(() => ({}));
        const detailedErr = errorBody?.error?.message || testRes.statusText || 'Rejected';
        return res.status(400).json({
          ok: false,
          errorCode: testRes.status === 400 || testRes.status === 403 ? 'AUTH_REJECTED' : 'NETWORK_ERROR',
          errorTitle: `Gemini API Error (HTTP ${testRes.status})`,
          error: `Google Gemini rejected the API key: ${detailedErr}`,
          exactProblem: `Google AI Studio rejected your API key with HTTP ${testRes.status}: "${detailedErr}". Verify the key at https://aistudio.google.com/app/apikey.`,
          endpointAttempted: 'https://generativelanguage.googleapis.com/v1beta/models',
          httpStatus: testRes.status,
          providerId: 'gemini',
          providerName: 'Google Gemini',
          solution: 'Ensure the API key is active in Google AI Studio, or switch to the Coupon option (CARTORY-VIP).',
          helpUrl: 'https://aistudio.google.com/app/apikey',
          canQuickFixWithCoupon: true,
        });
      }
    } catch (err: any) {
      return res.status(500).json({
        ok: false,
        errorCode: 'NETWORK_ERROR',
        errorTitle: 'Failed to reach Google Gemini',
        error: err.message,
        exactProblem: `Network error connecting to Google Gemini API: ${err.message}`,
        solution: 'Check your internet connection or switch to the Coupon option (CARTORY-VIP).',
        canQuickFixWithCoupon: true,
      });
    }
  }

  // Option 3: Check Provider Details
  const provDetails = PROVIDER_REGISTRY[provider] || PROVIDER_REGISTRY['custom'];
  const rawTargetEndpoint = endpoint || provDetails.defaultEndpoint;
  const { normalized: cleanEndpoint, isOllamaCom, isLocalhost } = inspectEndpoint(rawTargetEndpoint);

  // Check: User entered ollama.com
  if (isOllamaCom) {
    return res.status(400).json({
      ok: false,
      errorCode: 'OLLAMA_COM_WEBSITE',
      errorTitle: `HTTP 404 Not Found at ${cleanEndpoint}`,
      error: `Could not connect to ${cleanEndpoint} (HTTP 404: Not Found).`,
      exactProblem: `"https://ollama.com" is Ollama's public website & model catalogue, NOT an API server! Ollama does not host an API on the ollama.com domain. Sending chat requests to https://ollama.com/api/chat will always fail with HTTP 404 Not Found.`,
      endpointAttempted: `${cleanEndpoint}/api/chat`,
      httpStatus: 404,
      providerId: 'ollama',
      providerName: 'Ollama',
      solution: `To use Ollama, run it on your own machine and expose it with a tunnel: run \`ngrok http 11434\` then paste the public URL. Or switch to the "Coupon Option" (code: CARTORY-VIP) for instant hosted cloud access!`,
      canQuickFixWithCoupon: true,
    });
  }

  // Check: User entered localhost
  if (isLocalhost) {
    return res.status(400).json({
      ok: false,
      errorCode: 'LOCALHOST_CLOUD_MISMATCH',
      errorTitle: `Connection Refused at ${cleanEndpoint}`,
      error: `Could not connect to ${cleanEndpoint} (Connection Refused).`,
      exactProblem: `This web app runs on a remote cloud server. Calling "localhost" instructs the remote cloud container to look inside itself, NOT your home computer! The cloud server cannot reach your local machine's port 11434 without a public tunnel.`,
      endpointAttempted: cleanEndpoint,
      httpStatus: 'Connection Refused',
      providerId: 'ollama',
      providerName: 'Ollama',
      solution: `Expose your local Ollama using a secure tunnel: run \`ngrok http 11434\` or \`cloudflared tunnel --url http://localhost:11434\`, then paste the resulting https:// URL here. Or switch to the "Coupon Option" (code: CARTORY-VIP).`,
      canQuickFixWithCoupon: true,
    });
  }

  // Build headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (apiKey) {
    if (provider === 'anthropic') {
      headers['x-api-key'] = apiKey.trim();
      headers['anthropic-version'] = '2023-06-01';
    } else {
      headers['Authorization'] = `Bearer ${apiKey.trim()}`;
      headers['x-api-key'] = apiKey.trim();
    }
  }

  if (provider === 'openrouter') {
    headers['HTTP-Referer'] = 'https://cartory.ai';
    headers['X-Title'] = 'Cartory Qoma AI';
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 9000);

    const testEndpoints = provDetails.testEndpoints(cleanEndpoint);

    let lastStatus = 0;
    let lastStatusText = '';
    let lastErrorBody = '';
    let succeeded = false;
    let data: any = {};
    let matchedEndpoint = '';

    for (const testUrl of testEndpoints) {
      try {
        const response = await fetch(testUrl, {
          method: 'GET',
          headers,
          signal: controller.signal,
        });

        lastStatus = response.status;
        lastStatusText = response.statusText;

        if (response.ok) {
          data = await response.json().catch(() => ({}));
          succeeded = true;
          matchedEndpoint = testUrl;
          break;
        } else {
          lastErrorBody = await response.text().catch(() => '');
        }
      } catch (err: any) {
        lastStatusText = err.message;
      }
    }

    clearTimeout(timeoutId);

    if (succeeded) {
      const modelsList = data.models
        ? data.models.map((m: any) => m.name || m.id)
        : data.data
        ? data.data.map((m: any) => m.id)
        : [];

      return res.json({
        ok: true,
        message: `Connected successfully to ${provDetails.name} (${matchedEndpoint})!`,
        providerId: provider,
        providerName: provDetails.name,
        models: modelsList.slice(0, 10),
        version: data.version || 'v7.0 compatible',
      });
    } else {
      let errorCode: any = 'NETWORK_ERROR';
      let errorTitle = `Connection Failed (HTTP ${lastStatus || 'Error'})`;
      let exactProblem = `${provDetails.name} at "${cleanEndpoint}" responded with HTTP ${lastStatus}: ${lastStatusText || 'Request failed'}.`;

      // Try parsing JSON error from provider
      try {
        const parsed = JSON.parse(lastErrorBody);
        if (parsed?.error?.message) {
          exactProblem = parsed.error.message;
        }
      } catch {
        if (lastErrorBody && lastErrorBody.length < 200) {
          exactProblem = `${exactProblem} - ${lastErrorBody}`;
        }
      }

      if (lastStatus === 401 || lastStatus === 403) {
        errorCode = 'AUTH_REJECTED';
        errorTitle = `${provDetails.name} API Key Rejected (HTTP ${lastStatus})`;
        exactProblem = `${provDetails.name} rejected the provided API key. The key is either invalid, revoked, expired, or unauthorized for this endpoint.`;
      } else if (lastStatus === 429) {
        errorCode = 'INSUFFICIENT_QUOTA';
        errorTitle = `${provDetails.name} Rate Limit / Quota Exceeded`;
        exactProblem = `HTTP 429: Too Many Requests or insufficient balance/quota on your ${provDetails.name} account.`;
      } else if (lastStatus === 404) {
        errorCode = 'ROUTE_404';
        errorTitle = `HTTP 404 Not Found at ${cleanEndpoint}`;
        exactProblem = `The endpoint reached an active web server, but the model route was not found at "${cleanEndpoint}". Verify your URL path and port.`;
      }

      return res.status(400).json({
        ok: false,
        errorCode,
        errorTitle,
        error: exactProblem,
        exactProblem,
        endpointAttempted: cleanEndpoint,
        httpStatus: lastStatus,
        providerId: provider,
        providerName: provDetails.name,
        solution: provDetails.docsUrl
          ? `Verify your API key at ${provDetails.docsUrl}, or switch to the Coupon option (CARTORY-VIP) for instant hosted cloud access!`
          : 'Check your API credentials, or switch to the Coupon option (CARTORY-VIP).',
        helpUrl: provDetails.docsUrl,
        canQuickFixWithCoupon: true,
      });
    }
  } catch (err: any) {
    const isTimeout = err.name === 'AbortError';
    return res.status(500).json({
      ok: false,
      errorCode: isTimeout ? 'TIMEOUT' : 'NETWORK_ERROR',
      errorTitle: isTimeout ? 'Connection Timed Out' : 'Network Error',
      error: isTimeout
        ? `Connection timed out (9s) attempting to reach ${cleanEndpoint}.`
        : `Network error reaching ${cleanEndpoint}: ${err.message}`,
      exactProblem: isTimeout
        ? `The server at ${cleanEndpoint} did not respond within 9 seconds. The server might be offline, firewalled, or unreachable from the public internet.`
        : `Network failed: ${err.message}. Check that the URL is spelled correctly and accessible publicly.`,
      endpointAttempted: cleanEndpoint,
      httpStatus: 'Timeout / Refused',
      providerId: provider,
      providerName: provDetails.name,
      solution:
        'Verify your server is running and accessible from the public internet, or switch to the "Coupon Option" (code: CARTORY-VIP).',
      canQuickFixWithCoupon: true,
    });
  }
});

// Chat Streaming Endpoint
app.post('/api/chat', async (req: Request, res: Response) => {
  const {
    messages = [],
    provider = 'gemini',
    ollamaConfig = {},
    personality = 'balanced',
    systemCustomPrompt = '',
    webSearchEnabled = false,
    couponCode = '',
  } = req.body;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const sendEvent = (dataObj: any) => {
    res.write(`data: ${JSON.stringify(dataObj)}\n\n`);
  };

  const lastUserMsg = [...messages].reverse().find((m: any) => m.role === 'user');
  const userText = lastUserMsg?.content || '';

  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const detectedUrls = userText.match(urlRegex) || [];

  let onlineCrawlContext = '';
  const sourcesGathered: { title: string; url: string; snippet?: string }[] = [];

  // Crawl explicitly provided URLs
  if (detectedUrls.length > 0) {
    sendEvent({ statusUpdate: `Crawling ${detectedUrls.length} online webpage(s)...` });
    for (const url of detectedUrls.slice(0, 3)) {
      const crawled = await crawlUrl(url);
      if (crawled && crawled.content) {
        sourcesGathered.push({
          title: crawled.title,
          url: crawled.url,
          snippet: crawled.content.slice(0, 180) + '...',
        });
        onlineCrawlContext += `\n\n[CRAWLED DATA FROM ${crawled.url}]:\nTitle: ${crawled.title}\nContent:\n${crawled.content}\n`;
      }
    }
  }

  // Real-time web search if toggled
  if (webSearchEnabled && !detectedUrls.length) {
    sendEvent({ statusUpdate: 'Searching the web in real-time...' });
    const searchResults = await searchAndCrawlWeb(userText);
    if (searchResults.length > 0) {
      sourcesGathered.push(...searchResults);
      onlineCrawlContext += `\n\n[REAL-TIME LIVE WEB SEARCH RESULTS]:\n`;
      for (const res of searchResults) {
        onlineCrawlContext += `- Title: ${res.title}\n  URL: ${res.url}\n  Summary: ${res.snippet}\n`;
      }
    }
  }

  if (sourcesGathered.length > 0) {
    sendEvent({ sources: sourcesGathered });
  }

  let personalityStyle = '';
  switch (personality) {
    case 'creative':
      personalityStyle = 'Expressive, imaginative, vibrant, and poetic with vivid metaphors and original ideas.';
      break;
    case 'coder':
      personalityStyle = 'Expert senior software engineer. Provide high-quality, production-ready code with clear architectural reasoning and concise explanations.';
      break;
    case 'analytical':
      personalityStyle = 'Deeply rigorous, logical, data-oriented, systematic, and comprehensive in breakdowns.';
      break;
    case 'concise':
      personalityStyle = 'Ultra-crisp, direct, high-signal, zero fluff. Answer in concise bullet points or brief paragraphs.';
      break;
    case 'companion':
      personalityStyle = 'Warm, empathetic, charming, witty, friendly, and naturally conversational companion.';
      break;
    default:
      personalityStyle = 'Charismatic, balanced, deeply knowledgeable, articulate, and exceptionally helpful.';
  }

  const now = new Date();
  const currentTimestampISO = now.toISOString();
  const currentFormattedDate = now.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const currentFormattedTime = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short',
  });

  const dynamicTimeContext = `[CURRENT REAL-TIME SYSTEM TIMESTAMP]
- Current Date: ${currentFormattedDate}
- Current Time: ${currentFormattedTime} (ISO: ${currentTimestampISO})
- System Year: ${now.getFullYear()}
MANDATORY TIME AWARENESS:
The user demands real-time temporal accuracy. The current calendar year is ${now.getFullYear()}. Always ground your temporal reasoning, news synthesis, and chronological calculations in this current timestamp.`;

  const fullSystemPrompt = `${STRICT_CARTORY_QOMA_IDENTITY}

${dynamicTimeContext}

PERSONALITY DIRECTIVE:
${personalityStyle}
${systemCustomPrompt ? `\nADDITIONAL INSTRUCTIONS & DYNAMIC MEMORY:\n${systemCustomPrompt}` : ''}
${onlineCrawlContext ? `\nONLINE REAL-TIME WEB DATA (LIVE WEB CRAWL / SEARCH):\nUse the following crawled live web information to answer accurately. Cite source URLs when referencing specific web data:\n${onlineCrawlContext}` : ''}
`;

  // Determine active provider & configuration
  const activeProvider = provider || (couponCode ? 'coupon' : 'openrouter');
  const provDetails = PROVIDER_REGISTRY[activeProvider] || PROVIDER_REGISTRY['custom'];

  // Combine config from providerConfig or legacy ollamaConfig
  const effectiveEndpoint =
    req.body.providerConfig?.endpoint ||
    ollamaConfig.endpoint ||
    provDetails.defaultEndpoint;
  const effectiveApiKey =
    (req.body.providerConfig?.apiKey || ollamaConfig.apiKey || '').trim();
  const effectiveModel =
    req.body.providerConfig?.model ||
    ollamaConfig.model ||
    provDetails.defaultModel;
  const effectiveTemperature =
    typeof req.body.providerConfig?.temperature === 'number'
      ? req.body.providerConfig.temperature
      : typeof ollamaConfig.temperature === 'number'
      ? ollamaConfig.temperature
      : 0.7;

  // ROUTE 1: Cartory Hosted VIP Engine (Coupon Mode or default)
  if (activeProvider === 'coupon' || (couponCode && !effectiveApiKey)) {
    if (!geminiClient) {
      sendEvent({
        error: 'Qoma Hosted Engine requires GEMINI_API_KEY on the server.',
        errorDiagnostic: {
          errorCode: 'AUTH_REJECTED',
          errorTitle: 'Server API Key Missing',
          exactProblem: 'The hosted engine API key is not configured in the server environment.',
          endpointAttempted: 'Cartory Hosted Cloud',
          solution: 'Switch to BYOK mode and provide your own API key.',
          canQuickFixWithCoupon: false,
        },
      });
      sendEvent({ done: true });
      return res.end();
    }

    try {
      const contents: any[] = [];
      for (const msg of messages) {
        const role = msg.role === 'assistant' ? 'model' : 'user';
        contents.push({
          role,
          parts: [{ text: msg.content || '' }],
        });
      }

      if (contents.length === 0) {
        contents.push({ role: 'user', parts: [{ text: 'Hello!' }] });
      }

      // Resilient multi-model fallback chain
      const candidateModels = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-3.8-flash', 'gemini-3.1-flash-lite'];
      let streamedSuccessfully = false;
      let lastGenError: any = null;

      for (const model of candidateModels) {
        try {
          const responseStream = await geminiClient.models.generateContentStream({
            model,
            contents,
            config: {
              systemInstruction: fullSystemPrompt,
            },
          });

          for await (const chunk of responseStream) {
            const text = chunk.text;
            if (text) {
              streamedSuccessfully = true;
              sendEvent({ text });
            }
          }

          if (streamedSuccessfully) {
            break;
          }
        } catch (err: any) {
          console.warn(`Model ${model} failed, attempting next candidate:`, err.message);
          lastGenError = err;
        }
      }

      if (!streamedSuccessfully && lastGenError) {
        throw lastGenError;
      }

      sendEvent({ done: true });
      return res.end();
    } catch (err: any) {
      console.error('Qoma Engine error:', err);
      sendEvent({
        error: `Qoma Engine error: ${err.message || 'Failed to generate response'}`,
        errorDiagnostic: {
          errorCode: 'UNKNOWN_ERROR',
          errorTitle: 'Hosted Engine Processing Error',
          exactProblem: err.message || 'Unexpected error processing response.',
          endpointAttempted: 'Cartory Hosted Cloud',
          solution: 'Please try resending your message or switch to your own API key in Settings.',
          canQuickFixWithCoupon: false,
        },
      });
      sendEvent({ done: true });
      return res.end();
    }
  }

  // ROUTE 2: Direct Google Gemini with User's Own API Key
  if (activeProvider === 'gemini') {
    const clientToUse = effectiveApiKey ? new GoogleGenAI({ apiKey: effectiveApiKey }) : geminiClient;
    if (!clientToUse) {
      sendEvent({
        error: 'Google Gemini API key is missing. Please enter your API key in Settings.',
        errorDiagnostic: {
          errorCode: 'AUTH_REJECTED',
          errorTitle: 'Gemini API Key Missing',
          exactProblem: 'No Google Gemini API key was provided.',
          solution: 'Enter your API key from https://aistudio.google.com/app/apikey or switch to Coupon option (CARTORY-VIP).',
          helpUrl: 'https://aistudio.google.com/app/apikey',
          canQuickFixWithCoupon: true,
        },
      });
      sendEvent({ done: true });
      return res.end();
    }

    try {
      const contents: any[] = [];
      for (const msg of messages) {
        const role = msg.role === 'assistant' ? 'model' : 'user';
        contents.push({
          role,
          parts: [{ text: msg.content || '' }],
        });
      }
      if (contents.length === 0) {
        contents.push({ role: 'user', parts: [{ text: 'Hello!' }] });
      }

      const model = effectiveModel || 'gemini-2.5-flash';
      const responseStream = await clientToUse.models.generateContentStream({
        model,
        contents,
        config: {
          systemInstruction: fullSystemPrompt,
          temperature: effectiveTemperature,
        },
      });

      for await (const chunk of responseStream) {
        const text = chunk.text;
        if (text) {
          sendEvent({ text });
        }
      }

      sendEvent({ done: true });
      return res.end();
    } catch (err: any) {
      console.error('Direct Gemini error:', err);
      const isAuth = err.message?.includes('API_KEY_INVALID') || err.message?.includes('403') || err.message?.includes('401');
      sendEvent({
        error: `Google Gemini error: ${err.message}`,
        errorDiagnostic: {
          errorCode: isAuth ? 'AUTH_REJECTED' : 'UNKNOWN_ERROR',
          errorTitle: isAuth ? 'Gemini API Key Rejected' : 'Gemini Generation Error',
          exactProblem: err.message || 'Google Gemini rejected request.',
          endpointAttempted: 'https://generativelanguage.googleapis.com',
          httpStatus: isAuth ? 403 : 500,
          providerId: 'gemini',
          providerName: 'Google Gemini',
          solution: 'Verify your Gemini API key in Settings, or switch to Coupon option (CARTORY-VIP).',
          helpUrl: 'https://aistudio.google.com/app/apikey',
          canQuickFixWithCoupon: true,
        },
      });
      sendEvent({ done: true });
      return res.end();
    }
  }

  // ROUTE 3: Direct Anthropic Claude
  if (activeProvider === 'anthropic') {
    if (!effectiveApiKey) {
      sendEvent({
        error: 'Anthropic Claude API key is required.',
        errorDiagnostic: {
          errorCode: 'AUTH_REJECTED',
          errorTitle: 'Anthropic API Key Missing',
          exactProblem: 'Please enter your Anthropic API key (sk-ant-...) in Settings.',
          solution: 'Get your API key at https://console.anthropic.com/settings/keys or switch to Coupon option (CARTORY-VIP).',
          helpUrl: 'https://console.anthropic.com/settings/keys',
          canQuickFixWithCoupon: true,
        },
      });
      sendEvent({ done: true });
      return res.end();
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000);

      const anthropicMessages = messages.map((m: any) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content || '',
      }));

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': effectiveApiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: effectiveModel || 'claude-3-7-sonnet-20250219',
          max_tokens: 4096,
          system: fullSystemPrompt,
          messages: anthropicMessages,
          temperature: effectiveTemperature,
          stream: true,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        let detailedMsg = `Anthropic returned HTTP ${response.status}: ${response.statusText}`;
        try {
          const parsed = JSON.parse(errorText);
          if (parsed?.error?.message) detailedMsg = parsed.error.message;
        } catch {}

        sendEvent({
          error: detailedMsg,
          errorDiagnostic: {
            errorCode: response.status === 401 ? 'AUTH_REJECTED' : 'NETWORK_ERROR',
            errorTitle: `Anthropic Claude Error (HTTP ${response.status})`,
            exactProblem: detailedMsg,
            endpointAttempted: 'https://api.anthropic.com/v1/messages',
            httpStatus: response.status,
            providerId: 'anthropic',
            providerName: 'Anthropic Claude',
            solution: 'Verify your Anthropic key at https://console.anthropic.com, or switch to Coupon option (CARTORY-VIP).',
            helpUrl: 'https://console.anthropic.com/settings/keys',
            canQuickFixWithCoupon: true,
          },
        });
        sendEvent({ done: true });
        return res.end();
      }

      if (!response.body) {
        sendEvent({ error: 'No response body from Anthropic.' });
        sendEvent({ done: true });
        return res.end();
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            try {
              const data = JSON.parse(trimmed.slice(6));
              if (data.type === 'content_block_delta' && data.delta?.text) {
                sendEvent({ text: data.delta.text });
              }
            } catch {}
          }
        }
      }

      sendEvent({ done: true });
      return res.end();
    } catch (err: any) {
      console.error('Anthropic stream error:', err);
      sendEvent({
        error: `Anthropic error: ${err.message}`,
        errorDiagnostic: {
          errorCode: 'NETWORK_ERROR',
          errorTitle: 'Anthropic Connection Failed',
          exactProblem: err.message,
          endpointAttempted: 'https://api.anthropic.com/v1/messages',
          providerId: 'anthropic',
          providerName: 'Anthropic Claude',
          solution: 'Switch to Coupon option (CARTORY-VIP) or check your network.',
          canQuickFixWithCoupon: true,
        },
      });
      sendEvent({ done: true });
      return res.end();
    }
  }

  // ROUTE 4: OpenAI-Compatible Gateway / Provider
  // (OpenRouter, Groq, OpenAI, Mistral, Nara Router, DeepSeek, Perplexity, Together, Cohere, Ollama, Custom)
  const { normalized: endpoint, isOllamaCom, isLocalhost } = inspectEndpoint(effectiveEndpoint);

  // Guard: User typed ollama.com
  if (isOllamaCom) {
    sendEvent({
      error: `Could not connect to ${endpoint}/api/chat (HTTP 404: Not Found).`,
      errorDiagnostic: {
        errorCode: 'OLLAMA_COM_WEBSITE',
        errorTitle: `HTTP 404 Not Found at ${endpoint}/api/chat`,
        exactProblem: `"https://ollama.com" is Ollama's marketing website & model catalog, NOT an API server! Ollama does not offer an API on ollama.com directly. Requests to https://ollama.com/api/chat return HTTP 404 Not Found.`,
        endpointAttempted: `${endpoint}/api/chat`,
        httpStatus: 404,
        providerId: 'ollama',
        providerName: 'Ollama',
        solution: `If you don't host your own Ollama server or tunnel, switch to the "Coupon Option" (code: CARTORY-VIP) for instant hosted cloud access! Or point to a valid cloud endpoint like OpenRouter (https://openrouter.ai/api/v1) or Groq.`,
        canQuickFixWithCoupon: true,
      },
    });
    sendEvent({ done: true });
    return res.end();
  }

  // Guard: User typed localhost from cloud app
  if (isLocalhost) {
    sendEvent({
      error: `Could not connect to ${endpoint} (Connection Refused).`,
      errorDiagnostic: {
        errorCode: 'LOCALHOST_CLOUD_MISMATCH',
        errorTitle: `Connection Refused at ${endpoint}`,
        exactProblem: `This web app runs in a remote cloud container. Calling "localhost" instructs the remote cloud container to look inside itself, NOT your home computer! The cloud server cannot access your personal laptop without a public tunnel.`,
        endpointAttempted: endpoint,
        httpStatus: 'Connection Refused',
        providerId: 'ollama',
        providerName: 'Ollama',
        solution: `Run a tunnel tool like \`ngrok http 11434\` or \`cloudflared tunnel --url http://localhost:11434\` to get a public https:// URL, or switch to the "Coupon Option" (CARTORY-VIP).`,
        canQuickFixWithCoupon: true,
      },
    });
    sendEvent({ done: true });
    return res.end();
  }

  // Build headers & chat endpoint URL
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (effectiveApiKey) {
    headers['Authorization'] = `Bearer ${effectiveApiKey}`;
    headers['x-api-key'] = effectiveApiKey;
  }

  if (activeProvider === 'openrouter') {
    headers['HTTP-Referer'] = 'https://cartory.ai';
    headers['X-Title'] = 'Cartory Qoma AI';
  }

  const isOllamaNative = activeProvider === 'ollama' && !endpoint.includes('/v1');
  const chatUrl = isOllamaNative
    ? `${endpoint}/api/chat`
    : provDetails.chatEndpoint(endpoint);

  const requestBody = isOllamaNative
    ? {
        model: effectiveModel,
        messages: [
          { role: 'system', content: fullSystemPrompt },
          ...messages.map((m: any) => ({ role: m.role, content: m.content })),
        ],
        stream: true,
        options: { temperature: effectiveTemperature },
      }
    : {
        model: effectiveModel,
        messages: [
          { role: 'system', content: fullSystemPrompt },
          ...messages.map((m: any) => ({ role: m.role, content: m.content })),
        ],
        temperature: effectiveTemperature,
        stream: true,
      };

  try {
    const controller = new AbortController();
    const fetchTimeout = setTimeout(() => controller.abort(), 22000);

    const apiResponse = await fetch(chatUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    clearTimeout(fetchTimeout);

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text().catch(() => 'Unknown error');
      let exactReason = `${provDetails.name} returned HTTP ${apiResponse.status}: ${apiResponse.statusText}`;
      let errorCode: any = 'NETWORK_ERROR';
      let errorTitle = `${provDetails.name} Error (HTTP ${apiResponse.status})`;

      try {
        const parsed = JSON.parse(errorText);
        if (parsed?.error?.message) {
          exactReason = parsed.error.message;
        }
      } catch {
        if (errorText && errorText.length < 250) {
          exactReason = errorText;
        }
      }

      if (apiResponse.status === 404) {
        errorCode = 'ROUTE_404';
        errorTitle = `HTTP 404 Not Found at ${chatUrl}`;
        exactReason = `404 Not Found at ${chatUrl}. The domain exists, but the chat route was not found at this address.`;
      } else if (apiResponse.status === 401 || apiResponse.status === 403) {
        errorCode = 'AUTH_REJECTED';
        errorTitle = `${provDetails.name} Unauthorized (HTTP ${apiResponse.status})`;
        exactReason = `Authentication Failed: The API key provided was rejected by ${provDetails.name}.`;
      } else if (apiResponse.status === 429) {
        errorCode = 'INSUFFICIENT_QUOTA';
        errorTitle = `${provDetails.name} Rate Limit / Quota Exceeded`;
        exactReason = `Rate limit reached or insufficient balance on your ${provDetails.name} account.`;
      }

      sendEvent({
        error: exactReason,
        errorDiagnostic: {
          errorCode,
          errorTitle,
          exactProblem: exactReason,
          endpointAttempted: chatUrl,
          httpStatus: apiResponse.status,
          providerId: activeProvider,
          providerName: provDetails.name,
          solution: provDetails.docsUrl
            ? `Verify your API key at ${provDetails.docsUrl}, or switch to the Coupon Option (CARTORY-VIP) for instant hosted cloud access!`
            : 'Check your endpoint URL and API key, or switch to the Coupon Option (CARTORY-VIP).',
          helpUrl: provDetails.docsUrl,
          canQuickFixWithCoupon: true,
        },
      });
      sendEvent({ done: true });
      return res.end();
    }

    if (!apiResponse.body) {
      sendEvent({
        error: 'No response stream received from endpoint.',
        errorDiagnostic: {
          errorCode: 'NETWORK_ERROR',
          errorTitle: 'Empty Response Stream',
          exactProblem: 'The server responded with status 200 OK, but closed the connection without streaming data.',
          endpointAttempted: chatUrl,
          httpStatus: 200,
          providerId: activeProvider,
          providerName: provDetails.name,
          solution: 'Verify your model name exists and is accessible.',
          canQuickFixWithCoupon: true,
        },
      });
      sendEvent({ done: true });
      return res.end();
    }

    const reader = apiResponse.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        if (isOllamaNative) {
          try {
            const parsed = JSON.parse(trimmed);
            if (parsed.message?.content) {
              sendEvent({ text: parsed.message.content });
            }
            if (parsed.done) {
              sendEvent({ done: true });
            }
          } catch {}
        } else {
          // Standard OpenAI format SSE: `data: ...`
          if (trimmed.startsWith('data: ')) {
            const dataStr = trimmed.slice(6);
            if (dataStr === '[DONE]') {
              sendEvent({ done: true });
              continue;
            }
            try {
              const parsed = JSON.parse(dataStr);
              const delta = parsed.choices?.[0]?.delta?.content;
              if (delta) sendEvent({ text: delta });
            } catch {}
          }
        }
      }
    }

    sendEvent({ done: true });
    return res.end();
  } catch (err: any) {
    console.error(`${provDetails.name} stream error:`, err);
    const isTimeout = err.name === 'AbortError';
    sendEvent({
      error: isTimeout
        ? `Connection timed out reaching ${endpoint}.`
        : `Could not connect to ${endpoint}: ${err.message}`,
      errorDiagnostic: {
        errorCode: isTimeout ? 'TIMEOUT' : 'NETWORK_ERROR',
        errorTitle: isTimeout ? 'Connection Timed Out' : 'Network Error',
        exactProblem: isTimeout
          ? `The server at ${endpoint} did not respond within 22 seconds.`
          : `Network error: ${err.message}. Check that the URL is accessible.`,
        endpointAttempted: chatUrl,
        httpStatus: 'Timeout / Refused',
        providerId: activeProvider,
        providerName: provDetails.name,
        solution:
          'Verify your server is running, or switch to the Coupon option (CARTORY-VIP) for instant hosted cloud access!',
        canQuickFixWithCoupon: true,
      },
    });
    sendEvent({ done: true });
    return res.end();
  }
});

// Setup dev vs production static serving
async function setupServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Cartory Qoma AI v7.0] Server running on http://0.0.0.0:${PORT}`);
  });
}

setupServer();
