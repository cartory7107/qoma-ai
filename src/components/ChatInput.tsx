import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import {
  ArrowUp,
  Globe,
  Link2,
  Mic,
  MicOff,
  Square,
} from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  isStreaming: boolean;
  onStopStreaming: () => void;
  placeholder?: string;
  webSearchEnabled?: boolean;
  onToggleWebSearch?: () => void;
  onCrawlUrlPrompt?: () => void;
}

export default function ChatInput({
  onSendMessage,
  isStreaming,
  onStopStreaming,
  placeholder = 'Type your message or ask a question...',
  webSearchEnabled = false,
  onToggleWebSearch,
  onCrawlUrlPrompt,
}: ChatInputProps) {
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-resize textarea as user types
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        180
      )}px`;
    }
  }, [input]);

  // Focus textarea on load
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // Web Speech API Voice Dictation
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
        };

        recognition.onerror = () => {
          setIsRecording(false);
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (isStreaming) {
      onStopStreaming();
      return;
    }
    const trimmed = input.trim();
    if (!trimmed) return;

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    }

    onSendMessage(trimmed);
    setInput('');

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-3 sm:px-4 pb-3 sm:pb-5">
      <div className="relative rounded-2xl sm:rounded-3xl border border-zinc-200 bg-white shadow-md focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
        {/* Voice recording strip */}
        {isRecording && (
          <div className="flex items-center justify-between px-4 py-2 border-b border-rose-200 bg-rose-50 rounded-t-2xl sm:rounded-t-3xl text-xs text-rose-700">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
              <span className="font-medium">Listening to your voice...</span>
            </div>
            <button
              onClick={toggleRecording}
              className="text-[11px] font-medium text-rose-700 underline hover:text-rose-900 cursor-pointer"
            >
              Done
            </button>
          </div>
        )}

        {/* Text Area */}
        <div className="p-3 sm:p-4 pb-2">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full max-h-[180px] min-h-[38px] resize-none bg-transparent text-[15px] leading-relaxed text-zinc-900 placeholder-zinc-400 focus:outline-none"
          />
        </div>

        {/* Controls Toolbar */}
        <div className="flex items-center justify-between px-3 sm:px-4 pb-2.5 pt-1 border-t border-zinc-100">
          {/* Left: Web search toggle & Crawl URL tool */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onToggleWebSearch}
              className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-all cursor-pointer ${
                webSearchEnabled
                  ? 'bg-cyan-50 border border-cyan-300 text-cyan-800 font-semibold'
                  : 'bg-zinc-100 border border-zinc-200 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200'
              }`}
              title={webSearchEnabled ? 'Live Web Search Active' : 'Enable Live Web Search'}
            >
              <Globe className={`h-3.5 w-3.5 ${webSearchEnabled ? 'text-cyan-600' : 'text-zinc-500'}`} />
              <span>Web Search</span>
            </button>

            <button
              type="button"
              onClick={onCrawlUrlPrompt}
              className="hidden sm:flex items-center gap-1 rounded-full border border-zinc-200 bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-200 hover:text-zinc-900 transition-colors cursor-pointer"
              title="Paste a website URL to crawl live data"
            >
              <Link2 className="h-3.5 w-3.5 text-zinc-500" />
              <span>Crawl URL</span>
            </button>
          </div>

          {/* Right: Mic & Send Button */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={toggleRecording}
              className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors cursor-pointer ${
                isRecording
                  ? 'bg-rose-500 text-white'
                  : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800'
              }`}
              title={isRecording ? 'Stop recording' : 'Dictate with voice'}
            >
              {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </button>

            <button
              type="button"
              onClick={handleSend}
              disabled={!isStreaming && !input.trim()}
              className={`flex h-8 w-8 items-center justify-center rounded-full transition-all cursor-pointer ${
                isStreaming
                  ? 'bg-rose-600 text-white hover:bg-rose-700'
                  : input.trim()
                  ? 'bg-indigo-600 text-white shadow-xs hover:bg-indigo-500 active:scale-95'
                  : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
              }`}
              title={isStreaming ? 'Stop generation' : 'Send message'}
            >
              {isStreaming ? (
                <Square className="h-3.5 w-3.5 fill-white" />
              ) : (
                <ArrowUp className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      <p className="mt-1.5 text-center text-[11px] text-zinc-400">
        Cartory QOMA AI • Qoma AI version 7.0
      </p>
    </div>
  );
}
