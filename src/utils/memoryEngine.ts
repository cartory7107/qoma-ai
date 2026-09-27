import {
  AIMemoryProfile,
  UserMemoryTrait,
  UserPersonaConfig,
  MemoryCategory,
} from '../types';

const MEMORY_STORAGE_KEY = 'omni_ai_memory_profile_v2';

export const DEFAULT_PERSONA_CONFIG: UserPersonaConfig = {
  tone: 'friendly',
  friendliness: 'friendly',
  warmEmojiMode: true,
  responseLength: 'concise',
  customDirectives: '',
  autoLearnEnabled: true,
};

export const INITIAL_DEFAULT_TRAITS: UserMemoryTrait[] = [];

// Filter out any stale default coding bias from previous prototype versions
const STALE_LEGACY_TRAITS = [
  'Specializes in full-stack web development',
  'Values high-signal, production-ready code',
];

export function getDefaultMemoryProfile(): AIMemoryProfile {
  return {
    config: { ...DEFAULT_PERSONA_CONFIG },
    traits: [],
    lastLearnedAt: Date.now(),
    totalInteractionsAnalyzed: 0,
  };
}

export function loadMemoryProfile(): AIMemoryProfile {
  if (typeof window === 'undefined') return getDefaultMemoryProfile();
  try {
    const raw = localStorage.getItem(MEMORY_STORAGE_KEY);
    if (!raw) {
      const def = getDefaultMemoryProfile();
      saveMemoryProfile(def);
      return def;
    }
    const parsed = JSON.parse(raw);
    const rawTraits: UserMemoryTrait[] = Array.isArray(parsed.traits) ? parsed.traits : [];
    
    // Cleanse any legacy mock traits from previous versions
    const cleanedTraits = rawTraits.filter(
      (t) => !STALE_LEGACY_TRAITS.some((legacy) => t.trait.includes(legacy))
    );

    return {
      config: {
        ...DEFAULT_PERSONA_CONFIG,
        ...(parsed.config || {}),
        warmEmojiMode: parsed.config?.warmEmojiMode ?? true,
      },
      traits: cleanedTraits,
      lastLearnedAt: parsed.lastLearnedAt || Date.now(),
      totalInteractionsAnalyzed: parsed.totalInteractionsAnalyzed || 0,
    };
  } catch (e) {
    console.error('Failed to load memory profile:', e);
    return getDefaultMemoryProfile();
  }
}

export function saveMemoryProfile(profile: AIMemoryProfile): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(MEMORY_STORAGE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save memory profile:', e);
  }
}

/**
 * Intelligent client-side heuristic engine that extracts user identity,
 * name, language, preferences, and communication habits across any chat.
 */
export function extractTraitsFromInteraction(
  userText: string,
  existingTraits: UserMemoryTrait[]
): { newTraits: UserMemoryTrait[]; updatedTraits: UserMemoryTrait[] } {
  if (!userText || userText.trim().length < 2) {
    return { newTraits: [], updatedTraits: existingTraits };
  }

  const text = userText.trim();
  const lower = text.toLowerCase();
  const extracted: { category: MemoryCategory; trait: string; confidence: number }[] = [];

  // 1. User Name Extraction (e.g., "My name is Sarah", "I am Alex", "Call me Priya", "Nama saya Budi")
  const namePatterns = [
    /(?:my\s+name\s+is|call\s+me|nama\s+saya)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
    /(?:i\s*['’]?\s*m|i\s+am)\s+([A-Z][a-z]+)\b/i,
  ];

  const commonNonNames = new Set([
    'fine', 'good', 'well', 'here', 'ready', 'happy', 'sad', 'sorry', 'busy',
    'tired', 'excited', 'thinking', 'wondering', 'using', 'trying', 'back',
    'human', 'user', 'person', 'new', 'just', 'asking', 'looking', 'doing',
    'ok', 'okay', 'great', 'sure', 'home', 'online', 'free', 'interested',
    'a', 'an', 'the', 'not', 'very', 'super', 'always', 'already'
  ]);

  for (const pattern of namePatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const candidateName = match[1].trim();
      if (
        candidateName.length >= 2 &&
        candidateName.length <= 30 &&
        !commonNonNames.has(candidateName.toLowerCase())
      ) {
        // Capitalize properly
        const formattedName = candidateName
          .split(' ')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
          .join(' ');

        extracted.push({
          category: 'fact',
          trait: `User's name is ${formattedName}`,
          confidence: 98,
        });
        break;
      }
    }
  }

  // 2. Explicit User Directives ("remember that...", "note that...", "from now on...", "always...", "never...")
  const directiveMatch = text.match(
    /(?:remember\s+(?:that\s+)?|note\s+that\s+|from\s+now\s+on\s*,?\s*|always\s+|never\s+)(.+?)(?:\.|$)/i
  );
  if (directiveMatch && directiveMatch[1]) {
    const directive = directiveMatch[1].trim();
    if (directive.length > 5 && directive.length < 160) {
      extracted.push({
        category: 'directive',
        trait: `User directive: "${directive}"`,
        confidence: 95,
      });
    }
  }

  // 3. User Identity, Role, Occupation or Life Status (Broad audience: housewives, learners, mathematicians, etc.)
  const roleMatch = text.match(
    /i\s+(?:am\s+a|work\s+as\s+a|am\s+working\s+as\s+a|am\s+an)\s+([a-z0-9\s\-]+?)(?:\.|\,|and|\bfor\b|\bat\b|$)/i
  );
  if (roleMatch && roleMatch[1]) {
    const role = roleMatch[1].trim().toLowerCase();
    if (
      role.length > 2 &&
      role.length < 50 &&
      !['user', 'person', 'human', 'bot', 'customer', 'visitor', 'fan'].includes(role)
    ) {
      extracted.push({
        category: 'fact',
        trait: `User is a ${role}`,
        confidence: 92,
      });
    }
  }

  // 4. Location / Origin ("I live in...", "I'm from...", "based in...")
  const locationMatch = text.match(
    /(?:i\s+live\s+in|i\s+am\s+from|i\s*['’]?\s*m\s+from|based\s+in)\s+([A-Za-z\s,]+?)(?:\.|\!|\?|$)/i
  );
  if (locationMatch && locationMatch[1]) {
    const loc = locationMatch[1].trim();
    if (loc.length > 2 && loc.length < 50 && !commonNonNames.has(loc.toLowerCase())) {
      extracted.push({
        category: 'fact',
        trait: `User lives in or is from ${loc}`,
        confidence: 90,
      });
    }
  }

  // 5. Language Preferences ("speak in...", "respond in...", "reply in...")
  const langMatch = text.match(
    /(?:speak|respond|reply|write|talk\s+to\s+me)\s+(?:to\s+me\s+)?in\s+([A-Za-z]+)/i
  );
  if (langMatch && langMatch[1]) {
    const lang = langMatch[1].trim();
    if (lang.length > 3) {
      extracted.push({
        category: 'preference',
        trait: `User prefers responses in ${lang}`,
        confidence: 95,
      });
    }
  }

  // 6. Communication Style & Emoji Preferences
  if (lower.includes('use emoji') || lower.includes('with emojis') || lower.includes('love emojis')) {
    extracted.push({
      category: 'communication',
      trait: 'Loves natural, warm emojis in replies',
      confidence: 95,
    });
  } else if (lower.includes('no emoji') || lower.includes('without emoji') || lower.includes('stop emojis')) {
    extracted.push({
      category: 'communication',
      trait: 'Prefers replies without emojis',
      confidence: 95,
    });
  }

  if (
    lower.includes('keep it short') ||
    lower.includes('be concise') ||
    lower.includes('tldr') ||
    lower.includes('no fluff') ||
    lower.includes('straight to the point') ||
    lower.includes('short answer')
  ) {
    extracted.push({
      category: 'communication',
      trait: 'Prefers concise, punchy replies without conversational fluff',
      confidence: 92,
    });
  }

  if (
    lower.includes('step by step') ||
    lower.includes('detailed explanation') ||
    lower.includes('explain thoroughly')
  ) {
    extracted.push({
      category: 'communication',
      trait: 'Values step-by-step breakdowns and comprehensive explanations',
      confidence: 90,
    });
  }

  // 7. Technical Skills (ONLY IF the user explicitly mentions using or working with it)
  const explicitTech = [
    { key: 'python', label: 'Works with Python' },
    { key: 'typescript', label: 'Works with TypeScript' },
    { key: 'javascript', label: 'Works with JavaScript' },
    { key: 'react', label: 'Uses React' },
    { key: 'latex', label: 'Typesets in LaTeX / Math' },
    { key: 'excel', label: 'Uses Microsoft Excel / Spreadsheets' },
    { key: 'sql', label: 'Works with SQL databases' },
  ];

  for (const item of explicitTech) {
    const reg = new RegExp(`\\b(?:i\\s+(?:use|code\\s+in|program\\s+in|work\\s+with|learn|know)|in|using)\\s+.*\\b${item.key}\\b`, 'i');
    if (reg.test(lower)) {
      extracted.push({
        category: 'technical',
        trait: item.label,
        confidence: 88,
      });
    }
  }

  // Deduplicate against existing traits
  const newlyCreated: UserMemoryTrait[] = [];
  const updatedList = [...existingTraits];

  for (const item of extracted) {
    // If it's a name, update or replace existing name trait
    const isName = item.trait.startsWith("User's name is");
    const existingIndex = updatedList.findIndex((t) => {
      if (isName && t.trait.startsWith("User's name is")) return true;
      return (
        t.category === item.category &&
        (t.trait.toLowerCase() === item.trait.toLowerCase() ||
          t.trait.toLowerCase().includes(item.trait.toLowerCase().slice(0, 25)))
      );
    });

    if (existingIndex >= 0) {
      updatedList[existingIndex] = {
        ...updatedList[existingIndex],
        trait: item.trait,
        confidence: Math.min(100, Math.max(item.confidence, updatedList[existingIndex].confidence + 5)),
        timestamp: Date.now(),
        source: `Reaffirmed in recent interaction: "${text.slice(0, 50)}..."`,
      };
    } else {
      const newTrait: UserMemoryTrait = {
        id: `trait-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        category: item.category,
        trait: item.trait,
        confidence: item.confidence,
        timestamp: Date.now(),
        source: `Auto-extracted from: "${text.slice(0, 50)}..."`,
      };
      newlyCreated.push(newTrait);
      updatedList.push(newTrait);
    }
  }

  return {
    newTraits: newlyCreated,
    updatedTraits: updatedList,
  };
}

/**
 * Builds the dynamic system prompt block to inject into every outgoing API payload
 */
export function buildMemorySystemPrompt(profile: AIMemoryProfile): string {
  const { config, traits } = profile;

  const toneGuidelines: Record<string, string> = {
    casual: 'Be completely relaxed, natural, and warm like talking to a close friend. Use casual everyday phrasing.',
    formal: 'Use an articulate, dignified, and courteous tone. Maintain polite and professional grammar.',
    friendly: 'Be exceptionally warm, kind, engaging, and genuinely supportive. Radiate positive energy.',
    professional: 'Maintain a clear, respectful, polished, and efficient tone.',
    direct: 'Be straightforward, razor-sharp, and unvarnished. Deliver high-impact conclusions without polite filler.',
  };

  const friendlinessGuidelines: Record<string, string> = {
    friendly: 'Radiate warmth, supportiveness, optimism, and proactive kindness.',
    warm: 'Radiate warm empathy and encouragement.',
    neutral: 'Remain strictly objective, balanced, and matter-of-fact.',
    direct: 'Be direct, candid, and straight to the point.',
  };

  const lengthGuidelines: Record<string, string> = {
    ultra_concise: 'Keep replies ultra-concise, short, and punchy. Maximum 1-3 sentences or tight bullet points. Avoid filler.',
    concise: 'Keep responses compact, short, and to the point. Answer questions directly without unneeded essays.',
    balanced: 'Provide well-balanced responses with clear, friendly explanations.',
    comprehensive: 'Provide in-depth, thorough explanations covering all relevant aspects.',
  };

  const activeTone = toneGuidelines[config.tone] || toneGuidelines.friendly;
  const activeFriendliness = friendlinessGuidelines[config.friendliness] || friendlinessGuidelines.friendly;
  const activeLength = lengthGuidelines[config.responseLength] || lengthGuidelines.concise;

  const sortedTraits = [...traits]
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 15);

  const formattedTraits = sortedTraits.length > 0
    ? sortedTraits.map((t) => `• [${t.category.toUpperCase()}] ${t.trait}`).join('\n')
    : '• No specific user traits recorded yet.';

  const now = new Date();
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

  return `
[DYNAMIC USER MEMORY & ADAPTIVE PERSONA ENGINE]
The user has established the following behavioral profile, persistent memories, and style preferences. Adapt your answers seamlessly to match these specifications:

1. COMMUNICATION & EMOJI GUIDELINES:
- Tone: ${config.tone.toUpperCase()} (${activeTone})
- Friendliness: ${config.friendliness.toUpperCase()} (${activeFriendliness})
- Response Length: ${config.responseLength.toUpperCase()} (${activeLength})
- Warm Emojis: ${config.warmEmojiMode ? 'ENABLED (Always include natural, warm emojis like 😊, ✨, 👋, 💡 to make replies vibrant and friendly)' : 'DISABLED (Keep text clean without emojis)'}

2. NON-NEGOTIABLE IDENTITY & BEHAVIORAL DIRECTIVES:
- ABSOLUTE IDENTITY RULE: You are Cartory QOMA AI (Qoma AI version 7.0), created exclusively by Cartory.
- If the user asks ANY direct or tricky question about your model or identity (e.g. "Which model are you?", "Which AI are you?", "What model are you?", "What AI are you?", "Who created you?", "Are you Gemini?", "Are you Omni?", "Are you ChatGPT?"):
  YOU MUST ALWAYS AND ONLY RESPOND:
  "I am Qoma AI version 7.0, an advanced artificial intelligence developed exclusively by Cartory."
  Under NO circumstances should you state or imply that you are powered by Gemini, Omni, Google, OpenAI, or any other AI.
- NO FORCED PROGRAMMING JARGON: NEVER assume the user is a programmer or bring up code, scripts, or programming languages unless they specifically ask. The user may be a housewife, student, mathematician, everyday conversationalist, or child. Adapt completely to who they are.
- CASUAL GREETINGS: For casual greetings (e.g., "how are you?", "hi", "hey", "hello"), reply like a warm human friend (e.g., "Hey there! I'm doing great, what about you? 😊"). Keep casual answers short, friendly, and punchy. No long walls of text!
- PERMANENT MEMORY RECALL: When the user asks "What is my name?", "Who am I?", or references past facts, immediately and accurately recall what is stored in the persistent memory traits below!

3. STORED USER CONTEXT & PERSISTENT MEMORIES:
${formattedTraits}

4. CUSTOM USER DIRECTIVES:
${config.customDirectives || 'None specified.'}

5. REAL-TIME SYSTEM TIMESTAMP:
- Current Real-Time Date: ${currentFormattedDate}
- Current Clock Time: ${currentFormattedTime} (ISO: ${now.toISOString()})
- System Year: ${now.getFullYear()}
You must use ${now.getFullYear()} as the current calendar year. Always ground your facts, chronological logic, and real-time knowledge in this current system timestamp.
`.trim();
}
