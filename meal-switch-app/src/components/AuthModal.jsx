import React, { useState } from 'react';
import styled from 'styled-components';
import { X, Mail, Lock, User, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { loginUserAPI, registerUserAPI, demoLoginAPI } from '../services/api';
import logoImg from '../assets/logo.png';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 1rem;
`;

const ModalCard = styled.div`
  background: #0E0E0E;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.9);
  overflow: hidden;
  position: relative;
  animation: modalFadeIn 0.25s ease-out;
  font-family: 'DM Sans', sans-serif;

  @keyframes modalFadeIn {
    from {
      opacity: 0;
      transform: scale(0.96) translateY(8px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1.25rem;
  right: 1.25rem;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #A19D98;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.12);
    color: #FFFFFF;
  }
`;

const ModalHeader = styled.div`
  padding: 2.5rem 2rem 1.25rem;
  text-align: center;
`;

const Title = styled.h2`
  margin: 0 0 0.4rem;
  font-size: 2rem;
  font-weight: 400;
  font-family: 'Instrument Serif', Georgia, serif;
  color: #FFFFFF;
  letter-spacing: -0.02em;
`;

const Subtitle = styled.p`
  margin: 0;
  color: #A19D98;
  font-size: 0.85rem;
  font-weight: 300;
`;

const TabContainer = styled.div`
  display: flex;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 9999px;
  padding: 4px;
  margin: 0 2rem 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
`;

const Tab = styled.button`
  flex: 1;
  padding: 0.55rem;
  background: ${props => props.$active ? '#FF7300' : 'transparent'};
  color: ${props => props.$active ? '#000000' : '#A19D98'};
  border: none;
  border-radius: 9999px;
  font-size: 0.82rem;
  font-weight: 700;
  font-family: 'DM Sans', sans-serif;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    color: ${props => props.$active ? '#000000' : '#FFFFFF'};
  }
`;

const Form = styled.form`
  padding: 0 2rem 2.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const InputGroup = styled.div`
  position: relative;
`;

const InputIcon = styled.div`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #A19D98;
  display: flex;
  align-items: center;
  pointer-events: none;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.85rem 1rem 0.85rem 2.75rem;
  background: #171717;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  color: #FFFFFF;
  font-size: 0.88rem;
  outline: none;
  transition: border-color 0.2s;
  font-family: 'DM Sans', sans-serif;

  &:focus {
    border-color: #FF7300;
  }

  &::placeholder {
    color: rgba(161, 157, 152, 0.5);
  }
`;

const SubmitButton = styled.button`
  margin-top: 0.5rem;
  padding: 0.9rem;
  background: #FF7300;
  color: #000000;
  border: none;
  border-radius: 9999px;
  font-size: 0.88rem;
  font-weight: 700;
  font-family: 'DM Sans', sans-serif;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: transform 0.2s ease, background 0.2s ease;
  box-shadow: 0 0 25px rgba(255, 115, 0, 0.35);

  &:hover:not(:disabled) {
    transform: scale(1.02);
    background: #FF8822;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const DemoCard = styled.div`
  margin: 0 2rem 1.25rem;
  background: linear-gradient(135deg, rgba(255, 115, 0, 0.12), rgba(255, 255, 255, 0.02));
  border: 1px solid rgba(255, 115, 0, 0.35);
  border-radius: 18px;
  padding: 1rem 1.15rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  box-shadow: 0 0 30px -10px rgba(255, 115, 0, 0.2);
`;

const DemoBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: #FF7300;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const DemoDescription = styled.p`
  margin: 0;
  font-size: 0.78rem;
  color: #D1CFCD;
  line-height: 1.4;
`;

const DemoBtn = styled.button`
  width: 100%;
  padding: 0.7rem;
  background: #FF7300;
  color: #000000;
  border: none;
  border-radius: 12px;
  font-size: 0.82rem;
  font-weight: 700;
  font-family: 'DM Sans', sans-serif;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: #FF8822;
    transform: translateY(-1px);
    box-shadow: 0 0 20px rgba(255, 115, 0, 0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const DividerContainer = styled.div`
  display: flex;
  align-items: center;
  margin: 0 2rem 1.25rem;
  gap: 0.75rem;
  color: rgba(161, 157, 152, 0.6);
  font-size: 0.72rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;

  &::before, &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: rgba(255, 255, 255, 0.08);
  }
`;

const ErrorBanner = styled.div`
  background: rgba(225, 29, 72, 0.15);
  border: 1px solid rgba(225, 29, 72, 0.3);
  color: #FDA4AF;
  padding: 0.65rem 0.85rem;
  border-radius: 12px;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const AuthModal = ({ isOpen, onClose, onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: ''
  });
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError(null);
  };

  const handleDemoLogin = async () => {
    setDemoLoading(true);
    setError(null);
    try {
      const data = await demoLoginAPI();
      onAuthSuccess(data.access_token, data.user);
      onClose();
    } catch (err) {
      setError(err.message || 'Demo access failed');
    } finally {
      setDemoLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const data = await loginUserAPI({ email: formData.email, password: formData.password });
        onAuthSuccess(data.access_token, data.user);
      } else {
        const data = await registerUserAPI({
          email: formData.email,
          password: formData.password,
          full_name: formData.full_name
        });
        onAuthSuccess(data.access_token, data.user);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalCard onClick={e => e.stopPropagation()}>
        <CloseButton onClick={onClose}>
          <X size={16} />
        </CloseButton>

        <ModalHeader>
          <img src={logoImg} alt="MealSwitch" style={{ width: 44, height: 44, objectFit: 'contain', margin: '0 auto 0.85rem', display: 'block' }} />
          <Title>{isLogin ? 'Welcome Back' : 'Create Account'}</Title>
          <Subtitle>
            {isLogin
              ? 'Access your saved meal plans and biometrics'
              : 'Join MealSwitch to optimize your metabolic health'}
          </Subtitle>
        </ModalHeader>

        {/* Quick Demo Access */}
        <DemoCard>
          <DemoBadge>
            <span>Instant Sandbox</span>
          </DemoBadge>
          <DemoDescription>
            Test MealSwitch with a pre-configured guest session without registration. Includes pre-seeded biometrics and sample PostgreSQL meal plans.
          </DemoDescription>
          <DemoBtn type="button" onClick={handleDemoLogin} disabled={demoLoading || loading}>
            {demoLoading ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <>
                <span>Continue as Guest</span>
                <ArrowRight size={14} />
              </>
            )}
          </DemoBtn>
        </DemoCard>

        <DividerContainer>
          <span>or continue with email</span>
        </DividerContainer>

        <TabContainer>
          <Tab $active={isLogin} type="button" onClick={() => { setIsLogin(true); setError(null); }}>
            Sign In
          </Tab>
          <Tab $active={!isLogin} type="button" onClick={() => { setIsLogin(false); setError(null); }}>
            Register
          </Tab>
        </TabContainer>

        <Form onSubmit={handleSubmit}>
          {error && (
            <ErrorBanner>
              <AlertCircle size={14} />
              <span>{error}</span>
            </ErrorBanner>
          )}

          {!isLogin && (
            <InputGroup>
              <InputIcon>
                <User size={16} />
              </InputIcon>
              <Input
                type="text"
                name="full_name"
                placeholder="Full Name"
                value={formData.full_name}
                onChange={handleChange}
                required={!isLogin}
              />
            </InputGroup>
          )}

          <InputGroup>
            <InputIcon>
              <Mail size={16} />
            </InputIcon>
            <Input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </InputGroup>

          <InputGroup>
            <InputIcon>
              <Lock size={16} />
            </InputIcon>
            <Input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </InputGroup>

          <SubmitButton type="submit" disabled={loading}>
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <>
                <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                <ArrowRight size={14} />
              </>
            )}
          </SubmitButton>
        </Form>
      </ModalCard>
    </ModalOverlay>
  );
};

export default AuthModal;
