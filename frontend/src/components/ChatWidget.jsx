/**
 * VitCare AI — Floating Chat Widget
 * Self-contained component with internal sliding mini-sidebar for history.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import './ChatWidget.css';

// ── Helpers ──────────────────────────────────────────────────────
const formatTimeAgo = (isoString) => {
  const date = new Date(isoString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return `Just now`;
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return `Yesterday`;
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return date.toLocaleDateString();
};

// ── Quick Questions ──────────────────────────────────────────────
const QUICK_QUESTIONS = [
  { icon: 'fa-thermometer-half', label: 'Fever Symptoms', q: 'What are the symptoms of fever?' },
  { icon: 'fa-head-side-virus', label: 'Headache Help', q: 'How to treat a severe headache?' },
  { icon: 'fa-heartbeat', label: 'Blood Pressure', q: 'What causes high blood pressure?' },
  { icon: 'fa-notes-medical', label: 'Diabetes Tips', q: 'Tell me about diabetes management' },
];

// ── Message Bubble ───────────────────────────────────────────────
function MessageBubble({ msg, onSend }) {
  const copyText = () => navigator.clipboard.writeText(msg.content).catch(() => {});

  if (msg.type === 'user') {
    return (
      <div className="vc-msg vc-user">
        <div className="vc-msg-row">
          <div className="vc-msg-avatar"><i className="fas fa-user" /></div>
          <div className="vc-msg-body">
            <div className="vc-msg-bubble">{msg.content}</div>
            <span className="vc-msg-time">{msg.timestamp}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="vc-msg vc-bot">
      <div className="vc-msg-row">
        <div className="vc-msg-avatar"><i className="fas fa-robot" /></div>
        <div className="vc-msg-body">
          <div className="vc-msg-bubble">
            <ReactMarkdown>{msg.content}</ReactMarkdown>
          </div>

          {/* Doctor Cards */}
          {msg.doctors && msg.doctors.length > 0 && (
            <div className="vc-doctor-grid">
              {msg.doctors.map((doc, i) => (
                <div key={doc.id || i} className="vc-doctor-card" onClick={() => onSend?.(String(i + 1))}>
                  <div className="vc-doctor-avatar">
                    {doc.image ? <img src={doc.image} alt={doc.name} /> : <i className="fas fa-user-md" />}
                  </div>
                  <div className="vc-doctor-info">
                    <h4>{doc.name}</h4>
                    <span>{doc.degree} • {doc.experience} exp.</span>
                  </div>
                  <div className="vc-doctor-fee">₹{doc.fees}</div>
                </div>
              ))}
            </div>
          )}

          {/* Slot Chips */}
          {msg.slots && msg.slots.length > 0 && (
            <div className="vc-slots">
              {(() => {
                let idx = 1;
                return msg.slots.slice(0, 3).map((day) => (
                  <div key={day.date} className="vc-slot-day">
                    <div className="vc-slot-label">📅 {day.date_display}</div>
                    <div className="vc-slot-row">
                      {day.times.slice(0, 6).map((t) => {
                        const slotNum = idx++;
                        return (
                          <button key={t} className="vc-slot-chip" onClick={() => onSend?.(String(slotNum))}>
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

          <span className="vc-msg-time">{msg.timestamp}</span>
          <div className="vc-msg-footer">
            {msg.source && (
              <span className="vc-msg-source">
                <i className="fas fa-database" />
                {msg.source}
              </span>
            )}
            <button className="vc-msg-copy" title="Copy" onClick={copyText}>
              <i className="fas fa-copy" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Widget Component ────────────────────────────────────────
export default function ChatWidget({ userToken, aiBackendUrl = 'http://localhost:8000/api/v1' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const [messages, setMessages] = useState([]);
  const [sessions, setSessions] = useState([]);
  
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);

  const messagesRef = useRef(null);
  const inputRef = useRef(null);
  const sessionIdRef = useRef(Math.random().toString(36).substring(2) + Date.now().toString(36));
  
  // Persistent client ID across reloads and chat sessions
  const clientIdRef = useRef(
    localStorage.getItem('vc_client_id') || 
    (() => {
      const newId = Math.random().toString(36).substring(2) + Date.now().toString(36);
      localStorage.setItem('vc_client_id', newId);
      return newId;
    })()
  );

  // ── Scroll to bottom ─────────────────────────────────────────
  const scrollToBottom = useCallback(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTo({ top: messagesRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    if ((messages.length > 0 || isTyping) && isOpen) {
      scrollToBottom();
    }
  }, [messages, isTyping, isOpen, scrollToBottom]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen && inputRef.current && !sidebarOpen) {
      setTimeout(() => inputRef.current?.focus(), 350);
    }
  }, [isOpen, sidebarOpen]);

  // ── Session Management (Mini Sidebar) ────────────────────────
  const loadSessions = useCallback(async () => {
    try {
      const res = await fetch(`${aiBackendUrl}/sessions`, {
        headers: { 
          'X-Session-ID': sessionIdRef.current,
          'X-Client-ID': clientIdRef.current
        }
      });
      const data = await res.json();
      if (data.success && data.sessions) {
        setSessions(data.sessions);
      }
    } catch { /* silent */ }
  }, [aiBackendUrl]);

  // Load sessions when widget is opened for the first time
  useEffect(() => {
    if (isOpen) {
      loadSessions();
    }
  }, [isOpen, loadSessions]);

  const loadSession = async (id) => {
    try {
      const res = await fetch(`${aiBackendUrl}/session/${id}`, {
        headers: { 
          'X-Session-ID': sessionIdRef.current,
          'X-Client-ID': clientIdRef.current
        }
      });
      const data = await res.json();
      if (data.success) {
        sessionIdRef.current = id;
        const loadedMsgs = data.messages.map(m => ({
          type: m.role === 'user' ? 'user' : 'assistant',
          content: m.content,
          timestamp: m.timestamp || '',
          source: m.source || null,
        }));
        setMessages(loadedMsgs);
        setShowWelcome(false);
        setSidebarOpen(false);
      }
    } catch { /* silent */ }
  };

  const deleteSession = async (e, id) => {
    e.stopPropagation();
    try {
      const res = await fetch(`${aiBackendUrl}/session/${id}`, {
        method: 'DELETE',
        headers: { 
          'X-Session-ID': sessionIdRef.current,
          'X-Client-ID': clientIdRef.current
        }
      });
      if (res.ok) {
        if (sessionIdRef.current === id) {
          setMessages([]);
          setShowWelcome(true);
          sessionIdRef.current = Math.random().toString(36).substring(2) + Date.now().toString(36);
        }
        await loadSessions();
      }
    } catch { /* silent */ }
  };

  // ── Send message ──────────────────────────────────────────────
  const sendMessage = useCallback(async (overrideText) => {
    const message = (overrideText ?? inputValue).trim();
    if (!message || isTyping) return;

    setShowWelcome(false);
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = { type: 'user', content: message, timestamp: time };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    if (inputRef.current) inputRef.current.style.height = 'auto';
    setIsTyping(true);

    try {
      const res = await fetch(`${aiBackendUrl}/chat`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Session-ID': sessionIdRef.current,
          'X-Client-ID': clientIdRef.current
        },
        body: JSON.stringify({ message, user_token: userToken || null }),
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
        loadSessions(); // refresh history list
      } else {
        setMessages(prev => [...prev, {
          type: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
          timestamp: time,
        }]);
      }
    } catch {
      setMessages(prev => [...prev, {
        type: 'assistant',
        content: 'Connection error. Please check if the AI service is running.',
        timestamp: time,
      }]);
    } finally {
      setIsTyping(false);
    }
  }, [inputValue, isTyping, userToken, aiBackendUrl, loadSessions]);

  // ── Clear / New Chat ──────────────────────────────────────────
  const newChat = useCallback(async () => {
    try {
      await fetch(`${aiBackendUrl}/new-chat`, { 
        method: 'POST',
        headers: { 
          'X-Session-ID': sessionIdRef.current,
          'X-Client-ID': clientIdRef.current
        }
      });
    } catch { /* silent */ }
    setMessages([]);
    setShowWelcome(true);
    // Generate new local session ID
    sessionIdRef.current = Math.random().toString(36).substring(2) + Date.now().toString(36);
    loadSessions();
    setSidebarOpen(false);
  }, [aiBackendUrl, loadSessions]);

  // ── Input handlers ────────────────────────────────────────────
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleInput = (e) => {
    setInputValue(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 80) + 'px';
  };

  // ── Render ────────────────────────────────────────────────────
  return (
    <div className="vc-widget">

      {/* Floating Toggle Button */}
      <div className="vc-toggle-container">
        {!isOpen && (
          <div className="vc-toggle-tooltip">
            Ask VitCare AI
          </div>
        )}
        <button
          className={`vc-toggle-btn${isOpen ? ' vc-open' : ''}`}
          onClick={() => setIsOpen(o => !o)}
          aria-label="Toggle VitCare AI Assistant"
        >
          <i className={`fas ${isOpen ? 'fa-times' : 'fa-stethoscope'}`} />
        </button>
      </div>

      {/* Chat Panel */}
      <div className={`vc-panel${isOpen ? ' vc-visible' : ''}`}>

        {/* Header */}
        <div className="vc-header">
          <div className="vc-header-left">
            <button className="vc-header-btn" title="Menu" onClick={() => setSidebarOpen(true)}>
              <i className="fas fa-bars" />
            </button>
            <div className="vc-header-info" style={{ marginLeft: '4px' }}>
              <h3>VitCare AI</h3>
              <div className="vc-header-status">
                <span className="vc-status-dot" />
                <span>Online • AI Assistant</span>
              </div>
            </div>
          </div>
          <div className="vc-header-actions">
            <button className="vc-header-btn" title="New Chat" onClick={newChat}>
              <i className="fas fa-plus" />
            </button>
            <button className="vc-header-btn" title="Close" onClick={() => setIsOpen(false)}>
              <i className="fas fa-chevron-down" />
            </button>
          </div>
        </div>

        {/* Content Wrapper for Sidebar Overlay */}
        <div className="vc-content-wrapper">
          
          {/* Mini Sidebar Backdrop */}
          <div 
            className={`vc-sidebar-backdrop ${sidebarOpen ? 'vc-open' : ''}`} 
            onClick={() => setSidebarOpen(false)}
          />

          {/* Mini Sidebar Overlay */}
          <div className={`vc-sidebar-overlay ${sidebarOpen ? 'vc-open' : ''}`}>
            <div className="vc-sidebar-header">
              <h4>Chat History</h4>
              <button className="vc-sidebar-close" onClick={() => setSidebarOpen(false)}>
                <i className="fas fa-times" />
              </button>
            </div>
            
            <div className="vc-sidebar-content">
              {sessions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--vc-text-tertiary)', fontSize: '12px' }}>
                  No previous conversations
                </div>
              ) : (
                <div className="vc-session-list">
                  {sessions.map((session) => (
                    <div 
                      key={session.session_id} 
                      className={`vc-session-item ${session.session_id === sessionIdRef.current ? 'vc-active' : ''}`}
                      onClick={() => loadSession(session.session_id)}
                    >
                      <i className="fas fa-message" />
                      <div className="vc-session-info">
                        <div className="vc-session-title">{session.preview || 'New conversation'}</div>
                        <div className="vc-session-time">{formatTimeAgo(session.last_active)}</div>
                      </div>
                      <button 
                        className="vc-session-delete" 
                        title="Delete Chat"
                        onClick={(e) => deleteSession(e, session.session_id)}
                      >
                        <i className="fas fa-trash" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="vc-sidebar-footer">
              <button 
                className="vc-btn-emergency" 
                onClick={() => window.open('tel:102', '_self')}
              >
                <i className="fas fa-ambulance" />
                Call Ambulance
              </button>
            </div>
          </div>

          {/* Main Messages Area */}
          <div className="vc-messages-wrapper">
            <div className="vc-messages" ref={messagesRef}>
              
              {/* Welcome */}
              {showWelcome && messages.length === 0 && (
                <div className="vc-welcome">
                  <div className="vc-welcome-icon">
                    <i className="fas fa-stethoscope" />
                  </div>
                  <h2>Hi there! 👋</h2>
                  <p>I'm your AI medical assistant. Describe your symptoms and I'll help diagnose and book a doctor.</p>
                  <div className="vc-quick-btns">
                    {QUICK_QUESTIONS.map(({ icon, label, q }) => (
                      <button key={q} className="vc-quick-btn" onClick={() => sendMessage(q)}>
                        <i className={`fas ${icon}`} />
                        <span>{label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Message List */}
              {messages.map((msg, idx) => (
                <MessageBubble key={idx} msg={msg} onSend={sendMessage} />
              ))}

              {/* Typing Indicator */}
              <div className={`vc-typing${isTyping ? ' vc-active' : ''}`}>
                <div className="vc-typing-bubble">
                  <span>Thinking</span>
                  <div className="vc-typing-dots">
                    <span /><span /><span />
                  </div>
                </div>
              </div>

            </div>

            {/* Login Prompt */}
            {!userToken && messages.length > 0 && (
              <div className="vc-login-prompt">
                <p>Log in to book appointments directly</p>
                <a href="/login" className="vc-login-link">
                  <i className="fas fa-sign-in-alt" />
                  Log In
                </a>
              </div>
            )}

            {/* Input Area */}
            <div className="vc-input-area">
              <div className="vc-input-row">
                <textarea
                  ref={inputRef}
                  className="vc-input-field"
                  placeholder="Describe your symptoms..."
                  rows={1}
                  value={inputValue}
                  onChange={handleInput}
                  onKeyDown={handleKeyDown}
                  disabled={sidebarOpen}
                />
                <button
                  className="vc-send-btn"
                  onClick={() => sendMessage()}
                  disabled={!inputValue.trim() || isTyping || sidebarOpen}
                  aria-label="Send message"
                >
                  <i className="fas fa-paper-plane" />
                </button>
              </div>
              <div className="vc-disclaimer">
                AI can make mistakes. Always consult healthcare professionals.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
