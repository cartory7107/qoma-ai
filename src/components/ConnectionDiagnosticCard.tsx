import { useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Key,
  RotateCcw,
  Settings,
  Sparkles,
  Zap,
} from 'lucide-react';
import { ErrorDiagnostic } from '../types';

interface ConnectionDiagnosticCardProps {
  diagnostic?: ErrorDiagnostic;
  fallbackError?: string;
  onSwitchToCoupon?: () => void;
  onOpenSettings?: () => void;
  onRetry?: () => void;
}

export default function ConnectionDiagnosticCard({
  diagnostic,
  fallbackError,
  onSwitchToCoupon,
  onOpenSettings,
  onRetry,
}: ConnectionDiagnosticCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  // If no structured diagnostic was provided, synthesize one
  const errText = diagnostic?.exactProblem || fallbackError || 'Unknown connection error';
  const isOllamaCom =
    diagnostic?.errorCode === 'OLLAMA_COM_WEBSITE' ||
    errText.toLowerCase().includes('ollama.com');
  const isLocalhost =
    diagnostic?.errorCode === 'LOCALHOST_CLOUD_MISMATCH' ||
    errText.toLowerCase().includes('localhost');
  const isAuth =
    diagnostic?.errorCode === 'AUTH_REJECTED' ||
    diagnostic?.errorCode === 'INVALID_KEY' ||
    errText.toLowerCase().includes('401') ||
    errText.toLowerCase().includes('unauthorized') ||
    errText.toLowerCase().includes('api_key');
  const isQuota =
    diagnostic?.errorCode === 'INSUFFICIENT_QUOTA' ||
    diagnostic?.errorCode === 'RATE_LIMITED' ||
    errText.toLowerCase().includes('quota') ||
    errText.toLowerCase().includes('rate limit');

  const providerName = diagnostic?.providerName || 'AI Provider';

  const title =
    diagnostic?.errorTitle ||
    (isOllamaCom
      ? 'HTTP 404 Not Found at https://ollama.com'
      : isLocalhost
      ? 'Connection Refused (Localhost in Cloud Container)'
      : isAuth
      ? `${providerName} API Key Rejected (HTTP 401)`
      : isQuota
      ? `${providerName} Rate Limit / Quota Exceeded`
      : 'API Connection Diagnostic');

  const exactProblem =
    diagnostic?.exactProblem ||
    (isOllamaCom
      ? '"https://ollama.com" is Ollama\'s public download website and model library catalog, NOT an API server! Ollama does not offer an API on ollama.com directly. Requests to https://ollama.com/api/chat return HTTP 404 Not Found.'
      : isLocalhost
      ? 'This web application runs on a remote cloud server. Connecting to "localhost" instructs the remote cloud container to look inside itself, not your home computer! Use a tunnel tool like ngrok or cloudflare tunnels.'
      : isAuth
      ? `The ${providerName} server rejected your API key. The key may be invalid, revoked, expired, or unauthorized for this model.`
      : errText);

  const endpoint = diagnostic?.endpointAttempted;
  const httpStatus = diagnostic?.httpStatus;
  const solution =
    diagnostic?.solution ||
    'Verify your API key in Settings or check the endpoint URL.';
  const helpUrl = diagnostic?.helpUrl;

  return (
    <div className="my-3 rounded-2xl border border-rose-200 bg-rose-50/60 p-4 shadow-sm text-zinc-800 animate-in fade-in duration-200">
      {/* Header Badge & Title */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-700 border border-rose-200">
            <AlertTriangle className="h-4 w-4" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-sm font-bold text-rose-900">{title}</h4>
              {httpStatus && (
                <span className="rounded-md bg-rose-100 border border-rose-200 px-1.5 py-0.5 font-mono text-[10px] font-bold text-rose-800">
                  HTTP {httpStatus}
                </span>
              )}
              {diagnostic?.providerName && (
                <span className="rounded-md bg-white border border-zinc-200 px-1.5 py-0.5 text-[10px] font-mono text-zinc-700">
                  {diagnostic.providerName}
                </span>
              )}
            </div>
            {endpoint && (
              <p className="mt-1 font-mono text-[11px] text-zinc-500 break-all">
                Target: <span className="text-zinc-600">{endpoint}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* The Exact Problem Explained */}
      <div className="mt-3 rounded-xl border border-zinc-200 bg-white p-3.5 space-y-2">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-800 mb-1">
            <span>Exact Problem Identified:</span>
          </div>
          <p className="text-xs leading-relaxed text-zinc-700">{exactProblem}</p>
        </div>

        {/* Recommended Solution */}
        <div className="pt-2 border-t border-zinc-100 text-[11.5px] text-zinc-700">
          <span className="font-semibold text-indigo-700">Recommended Fix: </span>
          <span>{solution}</span>
        </div>

        {helpUrl && (
          <div className="pt-1 text-[11px]">
            <a
              href={helpUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 font-medium text-indigo-600 hover:text-indigo-800"
            >
              <span>Get or verify your {providerName} API Key</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        )}

        {isOllamaCom && (
          <div className="mt-2 rounded-lg bg-amber-50 border border-amber-200 p-2.5 text-[11.5px] text-amber-900">
            <p className="font-semibold">Why does ollama.com return 404?</p>
            <p className="mt-0.5 text-amber-800 leading-normal">
              Ollama does not host cloud API services on their website domain. Ollama is software
              designed to run on your private computer or VPS server.
            </p>
          </div>
        )}
      </div>

      {/* 1-Click Fix Actions */}
      <div className="mt-3.5 flex flex-wrap items-center gap-2">
        {onOpenSettings && (
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 transition-colors cursor-pointer shadow-xs"
          >
            <Settings className="h-3.5 w-3.5 text-indigo-600" />
            <span>Open API Key Settings</span>
          </button>
        )}

        {onSwitchToCoupon && (
          <button
            onClick={onSwitchToCoupon}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition-all active:scale-98 cursor-pointer"
          >
            <Zap className="h-3.5 w-3.5 text-amber-300 fill-amber-300" />
            <span>Switch to Cartory QOMA AI Hosted Engine (CARTORY-VIP)</span>
          </button>
        )}

        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Retry</span>
          </button>
        )}
      </div>

      {/* Collapsible Guidance: How to connect different AI providers */}
      <div className="mt-3 border-t border-rose-200/60 pt-2.5">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex w-full items-center justify-between text-[11px] font-medium text-zinc-600 hover:text-zinc-900 cursor-pointer"
        >
          <span>Need API keys for OpenAI, Claude, Groq, or OpenRouter?</span>
          {showDetails ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>

        {showDetails && (
          <div className="mt-2.5 space-y-2 rounded-xl bg-white p-3 text-[11.5px] border border-zinc-200 text-zinc-700 shadow-xs animate-in fade-in duration-150">
            <p className="font-semibold text-zinc-900">Pre-Configured Providers in Cartory QOMA AI:</p>
            <div className="space-y-1.5 pl-1">
              <div className="flex items-start gap-1.5">
                <span className="font-bold text-indigo-600">• OpenAI:</span>
                <div>GPT-4o and o3-mini (<code>https://platform.openai.com</code>).</div>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="font-bold text-indigo-600">• Anthropic:</span>
                <div>Claude 3.7 Sonnet (<code>https://console.anthropic.com</code>).</div>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="font-bold text-indigo-600">• Groq Cloud:</span>
                <div>LPU high-speed inference (<code>https://console.groq.com/keys</code>).</div>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="font-bold text-indigo-600">• OpenRouter:</span>
                <div>Single key for 200+ models (<code>https://openrouter.ai/keys</code>).</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
