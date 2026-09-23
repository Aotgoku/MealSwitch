import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { X, User, Activity, Flame, Calendar, Trash2, CheckCircle, AlertCircle, Loader2, BookmarkCheck } from 'lucide-react';
import { getUserProfileAPI, updateUserProfileAPI, getUserMealPlansAPI, deleteMealPlanAPI } from '../services/api';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.78);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 1rem;
`;

const ModalCard = styled.div`
  background: #1c1917;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 20px;
  width: 100%;
  max-width: 640px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6);
  position: relative;
  display: flex;
  flex-direction: column;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1.25rem;
  right: 1.25rem;
  background: rgba(255, 255, 255, 0.06);
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #a8a29e;
  cursor: pointer;
  z-index: 10;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    color: white;
  }
`;

const Header = styled.div`
  padding: 2rem 2rem 1.25rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
`;

const UserName = styled.h2`
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #f2f2f2;
`;

const UserEmail = styled.p`
  margin: 0.25rem 0 0;
  color: #a8a29e;
  font-size: 0.88rem;
`;

const Tabs = styled.div`
  display: flex;
  padding: 1rem 2rem 0;
  gap: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
`;

const TabButton = styled.button`
  padding: 0.75rem 0.5rem;
  background: none;
  border: none;
  border-bottom: 2px solid ${props => props.active ? '#f97316' : 'transparent'};
  color: ${props => props.active ? '#ffffff' : '#78716c'};
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    color: #f2f2f2;
  }
`;

const Content = styled.div`
  padding: 1.5rem 2rem 2rem;
  overflow-y: auto;
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const MetricCard = styled.div`
  background: #0c0a09;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.85rem;
`;

const MetricIcon = styled.div`
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background: ${props => props.color || 'rgba(249, 115, 22, 0.15)'};
  color: ${props => props.textColor || '#f97316'};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const MetricValue = styled.div`
  font-size: 1.35rem;
  font-weight: 700;
  color: #f2f2f2;
`;

const MetricLabel = styled.div`
  font-size: 0.78rem;
  color: #a8a29e;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;

  @media (max-width: 500px) {
    grid-template-columns: 1fr;
  }
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`;

const Label = styled.label`
  font-size: 0.82rem;
  color: #a8a29e;
  font-weight: 500;
`;

const Input = styled.input`
  padding: 0.75rem 0.85rem;
  background: #0c0a09;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #f2f2f2;
  font-size: 0.9rem;

  &:focus {
    outline: none;
    border-color: #f97316;
  }
`;

const Select = styled.select`
  padding: 0.75rem 0.85rem;
  background: #0c0a09;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #f2f2f2;
  font-size: 0.9rem;

  &:focus {
    outline: none;
    border-color: #f97316;
  }
`;

const SaveButton = styled.button`
  width: 100%;
  padding: 0.85rem;
  background: linear-gradient(to right, #f97316, #ec4899);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: opacity 0.2s;

  &:hover:not(:disabled) {
    opacity: 0.92;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const PlanCard = styled.div`
  background: #0c0a09;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 1.25rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  transition: border-color 0.2s;

  &:hover {
    border-color: rgba(249, 115, 22, 0.4);
  }
`;

const PlanInfo = styled.div`
  flex: 1;
`;

const PlanTitle = styled.h4`
  margin: 0 0 0.4rem;
  font-size: 1rem;
  color: #f2f2f2;
`;

const PlanMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  color: #78716c;
  font-size: 0.8rem;
`;

const PlanActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  background: rgba(255, 255, 255, 0.06);
  border: none;
  border-radius: 8px;
  padding: 0.5rem 0.85rem;
  color: #f2f2f2;
  font-size: 0.82rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
  }
`;

const DeleteButton = styled(ActionButton)`
  color: #f87171;

  &:hover {
    background: rgba(239, 68, 68, 0.15);
  }
`;

const EmptyPlans = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  color: #78716c;
`;

const ProfileModal = ({ isOpen, onClose, user, token, onLoadPlan, onProfileUpdated }) => {
  const [activeTab, setActiveTab] = useState('health'); // 'health' or 'plans'
  const [profile, setProfile] = useState({
    age: '',
    weight_kg: '',
    height_cm: '',
    gender: 'male',
    activity_level: 'sedentary',
    dietary_preference: 'veg',
    primary_goal: 'muscle_gain',
    bmi: null,
    tdee: null
  });
  const [savedPlans, setSavedPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  useEffect(() => {
    if (!isOpen || !token) return;

    // Load user profile
    setLoading(true);
    getUserProfileAPI(token)
      .then(data => {
        setProfile({
          age: data.age || '',
          weight_kg: data.weight_kg || '',
          height_cm: data.height_cm || '',
          gender: data.gender || 'male',
          activity_level: data.activity_level || 'sedentary',
          dietary_preference: data.dietary_preference || 'veg',
          primary_goal: data.primary_goal || 'muscle_gain',
          bmi: data.bmi,
          tdee: data.tdee
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));

    // Load saved plans
    getUserMealPlansAPI(token)
      .then(setSavedPlans)
      .catch(console.error);
  }, [isOpen, token]);

  if (!isOpen) return null;

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg(null);
    try {
      const updated = await updateUserProfileAPI({
        age: profile.age ? parseInt(profile.age) : null,
        weight_kg: profile.weight_kg ? parseFloat(profile.weight_kg) : null,
        height_cm: profile.height_cm ? parseFloat(profile.height_cm) : null,
        gender: profile.gender,
        activity_level: profile.activity_level,
        dietary_preference: profile.dietary_preference,
        primary_goal: profile.primary_goal
      }, token);

      setProfile(prev => ({
        ...prev,
        bmi: updated.bmi,
        tdee: updated.tdee
      }));
      if (onProfileUpdated) {
        onProfileUpdated(updated);
      }
      setStatusMsg({ type: 'success', text: 'Health profile updated successfully!' });
    } catch (err) {

      setStatusMsg({ type: 'error', text: err.message || 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePlan = async (planId) => {
    if (!window.confirm("Are you sure you want to delete this saved meal plan?")) return;
    try {
      await deleteMealPlanAPI(planId, token);
      setSavedPlans(prev => prev.filter(p => p.id !== planId));
    } catch (err) {
      alert(err.message || "Failed to delete plan");
    }
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalCard onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={onClose}>
          <X size={18} />
        </CloseButton>

        <Header>
          <UserName>{user?.full_name || 'My Profile'}</UserName>
          <UserEmail>{user?.email}</UserEmail>
        </Header>

        <Tabs>
          <TabButton active={activeTab === 'health'} onClick={() => setActiveTab('health')}>
            Health Metrics & Profile
          </TabButton>
          <TabButton active={activeTab === 'plans'} onClick={() => setActiveTab('plans')}>
            Saved Meal Plans ({savedPlans.length})
          </TabButton>
        </Tabs>

        <Content>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <Loader2 className="animate-spin" size={32} color="#f97316" />
            </div>
          ) : activeTab === 'health' ? (
            <form onSubmit={handleSaveProfile}>
              {/* BMI & TDEE Metrics */}
              <MetricsGrid>
                <MetricCard>
                  <MetricIcon color="rgba(249, 115, 22, 0.15)" textColor="#f97316">
                    <Activity size={22} />
                  </MetricIcon>
                  <div>
                    <MetricValue>{profile.bmi ? profile.bmi : '—'}</MetricValue>
                    <MetricLabel>Body Mass Index (BMI)</MetricLabel>
                  </div>
                </MetricCard>

                <MetricCard>
                  <MetricIcon color="rgba(236, 72, 153, 0.15)" textColor="#ec4899">
                    <Flame size={22} />
                  </MetricIcon>
                  <div>
                    <MetricValue>{profile.tdee ? `${profile.tdee} kcal` : '—'}</MetricValue>
                    <MetricLabel>Daily Energy Target (TDEE)</MetricLabel>
                  </div>
                </MetricCard>
              </MetricsGrid>

              {statusMsg && (
                <div style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: statusMsg.type === 'success' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  color: statusMsg.type === 'success' ? '#86efac' : '#fca5a5'
                }}>
                  {statusMsg.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                  <span>{statusMsg.text}</span>
                </div>
              )}

              <FormGrid>
                <Field>
                  <Label>Age (years)</Label>
                  <Input
                    type="number"
                    value={profile.age}
                    placeholder="e.g. 25"
                    onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                  />
                </Field>

                <Field>
                  <Label>Gender</Label>
                  <Select
                    value={profile.gender}
                    onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </Select>
                </Field>

                <Field>
                  <Label>Weight (kg)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 70.5"
                    value={profile.weight_kg}
                    onChange={(e) => setProfile({ ...profile, weight_kg: e.target.value })}
                  />
                </Field>

                <Field>
                  <Label>Height (cm)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 175"
                    value={profile.height_cm}
                    onChange={(e) => setProfile({ ...profile, height_cm: e.target.value })}
                  />
                </Field>

                <Field>
                  <Label>Activity Level</Label>
                  <Select
                    value={profile.activity_level}
                    onChange={(e) => setProfile({ ...profile, activity_level: e.target.value })}
                  >
                    <option value="sedentary">Sedentary (desk job)</option>
                    <option value="light">Light (1-3 days/wk)</option>
                    <option value="moderate">Moderate (3-5 days/wk)</option>
                    <option value="active">Active (6-7 days/wk)</option>
                    <option value="very_active">Very Active (athlete)</option>
                  </Select>
                </Field>

                <Field>
                  <Label>Dietary Preference</Label>
                  <Select
                    value={profile.dietary_preference}
                    onChange={(e) => setProfile({ ...profile, dietary_preference: e.target.value })}
                  >
                    <option value="veg">Vegetarian</option>
                    <option value="non-veg">Non-Vegetarian</option>
                    <option value="vegan">Vegan</option>
                    <option value="keto">Keto</option>
                  </Select>
                </Field>

                <Field style={{ gridColumn: 'span 2' }}>
                  <Label>Primary Fitness Goal</Label>
                  <Select
                    value={profile.primary_goal}
                    onChange={(e) => setProfile({ ...profile, primary_goal: e.target.value })}
                  >
                    <option value="weight_loss">Weight Loss</option>
                    <option value="muscle_gain">Muscle Gain</option>
                    <option value="healthy_lifestyle">Healthy Lifestyle</option>
                  </Select>
                </Field>
              </FormGrid>

              <SaveButton type="submit" disabled={saving}>
                {saving ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                <span>Save Profile & Calculate Metrics</span>
              </SaveButton>
            </form>
          ) : (
            <div>
              {savedPlans.length === 0 ? (
                <EmptyPlans>
                  <BookmarkCheck size={48} style={{ opacity: 0.4, marginBottom: '0.75rem' }} />
                  <p style={{ margin: 0 }}>No saved meal plans yet.</p>
                  <p style={{ fontSize: '0.85rem', color: '#57534e' }}>Generate a meal plan on the home page and click "Save Plan" to store it here.</p>
                </EmptyPlans>
              ) : (
                savedPlans.map(plan => (
                  <PlanCard key={plan.id}>
                    <PlanInfo>
                      <PlanTitle>{plan.title || 'Personalized Meal Plan'}</PlanTitle>
                      <PlanMeta>
                        <span><Calendar size={13} style={{ verticalAlign: 'middle', marginRight: '4px' }} />{new Date(plan.created_at).toLocaleDateString()}</span>
                        {plan.target_calories && <span>Target: {plan.target_calories} kcal</span>}
                        {plan.is_optimized && <span style={{ color: '#86efac' }}>★ Optimized</span>}
                      </PlanMeta>
                    </PlanInfo>
                    <PlanActions>
                      <DeleteButton onClick={() => handleDeletePlan(plan.id)}>
                        <Trash2 size={14} />
                      </DeleteButton>
                    </PlanActions>
                  </PlanCard>
                ))
              )}
            </div>
          )}
        </Content>
      </ModalCard>
    </ModalOverlay>
  );
};

export default ProfileModal;
