import { useState } from 'react';
import {
  Check,
  Copy,
  ExternalLink,
  Globe,
  RotateCcw,
  ThumbsDown,
  ThumbsUp,
  Volume2,
  VolumeX,
  Edit3,
  AlertCircle,
  Clock,
  Loader2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ChatMessage, WebSource } from '../types';
import MarkdownRenderer from './MarkdownRenderer';
import ConnectionDiagnosticCard from './ConnectionDiagnosticCard';
import { isSpeaking, speakText, stopSpeech } from '../utils/audio';

interface MessageItemProps {
  message: ChatMessage;
  isLatestAssistant: boolean;
  onRegenerate?: () => void;
  onEditPrompt?: (newContent: string) => void;
  onFeedback?: (messageId: string, feedback: 'like' | 'dislike') => void;
  onSwitchToCoupon?: () => void;
  onOpenSettings?: (providerId?: any) => void;
  speechVoiceUri?: string;
  speechRate?: number;
}

export default function MessageItem({
  message,
  isLatestAssistant,
  onRegenerate,
  onEditPrompt,
  onFeedback,
  onSwitchToCoupon,
  onOpenSettings,
  speechVoiceUri,
  speechRate = 1.0,
}: MessageItemProps) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editInput, setEditInput] = useState(message.content);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore
    }
  };

  const handleToggleSpeak = () => {
    if (isReading) {
      stopSpeech();
      setIsReading(false);
    } else {
      setIsReading(true);
      speakText(
        message.content,
        () => setIsReading(false),
        speechVoiceUri,
        speechRate
      );
    }
  };

  const handleLike = () => {
    onFeedback?.(message.id, 'like');
    confetti({
      particleCount: 24,
      spread: 50,
      origin: { y: 0.8 },
      colors: ['#4f46e5', '#06b6d4', '#10b981'],
    });
  };

  const handleDislike = () => {
    onFeedback?.(message.id, 'dislike');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editInput.trim() && editInput !== message.content) {
      onEditPrompt?.(editInput.trim());
    }
    setIsEditing(false);
  };

  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div
      className={`group relative flex w-full py-3 sm:py-4 px-2 sm:px-4 md:px-6 transition-colors ${
        isUser ? 'justify-end' : 'justify-start'
      }`}
    >
      <div
        className={`flex w-full max-w-3xl gap-3 sm:gap-4 ${
          isUser ? 'flex-row-reverse' : 'flex-row'
        }`}
      >
        {/* Avatar */}
        <div className="shrink-0 pt-0.5">
          {isUser ? (
            <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-zinc-100 text-zinc-800 border border-zinc-200 text-xs font-semibold shadow-xs">
              U
            </div>
          ) : (
            <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono font-bold text-xs shadow-xs">
              Q
            </div>
          )}
        </div>

        {/* Message Content Area */}
        <div className={`relative min-w-0 flex-1 ${isUser ? 'max-w-2xl' : 'max-w-full'}`}>
          {/* Header Info */}
          <div
            className={`mb-1.5 flex items-center gap-2 text-xs ${
              isUser ? 'justify-end text-zinc-500' : 'text-zinc-500'
            }`}
          >
            {!isUser && (
              <>
                <span className="font-semibold text-zinc-900">Cartory QOMA AI</span>
                <span className="rounded bg-zinc-100 border border-zinc-200 px-1.5 py-0.2 text-[10px] font-mono font-medium text-zinc-700">
                  {message.modelUsed || 'Qoma AI v7.0'}
                </span>
                {message.providerUsed && (
                  <span className="hidden sm:inline text-[11px] text-zinc-400">
                    • {message.providerUsed}
                  </span>
                )}
              </>
            )}
            <span className="text-[10px] text-zinc-400 font-mono">
              {formatTime(message.timestamp)}
            </span>
          </div>

          {/* Perplexity-style Crawled Sources Cards */}
          {!isUser && message.sources && message.sources.length > 0 && (
            <div className="mb-3">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-500 mb-1.5">
                <Globe className="h-3 w-3 text-indigo-600" />
                <span>Crawled Web Sources ({message.sources.length})</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {message.sources.map((source: WebSource, idx: number) => {
                  let hostname = '';
                  try {
                    hostname = new URL(source.url).hostname.replace('www.', '');
                  } catch {
                    hostname = 'web source';
                  }

                  return (
                    <a
                      key={idx}
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50/80 px-2.5 py-1 text-xs text-zinc-700 transition-colors hover:border-zinc-300 hover:bg-white hover:text-zinc-900 shadow-2xs"
                      title={source.title}
                    >
                      <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-zinc-200 text-[9px] font-bold text-zinc-600">
                        {idx + 1}
                      </span>
                      <span className="font-medium text-[11px] max-w-[140px] truncate">
                        {source.title || hostname}
                      </span>
                      <ExternalLink className="h-2.5 w-2.5 text-zinc-400" />
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* Status update indicator (e.g. Crawling web page...) */}
          {!isUser && message.status === 'streaming' && message.statusUpdate && (
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-md bg-indigo-50 border border-indigo-100 px-2.5 py-1 text-xs text-indigo-700">
              <Loader2 className="h-3 w-3 animate-spin text-indigo-600" />
              <span>{message.statusUpdate}</span>
            </div>
          )}

          {/* User message edit mode */}
          {isUser && isEditing ? (
            <form onSubmit={handleSaveEdit} className="mt-1 space-y-2">
              <textarea
                value={editInput}
                onChange={(e) => setEditInput(e.target.value)}
                className="w-full rounded-xl border border-zinc-300 bg-white p-3 text-sm text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-400 resize-y"
                rows={3}
                autoFocus
              />
              <div className="flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="rounded-lg px-3 py-1.5 text-zinc-600 hover:bg-zinc-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-zinc-900 px-3 py-1.5 font-medium text-white hover:bg-zinc-800"
                >
                  Resend
                </button>
              </div>
            </form>
          ) : (
            <div
              className={`text-[15px] leading-relaxed ${
                isUser
                  ? 'ml-auto rounded-2xl bg-indigo-600 px-4 py-2.5 text-white font-medium shadow-xs'
                  : 'text-zinc-900 pt-0.5'
              }`}
            >
              {/* Error state */}
              {message.status === 'error' && (
                <ConnectionDiagnosticCard
                  diagnostic={message.errorDiagnostic}
                  fallbackError={message.errorMsg}
                  onSwitchToCoupon={onSwitchToCoupon}
                  onOpenSettings={() => onOpenSettings?.(message.errorDiagnostic?.providerId)}
                  onRetry={onRegenerate}
                />
              )}

              {/* Main Content */}
              {isUser ? (
                <p className="whitespace-pre-wrap text-white font-medium">{message.content}</p>
              ) : (
                <div className="text-zinc-900">
                  <MarkdownRenderer
                    content={message.content}
                    isStreaming={message.status === 'streaming'}
                  />
                </div>
              )}
            </div>
          )}

          {/* Action Toolbar */}
          {!isEditing && (
            <div
              className={`mt-1.5 flex items-center gap-1 text-xs text-zinc-400 opacity-80 hover:opacity-100 transition-opacity ${
                isUser ? 'justify-end' : 'justify-start'
              }`}
            >
              {/* Read Aloud button (Assistant only) */}
              {!isUser && message.content && (
                <button
                  onClick={handleToggleSpeak}
                  className={`flex items-center gap-1 rounded-md px-1.5 py-0.5 transition-colors ${
                    isReading
                      ? 'bg-indigo-50 text-indigo-700 font-medium'
                      : 'hover:bg-zinc-100 hover:text-zinc-700'
                  }`}
                  title={isReading ? 'Stop speech' : 'Listen with natural voice'}
                >
                  <Volume2 className="h-3.5 w-3.5" />
                  <span className="text-[11px]">{isReading ? 'Reading...' : 'Listen'}</span>
                </button>
              )}

              {/* Copy button */}
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 rounded-md px-1.5 py-0.5 hover:bg-zinc-100 hover:text-zinc-700 transition-colors"
                title="Copy to clipboard"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="text-[11px] text-emerald-600">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span className="text-[11px]">Copy</span>
                  </>
                )}
              </button>

              {/* User edit button */}
              {isUser && onEditPrompt && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1 rounded-md px-1.5 py-0.5 hover:bg-zinc-100 hover:text-zinc-700 transition-colors"
                  title="Edit prompt"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span className="text-[11px]">Edit</span>
                </button>
              )}

              {/* Assistant Regenerate button */}
              {!isUser && isLatestAssistant && onRegenerate && message.status !== 'streaming' && (
                <button
                  onClick={onRegenerate}
                  className="flex items-center gap-1 rounded-md px-1.5 py-0.5 hover:bg-zinc-100 hover:text-zinc-700 transition-colors"
                  title="Regenerate"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span className="text-[11px]">Regenerate</span>
                </button>
              )}

              {/* Thumbs Feedback (Assistant only) */}
              {!isUser && onFeedback && (
                <div className="flex items-center pl-1 ml-1 gap-0.5">
                  <button
                    onClick={handleLike}
                    className={`rounded p-1 transition-colors ${
                      message.feedback === 'like'
                        ? 'text-indigo-600 bg-indigo-50'
                        : 'hover:bg-zinc-100 hover:text-zinc-700'
                    }`}
                    title="Good response"
                  >
                    <ThumbsUp className="h-3 w-3" />
                  </button>
                  <button
                    onClick={handleDislike}
                    className={`rounded p-1 transition-colors ${
                      message.feedback === 'dislike'
                        ? 'text-rose-600 bg-rose-50'
                        : 'hover:bg-zinc-100 hover:text-zinc-700'
                    }`}
                    title="Poor response"
                  >
                    <ThumbsDown className="h-3 w-3" />
                  </button>
                </div>
              )}

              {message.durationMs && (
                <span className="ml-auto text-[10px] text-zinc-400 font-mono">
                  {(message.durationMs / 1000).toFixed(1)}s
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
