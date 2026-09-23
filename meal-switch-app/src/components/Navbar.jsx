import React from 'react';
import styled from 'styled-components';
import { Search, Calendar, UtensilsCrossed, BarChart3, LogIn, LogOut, Home } from 'lucide-react';

import logoImg from '../assets/logo.png';

const Nav = styled.nav`
  position: sticky;
  top: 0;
  z-index: 1000;
  background: rgba(10, 10, 10, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding: 1rem 2rem;
  font-family: 'DM Sans', sans-serif;
`;

const NavInner = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
`;

const LogoArea = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
`;

const BrandIcon = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

const BrandName = styled.span`
  font-family: 'Instrument Serif', Georgia, serif;
  font-size: 1.85rem;
  font-weight: 400;
  color: #F5F5F5;
  letter-spacing: -0.02em;
  display: flex;
  align-items: baseline;
  margin-top: 2px;
`;

const NavTabs = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 9999px;
  padding: 4px;

  @media (max-width: 880px) {
    display: none;
  }
`;

const TabBtn = styled.button`
  background: ${props => props.$active ? '#FF7300' : 'transparent'};
  color: ${props => props.$active ? '#000000' : '#A19D98'};
  border: none;
  border-radius: 9999px;
  padding: 0.5rem 1.1rem;
  font-size: 0.85rem;
  font-weight: 600;
  font-family: 'DM Sans', sans-serif;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;

  &:hover {
    color: ${props => props.$active ? '#000000' : '#FFFFFF'};
    background: ${props => props.$active ? '#FF8822' : 'rgba(255, 255, 255, 0.05)'};
  }
`;

const RightArea = styled.div`
  display: flex;
  align-items: center;
  gap: 0.85rem;
`;

const AuthBtn = styled.button`
  padding: 0.55rem 1.35rem;
  background: #FF7300;
  color: #000000;
  border: none;
  border-radius: 9999px;
  font-size: 0.85rem;
  font-weight: 700;
  font-family: 'DM Sans', sans-serif;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.45rem;
  transition: all 0.2s ease;
  box-shadow: 0 0 25px -5px rgba(255, 115, 0, 0.4);

  &:hover {
    background: #FF8822;
    transform: scale(1.02);
  }
`;

const UserPill = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 9999px;
  padding: 0.35rem 0.95rem 0.35rem 0.45rem;
  color: #F5F5F5;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: rgba(255, 115, 0, 0.4);
    background: rgba(255, 255, 255, 0.09);
  }
`;

const UserAvatar = styled.div`
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #FF7300;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  color: #000000;
`;

const LogoutBtn = styled.button`
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #A19D98;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    color: #FFFFFF;
    border-color: rgba(255, 255, 255, 0.25);
    background: rgba(255, 255, 255, 0.1);
  }
`;

const MobileTabBar = styled.div`
  display: none;
  background: rgba(10, 10, 10, 0.95);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding: 0.5rem 0.75rem;
  gap: 0.3rem;
  overflow-x: auto;

  @media (max-width: 880px) {
    display: flex;
  }
`;

const Navbar = ({
  currentView,
  onSelectView,
  user,
  onOpenAuth,
  onLogout
}) => {
  const tabs = [
    { id: 'landing', label: 'Home', icon: Home },
    { id: 'scanner', label: 'Nutrition Scanner', icon: Search },
    { id: 'planner', label: 'Meal Planner', icon: Calendar },
    { id: 'recipes', label: 'Recipe Studio', icon: UtensilsCrossed },
    { id: 'dashboard', label: 'Health Dashboard', icon: BarChart3 },
  ];

  return (
    <>
      <Nav>
        <NavInner>
          <LogoArea onClick={() => onSelectView('landing')}>
            <BrandIcon>
              <img src={logoImg} alt="MealSwitch" />
            </BrandIcon>
            <BrandName>
              MealSwitch
            </BrandName>
          </LogoArea>

          <NavTabs>
            {tabs.map(({ id, label, icon: Icon }) => (
              <TabBtn
                key={id}
                $active={currentView === id}
                onClick={() => onSelectView(id)}
              >
                <Icon size={14} />
                <span>{label}</span>
              </TabBtn>
            ))}
          </NavTabs>

          <RightArea>
            {user ? (
              <>
                <UserPill onClick={() => onSelectView('dashboard')} title="View Health Profile & Saved Plans">
                  <UserAvatar>
                    {(user.full_name ? user.full_name[0] : user.email[0]).toUpperCase()}
                  </UserAvatar>
                  <span>{user.full_name ? user.full_name.replace(/\s*\([^)]*\)/g, '').trim() : user.email.split('@')[0]}</span>
                </UserPill>

                <LogoutBtn onClick={onLogout} title="Sign Out">
                  <LogOut size={15} />
                </LogoutBtn>
              </>
            ) : (
              <AuthBtn onClick={onOpenAuth}>
                <LogIn size={15} />
                <span>Sign In</span>
              </AuthBtn>
            )}
          </RightArea>
        </NavInner>
      </Nav>

      <MobileTabBar>
        {tabs.map(({ id, label, icon: Icon }) => (
          <TabBtn
            key={id}
            $active={currentView === id}
            onClick={() => onSelectView(id)}
            style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', whiteSpace: 'nowrap' }}
          >
            <Icon size={13} />
            <span>{label}</span>
          </TabBtn>
        ))}
      </MobileTabBar>
    </>
  );
};

export default Navbar;