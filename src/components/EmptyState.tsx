import {
  Brain,
  Coffee,
  Globe,
  GraduationCap,
  Sparkles,
  Utensils,
} from 'lucide-react';
import { AppSettings, AIMemoryProfile } from '../types';
import { getProviderMeta } from '../utils/aiProviders';

interface EmptyStateProps {
  onSelectPrompt: (prompt: string) => void;
  onOpenSettings: (tab?: 'providers' | 'ollama' | 'custom' | 'memory' | 'web') => void;
  settings: AppSettings;
  memoryProfile?: AIMemoryProfile;
}

const STARTER_PROMPTS = [
  {
    icon: Coffee,
    category: 'Casual Greeting',
    title: 'Say Hello & Introduce Yourself',
    prompt: 'Hey there! How are you doing today? 😊',
  },
  {
    icon: Utensils,
    category: 'Daily Life & Home',
    title: 'Quick 20-Minute Meal Plan',
    prompt:
      'Give me 3 delicious, budget-friendly 20-minute dinner ideas with simple ingredients.',
  },
  {
    icon: GraduationCap,
    category: 'Learning & Math',
    title: 'Intuitive Mathematics',
    prompt:
      'Explain Bayes’ theorem or conditional probability with a clear, everyday example.',
  },
  {
    icon: Globe,
    category: 'Real-Time Web Search',
    title: 'Current World & Science News',
    prompt:
      'What are the most notable science and space exploration developments this week?',
  },
];

export default function EmptyState({
  onSelectPrompt,
  onOpenSettings,
  settings,
  memoryProfile,
}: EmptyStateProps) {
  const activeProv = settings.authMode === 'coupon' ? 'coupon' : (settings.activeProvider || 'openai');
  const meta = getProviderMeta(activeProv);
  const provConfig = settings.providerConfigs?.[activeProv];
  const modelName = settings.authMode === 'coupon' ? 'Qoma AI v7.0' : (provConfig?.model || settings.ollamaConfig?.model || meta.defaultModel);

  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 max-w-2xl mx-auto my-auto text-center text-zinc-900">
      {/* Brand Monogram */}
      <div className="mb-4 flex items-center justify-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white font-mono font-bold text-2xl shadow-md">
          Q
        </div>
      </div>

      {/* Main Title */}
      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 mb-2">
        Cartory <span className="text-indigo-600">QOMA AI</span>
      </h1>
      <p className="text-xs sm:text-sm text-zinc-600 max-w-md mx-auto mb-5 leading-relaxed">
        <strong>Qoma AI version 7.0</strong> — An advanced artificial intelligence developed exclusively by Cartory with dynamic memory and live web search.
      </p>

      {/* Status Pills */}
      <div className="mb-6 flex flex-wrap items-center justify-center gap-2">
        <button
          onClick={() => onOpenSettings('providers')}
          className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3.5 py-1.5 text-xs text-zinc-700 hover:border-zinc-300 hover:text-zinc-900 transition-colors cursor-pointer shadow-xs"
        >
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>
            Active: <strong>{meta.name} • {modelName}</strong>
          </span>
          <span className="text-[10px] font-mono text-indigo-600 underline font-medium">Change</span>
        </button>

        {memoryProfile && (
          <button
            onClick={() => onOpenSettings('memory')}
            className="inline-flex items-center gap-1.5 rounded-xl border border-purple-200 bg-purple-50 px-3 py-1.5 text-xs text-purple-700 hover:bg-purple-100 transition-colors cursor-pointer shadow-xs"
          >
            <Brain className="h-3.5 w-3.5 text-purple-600" />
            <span>
              Memory: <strong>{memoryProfile.traits.length} traits</strong> ({memoryProfile.config.tone})
            </span>
          </button>
        )}
      </div>

      {/* Starter Prompts Grid */}
      <div className="grid w-full grid-cols-1 sm:grid-cols-2 gap-2.5 text-left">
        {STARTER_PROMPTS.map((starter, idx) => {
          const Icon = starter.icon;
          return (
            <button
              key={idx}
              onClick={() => onSelectPrompt(starter.prompt)}
              className="group flex flex-col justify-between rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-left transition-all hover:border-indigo-300 hover:bg-white hover:shadow-sm cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-semibold text-zinc-500 flex items-center gap-1.5">
                    <Icon className="h-3.5 w-3.5 text-indigo-600" />
                    {starter.category}
                  </span>
                  <span className="text-[11px] text-zinc-400 group-hover:text-indigo-600 transition-colors font-medium">
                    Ask →
                  </span>
                </div>
                <h3 className="text-xs font-bold text-zinc-900 group-hover:text-indigo-600 transition-colors">
                  {starter.title}
                </h3>
                <p className="mt-1 text-[11px] text-zinc-500 line-clamp-2 leading-relaxed">
                  {starter.prompt}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
