/**
 * Chatbot Service
 *
 * All API communication for the AI medical chatbot is isolated here.
 *
 * In development, requests go to /chatbot-api/api/chat which Vite proxies
 * to http://54.163.18.81:8000/api/chat — this avoids the browser CORS
 * preflight that the AWS server does not handle.
 *
 * In production, set VITE_CHATBOT_BASE_URL to an empty string (same-origin
 * reverse-proxy) or to the full URL of a CORS-enabled gateway.
 */

const CHATBOT_BASE_URL = import.meta.env.VITE_CHATBOT_BASE_URL || 'https://1poeaxsg2f.execute-api.us-east-1.amazonaws.com';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ChatbotRequest {
  question: string;
}

export interface ChatbotResponse {
  question: string;
  answer: string;
  source: string;
  page: string | number;
  score: number;
}

export class ChatbotError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = 'ChatbotError';
  }
}

// ── Service ───────────────────────────────────────────────────────────────────

const chatbotService = {
  /**
   * Send a question to the medical chatbot and return the full response.
   * Throws `ChatbotError` on any failure so callers can handle it uniformly.
   */
  async ask(question: string): Promise<ChatbotResponse> {
    const trimmed = question.trim();
    if (!trimmed) {
      throw new ChatbotError('Question cannot be empty.');
    }

    let response: Response;

    try {
      response = await fetch(`${CHATBOT_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: trimmed } satisfies ChatbotRequest),
      });
    } catch {
      // Network-level failure (DNS, refused connection, timeout, …)
      throw new ChatbotError(
        'تعذّر الوصول إلى المساعد الطبي. يرجى التحقق من اتصالك والمحاولة مرة أخرى.',
      );
    }

    if (!response.ok) {
      let detail = '';
      try {
        const body = await response.json();
        detail = body?.detail ?? body?.message ?? '';
      } catch {
        // response body is not JSON — ignore
      }
      throw new ChatbotError(
        detail || `حدث خطأ في الخادم (${response.status}). يرجى المحاولة لاحقاً.`,
        response.status,
      );
    }

    try {
      const data: ChatbotResponse = await response.json();
      return data;
    } catch {
      throw new ChatbotError('استجابة غير مقروءة من الخادم. يرجى المحاولة مرة أخرى.');
    }
  },
};

export default chatbotService;
