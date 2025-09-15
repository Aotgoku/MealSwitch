import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { Bot, Send, X } from 'lucide-react';

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
`;

const ChatHeader = styled.div`
  padding: 1rem;
  background: linear-gradient(to right, #f97316, #ec4899);
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const HeaderTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
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
`;

const InputContainer = styled.div`
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
`;

const Chatbot = ({ goal, onClose, mealPlan }) => {
  const [messages, setMessages] = useState([
    { text: `Hello! I'm your AI health assistant. How can I help you with your goal of ${goal.replace(/_/g, ' ')} today?`, isUser: false }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { text: input, isUser: true };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
        const response = await fetch('http://127.0.0.1:8000/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: input,
                goal: goal,
                history: [],
                meal_plan: mealPlan  // You can optionally send chat history
            })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        const botResponse = { text: data.reply, isUser: false };
        setMessages(prev => [...prev, botResponse]);

    } catch (error) {
        console.error("Error fetching AI response:", error);
        const errorResponse = { text: "Sorry, I'm having trouble connecting. Please check your backend server.", isUser: false };
        setMessages(prev => [...prev, errorResponse]);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <ChatContainer>
      <ChatHeader>
        <HeaderTitle>
          <Bot />
          <span>AI Health Assistant</span>
        </HeaderTitle>
        <CloseButton onClick={onClose}>
            <X size={20} />
        </CloseButton>
      </ChatHeader>
      <MessagesContainer>
        {messages.map((msg, index) => (
          <Message key={index} $isUser={msg.isUser}>
            <MessageBubble $isUser={msg.isUser}>{msg.text}</MessageBubble>
          </Message>
        ))}
         {isLoading && <Message $isUser={false}><MessageBubble $isUser={false}>...</MessageBubble></Message>}
        <div ref={messagesEndRef} />
      </MessagesContainer>
      <InputContainer>
        <ChatInput
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask me anything..."
          disabled={isLoading}
        />
        <SendButton onClick={handleSend} disabled={isLoading}><Send /></SendButton>
      </InputContainer>
    </ChatContainer>
  );
};

export default Chatbot;
