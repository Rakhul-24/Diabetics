import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  User
} from 'lucide-react';
import { useHealth } from '../context/HealthContext';

export const AiCoachView = () => {
  const { user, latestGlucose, formatGlucose, getGlucoseUnit, aiChatMessages, sendAiMessage, isAiTyping } = useHealth();
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [aiChatMessages, isAiTyping]);

  const handleSend = (e) => {
    e?.preventDefault();
    if (!inputText.trim() || isAiTyping) return;
    sendAiMessage(inputText.trim());
    setInputText('');
  };

  const promptChips = [
    '📊 Analyze my sugar',
    '🥗 Low-GI dinner',
    '🚶 Post-meal workout',
    '⚠️ Hypo Rule of 15',
    '💧 Hydration benefits'
  ];

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - var(--header-height) - var(--bottom-nav-height) - 16px)', minHeight: 460, paddingBottom: 6 }}>
      {/* Top AI Coach Info Card */}
      <div
        className="app-card"
        style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(14, 165, 233, 0.1) 100%)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          padding: '10px 14px',
          marginBottom: 8,
          flexShrink: 0
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: 'var(--radius-xs)',
                background: 'var(--primary-gradient)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Bot size={17} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.88rem' }}>AI Diabetes Coach</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                {user.name} • {user.diabetesType}
              </div>
            </div>
          </div>

          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--primary)', background: 'var(--primary-light)', padding: '2px 7px', borderRadius: 'var(--radius-full)' }}>
            {formatGlucose(latestGlucose.readingMg)} {getGlucoseUnit()}
          </div>
        </div>
      </div>

      {/* Chat Messages Scroll Area */}
      <div
        className="no-scrollbar"
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '6px 2px',
          display: 'flex',
          flexDirection: 'column',
          gap: 10
        }}
      >
        {aiChatMessages.map(msg => {
          const isAi = msg.sender === 'ai';
          return (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                gap: 8,
                alignItems: 'flex-start',
                alignSelf: isAi ? 'flex-start' : 'flex-end',
                maxWidth: '88%'
              }}
            >
              {isAi && (
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: '50%',
                    background: 'var(--primary-gradient)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: 2
                  }}
                >
                  <Bot size={14} />
                </div>
              )}

              <div
                style={{
                  background: isAi ? 'var(--bg-card)' : 'var(--primary)',
                  color: isAi ? 'var(--text-primary)' : '#ffffff',
                  padding: '10px 14px',
                  borderRadius: isAi ? '4px 14px 14px 14px' : '14px 4px 14px 14px',
                  border: isAi ? '1px solid var(--border-light)' : 'none',
                  boxShadow: 'var(--shadow-xs)',
                  fontSize: '0.84rem',
                  lineHeight: 1.45,
                  whiteSpace: 'pre-line'
                }}
              >
                {msg.text}
                <div
                  style={{
                    fontSize: '0.65rem',
                    color: isAi ? 'var(--text-muted)' : 'rgba(255,255,255,0.7)',
                    marginTop: 3,
                    textAlign: 'right'
                  }}
                >
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              {!isAi && (
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: '50%',
                    background: 'var(--bg-card-subtle)',
                    color: 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    border: '1px solid var(--border-light)',
                    marginTop: 2
                  }}
                >
                  <User size={14} />
                </div>
              )}
            </div>
          );
        })}
        {/* Live Typing Indicator */}
        {isAiTyping && (
          <div
            style={{
              display: 'flex',
              gap: 8,
              alignItems: 'flex-start',
              alignSelf: 'flex-start',
              maxWidth: '88%',
              animation: 'fadeIn 0.2s ease-out'
            }}
          >
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: '50%',
                background: 'var(--primary-gradient)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                marginTop: 2
              }}
            >
              <Bot size={14} />
            </div>

            <div
              style={{
                background: 'var(--bg-card)',
                color: 'var(--text-secondary)',
                padding: '10px 14px',
                borderRadius: '4px 14px 14px 14px',
                border: '1px solid var(--border-light)',
                boxShadow: 'var(--shadow-xs)',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                GlucoCare AI is typing
              </span>
              <div className="typing-indicator">
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompt Chips */}
      <div className="no-scrollbar" style={{ display: 'flex', gap: 5, overflowX: 'auto', padding: '6px 0', flexShrink: 0 }}>
        {promptChips.map((chip, i) => (
          <button
            key={i}
            type="button"
            disabled={isAiTyping}
            onClick={() => {
              if (!isAiTyping) {
                sendAiMessage(chip.replace(/^[^\w]+/, ''));
              }
            }}
            style={{
              padding: '4px 9px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-light)',
              color: isAiTyping ? 'var(--text-muted)' : 'var(--text-secondary)',
              fontSize: '0.72rem',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              flexShrink: 0,
              cursor: isAiTyping ? 'not-allowed' : 'pointer',
              opacity: isAiTyping ? 0.6 : 1
            }}
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Message Input Box */}
      <form onSubmit={handleSend} style={{ display: 'flex', gap: 6, flexShrink: 0, marginTop: 4 }}>
        <input
          type="text"
          className="form-input"
          placeholder={isAiTyping ? "AI Coach is typing response..." : "Ask AI Coach..."}
          value={inputText}
          disabled={isAiTyping}
          onChange={e => setInputText(e.target.value)}
          style={{ flex: 1, borderRadius: 'var(--radius-full)', padding: '9px 14px', fontSize: '0.86rem' }}
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isAiTyping}
          className="btn btn-primary"
          style={{
            width: 38,
            height: 38,
            borderRadius: '50%',
            padding: 0,
            opacity: inputText.trim() && !isAiTyping ? 1 : 0.5,
            flexShrink: 0,
            cursor: !inputText.trim() || isAiTyping ? 'not-allowed' : 'pointer'
          }}
        >
          <Send size={15} />
        </button>
      </form>
    </div>
  );
};
