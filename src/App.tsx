/**
 * Cartory QOMA AI
 * Advanced artificial intelligence developed exclusively by Cartory.
 * Version 7.0 with Multi-Provider Inference & Dynamic Persistent Memory.
 */

import { useState, useEffect, useRef } from 'react';
import { ArrowDown, Brain, Globe, Key, ShieldAlert, X, Zap } from 'lucide-react';
import {
  AIMemoryProfile,
  AIProviderId,
  AppSettings,
  ChatMessage,
  ChatSession,
  ErrorLogItem,
  PersonalityType,
  WebSource,
} from './types';
import { getProviderMeta } from './utils/aiProviders';
import {
  createInitialSession,
  loadActiveSessionId,
  loadErrorLogs,
  loadSessions,
  loadSettings,
  saveActiveSessionId,
  saveSessions,
  saveSettings,
  appendErrorLog,
  clearErrorLogs,
} from './utils/storage';
import {
  loadMemoryProfile,
  saveMemoryProfile,
  extractTraitsFromInteraction,
  buildMemorySystemPrompt,
} from './utils/memoryEngine';
import { playReceiveSound, playSendSound } from './utils/audio';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MessageItem from './components/MessageItem';
import ChatInput from './components/ChatInput';
import EmptyState from './components/EmptyState';
import SettingsModal from './components/SettingsModal';
import ErrorLogsModal from './components/ErrorLogsModal';

export default function App() {
  const [settings, setSettings] = useState<AppSettings>(loadSettings);
  const [memoryProfile, setMemoryProfile] = useState<AIMemoryProfile>(loadMemoryProfile);
  const [errorLogs, setErrorLogs] = useState<ErrorLogItem[]>(loadErrorLogs);
  const [sessions, setSessions] = useState<ChatSession[]>(loadSessions);
  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    const saved = loadActiveSessionId();
    const all = loadSessions();
    if (saved && all.some((s) => s.id === saved)) {
      return saved;
    }
    return all[0]?.id || '';
  });

  const [isStreaming, setIsStreaming] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showErrorLogs, setShowErrorLogs] = useState(false);
  const [settingsInitialTab, setSettingsInitialTab] = useState<'providers' | 'ollama' | 'custom' | 'memory' | 'web'>('providers');
  const [settingsInitialProvider, setSettingsInitialProvider] = useState<AIProviderId | undefined>();
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [dismissTopBanner, setDismissTopBanner] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const currentSession =
    sessions.find((s) => s.id === activeSessionId) || sessions[0] || createInitialSession();

  const isCouponActive =
    settings.authMode === 'coupon' && Boolean(settings.couponCode);

  const activeProv: AIProviderId =
    settings.authMode === 'coupon' ? 'coupon' : (settings.activeProvider || 'openai');
  const activeMeta = getProviderMeta(activeProv);
  const activeProvConfig = settings.providerConfigs?.[activeProv] || {
    endpoint: activeMeta.defaultEndpoint,
    apiKey: '',
    model: activeMeta.defaultModel,
    temperature: 0.7,
  };

  const handleOpenSettings = (tab?: 'providers' | 'ollama' | 'custom' | 'memory' | 'web', provId?: AIProviderId) => {
    if (tab) setSettingsInitialTab(tab);
    setSettingsInitialProvider(provId);
    setShowSettings(true);
  };

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    saveSessions(sessions);
  }, [sessions]);

  useEffect(() => {
    saveMemoryProfile(memoryProfile);
  }, [memoryProfile]);

  useEffect(() => {
    if (activeSessionId) {
      saveActiveSessionId(activeSessionId);
    }
  }, [activeSessionId]);

  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShowScrollBottom(!isAtBottom);
  };

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    scrollToBottom(isStreaming ? 'auto' : 'smooth');
  }, [currentSession.messages, isStreaming]);

  const updateCurrentSession = (
    updater: (session: ChatSession) => ChatSession
  ) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === currentSession.id ? updater(s) : s))
    );
  };

  const handleNewChat = () => {
    const newSession: ChatSession = {
      id: `session-${Date.now()}`,
      title: 'New Conversation',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
      personality: settings.personality,
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
  };

  const handleDeleteSession = (sessionId: string) => {
    setSessions((prev) => {
      const remaining = prev.filter((s) => s.id !== sessionId);
      if (remaining.length === 0) {
        const fresh = createInitialSession();
        setActiveSessionId(fresh.id);
        return [fresh];
      }
      if (activeSessionId === sessionId) {
        setActiveSessionId(remaining[0].id);
      }
      return remaining;
    });
  };

  const handleRenameSession = (sessionId: string, newTitle: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, title: newTitle } : s))
    );
  };

  const handleStopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);

    updateCurrentSession((session) => {
      const lastMsg = session.messages[session.messages.length - 1];
      if (lastMsg && lastMsg.role === 'assistant' && lastMsg.status === 'streaming') {
        const updated = [...session.messages];
        updated[updated.length - 1] = {
          ...lastMsg,
          status: 'done',
        };
        return { ...session, messages: updated };
      }
      return session;
    });
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isStreaming) return;

    playSendSound(settings.soundEnabled);

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: Date.now(),
      status: 'done',
    };

    const assistantPlaceholderId = `assistant-${Date.now()}`;
    const modelBadge =
      settings.authMode === 'coupon'
        ? `VIP Hosted Engine (Pass: ${settings.couponCode || 'CARTORY-VIP'})`
        : `${activeMeta.name} • ${activeProvConfig.model || activeMeta.defaultModel}`;

    const assistantPlaceholder: ChatMessage = {
      id: assistantPlaceholderId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      status: 'streaming',
      modelUsed: modelBadge,
      providerUsed: activeProv,
      sources: [],
    };

    const isFirstUserMessage =
      currentSession.messages.filter((m) => m.role === 'user').length === 0;
    const newTitle = isFirstUserMessage
      ? text.slice(0, 36).trim() + (text.length > 36 ? '...' : '')
      : currentSession.title;

    const updatedMessages = [...currentSession.messages, userMessage, assistantPlaceholder];
    updateCurrentSession((session) => ({
      ...session,
      title: newTitle,
      updatedAt: Date.now(),
      messages: updatedMessages,
    }));

    setIsStreaming(true);
    const startTime = Date.now();

    const controller = new AbortController();
    abortControllerRef.current = controller;

    // 1. Immediately extract any new facts/identity traits from current user message
    let activeProfile = memoryProfile;
    if (memoryProfile.config.autoLearnEnabled) {
      const { newTraits, updatedTraits } = extractTraitsFromInteraction(
        text,
        memoryProfile.traits
      );
      if (newTraits.length > 0 || updatedTraits.length !== memoryProfile.traits.length) {
        activeProfile = {
          ...memoryProfile,
          traits: updatedTraits,
          lastLearnedAt: Date.now(),
          totalInteractionsAnalyzed: memoryProfile.totalInteractionsAnalyzed + 1,
        };
        setMemoryProfile(activeProfile);
        saveMemoryProfile(activeProfile);
      }
    }

    // 2. Context Injection: Automatically prepend learned memory traits into system prompt
    const memorySystemPrompt = buildMemorySystemPrompt(activeProfile);
    const fullCustomPrompt = [
      settings.customSystemPrompt,
      memorySystemPrompt,
    ].filter(Boolean).join('\n\n');

    try {
      const pastMessages = updatedMessages
        .slice(0, -1)
        .slice(-14)
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      // Route through server proxy with system prompt and provider configs
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: pastMessages,
          provider: activeProv,
          providerConfig: activeProvConfig,
          ollamaConfig: settings.ollamaSettings,
          personality: settings.personality,
          systemCustomPrompt: fullCustomPrompt,
          webSearchEnabled: settings.webSearchEnabled,
          couponCode: settings.authMode === 'coupon' ? settings.couponCode : '',
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}: ${res.statusText}`);
      }

      if (!res.body) {
        throw new Error('No stream body received.');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let accumulatedText = '';
      let buffer = '';
      let hadError = false;
      let gatheredSources: WebSource[] = [];

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const rawData = line.slice(6).trim();
            if (!rawData) continue;

            try {
              const data = JSON.parse(rawData);

              if (data.error) {
                hadError = true;
                const errLog = appendErrorLog({
                  providerId: activeProv,
                  providerName: activeMeta.name,
                  endpoint: activeProvConfig.endpoint || activeMeta.defaultEndpoint,
                  model: activeProvConfig.model || activeMeta.defaultModel,
                  statusCode: data.errorDiagnostic?.httpStatus || '500',
                  errorCode: data.errorDiagnostic?.errorCode || 'GENERATION_ERROR',
                  errorTitle: data.errorDiagnostic?.errorTitle || 'API Error',
                  message: data.error,
                  solution: data.errorDiagnostic?.solution,
                });
                setErrorLogs(loadErrorLogs());

                updateCurrentSession((session) => {
                  const msgs = [...session.messages];
                  const idx = msgs.findIndex((m) => m.id === assistantPlaceholderId);
                  if (idx !== -1) {
                    msgs[idx] = {
                      ...msgs[idx],
                      status: 'error',
                      errorMsg: data.error,
                      errorDiagnostic: data.errorDiagnostic,
                      durationMs: Date.now() - startTime,
                    };
                  }
                  return { ...session, messages: msgs };
                });
                break;
              }

              if (data.statusUpdate) {
                updateCurrentSession((session) => {
                  const msgs = [...session.messages];
                  const idx = msgs.findIndex((m) => m.id === assistantPlaceholderId);
                  if (idx !== -1) {
                    msgs[idx] = {
                      ...msgs[idx],
                      statusUpdate: data.statusUpdate,
                    };
                  }
                  return { ...session, messages: msgs };
                });
              }

              if (data.sources) {
                gatheredSources = data.sources;
                updateCurrentSession((session) => {
                  const msgs = [...session.messages];
                  const idx = msgs.findIndex((m) => m.id === assistantPlaceholderId);
                  if (idx !== -1) {
                    msgs[idx] = {
                      ...msgs[idx],
                      sources: gatheredSources,
                    };
                  }
                  return { ...session, messages: msgs };
                });
              }

              if (data.text) {
                accumulatedText += data.text;
                updateCurrentSession((session) => {
                  const msgs = [...session.messages];
                  const idx = msgs.findIndex((m) => m.id === assistantPlaceholderId);
                  if (idx !== -1) {
                    msgs[idx] = {
                      ...msgs[idx],
                      content: accumulatedText,
                      status: 'streaming',
                      statusUpdate: undefined,
                    };
                  }
                  return { ...session, messages: msgs };
                });
              }
            } catch {
              // Ignore invalid chunk
            }
          }
        }
        if (hadError) break;
      }

      if (!hadError) {
        const totalDuration = Date.now() - startTime;
        updateCurrentSession((session) => {
          const msgs = [...session.messages];
          const idx = msgs.findIndex((m) => m.id === assistantPlaceholderId);
          if (idx !== -1) {
            msgs[idx] = {
              ...msgs[idx],
              content: accumulatedText,
              status: 'done',
              statusUpdate: undefined,
              sources: gatheredSources,
              durationMs: totalDuration,
            };
          }
          return { ...session, messages: msgs };
        });

        playReceiveSound(settings.soundEnabled);

        // 2. Auto-Learning Loop: analyze user message context to extract traits across every session
        if (memoryProfile.config.autoLearnEnabled) {
          const { newTraits, updatedTraits } = extractTraitsFromInteraction(
            text,
            memoryProfile.traits
          );
          if (newTraits.length > 0 || updatedTraits.length !== memoryProfile.traits.length) {
            const updatedProfile: AIMemoryProfile = {
              ...memoryProfile,
              traits: updatedTraits,
              lastLearnedAt: Date.now(),
              totalInteractionsAnalyzed: memoryProfile.totalInteractionsAnalyzed + 1,
            };
            setMemoryProfile(updatedProfile);
            saveMemoryProfile(updatedProfile);
          }
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      console.error('Chat error:', err);

      appendErrorLog({
        providerId: activeProv,
        providerName: activeMeta.name,
        endpoint: activeProvConfig.endpoint || activeMeta.defaultEndpoint,
        model: activeProvConfig.model || activeMeta.defaultModel,
        statusCode: 'Network Error',
        errorCode: 'NETWORK_ERROR',
        errorTitle: 'Connection Interrupted',
        message: err.message || 'Network request failed to complete.',
        solution: 'Check your server status, local CORS, or switch to the hosted VIP engine.',
      });
      setErrorLogs(loadErrorLogs());

      updateCurrentSession((session) => {
        const msgs = [...session.messages];
        const idx = msgs.findIndex((m) => m.id === assistantPlaceholderId);
        if (idx !== -1) {
          msgs[idx] = {
            ...msgs[idx],
            status: 'error',
            errorMsg:
              err.message ||
              'Connection interrupted. Verify your endpoint or check the Real-Time Error Logs.',
            errorDiagnostic: {
              errorCode: 'NETWORK_ERROR',
              errorTitle: 'Connection Interrupted',
              exactProblem:
                err.message ||
                'Unable to reach the AI endpoint. Make sure the API server is online or check your network.',
              solution:
                'Verify your API key in Settings, test your endpoint, or switch to the VIP hosted pass.',
              canQuickFixWithCoupon: true,
            },
            durationMs: Date.now() - startTime,
          };
        }
        return { ...session, messages: msgs };
      });
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  const handleQuickSwitchToCoupon = () => {
    const updatedSettings: AppSettings = {
      ...settings,
      authMode: 'coupon',
      activeProvider: 'coupon',
      couponCode: 'CARTORY-VIP',
      couponData: {
        valid: true,
        couponCode: 'CARTORY-VIP',
        name: 'Cartory QOMA AI Hosted Access Pass',
        description: 'Hosted high-speed cloud engine unlocked with live web search & persistent memory.',
      },
    };
    setSettings(updatedSettings);
    saveSettings(updatedSettings);

    updateCurrentSession((session) => {
      const msgs = [...session.messages];
      const lastIdx = msgs.length - 1;
      if (lastIdx >= 0 && msgs[lastIdx].status === 'error') {
        msgs[lastIdx] = {
          ...msgs[lastIdx],
          status: 'done',
          content:
            '✓ **Switched to Cartory QOMA AI Hosted Cloud Engine (CARTORY-VIP).** Ready to complete your prompt with instant hosted inference!',
          errorMsg: undefined,
          errorDiagnostic: undefined,
        };
      }
      return { ...session, messages: msgs };
    });
  };

  const handleRegenerate = () => {
    const lastUserMsg = [...currentSession.messages]
      .reverse()
      .find((m) => m.role === 'user');
    if (lastUserMsg) {
      handleSendMessage(lastUserMsg.content);
    }
  };

  const handleEditPrompt = (newContent: string) => {
    handleSendMessage(newContent);
  };

  const handleFeedback = (messageId: string, feedback: 'like' | 'dislike') => {
    updateCurrentSession((session) => ({
      ...session,
      messages: session.messages.map((m) => (m.id === messageId ? { ...m, feedback } : m)),
    }));
  };

  const handleExportChat = () => {
    const mdLines = [
      `# ${currentSession.title}`,
      `*Exported from Cartory QOMA AI on ${new Date().toLocaleString()}*`,
      '',
    ];

    currentSession.messages.forEach((m) => {
      const speaker = m.role === 'user' ? '### User' : `### Cartory QOMA AI (${m.modelUsed || 'Qoma AI v7.0'})`;
      mdLines.push(speaker);
      mdLines.push(m.content);
      mdLines.push('');
    });

    const blob = new Blob([mdLines.join('\n')], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentSession.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_cartory_qoma.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCrawlUrlPrompt = () => {
    const target = prompt('Enter a website URL to crawl live data (e.g. https://...):');
    if (target && target.trim()) {
      handleSendMessage(`Please crawl ${target.trim()} and summarize its key insights and contents.`);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white text-zinc-900 font-sans selection:bg-indigo-500/20 selection:text-indigo-800">
      {/* Sidebar Navigation */}
      <Sidebar
        isOpen={showSidebar}
        onClose={() => setShowSidebar(false)}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={(id) => setActiveSessionId(id)}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        onRenameSession={handleRenameSession}
        currentPersonality={settings.personality}
        onSelectPersonality={(p: PersonalityType) => {
          setSettings((prev) => ({ ...prev, personality: p }));
        }}
        onOpenSettings={(tab) => handleOpenSettings(tab)}
        onOpenErrorLogs={() => setShowErrorLogs(true)}
        onToggleWebSearch={() =>
          setSettings((prev) => ({ ...prev, webSearchEnabled: !prev.webSearchEnabled }))
        }
        errorCount={errorLogs.length}
        memoryTraitCount={memoryProfile.traits.length}
        settings={settings}
      />

      {/* Main Workspace */}
      <div className="flex flex-1 flex-col h-full min-w-0 overflow-hidden relative bg-white">
        {/* Top Navbar */}
        <Header
          settings={settings}
          onUpdateSettings={(newS) => setSettings(newS)}
          onOpenSettings={(tab) => handleOpenSettings(tab)}
          onOpenErrorLogs={() => setShowErrorLogs(true)}
          errorCount={errorLogs.length}
          memoryTraitCount={memoryProfile.traits.length}
          onToggleSidebar={() => setShowSidebar(!showSidebar)}
          onNewChat={handleNewChat}
          onExportChat={handleExportChat}
          isSidebarOpen={showSidebar}
        />

        {/* Informative Top Notification Banner */}
        {!dismissTopBanner && (
          <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50 px-4 py-2 text-xs text-zinc-700 transition-colors">
            <div className="flex items-center gap-2">
              <Key className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
              <span>
                <strong>Active Engine:</strong> {activeMeta.name} ({activeProvConfig.model || activeMeta.defaultModel})
              </span>
              <span className="hidden sm:inline-block text-zinc-300">•</span>
              <span className="hidden sm:inline-flex items-center gap-1 text-purple-700 font-medium">
                <Brain className="h-3 w-3 text-purple-600" />
                Adaptive Memory Active ({memoryProfile.traits.length} traits)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleOpenSettings('providers', activeProv)}
                className="rounded-md bg-indigo-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-indigo-500 transition-colors cursor-pointer"
              >
                Configure Providers & Keys
              </button>
              <button
                onClick={() => setDismissTopBanner(true)}
                className="p-1 text-zinc-400 hover:text-zinc-600 cursor-pointer"
                title="Dismiss"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Scrollable Conversation Stream */}
        <main
          ref={chatContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-2 sm:px-4 md:px-6 py-4 space-y-2 relative bg-white"
        >
          {currentSession.messages.length === 0 ? (
            <EmptyState
              onSelectPrompt={(prompt) => handleSendMessage(prompt)}
              onOpenSettings={(tab) => handleOpenSettings(tab)}
              settings={settings}
              memoryProfile={memoryProfile}
            />
          ) : (
            <div className="max-w-3xl mx-auto space-y-1">
              {currentSession.messages.map((message, index) => {
                const isLatestAssistant =
                  message.role === 'assistant' &&
                  index === currentSession.messages.length - 1;

                return (
                  <MessageItem
                    key={message.id}
                    message={message}
                    isLatestAssistant={isLatestAssistant}
                    onRegenerate={isLatestAssistant ? handleRegenerate : undefined}
                    onEditPrompt={
                      message.role === 'user' ? handleEditPrompt : undefined
                    }
                    onFeedback={handleFeedback}
                    speechVoiceUri={settings.speechVoiceUri}
                    speechRate={settings.speechRate}
                    onSwitchToCoupon={handleQuickSwitchToCoupon}
                    onOpenSettings={(provId) => handleOpenSettings('providers', provId)}
                  />
                );
              })}
              <div ref={messagesEndRef} className="h-4" />
            </div>
          )}
        </main>

        {/* Floating Scroll to Bottom */}
        {showScrollBottom && (
          <button
            onClick={() => scrollToBottom('smooth')}
            className="absolute bottom-24 right-6 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-700 shadow-md transition-all hover:bg-zinc-100 hover:text-zinc-900 cursor-pointer"
            title="Scroll to latest message"
          >
            <ArrowDown className="h-4 w-4" />
          </button>
        )}

        {/* Bottom Floating Chat Input */}
        <footer className="w-full shrink-0 bg-gradient-to-t from-white via-white to-transparent pt-2">
          <ChatInput
            onSendMessage={handleSendMessage}
            isStreaming={isStreaming}
            onStopStreaming={handleStopStreaming}
            webSearchEnabled={settings.webSearchEnabled}
            onToggleWebSearch={() =>
              setSettings((prev) => ({ ...prev, webSearchEnabled: !prev.webSearchEnabled }))
            }
            onCrawlUrlPrompt={handleCrawlUrlPrompt}
          />
        </footer>
      </div>

      {/* Settings Modal (Top 20, Ollama, Custom, Memory, Web) */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onSaveSettings={(newSettings) => setSettings(newSettings)}
        initialProvider={settingsInitialProvider}
        initialTab={settingsInitialTab}
        memoryProfile={memoryProfile}
        onSaveMemoryProfile={(newProf) => setMemoryProfile(newProf)}
        onOpenErrorLogs={() => setShowErrorLogs(true)}
      />

      {/* Real-time Error Diagnostics & Logs Modal */}
      <ErrorLogsModal
        isOpen={showErrorLogs}
        onClose={() => setShowErrorLogs(false)}
        logs={errorLogs}
        onClearLogs={() => {
          clearErrorLogs();
          setErrorLogs([]);
        }}
        onOpenProviderSettings={(provId) => {
          handleOpenSettings('providers', provId as AIProviderId);
        }}
      />
    </div>
  );
}
