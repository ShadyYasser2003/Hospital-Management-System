import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Stethoscope, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  showSuggestions?: boolean;
}

const initialMessages: Message[] = [
  {
    id: '1',
    role: 'ai',
    content: "Hello! I'm your AI Medical Assistant. I can help you understand symptoms, check your appointments, or provide information about medications. How can I help you today?",
    showSuggestions: true,
  },
  {
    id: '2',
    role: 'user',
    content: 'I have a headache and fever.',
  },
  {
    id: '3',
    role: 'ai',
    content: 'These symptoms may indicate flu or a viral infection. Common causes include:\n• Influenza (flu)\n• Common cold\n• Sinus infection\n\nIf your fever is above 39°C (102°F) or symptoms persist for more than 3 days, you should consider booking an appointment with a doctor.',
  },
];

const suggestions = [
  { label: 'Check symptoms', icon: '🩺' },
  { label: 'Book appointment', icon: '📅' },
  { label: 'Medication information', icon: '💊' },
];

const getMockResponse = (input: string): string => {
  const lower = input.toLowerCase();
  if (lower.includes('appointment') || lower.includes('book')) {
    return 'To book an appointment, go to the Appointments section in your dashboard. You can select a doctor, choose a date and time, and confirm your booking. Would you like me to help with anything else?';
  }
  if (lower.includes('medication') || lower.includes('medicine') || lower.includes('prescription')) {
    return "You can view all your active prescriptions in the Prescriptions section. Always follow your doctor's instructions and do not stop medications without consulting your physician. Do you have a specific medication question?";
  }
  if (lower.includes('symptom') || lower.includes('pain') || lower.includes('sick')) {
    return "I understand you're not feeling well. Please describe your symptoms in detail so I can provide better guidance. Remember, for any serious or emergency symptoms, please call emergency services immediately or visit the nearest emergency room.";
  }
  return 'Thank you for your question. For personalized medical advice, I recommend consulting with your assigned doctor through the Appointments section. Is there anything general I can help you with?';
};

/* ─── Shared message bubble ─── */
const MessageBubble: React.FC<{ msg: Message; onSuggestion: (s: string) => void; isFullScreen: boolean }> = ({ msg, onSuggestion, isFullScreen }) => (
  <div className={cn('flex gap-3', msg.role === 'user' ? 'flex-row-reverse' : 'flex-row')}>
    <div className={cn(
      'rounded-full flex items-center justify-center flex-shrink-0 mt-0.5',
      isFullScreen ? 'h-9 w-9' : 'h-7 w-7',
      msg.role === 'ai' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground',
    )}>
      {msg.role === 'ai'
        ? <Bot className={isFullScreen ? 'h-5 w-5' : 'h-4 w-4'} />
        : <User className={isFullScreen ? 'h-5 w-5' : 'h-4 w-4'} />}
    </div>

    <div className={cn('flex flex-col gap-2', msg.role === 'user' ? 'items-end' : 'items-start', isFullScreen ? 'max-w-[65%]' : 'max-w-[80%]')}>
      <div className={cn(
        'rounded-2xl leading-relaxed whitespace-pre-line',
        isFullScreen ? 'px-4 py-3 text-base' : 'px-3.5 py-2.5 text-sm',
        msg.role === 'user'
          ? 'bg-primary text-primary-foreground rounded-tr-sm'
          : 'bg-card border border-border text-foreground rounded-tl-sm shadow-sm',
      )}>
        {msg.content}
      </div>

      {msg.showSuggestions && (
        <div className="flex flex-wrap gap-2 mt-1">
          {suggestions.map((s) => (
            <button
              key={s.label}
              onClick={() => onSuggestion(s.label)}
              className={cn(
                'flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary hover:bg-primary/15 transition-colors font-medium',
                isFullScreen ? 'text-sm px-3.5 py-2' : 'text-xs px-2.5 py-1.5',
              )}
            >
              <span>{s.icon}</span>
              <span>{s.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  </div>
);

/* ─── Typing indicator ─── */
const TypingIndicator: React.FC = () => (
  <div className="flex gap-3 items-start">
    <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
      <Bot className="h-4 w-4" />
    </div>
    <div className="bg-card border border-border px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm">
      <div className="flex gap-1 items-center h-4">
        <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:0ms]" />
        <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:150ms]" />
        <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:300ms]" />
      </div>
    </div>
  </div>
);

/* ─── Main Component ─── */
const AIChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, messages]);

  const handleSend = (text?: string) => {
    const messageText = text || inputValue.trim();
    if (!messageText) return;

    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: messageText }]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'ai', content: getMockResponse(messageText) }]);
      setIsTyping(false);
    }, 1200);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleClose = () => { setIsOpen(false); setIsFullScreen(false); };
  const toggleFullScreen = () => setIsFullScreen(v => !v);

  /* ── Shared Header ── */
  const Header = () => (
    <div className={cn(
      'flex items-center justify-between bg-primary text-primary-foreground flex-shrink-0',
      isFullScreen ? 'px-6 py-4' : 'px-4 py-3',
    )}>
      <div className="flex items-center gap-3">
        <div className={cn(
          'rounded-full bg-primary-foreground/20 flex items-center justify-center flex-shrink-0',
          isFullScreen ? 'h-11 w-11' : 'h-9 w-9',
        )}>
          <Stethoscope className={isFullScreen ? 'h-6 w-6' : 'h-5 w-5'} />
        </div>
        <div>
          <h3 className={cn('font-semibold leading-tight', isFullScreen ? 'text-base' : 'text-sm')}>AI Medical Assistant</h3>
          <p className={cn('text-primary-foreground/75 leading-tight', isFullScreen ? 'text-sm' : 'text-xs')}>
            Ask me about symptoms, appointments, or medications.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={toggleFullScreen}
          title={isFullScreen ? 'Minimize' : 'Full screen'}
          className={cn(
            'rounded-full hover:bg-primary-foreground/20 flex items-center justify-center transition-colors',
            isFullScreen ? 'h-9 w-9' : 'h-8 w-8',
          )}
        >
          {isFullScreen
            ? <Minimize2 className={isFullScreen ? 'h-5 w-5' : 'h-4 w-4'} />
            : <Maximize2 className="h-4 w-4" />}
        </button>
        <button
          onClick={handleClose}
          className={cn(
            'rounded-full hover:bg-primary-foreground/20 flex items-center justify-center transition-colors',
            isFullScreen ? 'h-9 w-9' : 'h-8 w-8',
          )}
        >
          <X className={isFullScreen ? 'h-5 w-5' : 'h-4 w-4'} />
        </button>
      </div>
    </div>
  );

  /* ── Shared Messages Area ── */
  const MessagesArea = () => (
    <div className={cn('flex-1 overflow-y-auto bg-background', isFullScreen ? 'px-6 py-6 space-y-5' : 'px-4 py-4 space-y-4')}>
      {isFullScreen && (
        <div className="flex justify-center mb-4">
          <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">Today</span>
        </div>
      )}
      {messages.map((msg) => (
        <MessageBubble key={msg.id} msg={msg} onSuggestion={handleSend} isFullScreen={isFullScreen} />
      ))}
      {isTyping && <TypingIndicator />}
      <div ref={messagesEndRef} />
    </div>
  );

  /* ── Shared Footer ── */
  const Footer = () => (
    <>
      <div className={cn('bg-muted/50 border-t border-border flex-shrink-0', isFullScreen ? 'px-6 py-2' : 'px-4 py-2')}>
        <p className="text-xs text-muted-foreground text-center">
          ⚕️ This AI assistant does not replace professional medical advice.
        </p>
      </div>
      <div className={cn('bg-card border-t border-border flex gap-2 flex-shrink-0', isFullScreen ? 'px-6 py-4' : 'px-4 py-3')}>
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your question..."
          className={cn('flex-1 rounded-full bg-background border-border', isFullScreen ? 'text-base h-12' : 'text-sm')}
        />
        <Button
          size="icon"
          onClick={() => handleSend()}
          disabled={!inputValue.trim() || isTyping}
          className={cn('rounded-full flex-shrink-0', isFullScreen ? 'h-12 w-12' : 'h-10 w-10')}
        >
          <Send className={isFullScreen ? 'h-5 w-5' : 'h-4 w-4'} />
        </Button>
      </div>
    </>
  );

  return (
    <>
      {/* Floating launch button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-in">
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <MessageCircle className="h-5 w-5" />
            <span className="text-sm font-medium">AI Assistant</span>
          </button>
        </div>
      )}

      {/* Full-screen backdrop + panel */}
      {isOpen && isFullScreen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-fade-in">
          <div className="flex flex-col w-full max-w-4xl mx-4 rounded-2xl shadow-2xl border border-border bg-card overflow-hidden animate-scale-in"
            style={{ height: 'min(85vh, 800px)' }}>
            <Header />
            <MessagesArea />
            <Footer />
          </div>
        </div>
      )}

      {/* Floating panel (normal mode) */}
      {isOpen && !isFullScreen && (
        <div
          className="fixed bottom-6 right-6 z-50 w-[370px] max-w-[calc(100vw-2rem)] flex flex-col rounded-2xl shadow-2xl border border-border bg-card overflow-hidden animate-fade-in"
          style={{ height: '560px' }}
        >
          <Header />
          <MessagesArea />
          <Footer />
        </div>
      )}
    </>
  );
};

export default AIChatbot;
