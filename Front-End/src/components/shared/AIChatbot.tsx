import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  MessageCircle, X, Send, Bot, User,
  Stethoscope, Maximize2, Minimize2, AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import chatbotService, { ChatbotResponse, ChatbotError } from '@/services/chatbotService';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: 'user' | 'ai' | 'error';
  content: string;
}

interface AIChatbotProps {
  role?: 'patient' | 'doctor';
}

// ── Welcome messages per role ─────────────────────────────────────────────────

const PATIENT_WELCOME: Message = {
  id: 'welcome',
  role: 'ai',
  content:
    'أهلاً 👋 أنا HakimAI، مساعدك الطبي الذكي. أستطيع مساعدتك في فهم الأعراض، التقارير الطبية، والمعلومات العلاجية بناءً على مصادر طبية موثوقة.',
};

const DOCTOR_WELCOME: Message = {
  id: 'welcome',
  role: 'ai',
  content:
    'أهلاً دكتور 👋 أنا HakimAI، مساعدك الطبي الذكي. يمكنك سؤالي عن أي معلومة طبية تريد مراجعتها — تشخيصات، بروتوكولات علاجية، أو معلومات سريرية — بناءً على مصادر طبية موثوقة.',
};

// ── Sub-components (defined at module level — never recreated on re-render) ───

interface BubbleProps {
  msg: Message;
  isFullScreen: boolean;
}

const MessageBubble = React.memo<BubbleProps>(({ msg, isFullScreen }) => {
  const isUser  = msg.role === 'user';
  const isError = msg.role === 'error';

  return (
    <div className={cn('flex gap-3', isUser ? 'flex-row-reverse' : 'flex-row')} dir="rtl">
      <div className={cn(
        'rounded-full flex items-center justify-center flex-shrink-0 mt-0.5',
        isFullScreen ? 'h-9 w-9' : 'h-7 w-7',
        isUser    ? 'bg-muted text-muted-foreground'
        : isError ? 'bg-destructive/10 text-destructive'
        :           'bg-primary/10 text-primary',
      )}>
        {isUser    ? <User        className={isFullScreen ? 'h-5 w-5' : 'h-4 w-4'} />
        : isError  ? <AlertCircle className={isFullScreen ? 'h-5 w-5' : 'h-4 w-4'} />
        :             <Bot        className={isFullScreen ? 'h-5 w-5' : 'h-4 w-4'} />}
      </div>

      <div className={cn(
        'rounded-2xl leading-relaxed whitespace-pre-line text-right',
        isFullScreen ? 'px-4 py-3 text-base max-w-[65%]' : 'px-3.5 py-2.5 text-sm max-w-[80%]',
        isUser
          ? 'bg-primary text-primary-foreground rounded-tl-sm'
          : isError
            ? 'bg-destructive/10 border border-destructive/30 text-destructive rounded-tr-sm'
            : 'bg-card border border-border text-foreground rounded-tr-sm shadow-sm',
      )}>
        {msg.content}
      </div>
    </div>
  );
});
MessageBubble.displayName = 'MessageBubble';

const TypingIndicator = React.memo<{ isFullScreen: boolean }>(({ isFullScreen }) => (
  <div className="flex gap-3 items-start" dir="rtl">
    <div className={cn(
      'rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0',
      isFullScreen ? 'h-9 w-9' : 'h-7 w-7',
    )}>
      <Bot className={isFullScreen ? 'h-5 w-5' : 'h-4 w-4'} />
    </div>
    <div className="bg-card border border-border px-4 py-3 rounded-2xl rounded-tr-sm shadow-sm">
      <div className="flex gap-1 items-center h-4">
        <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:0ms]" />
        <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:150ms]" />
        <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:300ms]" />
      </div>
    </div>
  </div>
));
TypingIndicator.displayName = 'TypingIndicator';

// ── Header (pure — only depends on props) ─────────────────────────────────────

interface HeaderProps {
  isFullScreen: boolean;
  role?: 'patient' | 'doctor';
  onClose: () => void;
  onToggleFullScreen: () => void;
}

const ChatHeader = React.memo<HeaderProps>(({ isFullScreen, role = 'patient', onClose, onToggleFullScreen }) => (
  <div
    className={cn(
      'flex items-center justify-between bg-primary text-primary-foreground flex-shrink-0',
      isFullScreen ? 'px-6 py-4' : 'px-4 py-3',
    )}
    dir="rtl"
  >
    <div className="flex items-center gap-3">
      <div className={cn(
        'rounded-full bg-primary-foreground/20 flex items-center justify-center flex-shrink-0',
        isFullScreen ? 'h-11 w-11' : 'h-9 w-9',
      )}>
        <Stethoscope className={isFullScreen ? 'h-6 w-6' : 'h-5 w-5'} />
      </div>
      <div>
        <h3 className={cn('font-semibold leading-tight', isFullScreen ? 'text-base' : 'text-sm')}>
          HakimAI
        </h3>
        <p className={cn('text-primary-foreground/75 leading-tight', isFullScreen ? 'text-sm' : 'text-xs')}>
          {role === 'doctor'
            ? 'راجع معلوماتك الطبية بسرعة'
            : 'اسألني عن الأعراض أو التقارير الطبية'}
        </p>
      </div>
    </div>

    <div className="flex items-center gap-1">
      <button
        onClick={onToggleFullScreen}
        title={isFullScreen ? 'تصغير' : 'تكبير'}
        className={cn(
          'rounded-full hover:bg-primary-foreground/20 flex items-center justify-center transition-colors',
          isFullScreen ? 'h-9 w-9' : 'h-8 w-8',
        )}
      >
        {isFullScreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
      </button>
      <button
        onClick={onClose}
        className={cn(
          'rounded-full hover:bg-primary-foreground/20 flex items-center justify-center transition-colors',
          isFullScreen ? 'h-9 w-9' : 'h-8 w-8',
        )}
      >
        <X className={isFullScreen ? 'h-5 w-5' : 'h-4 w-4'} />
      </button>
    </div>
  </div>
));
ChatHeader.displayName = 'ChatHeader';

// ── Messages area ─────────────────────────────────────────────────────────────

interface MessagesProps {
  messages: Message[];
  isLoading: boolean;
  isFullScreen: boolean;
  bottomRef: React.RefObject<HTMLDivElement>;
}

const MessagesArea = React.memo<MessagesProps>(({ messages, isLoading, isFullScreen, bottomRef }) => (
  <div className={cn(
    'flex-1 overflow-y-auto bg-background',
    isFullScreen ? 'px-6 py-6 space-y-5' : 'px-4 py-4 space-y-4',
  )}>
    {messages.map(msg => (
      <MessageBubble key={msg.id} msg={msg} isFullScreen={isFullScreen} />
    ))}
    {isLoading && <TypingIndicator isFullScreen={isFullScreen} />}
    <div ref={bottomRef} />
  </div>
));
MessagesArea.displayName = 'MessagesArea';

// ── Footer / input area ───────────────────────────────────────────────────────

interface FooterProps {
  inputValue: string;
  isLoading: boolean;
  isFullScreen: boolean;
  role?: 'patient' | 'doctor';
  inputRef: React.RefObject<HTMLInputElement>;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onSend: () => void;
}

const ChatFooter = React.memo<FooterProps>(({
  inputValue, isLoading, isFullScreen, role = 'patient', inputRef, onChange, onKeyDown, onSend,
}) => (
  <>
    <div className={cn(
      'bg-muted/50 border-t border-border flex-shrink-0',
      isFullScreen ? 'px-6 py-2' : 'px-4 py-2',
    )}>
      <p className="text-xs text-muted-foreground text-center" dir="rtl">
        {role === 'doctor'
          ? '📚 المعلومات مستخرجة من مصادر طبية موثوقة — تحقق دائماً قبل التطبيق.'
          : '⚕️ هذا المساعد لا يُغني عن استشارة الطبيب المختص.'}
      </p>
    </div>

    <div
      className={cn(
        'bg-card border-t border-border flex gap-2 flex-shrink-0',
        isFullScreen ? 'px-6 py-4' : 'px-4 py-3',
      )}
      dir="rtl"
    >
      <Button
        size="icon"
        onClick={onSend}
        disabled={!inputValue.trim() || isLoading}
        className={cn('rounded-full flex-shrink-0', isFullScreen ? 'h-12 w-12' : 'h-10 w-10')}
      >
        <Send className={cn(isFullScreen ? 'h-5 w-5' : 'h-4 w-4', 'scale-x-[-1]')} />
      </Button>

      <Input
        ref={inputRef}
        value={inputValue}
        onChange={onChange}
        onKeyDown={onKeyDown}
        placeholder="اكتب سؤالك هنا..."
        disabled={isLoading}
        dir="rtl"
        autoComplete="off"
        className={cn(
          'flex-1 rounded-full bg-background border-border text-right',
          isFullScreen ? 'text-base h-12' : 'text-sm',
        )}
      />
    </div>
  </>
));
ChatFooter.displayName = 'ChatFooter';

// ── Main component ────────────────────────────────────────────────────────────

const AIChatbot: React.FC<AIChatbotProps> = ({ role = 'patient' }) => {
  const welcomeMessage = role === 'doctor' ? DOCTOR_WELCOME : PATIENT_WELCOME;

  const [isOpen,       setIsOpen]       = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [messages,     setMessages]     = useState<Message[]>([welcomeMessage]);
  const [inputValue,   setInputValue]   = useState('');
  const [isLoading,    setIsLoading]    = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef       = useRef<HTMLInputElement>(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Re-focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // ── Stable callbacks (won't recreate on every render) ──────────────────────

  const handleSend = useCallback(async () => {
    const question = inputValue.trim();
    if (!question || isLoading) return;

    setMessages(prev => [
      ...prev,
      { id: `u-${Date.now()}`, role: 'user', content: question },
    ]);
    setInputValue('');
    setIsLoading(true);

    try {
      const res: ChatbotResponse = await chatbotService.ask(question);
      setMessages(prev => [
        ...prev,
        { id: `a-${Date.now()}`, role: 'ai', content: res.answer },
      ]);
    } catch (err) {
      const content =
        err instanceof ChatbotError
          ? err.message
          : 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.';
      setMessages(prev => [
        ...prev,
        { id: `e-${Date.now()}`, role: 'error', content },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, isLoading]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value),
    [],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        // Call send directly — avoids stale-closure risk of referencing handleSend
        const question = (e.target as HTMLInputElement).value.trim();
        if (!question || isLoading) return;

        setMessages(prev => [
          ...prev,
          { id: `u-${Date.now()}`, role: 'user', content: question },
        ]);
        setInputValue('');
        setIsLoading(true);

        chatbotService
          .ask(question)
          .then(res => {
            setMessages(prev => [
              ...prev,
              { id: `a-${Date.now()}`, role: 'ai', content: res.answer },
            ]);
          })
          .catch(err => {
            const content =
              err instanceof ChatbotError
                ? err.message
                : 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.';
            setMessages(prev => [
              ...prev,
              { id: `e-${Date.now()}`, role: 'error', content },
            ]);
          })
          .finally(() => setIsLoading(false));
      }
    },
    [isLoading],
  );

  const handleClose           = useCallback(() => { setIsOpen(false); setIsFullScreen(false); }, []);
  const handleToggleFullScreen = useCallback(() => setIsFullScreen(v => !v), []);
  const handleOpen             = useCallback(() => setIsOpen(true), []);

  // ── Render ────────────────────────────────────────────────────────────────

  const panel = (
    <>
      <ChatHeader
        isFullScreen={isFullScreen}
        role={role}
        onClose={handleClose}
        onToggleFullScreen={handleToggleFullScreen}
      />
      <MessagesArea
        messages={messages}
        isLoading={isLoading}
        isFullScreen={isFullScreen}
        bottomRef={messagesEndRef}
      />
      <ChatFooter
        inputValue={inputValue}
        isLoading={isLoading}
        isFullScreen={isFullScreen}
        role={role}
        inputRef={inputRef}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onSend={handleSend}
      />
    </>
  );

  return (
    <>
      {/* Launch button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-in">
          <button
            onClick={handleOpen}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            dir="rtl"
          >
            <MessageCircle className="h-5 w-5" />
            <span className="text-sm font-medium">HakimAI</span>
          </button>
        </div>
      )}

      {/* Full-screen overlay */}
      {isOpen && isFullScreen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-fade-in">
          <div
            className="flex flex-col w-full max-w-4xl mx-4 rounded-2xl shadow-2xl border border-border bg-card overflow-hidden animate-scale-in"
            style={{ height: 'min(85vh, 800px)' }}
          >
            {panel}
          </div>
        </div>
      )}

      {/* Floating panel */}
      {isOpen && !isFullScreen && (
        <div
          className="fixed bottom-6 right-6 z-50 w-[370px] max-w-[calc(100vw-2rem)] flex flex-col rounded-2xl shadow-2xl border border-border bg-card overflow-hidden animate-fade-in"
          style={{ height: '560px' }}
        >
          {panel}
        </div>
      )}
    </>
  );
};

export default AIChatbot;
