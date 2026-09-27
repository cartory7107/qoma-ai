import { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  Filter,
  Key,
  Server,
  ShieldAlert,
  Trash2,
  X,
} from 'lucide-react';
import { ErrorLogItem } from '../types';

interface ErrorLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: ErrorLogItem[];
  onClearLogs: () => void;
  onOpenProviderSettings: (providerId?: string) => void;
}

export default function ErrorLogsModal({
  isOpen,
  onClose,
  logs,
  onClearLogs,
  onOpenProviderSettings,
}: ErrorLogsModalProps) {
  const [filterProvider, setFilterProvider] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredLogs = logs.filter((log) => {
    if (filterProvider === 'all') return true;
    return log.providerId === filterProvider;
  });

  const providersInLogs = Array.from(new Set(logs.map((l) => l.providerId)));

  const handleCopyLog = (log: ErrorLogItem) => {
    navigator.clipboard.writeText(JSON.stringify(log, null, 2));
    setCopiedId(log.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl max-h-[85vh] flex flex-col bg-white border border-zinc-200 rounded-2xl shadow-2xl text-zinc-900 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 bg-zinc-50">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-zinc-900 tracking-tight">
                  Real-Time Error Diagnostics & API Logs
                </h2>
                <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-[11px] font-mono font-medium text-zinc-700">
                  {logs.length} logged
                </span>
              </div>
              <p className="text-xs text-zinc-500">
                Detailed telemetry and status intercepts from model completions and connection probes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {logs.length > 0 && (
              <button
                onClick={onClearLogs}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-zinc-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                title="Clear error log history"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Clear All</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-zinc-800 hover:bg-zinc-200 rounded-lg transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Filter bar */}
        {logs.length > 0 && (
          <div className="flex items-center gap-2 px-6 py-2.5 bg-zinc-50 border-b border-zinc-200 text-xs">
            <Filter className="h-3.5 w-3.5 text-zinc-400" />
            <span className="text-zinc-600 font-medium">Filter by Provider:</span>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setFilterProvider('all')}
                className={`px-2 py-0.5 rounded-md font-mono text-[11px] transition-colors cursor-pointer ${
                  filterProvider === 'all'
                    ? 'bg-zinc-800 text-white font-medium'
                    : 'bg-white border border-zinc-200 text-zinc-600 hover:text-zinc-900'
                }`}
              >
                All ({logs.length})
              </button>
              {providersInLogs.map((p) => (
                <button
                  key={p}
                  onClick={() => setFilterProvider(p)}
                  className={`px-2 py-0.5 rounded-md font-mono text-[11px] transition-colors cursor-pointer ${
                    filterProvider === p
                      ? 'bg-indigo-600 text-white font-medium'
                      : 'bg-white border border-zinc-200 text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  {p} ({logs.filter((l) => l.providerId === p).length})
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Log List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3.5">
          {filteredLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 mb-3">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-semibold text-zinc-900">No Error Events Recorded</h3>
              <p className="text-xs text-zinc-500 max-w-sm mt-1">
                All model requests and connection pings are completing without unhandled failures or network halts.
              </p>
            </div>
          ) : (
            filteredLogs.map((item) => {
              const statusStr = String(item.statusCode || '');
              const isAuth = item.errorCode === 'INVALID_KEY' || item.errorCode === 'AUTH_REJECTED' || statusStr === '401';
              const isQuota = item.errorCode === 'INSUFFICIENT_QUOTA' || statusStr === '402' || statusStr === '429';
              const is404 = item.errorCode === 'ROUTE_404' || statusStr === '404';

              return (
                <div
                  key={item.id}
                  className="rounded-xl border border-zinc-200 bg-zinc-50/60 p-4 transition-all hover:border-zinc-300"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Status badge */}
                      <span
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-mono text-[11px] font-semibold border ${
                          isAuth
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : isQuota
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : is404
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : 'bg-zinc-100 text-zinc-700 border-zinc-200'
                        }`}
                      >
                        <AlertTriangle className="h-3 w-3" />
                        {item.statusCode ? `HTTP ${item.statusCode}` : item.errorCode}
                      </span>

                      {/* Provider badge */}
                      <span className="rounded-md bg-zinc-100 px-2 py-0.5 font-mono text-[11px] text-zinc-700 border border-zinc-200">
                        {item.providerName || item.providerId}
                      </span>

                      {/* Model badge */}
                      {item.model && (
                        <span className="text-[11px] font-mono text-zinc-500">
                          model: {item.model}
                        </span>
                      )}

                      <span className="text-[11px] text-zinc-400">
                        {new Date(item.timestamp).toLocaleTimeString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleCopyLog(item)}
                        className="flex items-center gap-1 px-2 py-1 text-[11px] text-zinc-600 hover:text-zinc-900 bg-white border border-zinc-200 hover:bg-zinc-100 rounded-md transition-colors cursor-pointer"
                        title="Copy diagnostic details to clipboard"
                      >
                        <Copy className="h-3 w-3" />
                        <span>{copiedId === item.id ? 'Copied' : 'JSON'}</span>
                      </button>
                      <button
                        onClick={() => {
                          onClose();
                          onOpenProviderSettings(item.providerId);
                        }}
                        className="flex items-center gap-1 px-2 py-1 text-[11px] text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-md transition-colors cursor-pointer"
                        title="Configure API key or endpoint"
                      >
                        <Key className="h-3 w-3" />
                        <span>Fix</span>
                      </button>
                    </div>
                  </div>

                  <div className="mt-2.5">
                    <h4 className="text-xs font-semibold text-zinc-900">{item.errorTitle}</h4>
                    <p className="mt-1 text-xs text-zinc-600 leading-relaxed font-sans">{item.message}</p>
                  </div>

                  {item.endpoint && (
                    <div className="mt-2 flex items-center gap-1.5 font-mono text-[11px] text-zinc-600 bg-white px-2.5 py-1 rounded-md border border-zinc-200 overflow-x-auto">
                      <Server className="h-3 w-3 shrink-0 text-zinc-400" />
                      <span className="truncate">{item.endpoint}</span>
                    </div>
                  )}

                  {item.solution && (
                    <div className="mt-2.5 rounded-lg bg-indigo-50 border border-indigo-200 px-3 py-1.5 text-[11.5px] text-indigo-900">
                      <strong>Recommended Fix:</strong> {item.solution}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-zinc-200 bg-zinc-50 text-xs text-zinc-500">
          <span>
            Diagnostic engine actively listens to status codes: 401 (Invalid Key), 402/429 (Quota/Limits), 404 (Bad URL), CORS/Network.
          </span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-medium transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
