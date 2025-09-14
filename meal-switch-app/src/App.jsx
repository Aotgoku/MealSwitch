import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
// Add Bot to the list of imported icons
import { Camera, Upload, Zap, Target, TrendingUp, Sparkles, ChefHat, Activity, Star, Users, Clock, Brain, Shield, Award, ArrowRight, Play, BarChart3, Utensils, Heart, Flame, Droplets, Wheat, X, CheckCircle, AlertCircle, ArrowLeft, Bot } from 'lucide-react';
import GoalModal from './GoalModal'; // Import the new modal
import Chatbot from './Chatbot'; // Import the new chatbot
import styled from 'styled-components';
import MealPlan from './MealPlan';
import MealPlanForm from './MealPlanForm';

const OpenChatbotButton = styled.button`
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(to right, #f97316, #ec4899);
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 5px 15px rgba(0,0,0,0.2);
  z-index: 999;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.1);
  }
`;

const App = () => {
    const [foodInput, setFoodInput] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [currentTab, setCurrentTab] = useState('text');
    const [isVisible, setIsVisible] = useState({});
    const [currentSection, setCurrentSection] = useState('hero');
    const [showResults, setShowResults] = useState(false);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [error, setError] = useState(null);
    const [userGoal, setUserGoal] = useState(null);
    const [showGoalModal, setShowGoalModal] = useState(true);
    const [showChatbot, setShowChatbot] = useState(false);
    const [showMealPlan, setShowMealPlan] = useState(false);
    const [mealPlanData, setMealPlanData] = useState(null);
    const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
   const [showMealPlanForm, setShowMealPlanForm] = useState(false);
  const [mealPlanDetails, setMealPlanDetails] = useState({
    age: '',
    weight: '',
    height: '',
    gender: 'male',
    targetCalories: 2000,
  });
  const [optimizedPlanData, setOptimizedPlanData] = useState(null);


    const mountRef = useRef(null);
    const heroRef = useRef(null);
    const featuresRef = useRef(null);
    const demoRef = useRef(null);
    const statsRef = useRef(null);
    const ctaRef = useRef(null);

    const handleGoalSelection = (goal) => {
        if (goal) {
            setUserGoal(goal);
            setShowGoalModal(false);
            setShowChatbot(true); // ADD THIS LINE
        }
    };

    const handleCloseChatbot = () => {
        setShowChatbot(false);
    };

    const handleOpenChatbot = () => {
        setShowChatbot(true);
    };



    // Intersection Observer for smooth scroll animations
    useEffect(() => {
        const sections = { hero: heroRef, features: featuresRef, demo: demoRef, stats: statsRef, cta: ctaRef };
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    const id = Object.keys(sections).find(key => sections[key].current === entry.target);
                    if (entry.isIntersecting) {
                        setIsVisible(prev => ({ ...prev, [id]: true }));
                        setCurrentSection(id);
                    }
                });
            }, { rootMargin: "-30% 0px -30% 0px", threshold: 0.2 }
        );

        Object.values(sections).forEach((ref) => {
            if (ref.current) observer.observe(ref.current);
        });

        return () => observer.disconnect();
    }, []);

    // Creative and Themed 3D Background Scene
   // Paste this entire useEffect hook into your App.jsx file
// in place of the old three.js useEffect.

useEffect(() => {
    if (!mountRef.current) return;
    const currentMount = mountRef.current;

    // Check if scene already exists to prevent re-rendering
    if (window.healthSceneInstance) {
        currentMount.appendChild(window.healthSceneInstance.renderer.domElement);
        window.healthSceneInstance.mount = currentMount;
        return () => {
            if (window.healthSceneInstance?.renderer.domElement.parentNode === currentMount) {
                currentMount.removeChild(window.healthSceneInstance.renderer.domElement);
            }
        };
    }

    // === FUTURISTIC SCENE SETUP ===
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x6366f1, 30, 200); // Purple fog to match background
    
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 30);
    
    const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance"
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    currentMount.appendChild(renderer.domElement);

    // === HOLOGRAPHIC MATERIAL ===
    const createHolographicMaterial = (color1, color2, speed = 1.0) => {
        return new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uColor1: { value: new THREE.Color(color1) },
                uColor2: { value: new THREE.Color(color2) },
                uSpeed: { value: speed },
                uFresnelPower: { value: 2.0 },
                uScanlineFreq: { value: 20.0 },
                uGlitchIntensity: { value: 0.1 },
                uHologramStrength: { value: 0.8 }
            },
            vertexShader: `
                varying vec3 vNormal;
                varying vec3 vPosition;
                varying vec2 vUv;
                varying vec3 vWorldPosition;
                uniform float uTime;
                uniform float uGlitchIntensity;
                
                // Noise function for glitch effect
                float random(vec2 st) {
                    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
                }
                
                void main() {
                    vUv = uv;
                    vNormal = normalize(normalMatrix * normal);
                    
                    vec3 pos = position;
                    
                    // Holographic glitch effect
                    float glitch = random(vec2(uTime * 10.0, position.y * 100.0)) * uGlitchIntensity;
                    pos.x += sin(uTime * 5.0 + position.y * 10.0) * glitch;
                    pos.z += cos(uTime * 3.0 + position.x * 8.0) * glitch * 0.5;
                    
                    // Gentle wave distortion
                    pos += normal * sin(uTime * 2.0 + position.y * 5.0) * 0.1;
                    
                    vWorldPosition = (modelMatrix * vec4(pos, 1.0)).xyz;
                    vPosition = pos;
                    
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
            `,
            fragmentShader: `
                uniform float uTime;
                uniform vec3 uColor1;
                uniform vec3 uColor2;
                uniform float uSpeed;
                uniform float uFresnelPower;
                uniform float uScanlineFreq;
                uniform float uHologramStrength;
                
                varying vec3 vNormal;
                varying vec3 vPosition;
                varying vec2 vUv;
                varying vec3 vWorldPosition;
                
                void main() {
                    vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
                    vec3 normal = normalize(vNormal);
                    
                    // Fresnel effect for holographic rim
                    float fresnel = 1.0 - max(dot(viewDirection, normal), 0.0);
                    fresnel = pow(fresnel, uFresnelPower);
                    
                    // Animated scanlines
                    float scanlines = sin((vPosition.y + uTime * uSpeed * 5.0) * uScanlineFreq) * 0.5 + 0.5;
                    scanlines = pow(scanlines, 3.0);
                    
                    // Horizontal data streams
                    float streams = sin((vPosition.x + uTime * uSpeed * 2.0) * 15.0) * 0.3 + 0.7;
                    
                    // Color mixing with holographic effect
                    vec3 hologramColor = mix(uColor1, uColor2, fresnel);
                    hologramColor = mix(hologramColor, uColor2 * 1.5, scanlines);
                    hologramColor += uColor1 * streams * 0.3;
                    
                    // Pulsing intensity
                    float pulse = sin(uTime * 3.0) * 0.2 + 0.8;
                    hologramColor *= pulse;
                    
                    // Edge glow
                    float edgeGlow = pow(fresnel, 0.5) * uHologramStrength;
                    hologramColor += uColor2 * edgeGlow * 2.0;
                    
                    // Alpha based on fresnel and scanlines
                    float alpha = (fresnel * 0.8 + scanlines * 0.4) * uHologramStrength;
                    alpha = clamp(alpha, 0.1, 0.9);
                    
                    gl_FragColor = vec4(hologramColor, alpha);
                }
            `,
            transparent: true,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending
        });
    };

    // === FUTURISTIC HEALTH OBJECTS ===
    const healthObjects = [];
    
    // DNA Helix
    const createDNAHelix = () => {
        const group = new THREE.Group();
        const helixMaterial = createHolographicMaterial(0x8b5cf6, 0x06b6d4, 1.2); // Purple to cyan
        
        for (let i = 0; i < 40; i++) {
            const sphere = new THREE.Mesh(
                new THREE.SphereGeometry(0.2, 8, 8),
                helixMaterial
            );
            
            const angle = (i / 40) * Math.PI * 4;
            const y = i * 0.5 - 10;
            sphere.position.set(
                Math.cos(angle) * 2,
                y,
                Math.sin(angle) * 2
            );
            
            const sphere2 = sphere.clone();
            sphere2.position.set(
                Math.cos(angle + Math.PI) * 2,
                y,
                Math.sin(angle + Math.PI) * 2
            );
            
            group.add(sphere, sphere2);
            
            // Connecting lines
            const lineGeometry = new THREE.BufferGeometry().setFromPoints([
                sphere.position,
                sphere2.position
            ]);
            const line = new THREE.Line(lineGeometry, helixMaterial);
            group.add(line);
        }
        
        group.position.set(-15, 0, -10);
        group.rotation.z = Math.PI / 6;
        return group;
    };

    // Medical Cross
    const createMedicalCross = () => {
        const group = new THREE.Group();
        const crossMaterial = createHolographicMaterial(0x06d6a0, 0x10b981, 0.8); // Emerald green
        
        // Vertical bar
        const vertical = new THREE.Mesh(
            new THREE.BoxGeometry(1.5, 8, 0.5),
            crossMaterial
        );
        
        // Horizontal bar  
        const horizontal = new THREE.Mesh(
            new THREE.BoxGeometry(8, 1.5, 0.5),
            crossMaterial
        );
        
        group.add(vertical, horizontal);
        group.position.set(15, 5, -5);
        return group;
    };

    // Molecular Structure
    const createMolecule = () => {
        const group = new THREE.Group();
        const moleculeMaterial = createHolographicMaterial(0xf59e0b, 0xeab308, 1.5); // Golden yellow
        
        // Central atom
        const center = new THREE.Mesh(
            new THREE.SphereGeometry(1, 16, 16),
            moleculeMaterial
        );
        group.add(center);
        
        // Orbiting electrons
        for (let i = 0; i < 6; i++) {
            const electron = new THREE.Mesh(
                new THREE.SphereGeometry(0.3, 8, 8),
                moleculeMaterial
            );
            
            const angle = (i / 6) * Math.PI * 2;
            const radius = 3 + Math.sin(i) * 1;
            electron.position.set(
                Math.cos(angle) * radius,
                Math.sin(angle * 2) * 2,
                Math.sin(angle) * radius
            );
            
            group.add(electron);
            
            // Electron path
            const orbitGeometry = new THREE.RingGeometry(radius - 0.1, radius + 0.1, 32);
            const orbit = new THREE.Mesh(orbitGeometry, moleculeMaterial);
            orbit.rotation.x = Math.PI / 2;
            orbit.rotation.z = angle;
            group.add(orbit);
        }
        
        group.position.set(0, -10, 0);
        return group;
    };

    // Heart Rate Monitor
    const createHeartRate = () => {
        const group = new THREE.Group();
        const heartMaterial = createHolographicMaterial(0xef4444, 0xf87171, 2.0); // Red
        
        const points = [];
        for (let i = 0; i < 100; i++) {
            const x = (i - 50) * 0.3;
            let y = 0;
            
            // Create heartbeat pattern
            if (i > 45 && i < 55) {
                y = Math.sin((i - 45) / 10 * Math.PI) * 3;
            } else if (i > 35 && i < 45) {
                y = Math.sin((i - 35) / 10 * Math.PI) * 1.5;
            }
            
            points.push(new THREE.Vector3(x, y, 0));
        }
        
        const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
        const heartLine = new THREE.Line(lineGeometry, heartMaterial);
        group.add(heartLine);
        
        group.position.set(-8, 12, 5);
        return group;
    };

    // Vitamin Pills
    const createVitamins = () => {
        const group = new THREE.Group();
        const vitaminMaterial = createHolographicMaterial(0xa855f7, 0xc084fc, 1.0); // Purple
        
        for (let i = 0; i < 8; i++) {
            const pill = new THREE.Mesh(
                new THREE.CapsuleGeometry(0.5, 1.5, 4, 8),
                vitaminMaterial
            );
            
            const angle = (i / 8) * Math.PI * 2;
            pill.position.set(
                Math.cos(angle) * 4,
                Math.sin(angle * 1.5) * 2,
                Math.sin(angle) * 2
            );
            pill.rotation.set(angle, angle * 0.5, 0);
            
            group.add(pill);
        }
        
        group.position.set(12, -8, 8);
        return group;
    };

    // Add all objects
    healthObjects.push(
        createDNAHelix(),
        createMedicalCross(), 
        createMolecule(),
        createHeartRate(),
        createVitamins()
    );

    healthObjects.forEach(obj => {
        scene.add(obj);
        
        // Store animation data
        obj.userData = {
            rotationSpeed: 0.2 + Math.random() * 0.8,
            floatSpeed: 0.3 + Math.random() * 0.7,
            originalPosition: obj.position.clone()
        };
    });

    // === HOLOGRAPHIC GRID FLOOR ===
    const createHolographicGrid = () => {
        const gridMaterial = createHolographicMaterial(0x3b82f6, 0x1d4ed8, 0.5); // Blue
        const gridGroup = new THREE.Group();
        
        // Grid lines
        for (let i = -20; i <= 20; i += 2) {
            // Horizontal lines
            const hLineGeometry = new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(-40, -15, i),
                new THREE.Vector3(40, -15, i)
            ]);
            const hLine = new THREE.Line(hLineGeometry, gridMaterial);
            gridGroup.add(hLine);
            
            // Vertical lines
            const vLineGeometry = new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(i, -15, -20),
                new THREE.Vector3(i, -15, 20)
            ]);
            const vLine = new THREE.Line(vLineGeometry, gridMaterial);
            gridGroup.add(vLine);
        }
        
        return gridGroup;
    };

    const holographicGrid = createHolographicGrid();
    scene.add(holographicGrid);

    // === LIGHTING ===
    const ambientLight = new THREE.AmbientLight(0x6366f1, 0.3); // Purple ambient
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0x8b5cf6, 1); // Purple directional
    mainLight.position.set(10, 10, 5);
    scene.add(mainLight);

    // === ANIMATION LOOP ===
    const clock = new THREE.Clock();
    let animationId;
    
    const animate = () => {
        const elapsedTime = clock.getElapsedTime();
        
        // Update all holographic materials
        scene.traverse((object) => {
            if (object.material && object.material.uniforms && object.material.uniforms.uTime) {
                object.material.uniforms.uTime.value = elapsedTime;
            }
        });
        
        // Animate health objects
        healthObjects.forEach((obj, index) => {
            const userData = obj.userData;
            
            // Floating motion
            obj.position.y = userData.originalPosition.y + 
                Math.sin(elapsedTime * userData.floatSpeed + index) * 2;
            
            // Rotation
            obj.rotation.y += userData.rotationSpeed * 0.01;
            obj.rotation.x += userData.rotationSpeed * 0.005;
        });
        
        // Camera gentle movement
        camera.position.x = Math.sin(elapsedTime * 0.1) * 3;
        camera.position.y = Math.cos(elapsedTime * 0.08) * 2;
        camera.lookAt(new THREE.Vector3(0, 0, 0));
        
        // Grid animation
        holographicGrid.rotation.y += 0.002;
        
        renderer.render(scene, camera);
        animationId = requestAnimationFrame(animate);
    };
    
    animate();

    // === RESIZE HANDLER ===
    const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };
    
    window.addEventListener('resize', handleResize);

    // === STORE INSTANCE GLOBALLY FOR PERSISTENCE ===
    window.healthSceneInstance = {
        scene,
        camera,
        renderer,
        healthObjects,
        animationId,
        mount: currentMount,
        cleanup: () => {
            if (animationId) cancelAnimationFrame(animationId);
            window.removeEventListener('resize', handleResize);
            
            scene.traverse((object) => {
                if (object.geometry) object.geometry.dispose();
                if (object.material) {
                    if (Array.isArray(object.material)) {
                        object.material.forEach(material => material.dispose());
                    } else {
                        object.material.dispose();
                    }
                }
            });
            
            if (renderer.domElement.parentNode) {
                renderer.domElement.parentNode.removeChild(renderer.domElement);
            }
            renderer.dispose();
            delete window.healthSceneInstance;
        }
    };

    // === CLEANUP FUNCTION ===
    return () => {
        if (window.healthSceneInstance?.renderer.domElement.parentNode === currentMount) {
            currentMount.removeChild(window.healthSceneInstance.renderer.domElement);
        }
    };
}, []);

    // API call function
    const callNutritionAPI = async (foodQuery) => {
        try {
            const response = await fetch('http://127.0.0.1:8000/nutrition-analysis', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    food_name: foodQuery,
                    portion_size: 1.0
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('API call failed:', error);
            throw error;
        }
    };

    const getRecommendations = async (foodQuery) => {
        try {
            const response = await fetch('http://127.0.0.1:8000/food-recommendations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query: foodQuery
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Recommendations API call failed:', error);
            return null;
        }
    };

    const handleAnalyze = useCallback(async () => {
        if (!foodInput.trim() && !selectedImage) return;

        setIsAnalyzing(true);
        setError(null);

        try {
            // For now, we'll use the text input. Image analysis would require additional backend processing
            const query = foodInput.trim() || 'uploaded image food';

            // Get nutrition analysis
            const nutritionData = await callNutritionAPI(query);

            // Get recommendations
            const recommendationsData = await getRecommendations(query);

            const result = {
                nutrition: nutritionData,
                recommendations: recommendationsData,
                query: query,
                timestamp: new Date().toISOString()
            };

            setAnalysisResult(result);
            setShowResults(true);

        } catch (error) {
            console.error('Analysis failed:', error);
            setError('Failed to analyze food. Please check if the backend server is running on http://127.0.0.1:8000');
        } finally {
            setIsAnalyzing(false);
        }
    }, [foodInput, selectedImage]);

    const handleImageUpload = useCallback((event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => setSelectedImage(e.target.result);
            reader.readAsDataURL(file);
        }
    }, []);


    const handleGeneratePlan = async () => {
    if (!userGoal) {
        alert("Please select a goal first!");
        return;
    }
    setIsGeneratingPlan(true);
    setShowMealPlanForm(false); // Close the form while generating

    try {
        const response = await fetch('http://127.0.0.1:8000/generate-meal-plan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                goal: userGoal,
                calories: parseInt(mealPlanDetails.targetCalories, 10),
                age: mealPlanDetails.age ? parseInt(mealPlanDetails.age, 10) : null,
                weight_kg: mealPlanDetails.weight ? parseFloat(mealPlanDetails.weight) : null,
                height_cm: mealPlanDetails.height ? parseFloat(mealPlanDetails.height) : null,
                gender: mealPlanDetails.gender
            })
        });
        const data = await response.json();
        if (data.status === 'ok') {
           setMealPlanData(data.plan_data);
            setShowMealPlan(true);
        } else {
            throw new Error(data.error || "Failed to generate plan.");
        }
    } catch (error) {
        console.error("Error generating meal plan:", error);
        alert("Sorry, there was an error generating your meal plan.");
    } finally {
        setIsGeneratingPlan(false);
    }
};

const handleOptimizePlan = async () => {
    if (!mealPlanData) return;
    setIsGeneratingPlan(true); // We can reuse the same loading state

    try {
        const response = await fetch('http://127.0.0.1:8000/optimize-plan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ plan: mealPlanData }) // Send the current plan to the backend
        });
        const data = await response.json();
        if (data.status === 'ok') {
            // Store the new, optimized plan in our new state variable
            setOptimizedPlanData(data.optimized_plan);
        } else {
            throw new Error("Failed to optimize plan.");
        }
    } catch (error) {
        console.error("Error optimizing plan:", error);
        alert("Sorry, there was an error optimizing your plan.");
    } finally {
        setIsGeneratingPlan(false);
    }
};

    // Function to handle smooth scrolling
    const handleNavClick = (sectionId) => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    };

    const goBackToMain = () => {
        setShowResults(false);
        setAnalysisResult(null);
        setError(null);
        setFoodInput('');
        setSelectedImage(null);
    };

    const FeatureCard = ({ icon: Icon, title, description, gradientClass, delay }) => (
        <div className={`feature-card ${isVisible.features ? 'is-visible' : ''}`} style={{ transitionDelay: `${delay}ms` }}>
            <div className={`feature-card-icon-wrapper ${gradientClass}`}>
                <Icon className="feature-card-icon" />
            </div>
            <h3 className="feature-card-title">{title}</h3>
            <p className="feature-card-description">{description}</p>
        </div>
    );

    const MacroCard = ({ icon: Icon, title, value, colorClass, description }) => (
        <div className={`macro-card ${colorClass}`}>
            <div className="macro-card-content">
                <Icon className="macro-card-icon" />
                <h3 className="macro-card-value">{value}</h3>
                <p className="macro-card-title">{title}</p>
                <p className="macro-card-description">{description}</p>
            </div>
        </div>
    );

    // Results Component
    const ResultsView = () => {
        if (!analysisResult) return null;

        const { nutrition, recommendations } = analysisResult;

        return (
            <div className="results-container">
                <div className="results-header">
                    <button onClick={goBackToMain} className="back-button">
                        <ArrowLeft />
                        <span>Back to Analyzer</span>
                    </button>
                    <h1 className="results-title">Nutrition Analysis Results</h1>
                </div>

                {nutrition?.status === 'ok' && nutrition?.result ? (
                    <div className="results-content">
                        <div className="food-summary">
                            <h2 className="food-name">{nutrition.result.food_name}</h2>
                            <p className="portion-info">Portion Size: {nutrition.result.portion_size}</p>
                        </div>

                        <div className="nutrition-grid">
                            <MacroCard
                                icon={Flame}
                                title="Calories"
                                value={Math.round(nutrition.result.nutrition.calories)}
                                colorClass="color-red"
                                description="Energy for your day"
                            />
                            <MacroCard
                                icon={Utensils}
                                title="Protein"
                                value={`${Math.round(nutrition.result.nutrition.protein_g)}g`}
                                colorClass="color-blue"
                                description="For muscle repair"
                            />
                            <MacroCard
                                icon={Wheat}
                                title="Carbs"
                                value={`${Math.round(nutrition.result.nutrition.carbs_g)}g`}
                                colorClass="color-green"
                                description="For sustained energy"
                            />
                            <MacroCard
                                icon={Droplets}
                                title="Fats"
                                value={`${Math.round(nutrition.result.nutrition.fat_g)}g`}
                                colorClass="color-purple"
                                description="For brain health"
                            />
                        </div>

                        {nutrition.result.health_info && (
                            <div className="health-info">
                                <h3>Health Information</h3>
                                <div className="health-details">
                                    {nutrition.result.health_info.calories_saved > 0 && (
                                        <div className="health-item">
                                            <CheckCircle className="health-icon positive" />
                                            <span>Calories Saved: {Math.round(nutrition.result.health_info.calories_saved)}</span>
                                        </div>
                                    )}
                                    <div className="health-item">
                                        <Star className="health-icon" />
                                        <span>Category: {nutrition.result.health_info.category}</span>
                                    </div>
                                    {nutrition.result.health_info.risky_for !== 'None' && (
                                        <div className="health-item">
                                            <AlertCircle className="health-icon warning" />
                                            <span>Risky for: {nutrition.result.health_info.risky_for}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {recommendations?.status === 'ok' && recommendations?.results && (
                            <div className="recommendations">
                                <h3>Similar Foods & Alternatives</h3>
                                <div className="recommendations-grid">
                                    {recommendations.results.slice(0, 4).map((item, index) => (
                                        <div key={index} className="recommendation-card">
                                            <h4>{item.food_name}</h4>
                                            <div className="rec-nutrition">
                                                <span>{Math.round(item.calories)} cal</span>
                                                <span>{Math.round(item.protein_g)}g protein</span>
                                                <span>{Math.round(item.carbs_g)}g carbs</span>
                                                <span>{Math.round(item.fat_g)}g fat</span>
                                            </div>
                                            <div className="similarity-score">
                                                Similarity: {(item.similarity_score * 100).toFixed(1)}%
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="no-results">
                        <AlertCircle className="no-results-icon" />
                        <h3>Food Not Found</h3>
                        <p>Sorry, we couldn't find nutrition information for "{analysisResult.query}". Try a different food name or check your spelling.</p>
                        <button onClick={goBackToMain} className="try-again-button">
                            Try Again
                        </button>
                    </div>
                )}
            </div>
        );
    };

    // Error Display Component
    const ErrorDisplay = () => {
        if (!error) return null;

        return (
            <div className="error-container">
                <AlertCircle className="error-icon" />
                <h3>Analysis Failed</h3>
                <p>{error}</p>
                <button onClick={() => setError(null)} className="dismiss-button">
                    <X />
                    Dismiss
                </button>
            </div>
        );
    };

    // Main render logic
    if (showResults) {
        return (
            <div className="app-container">
                <div ref={mountRef} className="threejs-canvas"></div>
                <ResultsView />
                <style jsx>{`
            .results-container {
    min-height: 100vh;    /* cover full screen height */
    min-width:94.5vw ;          /* full width */
 overflow: hidden; 
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 2rem;
    color: white;

    position:absolute;  
    top:0.1rem;
     /* keeps it in normal flow */
    z-index: 1;       /* in case other elements overlap */
}




                    .results-header {
                        display: flex;
                        align-items: center;
                        gap: 1rem;
                        margin-bottom: 2rem;
                    }

                    .back-button {
                        display: flex;
                        align-items: center;
                        gap: 0.5rem;
                        background: rgba(255, 255, 255, 0.1);
                        border: none;
                        color: white;
                        padding: 0.75rem 1rem;
                        border-radius: 8px;
                        cursor: pointer;
                        transition: all 0.3s ease;
                    }

                    .back-button:hover {
                        background: rgba(255, 255, 255, 0.2);
                    }

                    .results-title {
                        font-size: 2rem;
                        font-weight: bold;
                        margin: 0;
                    }

                    .results-content {
                        max-width: 1200px;
                        margin: 0 auto;
                    }

                    .food-summary {
                        text-align: center;
                        margin-bottom: 2rem;
                        background: rgba(255, 255, 255, 0.1);
                        padding: 1.5rem;
                        border-radius: 12px;
                        backdrop-filter: blur(10px);
                    }

                    .food-name {
                        font-size: 1.5rem;
                        margin: 0 0 0.5rem 0;
                        color: #ffd700;
                    }

                    .portion-info {
                        margin: 0;
                        opacity: 0.8;
                    }

                    .nutrition-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                        gap: 1rem;
                        margin-bottom: 2rem;
                    }

                    .health-info {
                        background: rgba(255, 255, 255, 0.1);
                        padding: 1.5rem;
                        border-radius: 12px;
                        backdrop-filter: blur(10px);
                        margin-bottom: 2rem;
                    }

                    .health-info h3 {
                        margin: 0 0 1rem 0;
                        color: #ffd700;
                    }

                    .health-details {
                        display: flex;
                        flex-direction: column;
                        gap: 0.75rem;
                    }

                    .health-item {
                        display: flex;
                        align-items: center;
                        gap: 0.5rem;
                    }

                    .health-icon {
                        width: 20px;
                        height: 20px;
                    }

                    .health-icon.positive {
                        color: #4ade80;
                    }

                    .health-icon.warning {
                        color: #fbbf24;
                    }

                    .recommendations {
                        background: rgba(255, 255, 255, 0.1);
                        padding: 1.5rem;
                        border-radius: 12px;
                        backdrop-filter: blur(10px);
                    }

                    .recommendations h3 {
                        margin: 0 0 1rem 0;
                        color: #ffd700;
                    }

                    .recommendations-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                        gap: 1rem;
                    }

                    .recommendation-card {
                        background: rgba(255, 255, 255, 0.1);
                        padding: 1rem;
                        border-radius: 8px;
                        border: 1px solid rgba(255, 255, 255, 0.2);
                    }

                    .recommendation-card h4 {
                        margin: 0 0 0.5rem 0;
                        font-size: 1rem;
                        color: #ffd700;
                    }

                    .rec-nutrition {
                        display: flex;
                        flex-wrap: wrap;
                        gap: 0.5rem;
                        margin-bottom: 0.5rem;
                    }

                    .rec-nutrition span {
                        background: rgba(255, 255, 255, 0.2);
                        padding: 0.25rem 0.5rem;
                        border-radius: 4px;
                        font-size: 0.8rem;
                    }

                    .similarity-score {
                        font-size: 0.8rem;
                        opacity: 0.8;
                    }

                    .no-results {
                        text-align: center;
                        background: rgba(255, 255, 255, 0.1);
                        padding: 3rem;
                        border-radius: 12px;
                        backdrop-filter: blur(10px);
                        max-width: 500px;
                        margin: 2rem auto;
                    }

                    .no-results-icon {
                        width: 64px;
                        height: 64px;
                        color: #fbbf24;
                        margin: 0 auto 1rem;
                    }

                    .no-results h3 {
                        margin: 0 0 1rem 0;
                        color: #ffd700;
                    }

                    .no-results p {
                        margin: 0 0 1.5rem 0;
                        opacity: 0.8;
                    }

                    .try-again-button {
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        border: none;
                        color: white;
                        padding: 0.75rem 1.5rem;
                        border-radius: 8px;
                        cursor: pointer;
                        font-weight: 600;
                        transition: all 0.3s ease;
                    }

                    .try-again-button:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
                    }

                    @media (max-width: 768px) {
                        .results-container {
                            padding: 1rem;
                        }

                        .results-title {
                            font-size: 1.5rem;
                        }

                        .nutrition-grid {
                            grid-template-columns: 1fr;
                        }

                        .recommendations-grid {
                            grid-template-columns: 1fr;
                        }
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div className="app-container">
             {showMealPlanForm && <MealPlanForm onGenerate={handleGeneratePlan} onClose={() => setShowMealPlanForm(false)} isGenerating={isGeneratingPlan} details={mealPlanDetails} setDetails={setMealPlanDetails} />}
           {showMealPlan && (
    <MealPlan 
        planData={mealPlanData} 
        optimizedPlanData={optimizedPlanData}
        onClose={() => {
            setShowMealPlan(false);
            setOptimizedPlanData(null); // IMPORTANT: Reset the optimized plan when the modal is closed
        }} 
        onOptimize={handleOptimizePlan}
        isOptimizing={isGeneratingPlan} // Pass the loading state
    />
)}
            {/* ADD THESE TWO LINES */}
            {/* This shows the goal modal at the start */}
            {showGoalModal && <GoalModal onGoalSelect={handleGoalSelection} />}

            {/* This shows the chatbot only when a goal is set AND it's meant to be visible */}
           {userGoal && showChatbot && (
    <Chatbot 
      goal={userGoal} 
      onClose={handleCloseChatbot} 
      mealPlan={optimizedPlanData || mealPlanData} // <-- ADD THIS PROP
    />
)}

            {/* This shows the floating button to RE-OPEN the chatbot */}

            {userGoal && !showChatbot && (
                <OpenChatbotButton
                    onClick={handleOpenChatbot}
                    className="tooltip-host"
                    data-tooltip="AI Health Assistant"
                >
                    <Bot />
                </OpenChatbotButton>
            )}

            <div ref={mountRef} className="threejs-canvas"></div>

            {error && <ErrorDisplay />}

            <div className="floating-action-menu">
                {[
                    { id: 'hero', icon: ChefHat, label: 'Go to Top' },
                    { id: 'features', icon: Sparkles, label: 'View Features' },
                    { id: 'demo', icon: BarChart3, label: 'See Demo' },
                    { id: 'stats', icon: Users, label: 'Read Reviews' }
                ].map(({ id, icon: Icon, label }) => (
                    <button
                        key={id}
                        onClick={() => handleNavClick(id)}
                        className={`floating-menu-button tooltip-host ${currentSection === id ? 'active' : ''}`}
                        data-tooltip={label}
                    >
                        <Icon />
                    </button>
                ))}
            </div>

            <nav className="main-nav">
                <div className="nav-content">
                    <div className="nav-logo-area">
                        <div className="nav-logo-icon-bg">
                            <ChefHat className="nav-logo-icon" />
                        </div>
                        <div>
                            <h1 className="nav-logo-title">MealSwitch</h1>
                            <p className="nav-logo-subtitle">ML Nutrition Analytics</p>
                        </div>
                    </div>
                    <div className="nav-links">
                        {[
                            { name: 'Features', id: 'features', tooltip: 'Learn about our features' },
                            { name: 'Reviews', id: 'stats', tooltip: 'See what users are saying' },
                            { name: 'About', id: 'About', tooltip: 'Learn more about MealSwitch' }
                        ].map((item) => (
                            <a
                                key={item.name}
                                href={`#${item.id}`}
                                onClick={(e) => { e.preventDefault(); handleNavClick(item.id); }}
                                className="nav-link tooltip-host"
                                data-tooltip={item.tooltip}
                            >
                                {item.name}
                            </a>
                        ))}
                    </div>
                    <button className="nav-button">Get Started</button>
                </div>
            </nav>

            <main className="main-content">
                <section id="hero" ref={heroRef} className="hero-section">
                    <div className={`hero-badge ${isVisible.hero ? 'is-visible' : ''}`}>
                        <Sparkles className="hero-badge-icon" />
                        <span>Powered by Advanced AI</span>
                    </div>
                    <h1 className={`hero-title ${isVisible.hero ? 'is-visible' : ''}`} style={{ transitionDelay: '100ms' }}>
                        <span className="hero-title-gradient">MealSwitch</span>
                        <div className="hero-title-glow"></div>
                    </h1>
                    <p className={`hero-subtitle ${isVisible.hero ? 'is-visible' : ''}`} style={{ transitionDelay: '200ms' }}>
                        Transform your nutrition journey with
                        <span className="hero-subtitle-highlight"> ML-powered macro analysis with healthy substitutes</span>.
                    </p>

                    <div className={`input-module ${isVisible.hero ? 'is-visible' : ''}`} style={{ transitionDelay: '300ms' }}>
                        <div className="tab-selector">
                            <div className="tab-selector-bg">
                                {[
                                    { id: 'text', icon: Sparkles, label: 'Smart Text Input' },
                                    { id: 'image', icon: Camera, label: 'Image Analysis' }
                                ].map(({ id, icon: Icon, label }) => (
                                    <button key={id} onClick={() => setCurrentTab(id)} className={`tab-button ${currentTab === id ? 'active' : ''}`}>
                                        <Icon className="tab-icon" />
                                        <span>{label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="input-area">
                            {currentTab === 'text' ? (
                                <div className="text-input-container">
                                    <div className="input-field-wrapper">
                                        <input type="text" value={foodInput} onChange={(e) => setFoodInput(e.target.value)} placeholder="e.g., 'grilled salmon with quinoa'" className="text-input" />
                                        <Sparkles className="input-field-icon" />
                                    </div>
                                    <div className="suggestions">
                                        <span>Try:</span>
                                        {['Chicken Bowl', 'Protein Smoothie', 'Avocado Toast'].map((suggestion) => (
                                            <button key={suggestion} onClick={() => setFoodInput(suggestion)} className="suggestion-chip">
                                                {suggestion}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="image-input-container">
                                    <input type="file" accept="image/*" onChange={handleImageUpload} className="image-input-hidden" id="image-upload" />
                                    <label htmlFor="image-upload" className="image-drop-zone">
                                        {selectedImage ? (
                                            <img src={selectedImage} alt="Selected meal" className="image-preview" />
                                        ) : (
                                            <div className="image-drop-placeholder">
                                                <Upload className="upload-icon" />
                                                <p>Drop an image or click to upload</p>
                                            </div>
                                        )}
                                    </label>
                                </div>
                            )}
                            <button onClick={handleAnalyze} disabled={(!foodInput.trim() && !selectedImage) || isAnalyzing} className="analyze-button">
                                {isAnalyzing ? (<div className="spinner"></div>) : (
                                    <div className="analyze-button-content">
                                        <Brain />
                                        <span>Analyze with AI</span>
                                    </div>
                                )}
                            </button>
                        </div>
                    </div>

                  {/* This is the new button that opens the pop-up form */}
<div style={{ marginTop: '2rem' }}>
    <button onClick={() => setShowMealPlanForm(true)} className="cta-button-primary">
        <Zap />
        <span>Generate Personalized AI Meal Plan</span>
    </button>
</div>
                </section>

                <section id="features" ref={featuresRef} className="features-section">
                    <h2 className="section-title">Revolutionary Features</h2>
                    <p className="section-subtitle">Experience the future of nutrition analysis with cutting-edge AI.</p>
                    <div className="features-grid">
                        <FeatureCard icon={Brain} title="AI-Powered Analysis" description="Advanced algorithms analyze meals with over 95% accuracy." gradientClass="grad-purple" delay={0} />
                        <FeatureCard icon={Camera} title="Smart Image Recognition" description="Snap a photo of your meal and let our AI identify every ingredient." gradientClass="grad-blue" delay={150} />
                        <FeatureCard icon={TrendingUp} title="Personalized Insights" description="Get recommendations to optimize your diet based on your goals." gradientClass="grad-green" delay={300} />
                    </div>
                </section>

                <section id="demo" ref={demoRef} className="demo-section">
                    <h2 className="section-title">See It In Action</h2>
                    <p className="section-subtitle">From a simple description to a detailed breakdown in seconds.</p>
                    <div className="macros-grid">
                        <MacroCard icon={Flame} title="Calories" value="542" colorClass="color-red" description="Energy for your day" />
                        <MacroCard icon={Utensils} title="Protein" value="32g" colorClass="color-blue" description="For muscle repair" />
                        <MacroCard icon={Wheat} title="Carbs" value="45g" colorClass="color-green" description="For sustained energy" />
                        <MacroCard icon={Droplets} title="Fats" value="18g" colorClass="color-purple" description="For brain health" />
                    </div>
                </section>

                <section id="stats" ref={statsRef} className="stats-section">
                    <h2 className="section-title">Trusted by Thousands</h2>
                    <p className="section-subtitle">Join a growing community revolutionizing their nutrition journey.</p>
                    <div className="stats-grid">
                        {[
                            { icon: Users, value: '50K+', label: 'Active Users' },
                            { icon: BarChart3, value: '2M+', label: 'Meals Analyzed' },
                            { icon: Star, value: '4.9/5', label: 'User Rating' },
                            { icon: Award, value: '99.2%', label: 'Analysis Accuracy' }
                        ].map(({ icon: Icon, value, label }, index) => (
                            <div key={label} className={`stat-item ${isVisible.stats ? 'is-visible' : ''}`} style={{ transitionDelay: `${index * 150}ms` }}>
                                <div className="stat-icon-wrapper"><Icon /></div>
                                <div className="stat-value">{value}</div>
                                <div className="stat-label">{label}</div>
                            </div>
                        ))}
                    </div>
                    <div className={`testimonial-card ${isVisible.stats ? 'is-visible' : ''}`} style={{ transitionDelay: '300ms' }}>
                        <div className="testimonial-stars">
                            {[...Array(5)].map((_, i) => <Star key={i} />)}
                        </div>
                        <blockquote className="testimonial-quote">
                            "MealSwitch has completely transformed how I approach nutrition. The AI is incredibly accurate, and I love how easy it is to track my macros."
                        </blockquote>
                        <div className="testimonial-author">
                            <div className="author-avatar">SJ</div>
                            <div>
                                <div className="author-name">Sarah Johnson</div>
                                <div className="author-title">Fitness Coach & Nutritionist</div>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="cta" ref={ctaRef} className="cta-section">
                    <h2 className={`section-title ${isVisible.cta ? 'is-visible' : ''}`}>Ready to Transform Your Nutrition?</h2>
                    <p className={`section-subtitle ${isVisible.cta ? 'is-visible' : ''}`} style={{ transitionDelay: '150ms' }}>
                        Start your journey towards healthier living today. No credit card required.
                    </p>
                    <div className={`cta-buttons ${isVisible.cta ? 'is-visible' : ''}`} style={{ transitionDelay: '300ms' }}>
                        <button className="cta-button-primary">
                            <Sparkles />
                            <span>Start Free Trial</span>
                        </button>
                        <button className="cta-button-secondary">
                            <Play />
                            <span>Watch Demo</span>
                        </button>
                    </div>
                </section>

            </main>

            <footer className="footer">
                <div className="footer-content">
                    <div className="footer-column">
                        <div className="nav-logo-area">
                            <div className="nav-logo-icon-bg"><ChefHat className="nav-logo-icon" /></div>
                            <div>
                                <h1 className="nav-logo-title">MealSwitch</h1>
                                <p className="nav-logo-subtitle">AI Nutrition Analytics</p>
                            </div>
                        </div>
                    </div>
                    <div className="footer-column">
                        <h4>Product</h4>
                        <a href="#">Features</a>
                        <a href="#">Pricing</a>
                        <a href="#">API Access</a>
                    </div>
                    <div className="footer-column">
                        <h4>Company</h4>
                        <a href="#">About Us</a>
                        <a href="#">Careers</a>
                        <a href="#">Press</a>
                    </div>
                    <div className="footer-column">
                        <h4>Resources</h4>
                        <a href="#">Blog</a>
                        <a href="#">Help Center</a>
                        <a href="#">Privacy</a>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>© 2025 MealSwitch. All rights reserved.</p>
                </div>
            </footer>

            <style jsx>{`
                .app-container {
                    min-height: 100vh;
                    position: relative;
                    overflow-y: auto;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    width:98.5vw;
                     overflow: hidden; 
                }

               

                .threejs-canvas {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    z-index: 0;
                    pointer-events: none;
                }


                .floating-action-menu {
                    position: fixed;
                    right: 2rem;
                    top: 50%;
                    transform: translateY(-50%);
                    z-index: 1000;
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .floating-menu-button {
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    border: none;
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(10px);
                    color: white;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s ease;
                }

                .floating-menu-button:hover,
                .floating-menu-button.active {
                    background: rgba(255, 255, 255, 0.2);
                    transform: scale(1.1);
                }

                .main-nav {
                    position: relative;
                    z-index: 100;
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(10px);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                }

                .nav-content {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 1rem 2rem;
                    max-width: 1200px;
                    margin: 0 auto;
                }

                .nav-logo-area {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }

                .nav-logo-icon-bg {
                    width: 40px;
                    height: 40px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .nav-logo-icon {
                    width: 24px;
                    height: 24px;
                    color: white;
                }

                .nav-logo-title {
                    font-size: 1.25rem;
                    font-weight: bold;
                    margin: 0;
                    color: white;
                }

                .nav-logo-subtitle {
                    font-size: 0.8rem;
                    margin: 0;
                    color: rgba(255, 255, 255, 0.7);
                }

                .nav-links {
                    display: flex;
                    gap: 2rem;
                }

                .nav-link {
                    color: white;
                    text-decoration: none;
                    font-weight: 500;
                    transition: color 0.3s ease;
                }

                .nav-link:hover {
                    color: #ffd700;
                }

                .nav-button {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border: none;
                    color: white;
                    padding: 0.75rem 1.5rem;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .nav-button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
                }

                .main-content {
                    position: relative;
                    z-index: 10;
                }

                .hero-section {
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    padding: 2rem;
                    color: white;
                }

                .hero-badge {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    background: rgba(255, 255, 255, 0.1);
                    padding: 0.5rem 1rem;
                    border-radius: 50px;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    margin-bottom: 2rem;
                    opacity: 0;
                    transform: translateY(20px);
                    transition: all 0.8s ease;
                }

                .hero-badge.is-visible {
                    opacity: 1;
                    transform: translateY(0);
                }

                .hero-badge-icon {
                    width: 16px;
                    height: 16px;
                    color: #ffd700;
                }

                .hero-title {
                    position: relative;
                    font-size: clamp(3rem, 8vw, 6rem);
                    font-weight: bold;
                    margin: 0 0 1rem 0;
                    opacity: 0;
                    transform: translateY(30px);
                    transition: all 1s ease;
                }

                .hero-title.is-visible {
                    opacity: 1;
                    transform: translateY(0);
                }

                .hero-title-gradient {
                    background: linear-gradient(135deg, #ffd700 0%, #ff6b6b 50%, #4ecdc4 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .hero-title-glow {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: linear-gradient(135deg, #ffd700 0%, #ff6b6b 50%, #4ecdc4 100%);
                    filter: blur(20px);
                    opacity: 0.3;
                    z-index: -1;
                }

                .hero-subtitle {
                    font-size: 1.25rem;
                    margin: 0 0 3rem 0;
                    max-width: 600px;
                    opacity: 0;
                    transform: translateY(20px);
                    transition: all 0.8s ease;
                }

                .hero-subtitle.is-visible {
                    opacity: 1;
                    transform: translateY(0);
                }

                .hero-subtitle-highlight {
                    color: #ffd700;
                    font-weight: 600;
                }

                .input-module {
                    width: 100%;
                    max-width: 600px;
                    opacity: 0;
                    transform: translateY(30px);
                    transition: all 1s ease;
                }

                .input-module.is-visible {
                    opacity: 1;
                    transform: translateY(0);
                }

                .tab-selector {
                    margin-bottom: 1.5rem;
                }

                .tab-selector-bg {
                    display: flex;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    padding: 0.25rem;
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }

                .tab-button {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    padding: 0.75rem 1rem;
                    border: none;
                    background: transparent;
                    color: rgba(255, 255, 255, 0.7);
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    font-weight: 500;
                }

                .tab-button.active {
                    background: rgba(255, 255, 255, 0.2);
                    color: white;
                }

                .tab-icon {
                    width: 18px;
                    height: 18px;
                }

                .input-area {
                   background-color: #292524;
                    border-radius: 16px;
                    padding: 1.5rem;
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }

                .text-input-container {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .input-field-wrapper {
                    position: relative;
                }

                .text-input {
                    width: 88%;
                    padding: 1rem 3rem 1rem 1rem;
                    border: 2px solid rgba(255, 255, 255, 0.2);
                    border-radius: 12px;
                    background: rgba(255, 255, 255, 0.1);
                    color: white;
                    font-size: 1rem;
                    backdrop-filter: blur(10px);
                    transition: all 0.3s ease;
                }

                .text-input::placeholder {
                    color: rgba(255, 255, 255, 0.5);
                }

                .text-input:focus {
                    outline: none;
                    border-color: #ffd700;
                    box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
                }

                .input-field-icon {
                    position: absolute;
                    right: 1rem;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 20px;
                    height: 20px;
                    color: #ffd700;
                }

                .suggestions {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    flex-wrap: wrap;
                }

                .suggestions span {
                    color: rgba(255, 255, 255, 0.7);
                    font-size: 0.9rem;
                }

                .suggestion-chip {
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    color: white;
                    padding: 0.25rem 0.75rem;
                    border-radius: 20px;
                    font-size: 0.85rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .suggestion-chip:hover {
                    background: rgba(255, 255, 255, 0.2);
                    border-color: #ffd700;
                }

                .image-input-container {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .image-input-hidden {
                    display: none;
                }

                .image-drop-zone {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 200px;
                    border: 2px dashed rgba(255, 255, 255, 0.3);
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    background: rgba(255, 255, 255, 0.05);
                }

                .image-drop-zone:hover {
                    border-color: #ffd700;
                    background: rgba(255, 255, 255, 0.1);
                }

                .image-drop-placeholder {
                    text-align: center;
                    color: rgba(255, 255, 255, 0.7);
                }

                .upload-icon {
                    width: 48px;
                    height: 48px;
                    margin: 0 auto 1rem;
                    color: #ffd700;
                }

                .image-preview {
                    max-width: 100%;
                    max-height: 200px;
                    border-radius: 8px;
                    object-fit: cover;
                }

                .analyze-button {
                    width: 100%;
                    padding: 1rem;
                    margin-top: 1rem;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border: none;
                    border-radius: 12px;
                    color: white;
                    font-size: 1.1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    position: relative;
                    overflow: hidden;
                }

                .analyze-button:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
                }

                .analyze-button:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .analyze-button-content {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                }

                .spinner {
                    width: 24px;
                    height: 24px;
                    border: 2px solid rgba(255, 255, 255, 0.3);
                    border-top: 2px solid white;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                .features-section,
                .demo-section,
                .stats-section,
                .cta-section {
                    padding: 5rem 2rem;
                    text-align: center;
                    color: white;
                    position: relative;
                    z-index: 10;
                }

                .section-title {
                    font-size: 2.5rem;
                    font-weight: bold;
                    margin: 0 0 1rem 0;
                    background: linear-gradient(135deg, #ffd700 0%, #ff6b6b 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .section-subtitle {
                    font-size: 1.2rem;
                    margin: 0 0 3rem 0;
                    color: rgba(255, 255, 255, 0.8);
                    max-width: 600px;
                    margin-left: auto;
                    margin-right: auto;
                }

                .features-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 2rem;
                    max-width: 1200px;
                    margin: 0 auto;
                }

                .feature-card {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 16px;
                    padding: 2rem;
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    transition: all 0.8s ease;
                    opacity: 0;
                    transform: translateY(30px);
                }

                .feature-card.is-visible {
                    opacity: 1;
                    transform: translateY(0);
                }

                .feature-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2);
                }

                .feature-card-icon-wrapper {
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 1rem;
                }

                .grad-purple {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                }

                .grad-blue {
                    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
                }

                .grad-green {
                    background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
                }

                .feature-card-icon {
                    width: 30px;
                    height: 30px;
                    color: white;
                }

                .feature-card-title {
                    font-size: 1.3rem;
                    font-weight: bold;
                    margin: 0 0 1rem 0;
                    color: white;
                }

                .feature-card-description {
                    margin: 0;
                    color: rgba(255, 255, 255, 0.8);
                    line-height: 1.6;
                }

                .macros-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 1.5rem;
                    max-width: 1000px;
                    margin: 0 auto;
                }

                .macro-card {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 16px;
                    padding: 2rem;
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    transition: all 0.3s ease;
                    position: relative;
                    overflow: hidden;
                }

                .macro-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 4px;
                    background: linear-gradient(90deg, #ff6b6b, #ffd700);
                }

                .macro-card.color-red::before {
                    background: linear-gradient(90deg, #ff6b6b, #ff8e8e);
                }

                .macro-card.color-blue::before {
                    background: linear-gradient(90deg, #4facfe, #7dd3fc);
                }

                .macro-card.color-green::before {
                    background: linear-gradient(90deg, #43e97b, #86efac);
                }

                .macro-card.color-purple::before {
                    background: linear-gradient(90deg, #667eea, #a78bfa);
                }

                .macro-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2);
                }

                .macro-card-content {
                    text-align: center;
                }

                .macro-card-icon {
                    width: 40px;
                    height: 40px;
                    color: #ffd700;
                    margin: 0 auto 1rem;
                }

                .macro-card-value {
                    font-size: 2rem;
                    font-weight: bold;
                    margin: 0 0 0.5rem 0;
                    color: white;
                }

                .macro-card-title {
                    font-size: 1.1rem;
                    font-weight: 600;
                    margin: 0 0 0.5rem 0;
                    color: white;
                }

                .macro-card-description {
                    margin: 0;
                    color: rgba(255, 255, 255, 0.7);
                    font-size: 0.9rem;
                }

                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 2rem;
                    max-width: 800px;
                    margin: 0 auto 3rem;
                }

                .stat-item {
                    text-align: center;
                    opacity: 0;
                    transform: translateY(30px);
                    transition: all 0.8s ease;
                }

                .stat-item.is-visible {
                    opacity: 1;
                    transform: translateY(0);
                }

                .stat-icon-wrapper {
                    width: 60px;
                    height: 60px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 1rem;
                }

                .stat-icon-wrapper svg {
                    width: 30px;
                    height: 30px;
                    color: white;
                }

                .stat-value {
                    font-size: 2.5rem;
                    font-weight: bold;
                    color: #ffd700;
                    margin-bottom: 0.5rem;
                }

                .stat-label {
                    color: rgba(255, 255, 255, 0.8);
                    font-weight: 500;
                }

                .testimonial-card {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 16px;
                    padding: 2rem;
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    max-width: 600px;
                    margin: 0 auto;
                    opacity: 0;
                    transform: translateY(30px);
                    transition: all 0.8s ease;
                }

                .testimonial-card.is-visible {
                    opacity: 1;
                    transform: translateY(0);
                }

                .testimonial-stars {
                    display: flex;
                    justify-content: center;
                    gap: 0.25rem;
                    margin-bottom: 1rem;
                }

                .testimonial-stars svg {
                    width: 20px;
                    height: 20px;
                    color: #ffd700;
                    fill: currentColor;
                }

                .testimonial-quote {
                    font-style: italic;
                    margin: 0 0 1.5rem 0;
                    color: rgba(255, 255, 255, 0.9);
                    line-height: 1.6;
                }

                .testimonial-author {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    justify-content: center;
                }

                .author-avatar {
                    width: 50px;
                    height: 50px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: bold;
                }

                .author-name {
                    font-weight: 600;
                    color: white;
                    margin: 0;
                }

                .author-title {
                    font-size: 0.9rem;
                    color: rgba(255, 255, 255, 0.7);
                    margin: 0;
                }

                .cta-buttons {
                    display: flex;
                    gap: 1rem;
                    justify-content: center;
                    flex-wrap: wrap;
                    opacity: 0;
                    transform: translateY(20px);
                    transition: all 0.8s ease;
                }

                .cta-buttons.is-visible {
                    opacity: 1;
                    transform: translateY(0);
                }

                .cta-button-primary,
                .cta-button-secondary {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 1rem 2rem;
                    border-radius: 12px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    text-decoration: none;
                    border: none;
                    font-size: 1rem;
                }

                .cta-button-primary {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                }

                .cta-button-secondary {
                    background: rgba(255, 255, 255, 0.1);
                    color: white;
                    border: 2px solid rgba(255, 255, 255, 0.2);
                }

                .cta-button-primary:hover,
                .cta-button-secondary:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
                }

                .footer {
                    background: rgba(0, 0, 0, 0.3);
                    color: white;
                    padding: 3rem 2rem 1rem;
                    position: relative;
                    z-index: 10;
                }

                .footer-content {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 2rem;
                    max-width: 1200px;
                    margin: 0 auto;
                }

                .footer-column h4 {
                    margin: 0 0 1rem 0;
                    color: #ffd700;
                    font-weight: 600;
                }

                .footer-column a {
                    display: block;
                    color: rgba(255, 255, 255, 0.7);
                    text-decoration: none;
                    margin-bottom: 0.5rem;
                    transition: color 0.3s ease;
                }

                .footer-column a:hover {
                    color: white;
                }

                .footer-bottom {
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                    margin-top: 2rem;
                    padding-top: 1rem;
                    text-align: center;
                }

                .footer-bottom p {
                    margin: 0;
                    color: rgba(255, 255, 255, 0.5);
                }

                .error-container {
                    position: fixed;
                    top: 2rem;
                    right: 2rem;
                    background: rgba(239, 68, 68, 0.95);
                    color: white;
                    padding: 1rem 1.5rem;
                    border-radius: 12px;
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    z-index: 1000;
                    max-width: 400px;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                }

                .error-icon {
                    width: 24px;
                    height: 24px;
                    color: #fecaca;
                    margin-bottom: 0.5rem;
                }

                .error-container h3 {
                    margin: 0 0 0.5rem 0;
                    font-size: 1.1rem;
                }

                .error-container p {
                    margin: 0 0 1rem 0;
                    font-size: 0.9rem;
                    line-height: 1.4;
                }

                .dismiss-button {
                    background: rgba(255, 255, 255, 0.2);
                    border: none;
                    color: white;
                    padding: 0.5rem;
                    border-radius: 6px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.9rem;
                    transition: all 0.3s ease;
                }

                .dismiss-button:hover {
                    background: rgba(255, 255, 255, 0.3);
                }

                @media (max-width: 768px) {
                    .nav-content {
                        padding: 1rem;
                        flex-direction: column;
                        gap: 1rem;
                    }

                    .nav-links {
                        gap: 1rem;
                    }

                    .hero-section {
                        padding: 1rem;
                        min-height: 90vh;
                    }

                    .hero-title {
                        font-size: 3rem;
                    }

                    .hero-subtitle {
                        font-size: 1rem;
                    }

                    .input-module {
                        width: 100%;
                        max-width: none;
                    }

                    .tab-selector-bg {
                        flex-direction: column;
                    }

                    .features-grid {
                        grid-template-columns: 1fr;
                        gap: 1.5rem;
                    }

                    .macros-grid {
                        grid-template-columns: repeat(2, 1fr);
                        gap: 1rem;
                    }

                    .stats-grid {
                        grid-template-columns: repeat(2, 1fr);
                        gap: 1.5rem;
                    }

                    .cta-buttons {
                        flex-direction: column;
                        align-items: center;
                    }

                    .floating-action-menu {
                        right: 1rem;
                    }

                    .floating-menu-button {
                        width: 45px;
                        height: 45px;
                    }

                    .error-container {
                        top: 1rem;
                        right: 1rem;
                        left: 1rem;
                        max-width: none;
                    }
                }

                @media (max-width: 480px) {
                    .macros-grid {
                        grid-template-columns: 1fr;
                    }

                    .stats-grid {
                        grid-template-columns: 1fr;
                    }

                    .section-title {
                        font-size: 2rem;
                    }

                    .section-subtitle {
                        font-size: 1rem;
                    }
             // Inside the final <style jsx> block in App.jsx

/* ... all of your other existing CSS for the main page ... */


.open-chatbot-button:hover {
    transform: scale(1.1);
}




                }
            `}</style>
        </div>
    );
};

export default App;
