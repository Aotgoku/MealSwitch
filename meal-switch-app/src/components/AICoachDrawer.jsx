import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { Bot, X, Send, Loader2 } from 'lucide-react';
import { sendChatMessageAPI } from '../services/api';

const LauncherButton = styled.button`
  position: fixed;
  bottom: ${props => props.$isLanding ? '2.5rem' : '2rem'};
  right: 2rem;
  height: 44px;
  padding: 0 1.25rem;
  border-radius: 9999px;
  background: #FF7300;
  color: #000000;
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  font-weight: 700;
  font-family: 'DM Sans', sans-serif;
  cursor: pointer;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
  z-index: 990;
  transition: background-color 0.2s ease, transform 0.15s ease;

  &:hover {
    background: #FF8822;
  }
`;

const DrawerOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: 2500;
  opacity: ${props => props.$open ? 1 : 0};
  pointer-events: ${props => props.$open ? 'auto' : 'none'};
  transition: opacity 0.25s ease;
`;

const Drawer = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  width: 100%;
  max-width: 440px;
  height: 100%;
  background: #0D0D0D;
  border-left: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: -20px 0 50px rgba(0, 0, 0, 0.8);
  z-index: 2600;
  display: flex;
  flex-direction: column;
  transform: ${props => props.$open ? 'translateX(0)' : 'translateX(100%)'};
  transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1);
  font-family: 'DM Sans', sans-serif;
`;

const DrawerHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  background: #0A0A0A;
`;

const CoachInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const CoachAvatar = styled.div`
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: #FF7300;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #000000;
  box-shadow: 0 0 15px rgba(255, 115, 0, 0.3);
`;

const CoachTitle = styled.h3`
  margin: 0;
  font-size: 1.35rem;
  font-weight: 400;
  font-family: 'Instrument Serif', Georgia, serif;
  color: #FFFFFF;
`;

const StatusDot = styled.div`
  font-size: 0.72rem;
  color: #A19D98;
  display: flex;
  align-items: center;
  gap: 0.35rem;

  &::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #10B981;
    box-shadow: 0 0 8px #10B981;
  }
`;

const CloseBtn = styled.button`
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #A19D98;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    color: #FFFFFF;
    background: rgba(255, 255, 255, 0.12);
  }
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const MessageBubble = styled.div`
  max-width: 85%;
  padding: 0.85rem 1.15rem;
  border-radius: 18px;
  font-size: 0.88rem;
  line-height: 1.5;
  white-space: pre-wrap;
  align-self: ${props => props.$role === 'user' ? 'flex-end' : 'flex-start'};
  background: ${props => props.$role === 'user' ? '#FF7300' : '#141414'};
  color: ${props => props.$role === 'user' ? '#000000' : '#F5F5F5'};
  border: ${props => props.$role === 'user' ? 'none' : '1px solid rgba(255, 255, 255, 0.08)'};
  font-weight: ${props => props.$role === 'user' ? '600' : '400'};
  box-shadow: ${props => props.$role === 'user' ? '0 0 20px rgba(255, 115, 0, 0.25)' : 'none'};
`;

const QuickChips = styled.div`
  display: flex;
  gap: 0.45rem;
  overflow-x: auto;
  padding: 0.65rem 1.25rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  background: #0A0A0A;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const Chip = styled.button`
  white-space: nowrap;
  padding: 0.4rem 0.85rem;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #A19D98;
  font-size: 0.75rem;
  font-family: 'DM Sans', sans-serif;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    color: #FFFFFF;
    border-color: rgba(255, 115, 0, 0.4);
    background: rgba(255, 115, 0, 0.1);
  }
`;

const InputArea = styled.div`
  padding: 1.1rem 1.25rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  gap: 0.6rem;
  background: #0A0A0A;
`;

const ChatInput = styled.input`
  flex: 1;
  padding: 0.8rem 1.1rem;
  background: #171717;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  color: #FFFFFF;
  font-size: 0.88rem;
  outline: none;
  font-family: 'DM Sans', sans-serif;

  &:focus {
    border-color: #FF7300;
  }

  &::placeholder {
    color: rgba(161, 157, 152, 0.5);
  }
`;

const SendBtn = styled.button`
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: #FF7300;
  color: #000000;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: opacity 0.2s;
  box-shadow: 0 0 15px rgba(255, 115, 0, 0.3);

  &:hover:not(:disabled) {
    background: #FF8822;
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

const AICoachDrawer = ({ isOpen, onToggle, userGoal, mealPlan, isLanding }) => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: "Hello. I am your MealSwitch AI Health & Nutrition Coach. How may I assist your metabolic routine today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const quickPrompts = [
    "High-protein vegetarian snacks",
    "How to manage evening cravings?",
    "Pre-workout fuel options",
    "Optimize my hydration"
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (msgText) => {
    const textToSend = msgText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg = { role: 'user', text: textToSend.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const historyToSend = messages.slice(-8).map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));

      const response = await sendChatMessageAPI({
        message: textToSend.trim(),
        goal: userGoal || 'healthy_lifestyle',
        history: historyToSend,
        mealPlan: null
      });
      
      const assistantMsg = {
        role: 'assistant',
        text: response?.reply || response?.response || "Here is my nutritional guidance for you."
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', text: "Connection error. Please confirm the backend server is running on port 8000." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <LauncherButton $isLanding={isLanding} onClick={onToggle}>
        <Bot size={18} />
        <span>AI Coach</span>
      </LauncherButton>

      <DrawerOverlay $open={isOpen} onClick={onToggle} />

      <Drawer $open={isOpen}>
        <DrawerHeader>
          <CoachInfo>
            <CoachAvatar>
              <Bot size={20} />
            </CoachAvatar>
            <div>
              <CoachTitle>AI Nutrition Coach</CoachTitle>
              <StatusDot>Gemini 2.5 Flash Online</StatusDot>
            </div>
          </CoachInfo>
          <CloseBtn onClick={onToggle}>
            <X size={16} />
          </CloseBtn>
        </DrawerHeader>

        <MessagesContainer>
          {messages.map((m, idx) => (
            <MessageBubble key={idx} $role={m.role}>
              {m.text}
            </MessageBubble>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-xs text-[#A19D98] p-2">
              <Loader2 size={14} className="animate-spin text-[#FF7300]" />
              <span>Thinking...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </MessagesContainer>

        <QuickChips>
          {quickPrompts.map((p, i) => (
            <Chip key={i} onClick={() => handleSend(p)}>
              {p}
            </Chip>
          ))}
        </QuickChips>

        <InputArea>
          <ChatInput
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask anything about meals or nutrition..."
          />
          <SendBtn onClick={() => handleSend()} disabled={loading || !input.trim()}>
            <Send size={16} />
          </SendBtn>
        </InputArea>
      </Drawer>
    </>
  );
};

export default AICoachDrawer;
