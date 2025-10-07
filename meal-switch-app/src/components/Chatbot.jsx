import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { Bot, Send, X } from 'lucide-react';
import SmartSwaps from './SmartSwaps'; // Ensure this component exists and is imported correctly.

const ChatContainer = styled.div`
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 350px;
  max-height: 500px;
  background: #1c1917;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 1000;
  transition: all 0.3s ease-in-out;
`;

const ChatHeader = styled.div`
  padding: 1rem;
  background: linear-gradient(to right, #f97316, #ec4899);
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: default;
`;

const HeaderTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.2s ease;
  &:hover {
    opacity: 1;
  }
`;

const MessagesContainer = styled.div`
  padding: 1rem;
  height: 300px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
`;

const Message = styled.div`
  margin-bottom: 1rem;
  display: flex;
  flex-direction: ${props => props.$isUser ? 'row-reverse' : 'row'};
`;

const MessageBubble = styled.div`
  padding: 0.5rem 1rem;
  border-radius: 12px;
  background: ${props => props.$isUser ? '#f97316' : '#292524'};
  color: white;
  max-width: 80%;
  white-space: pre-wrap;
  word-wrap: break-word;
`;

const InputContainer = styled.form`
  display: flex;
  padding: 1rem;
  border-top: 1px solid #44403c;
`;

const ChatInput = styled.input`
  flex: 1;
  background: #292524;
  border: 1px solid #44403c;
  color: white;
  padding: 0.5rem;
  border-radius: 8px;
  &:focus {
    outline: none;
    border-color: #f97316;
  }
`;

const SendButton = styled.button`
  background: none;
  border: none;
  color: #f97316;
  cursor: pointer;
  margin-left: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  &:disabled {
    color: #555;
    cursor: not-allowed;
  }
`;

// Helper function to check if a string is valid JSON
const isJsonString = (str) => {
  if (typeof str !== 'string') return false;
  try {
    const parsed = JSON.parse(str);
    return (typeof parsed === 'object' && parsed !== null);
  } catch (e) {
    return false;
  }
};

const Chatbot = ({ goal, onClose, mealPlan, proactiveMessage, clearProactiveMessage }) => {
  const [messages, setMessages] = useState([
    { text: `Hello! I'm your AI health assistant. How can I help you with your goal of ${goal.replace(/_/g, ' ')} today?`, isUser: false }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (proactiveMessage) {
      setMessages(prev => [...prev, { text: proactiveMessage, isUser: false }]);
      clearProactiveMessage();
    }
  }, [proactiveMessage, clearProactiveMessage]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async (e) => {
    e.preventDefault(); // Prevent form submission from reloading the page
    const userMessageText = input.trim();
    if (!userMessageText || isLoading) return;

    // 1. Prepare history BEFORE updating state. This is what we'll send to the API.
    const historyForApi = messages.map(msg => ({
      role: msg.isUser ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    // 2. Optimistically update the UI with the user's message.
    setMessages(prevMessages => [...prevMessages, { text: userMessageText, isUser: true }]);
    setInput('');
    setIsLoading(true);

    try {
      // 3. Make the API call with the PREPARED history and the current message text.
      const response = await fetch('http://127.0.0.1:8000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessageText,
          goal: goal,
          history: historyForApi,
          meal_plan: mealPlan
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'The server returned an error.');
      }

      const data = await response.json();
      const botResponse = { text: data.reply, isUser: false };
      
      // 4. Add the bot's response to the message list.
      setMessages(prevMessages => [...prevMessages, botResponse]);

    } catch (error) {
      console.error("Error fetching AI response:", error);
      const errorResponse = { text: `Sorry, there was an error. Please try again.`, isUser: false };
      setMessages(prevMessages => [...prevMessages, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ChatContainer>
      <ChatHeader>
        <HeaderTitle><Bot /><span>AI Health Assistant</span></HeaderTitle>
        <CloseButton onClick={onClose}><X size={20} /></CloseButton>
      </ChatHeader>
      <MessagesContainer>
        {messages.map((msg, index) => (
          <Message key={index} $isUser={msg.isUser}>
            { !msg.isUser && isJsonString(msg.text) ? (
                <SmartSwaps data={JSON.parse(msg.text)} />
              ) : (
                <MessageBubble $isUser={msg.isUser}>{msg.text}</MessageBubble>
              )
            }
          </Message>
        ))}
        {isLoading && <Message $isUser={false}><MessageBubble $isUser={false}>...</MessageBubble></Message>}
        <div ref={messagesEndRef} />
      </MessagesContainer>
      <InputContainer onSubmit={handleSend}>
        <ChatInput
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me anything..."
          disabled={isLoading}
        />
        <SendButton type="submit" disabled={isLoading || !input.trim()}><Send /></SendButton>
      </InputContainer>
    </ChatContainer>
  );
};

export default Chatbot;


