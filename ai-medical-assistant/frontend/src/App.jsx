/**
 * VitCare AI — Monolithic React App
 * Pixel-perfect mirror of templates/index.html + static/css/style.css + static/js/main.js
 *
 * Sections:
 *   1. Imports
 *   2. Utility helpers (formatTimeAgo, downloadChat)
 *   3. Sidebar component
 *   4. ChatArea component
 *   5. InputArea component
 *   6. App root (all state + API logic)
 */

// ══════════════════════════════════════════════════════════════
// SECTION 1 — IMPORTS
// ══════════════════════════════════════════════════════════════
import { useState, useEffect, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import './index.css';

// ══════════════════════════════════════════════════════════════
// SECTION 2 — UTILITY HELPERS
// ══════════════════════════════════════════════════════════════
function formatTimeAgo(timestamp) {
  const now = new Date();
  const past = new Date(timestamp);
  const diffMs = now - past;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return past.toLocaleDateString();
}

function buildDownloadText(chatHistory) {
  let content = 'VitCare AI Chat Export\n';
  content += '='.repeat(50) + '\n\n';
  chatHistory.forEach((msg) => {
    content += `[${msg.timestamp}] ${msg.type === 'user' ? 'You' : 'VitCare AI'}:\n`;
    content += msg.content + '\n';
    if (msg.source) content += `Source: ${msg.source}\n`;
    content += '\n';
  });
  return content;
}

// ══════════════════════════════════════════════════════════════
// SECTION 3 — SIDEBAR COMPONENT
// ══════════════════════════════════════════════════════════════
function Sidebar({ sidebarOpen, sessions, currentSessionId, onNewChat, onLoadSession, onDeleteSession, onToggleTheme, theme }) {
  return (
    <aside className={`sidebar glass-effect${sidebarOpen ? '' : ' collapsed'}`}>
      <div className="sidebar-content">

        {/* Logo + New Chat */}
        <div className="sidebar-header">
          <div className="logo-wrapper">
            <div className="logo-animated">
              <div className="logo-pulse" />
              <i className="fas fa-heartbeat" />
            </div>
            <div className="logo-text">
              <h1>VitCare AI</h1>
              <span className="version">AI Assistant v3.0</span>
            </div>
          </div>
          <button className="new-chat-btn" onClick={onNewChat}>
            <i className="fas fa-plus" />
            <span>New Chat</span>
          </button>
        </div>

        {/* Chat History */}
        <div className="chat-history-section">
          <div className="section-header">
            <span>Chat History</span>
            <div className="section-line" />
          </div>
          <div className="chat-list">
            {sessions === null ? (
              <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-tertiary)', fontSize: '13px' }}>
                <div className="loading-spinner" style={{ margin: '0 auto 10px' }} />
                Loading chats...
              </div>
            ) : sessions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-tertiary)', fontSize: '13px' }}>
                No chat history yet
              </div>
            ) : (
              sessions.map((session) => (
                <div
                  key={session.session_id}
                  className={`chat-item${currentSessionId === session.session_id ? ' active' : ''}`}
                  onClick={() => onLoadSession(session.session_id)}
                >
                  <i className="fas fa-message" />
                  <div className="chat-item-content">
                    <div className="chat-item-title">{session.preview || 'New conversation'}</div>
                    <div className="chat-item-time">{formatTimeAgo(session.last_active)}</div>
                  </div>
                  <button
                    className="chat-item-delete"
                    onClick={(e) => { e.stopPropagation(); onDeleteSession(session.session_id); }}
                  >
                    <i className="fas fa-trash" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="sidebar-footer">
          <button className="emergency-btn" style={{ width: '100%', padding: '12px', background: 'rgba(239, 68, 68, 0.05)', color: 'var(--danger)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', marginBottom: '15px', fontWeight: 600, transition: 'all 0.2s ease' }} onClick={() => window.open('tel:102', '_self')} onMouseOver={(e) => {e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; e.currentTarget.style.transform = 'translateY(-2px)'}} onMouseOut={(e) => {e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)'; e.currentTarget.style.transform = 'none'}}>
            <i className="fas fa-ambulance" />
            Call Ambulance
          </button>
          <button className="theme-btn glass-effect" onClick={onToggleTheme}>
            <i className={`fas ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`} />
          </button>
        </div>

      </div>
    </aside>
  );
}

// ══════════════════════════════════════════════════════════════
// SECTION 4 — CHAT AREA COMPONENT
// ══════════════════════════════════════════════════════════════
const QUICK_QUESTIONS = [
  { icon: 'fa-thermometer', label: 'Fever Symptoms', q: 'What are the symptoms of fever?' },
  { icon: 'fa-head-side-virus', label: 'Headache Treatment', q: 'How to treat a headache?' },
  { icon: 'fa-heart-pulse', label: 'High Blood Pressure', q: 'What causes high blood pressure?' },
  { icon: 'fa-notes-medical', label: 'Diabetes Management', q: 'Tell me about diabetes management' },
  { icon: 'fa-virus-covid', label: 'COVID Prevention', q: 'COVID-19 prevention tips' },
  { icon: 'fa-pills', label: 'Cold Remedies', q: 'Common cold remedies' },
];

function ChatArea({ messages, isTyping, showWelcome, onQuickQuestion, chatAreaRef, onSend }) {
  return (
    <div className="chat-area" ref={chatAreaRef}>

      {/* Welcome Screen */}
      <div className={`welcome-screen${showWelcome ? '' : ' hidden'}`}>
        <div className="welcome-content">
          <h1 className="welcome-title">Welcome to VitCare AI</h1>
          <p className="welcome-subtitle">Your AI-powered medical assistant is ready to help</p>

          <div className="quick-actions">
            <h3>Quick Questions:</h3>
            <div className="quick-buttons">
              {QUICK_QUESTIONS.map(({ icon, label, q }) => (
                <button key={q} className="quick-btn glass-effect" onClick={() => onQuickQuestion(q)}>
                  <i className={`fas ${icon}`} />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="messages-container">
        {messages.map((msg, idx) => (
          <MessageBubble key={idx} msg={msg} onSend={onSend} />
        ))}
      </div>

      {/* Typing Indicator */}
      <div className={`typing-indicator${isTyping ? ' active' : ''}`}>
        <div className="typing-bubble glass-effect">
          <div className="typing-content">
            <span className="typing-text">VitCare AI is thinking</span>
            <div className="typing-dots">
              <span className="dot" />
              <span className="dot" />
              <span className="dot" />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

function MessageBubble({ msg, onSend }) {
  const copyText = useCallback(() => {
    navigator.clipboard.writeText(msg.content).catch(() => { });
  }, [msg.content]);

  if (msg.type === 'user') {
    return (
      <div className="message user-message">
        <div className="message-wrapper">
          <div className="message-avatar"><i className="fas fa-user" /></div>
          <div className="message-content">
            <div className="message-text">
              {msg.content}
              <span className="message-time">{msg.timestamp}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="message bot-message">
      <div className="message-wrapper">
        <div className="message-avatar"><i className="fas fa-robot" /></div>
        <div className="message-content">
          <div className="message-text">
            <ReactMarkdown>{msg.content}</ReactMarkdown>
          </div>

          {/* Doctor Cards */}
          {msg.doctors && msg.doctors.length > 0 && (
            <div className="doctor-cards-grid">
              {msg.doctors.map((doc, i) => (
                <div key={doc.id || i} className="doctor-card" onClick={() => onSend && onSend(String(i + 1))}>
                  <div className="doctor-card-avatar">
                    {doc.image ? <img src={doc.image} alt={doc.name} /> : <i className="fas fa-user-md" />}
                  </div>
                  <div className="doctor-card-info">
                    <h4>{doc.name}</h4>
                    <span className="doctor-card-degree">{doc.degree}</span>
                    <span className="doctor-card-exp">{doc.experience} exp.</span>
                  </div>
                  <div className="doctor-card-fee">₹{doc.fees}</div>
                </div>
              ))}
            </div>
          )}

          {/* Slot Chips */}
          {msg.slots && msg.slots.length > 0 && (
            <div className="slot-chips-container">
              {(() => {
                let idx = 1;
                return msg.slots.slice(0, 3).map((day) => (
                  <div key={day.date} className="slot-day-group">
                    <div className="slot-day-label">📅 {day.date_display}</div>
                    <div className="slot-chips">
                      {day.times.slice(0, 6).map((t) => {
                        const slotNum = idx++;
                        return (
                          <button key={t} className="slot-chip" onClick={() => onSend && onSend(String(slotNum))}>
                            {t.toLowerCase()}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ));
              })()}
            </div>
          )}

          <span className="message-time">{msg.timestamp}</span>
          <div className="message-footer">
            {msg.source && (
              <span className="message-source">
                <i className="fas fa-database" />
                {msg.source}
              </span>
            )}
            <div className="message-actions">
              <button className="message-action" title="Copy" onClick={copyText}>
                <i className="fas fa-copy" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// SECTION 5 — INPUT AREA COMPONENT
// ══════════════════════════════════════════════════════════════
function InputArea({ inputValue, setInputValue, onSend, isTyping, inputRef }) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const handleInput = (e) => {
    setInputValue(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  };

  return (
    <div className="input-area">
      <div className="input-wrapper">
        <div className="input-container glass-effect">
          <button className="input-btn" title="Attach file">
            <i className="fas fa-paperclip" />
          </button>
          <textarea
            ref={inputRef}
            className="message-input"
            placeholder="Ask your medical question..."
            rows={1}
            value={inputValue}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
          />
          <button className="input-btn" title="Voice input">
            <i className="fas fa-microphone" />
          </button>
          <button
            className="send-btn"
            title="Send message"
            aria-label="Send message"
            onClick={onSend}
            disabled={!inputValue.trim() || isTyping}
          >
            <i className="fas fa-paper-plane" />
          </button>
        </div>
        <div className="input-info">
          <i className="fas fa-info-circle" />
          <span>AI can make mistakes. Always consult healthcare professionals for medical advice.</span>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// SECTION 6 — APP ROOT  (all state + API logic)
// ══════════════════════════════════════════════════════════════
const API_BASE = '/api/v1';

// ── Mobile detection hook ──────────────────────────────────────
function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= breakpoint);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= breakpoint);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, [breakpoint]);
  return isMobile;
}

export default function App() {
  // ── State ──────────────────────────────────────────────────
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const isMobile = useIsMobile();
  // On mobile default to closed; on desktop restore from localStorage
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (window.innerWidth <= 768) return false;
    return localStorage.getItem('sidebarOpen') !== 'false';
  });
  const [sessions, setSessions] = useState(null);           // null = loading
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);       // for download
  const [showWelcome, setShowWelcome] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const chatAreaRef = useRef(null);
  const inputRef = useRef(null);
  const toastTimerRef = useRef(null);

  // ── Theme ──────────────────────────────────────────────────
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light');

  // ── Sidebar ────────────────────────────────────────────────
  const toggleSidebar = () => {
    setSidebarOpen(prev => {
      if (!isMobile) localStorage.setItem('sidebarOpen', !prev);
      return !prev;
    });
  };

  const closeSidebar = () => setSidebarOpen(false);

  // ── Toast ──────────────────────────────────────────────────
  const showToast = useCallback((message, type = 'success') => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ show: true, message, type });
    toastTimerRef.current = setTimeout(() => setToast(t => ({ ...t, show: false })), 3000);
  }, []);

  // ── Scroll to bottom ───────────────────────────────────────
  const scrollToBottom = useCallback(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTo({ top: chatAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0 || isTyping) {
      scrollToBottom();
    }
  }, [messages, isTyping, scrollToBottom]);

  // ── Load sessions ──────────────────────────────────────────
  const loadSessions = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/sessions`);
      const data = await res.json();
      if (data.success && data.sessions) setSessions(data.sessions);
    } catch {
      setSessions([]);
    }
  }, []);

  // ── Load current history on mount ──────────────────────────
  useEffect(() => {
    loadSessions();
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/history`);
        const data = await res.json();
        if (data.success && data.messages && data.messages.length > 0) {
          const msgs = data.messages.map(m => ({
            type: m.role === 'user' ? 'user' : 'assistant',
            content: m.content,
            timestamp: m.timestamp || '',
            source: m.source || null,
          }));
          setMessages(msgs);
          setChatHistory(msgs.map(m => ({ ...m })));
          setShowWelcome(false);
        }
      } catch { /* silent */ }
    })();
  }, [loadSessions]);

  // ── Load session ───────────────────────────────────────────
  const loadSession = useCallback(async (sessionId) => {
    try {
      const res = await fetch(`${API_BASE}/session/${sessionId}`);
      const data = await res.json();
      if (data.success) {
        setCurrentSessionId(sessionId);
        const msgs = data.messages.map(m => ({
          type: m.role === 'user' ? 'user' : 'assistant',
          content: m.content,
          timestamp: m.timestamp || '',
          source: m.source || null,
        }));
        setMessages(msgs);
        setChatHistory(msgs.map(m => ({ ...m })));
        setShowWelcome(false);
        showToast('Chat loaded successfully', 'success');
      }
    } catch {
      showToast('Failed to load chat', 'error');
    }
  }, [showToast]);

  // ── Delete session ─────────────────────────────────────────
  const deleteSession = useCallback(async (sessionId) => {
    if (!window.confirm('Are you sure you want to delete this chat?')) return;
    try {
      const res = await fetch(`${API_BASE}/session/${sessionId}`, { method: 'DELETE' });
      if (res.ok) {
        await loadSessions();
        if (currentSessionId === sessionId) createNewChat();
        showToast('Chat deleted successfully', 'success');
      }
    } catch {
      showToast('Failed to delete chat', 'error');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSessionId, loadSessions, showToast]);

  // ── New chat ───────────────────────────────────────────────
  const createNewChat = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/new-chat`, { method: 'POST' });
      if (res.ok) {
        setMessages([]);
        setChatHistory([]);
        setCurrentSessionId(null);
        setShowWelcome(true);
        await loadSessions();
        showToast('New chat created', 'success');
      }
    } catch {
      showToast('Failed to create new chat', 'error');
    }
  }, [loadSessions, showToast]);

  // ── Clear chat ─────────────────────────────────────────────
  const clearChat = useCallback(async () => {
    if (!window.confirm('Are you sure you want to clear this conversation?')) return;
    try {
      const res = await fetch(`${API_BASE}/clear`, { method: 'POST' });
      if (res.ok) {
        setMessages([]);
        setChatHistory([]);
        setShowWelcome(true);
        showToast('Conversation cleared', 'success');
      }
    } catch {
      showToast('Failed to clear conversation', 'error');
    }
  }, [showToast]);

  // ── Download chat ──────────────────────────────────────────
  const downloadChat = useCallback(() => {
    if (chatHistory.length === 0) { showToast('No messages to download', 'error'); return; }
    const content = buildDownloadText(chatHistory);
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vitcare-ai-chat-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Chat downloaded successfully', 'success');
  }, [chatHistory, showToast]);

  // ── Send message ───────────────────────────────────────────
  const sendMessage = useCallback(async (overrideText) => {
    const message = (overrideText ?? inputValue).trim();
    if (!message || isTyping) return;

    setShowWelcome(false);
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = { type: 'user', content: message, timestamp: time, source: null };
    setMessages(prev => [...prev, userMsg]);
    setChatHistory(prev => [...prev, userMsg]);
    setInputValue('');
    if (inputRef.current) { inputRef.current.style.height = 'auto'; }
    setIsTyping(true);

    try {
      // Get hospital auth token from URL params or localStorage
      const urlParams = new URLSearchParams(window.location.search);
      const userToken = urlParams.get('token') || localStorage.getItem('token') || null;

      const res = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, user_token: userToken }),
      });
      const data = await res.json();

      if (data.success) {
        const botMsg = {
          type: 'assistant',
          content: data.response,
          timestamp: data.timestamp || time,
          source: data.source || null,
          doctors: data.doctors || null,
          slots: data.slots || null,
        };
        setMessages(prev => [...prev, botMsg]);
        setChatHistory(prev => [...prev, botMsg]);
        showToast('Response received', 'success');
        await loadSessions();
      } else {
        const errMsg = { type: 'assistant', content: 'Sorry, I encountered an error. Please try again.', timestamp: time, source: null };
        setMessages(prev => [...prev, errMsg]);
        showToast('Error occurred', 'error');
      }
    } catch {
      const errMsg = { type: 'assistant', content: 'Connection error. Please check your internet and try again.', timestamp: time, source: null };
      setMessages(prev => [...prev, errMsg]);
      showToast('Connection error', 'error');
    } finally {
      setIsTyping(false);
    }
  }, [inputValue, isTyping, loadSessions, showToast]);

  // Quick question handler
  const handleQuickQuestion = useCallback((q) => {
    setTimeout(() => sendMessage(q), 200);
  }, [sendMessage]);

  // ── Toast colors ───────────────────────────────────────────
  const toastColors = {
    success: 'linear-gradient(135deg, #10b981, #059669)',
    error: 'linear-gradient(135deg, #ef4444, #dc2626)',
    info: 'linear-gradient(135deg, #3b82f6, #2563eb)',
  };
  const toastIcons = {
    success: 'fa-check-circle',
    error: 'fa-exclamation-circle',
    info: 'fa-info-circle',
  };

  // ── Render ─────────────────────────────────────────────────
  return (
    <>

      <div className="app-container">

        {/* Sidebar Toggle */}
        <button className="sidebar-toggle-btn" onClick={toggleSidebar}>
          <i className="fas fa-bars" />
        </button>

        {/* Mobile backdrop — closes sidebar on click */}
        {isMobile && sidebarOpen && (
          <div className="sidebar-backdrop" onClick={closeSidebar} />
        )}

        {/* Sidebar */}
        <Sidebar
          sidebarOpen={sidebarOpen}
          sessions={sessions}
          currentSessionId={currentSessionId}
          onNewChat={createNewChat}
          onLoadSession={loadSession}
          onDeleteSession={deleteSession}
          onToggleTheme={toggleTheme}
          theme={theme}
        />

        {/* Main Content */}
        <main className={`main-content${sidebarOpen ? ' sidebar-open' : ''}`}>

          {/* Header */}
          <header className="app-header glass-header" style={{ justifyContent: 'center', borderBottom: '1px solid var(--border-color)', height: '60px', padding: '0 20px', background: 'var(--bg-primary)' }}>
            <h2 className="gradient-text" style={{ fontSize: '18px', margin: 0, letterSpacing: '0.02em' }}>VitCare AI Consult</h2>
          </header>

          {/* Chat Area */}
          <ChatArea
            messages={messages}
            isTyping={isTyping}
            showWelcome={showWelcome}
            onQuickQuestion={handleQuickQuestion}
            chatAreaRef={chatAreaRef}
            onSend={(text) => sendMessage(text)}
          />

          {/* Input Area */}
          <InputArea
            inputValue={inputValue}
            setInputValue={setInputValue}
            onSend={() => sendMessage()}
            isTyping={isTyping}
            inputRef={inputRef}
          />

        </main>
      </div>

      {/* Toast Notification */}
      <div
        className={`toast${toast.show ? ' show' : ''}`}
        style={{ background: toastColors[toast.type] }}
      >
        <i className={`fas ${toastIcons[toast.type]}`} />
        <span>{toast.message}</span>
      </div>
    </>
  );
}
