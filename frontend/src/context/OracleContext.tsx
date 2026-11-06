import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { apiFetch } from '../utils/api';

export interface OracleMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface OracleContextValue {
  messages: OracleMessage[];
  streaming: boolean;
  error: string | null;
  widgetOpen: boolean;
  // Which model answers: "gemini", "anthropic", "ollama" or "demo"
  provider: string | null;
  setWidgetOpen: (open: boolean) => void;
  send: (text: string) => Promise<void>;
  clear: () => void;
}

const OracleContext = createContext<OracleContextValue | null>(null);

const FALLBACK_ERROR = 'The Oracle could not answer right now.';

// One conversation for the whole app, shared by the floating widget and the Oracle page
export const OracleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<OracleMessage[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [widgetOpen, setWidgetOpen] = useState(false);
  const [provider, setProvider] = useState<string | null>(null);

  // Ask once which model is active, so the UI can say "demo mode" before the first question
  useEffect(() => {
    apiFetch('/api/oracle/status')
      .then((res) => (res.ok ? res.json() : null))
      .then((status) => status && setProvider(status.provider))
      .catch(() => setProvider(null));
  }, []);
  const location = useLocation();

  const send = useCallback(
    async (text: string) => {
      const question = text.trim();
      if (!question || streaming) return;

      const history: OracleMessage[] = [...messages, { role: 'user', content: question }];
      setMessages([...history, { role: 'assistant', content: '' }]);
      setStreaming(true);
      setError(null);

      const appendToAnswer = (chunk: string) =>
        setMessages((prev) => {
          const next = [...prev];
          const last = next[next.length - 1];
          next[next.length - 1] = { ...last, content: last.content + chunk };
          return next;
        });

      try {
        // The backend adds live market data itself; we only tell it which tab is open
        const res = await apiFetch('/api/oracle/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: history, page: location.pathname }),
        });

        // The backend can fall back to another model (e.g. free quota used up), so trust the header
        const answeredBy = res.headers.get('X-Oracle-Provider');
        if (answeredBy) setProvider(answeredBy);

        if (!res.ok || !res.body) {
          const body = await res.json().catch(() => null);
          throw new Error(body?.error ?? FALLBACK_ERROR);
        }

        // The answer arrives as plain text chunks while Claude is writing it
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          appendToAnswer(decoder.decode(value, { stream: true }));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : FALLBACK_ERROR);
        // Drop the empty answer bubble, keep the question so it can be retried
        setMessages((prev) => (prev[prev.length - 1]?.content === '' ? prev.slice(0, -1) : prev));
      } finally {
        setStreaming(false);
      }
    },
    [messages, streaming, location.pathname],
  );

  const clear = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return (
    <OracleContext.Provider
      value={{ messages, streaming, error, widgetOpen, setWidgetOpen, provider, send, clear }}
    >
      {children}
    </OracleContext.Provider>
  );
};

const PROVIDER_LABELS: Record<string, string> = {
  gemini: 'Google Gemini',
  anthropic: 'Claude',
  ollama: 'a local model (Ollama)',
  demo: 'demo answers, no AI model',
};

export const providerLabel = (provider: string | null) =>
  provider ? PROVIDER_LABELS[provider] ?? provider : 'loading…';

export const useOracle = () => {
  const context = useContext(OracleContext);
  if (!context) throw new Error('useOracle must be used inside <OracleProvider>');
  return context;
};
