import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const Background3D = React.memo(() => {
    const mountRef = useRef(null);

    useEffect(() => {
        if (!mountRef.current) return;
        const currentMount = mountRef.current;

        // Check if scene already exists to prevent re-rendering
        if (window.healthSceneInstance) {
            currentMount.appendChild(window.healthSceneInstance.renderer.domElement);
            window.healthSceneInstance.mount = currentMount;
            return () => {
                if (window.healthSceneInstance && window.healthSceneInstance.renderer.domElement.parentNode === currentMount) {
                    currentMount.removeChild(window.healthSceneInstance.renderer.domElement);
                }
            };
        }

        // === SCENE SETUP ===
        const scene = new THREE.Scene();
        scene.fog = new THREE.Fog(0x0f0f23, 50, 200);

        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 0, 20);

        const renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance'
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        currentMount.appendChild(renderer.domElement);

        // === ENERGY ORB MATERIAL ===
        const createEnergyOrbMaterial = (color, intensity = 1.0) => {
            return new THREE.ShaderMaterial({
                uniforms: {
                    uTime: { value: 0 },
                    uColor: { value: new THREE.Color(color) },
                    uIntensity: { value: intensity },
                    uPulseSpeed: { value: 2.0 },
                    uNoiseScale: { value: 1.5 }
                },
                vertexShader: `
                uniform float uTime;
                uniform float uNoiseScale;
                varying vec3 vNormal;
                varying vec3 vPosition;
                varying vec2 vUv;
                
                // Simplex noise
                vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
                vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
                vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
                vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
                
                float snoise(vec3 v) {
                    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
                    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
                    
                    vec3 i = floor(v + dot(v, C.yyy));
                    vec3 x0 = v - i + dot(i, C.xxx);
                    
                    vec3 g = step(x0.yzx, x0.xyz);
                    vec3 l = 1.0 - g;
                    vec3 i1 = min(g.xyz, l.zxy);
                    vec3 i2 = max(g.xyz, l.zxy);
                    
                    vec3 x1 = x0 - i1 + C.xxx;
                    vec3 x2 = x0 - i2 + C.yyy;
                    vec3 x3 = x0 - D.yyy;
                    
                    i = mod289(i);
                    vec4 p = permute(permute(permute(
                        i.z + vec4(0.0, i1.z, i2.z, 1.0))
                        + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                        + i.x + vec4(0.0, i1.x, i2.x, 1.0));
                    
                    float n_ = 0.142857142857;
                    vec3 ns = n_ * D.wyz - D.xzx;
                    
                    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
                    vec4 x_ = floor(j * ns.z);
                    vec4 y_ = floor(j - 7.0 * x_);
                    
                    vec4 x = x_ *ns.x + ns.yyyy;
                    vec4 y = y_ *ns.x + ns.yyyy;
                    vec4 h = 1.0 - abs(x) - abs(y);
                    
                    vec4 b0 = vec4(x.xy, y.xy);
                    vec4 b1 = vec4(x.zw, y.zw);
                    
                    vec4 s0 = floor(b0)*2.0 + 1.0;
                    vec4 s1 = floor(b1)*2.0 + 1.0;
                    vec4 sh = -step(h, vec4(0.0));
                    
                    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
                    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
                    
                    vec3 p0 = vec3(a0.xy, h.x);
                    vec3 p1 = vec3(a0.zw, h.y);
                    vec3 p2 = vec3(a1.xy, h.z);
                    vec3 p3 = vec3(a1.zw, h.w);
                    
                    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
                    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
                    
                    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
                    m = m * m;
                    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
                }
                
                void main() {
                    vUv = uv;
                    vNormal = normalize(normalMatrix * normal);
                    
                    vec3 pos = position;
                    
                    // Energy surface distortion
                    float noise1 = snoise(pos * uNoiseScale + uTime * 0.5);
                    float noise2 = snoise(pos * uNoiseScale * 2.0 + uTime * 0.3);
                    
                    pos += normal * (noise1 * 0.3 + noise2 * 0.15);
                    
                    // Pulsing effect
                    float pulse = sin(uTime * 3.0) * 0.1 + 1.0;
                    pos *= pulse;
                    
                    vPosition = pos;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
            `,
                fragmentShader: `
                uniform float uTime;
                uniform vec3 uColor;
                uniform float uIntensity;
                uniform float uPulseSpeed;
                
                varying vec3 vNormal;
                varying vec3 vPosition;
                varying vec2 vUv;
                
                void main() {
                    vec3 viewDirection = normalize(cameraPosition - vPosition);
                    vec3 normal = normalize(vNormal);
                    
                    // Fresnel effect for energy glow
                    float fresnel = pow(1.0 - max(dot(viewDirection, normal), 0.0), 2.0);
                    
                    // Energy core
                    float core = 1.0 - fresnel;
                    core = pow(core, 3.0);
                    
                    // Pulsing energy
                    float pulse = sin(uTime * uPulseSpeed) * 0.3 + 0.7;
                    
                    // Energy rings
                    float rings = sin(vPosition.y * 10.0 + uTime * 2.0) * 0.5 + 0.5;
                    rings = pow(rings, 4.0);
                    
                    // Color mixing
                    vec3 energyColor = uColor;
                    energyColor += uColor * fresnel * 2.0; // Rim glow
                    energyColor += vec3(0.8, 0.9, 1.0) * core * 0.5; // Core brightness
                    energyColor += uColor * rings * 0.3; // Energy rings
                    
                    energyColor *= pulse * uIntensity;
                    
                    // Alpha for translucency
                    float alpha = fresnel * 0.8 + core * 0.3;
                    alpha *= pulse;
                    alpha = clamp(alpha, 0.1, 0.9);
                    
                    gl_FragColor = vec4(energyColor, alpha);
                }
            `,
                transparent: true,
                side: THREE.DoubleSide,
                blending: THREE.AdditiveBlending
            });
        };

        // === FLOATING ENERGY ORBS ===
        const energyOrbs = [];
        const orbCount = 8;

        const orbColors = [
            '#00f5ff', // Electric cyan
            '#ff006e', // Hot pink
            '#8338ec', // Purple
            '#3a86ff', // Blue
            '#06ffa5', // Mint green
            '#ffbe0b', // Golden yellow
            '#fb5607', // Orange red
            '#ff4081'  // Bright pink
        ];

        for (let i = 0; i < orbCount; i++) {
            const orbGeometry = new THREE.SphereGeometry(1.5 + Math.random() * 1, 32, 32);
            const orbMaterial = createEnergyOrbMaterial(orbColors[i], 1.2 + Math.random() * 0.8);
            const orb = new THREE.Mesh(orbGeometry, orbMaterial);

            const angle = (i / orbCount) * Math.PI * 2;
            const radius = 8 + Math.random() * 6;
            const height = (Math.random() - 0.5) * 10;

            orb.position.set(
                Math.cos(angle) * radius,
                height,
                Math.sin(angle) * radius + (Math.random() - 0.5) * 5
            );

            orb.userData = {
                originalPosition: orb.position.clone(),
                floatSpeed: 0.5 + Math.random() * 1.0,
                rotateSpeed: 0.3 + Math.random() * 0.7,
                orbitSpeed: 0.1 + Math.random() * 0.3,
                orbitRadius: 2 + Math.random() * 3,
                phaseOffset: Math.random() * Math.PI * 2
            };

            energyOrbs.push(orb);
            scene.add(orb);
        }

        // === ENERGY TRAILS ===
        const createEnergyTrail = (startOrb, endOrb, color) => {
            const trailMaterial = new THREE.ShaderMaterial({
                uniforms: {
                    uTime: { value: 0 },
                    uColor: { value: new THREE.Color(color) },
                    uOpacity: { value: 0.4 }
                },
                vertexShader: `
                uniform float uTime;
                varying float vAlpha;
                
                void main() {
                    vAlpha = sin(position.x * 0.1 + uTime * 2.0) * 0.5 + 0.5;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
                fragmentShader: `
                uniform vec3 uColor;
                uniform float uOpacity;
                varying float vAlpha;
                
                void main() {
                    gl_FragColor = vec4(uColor, vAlpha * uOpacity);
                }
            `,
                transparent: true,
                blending: THREE.AdditiveBlending
            });

            const points = [];
            for (let i = 0; i <= 20; i++) {
                const t = i / 20;
                const pos = new THREE.Vector3().lerpVectors(startOrb.position, endOrb.position, t);
                points.push(pos);
            }

            const trailGeometry = new THREE.BufferGeometry().setFromPoints(points);
            const trail = new THREE.Line(trailGeometry, trailMaterial);

            trail.userData = { startOrb, endOrb, material: trailMaterial };
            return trail;
        };

        const energyTrails = [];
        for (let i = 0; i < orbCount - 1; i += 2) {
            if (energyOrbs[i + 1]) {
                const trail = createEnergyTrail(energyOrbs[i], energyOrbs[i + 1], orbColors[i]);
                energyTrails.push(trail);
                scene.add(trail);
            }
        }

        // === AMBIENT ENERGY PARTICLES ===
        const createAmbientParticles = () => {
            const particleCount = 200;
            const particles = new Float32Array(particleCount * 3);
            const colors = new Float32Array(particleCount * 3);

            for (let i = 0; i < particleCount; i++) {
                const i3 = i * 3;

                particles[i3] = (Math.random() - 0.5) * 50;
                particles[i3 + 1] = (Math.random() - 0.5) * 50;
                particles[i3 + 2] = (Math.random() - 0.5) * 30;

                const color = new THREE.Color(orbColors[Math.floor(Math.random() * orbColors.length)]);
                colors[i3] = color.r;
                colors[i3 + 1] = color.g;
                colors[i3 + 2] = color.b;
            }

            const particleGeometry = new THREE.BufferGeometry();
            particleGeometry.setAttribute('position', new THREE.BufferAttribute(particles, 3));
            particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

            const particleMaterial = new THREE.PointsMaterial({
                size: 0.5,
                transparent: true,
                opacity: 0.6,
                vertexColors: true,
                blending: THREE.AdditiveBlending
            });

            return new THREE.Points(particleGeometry, particleMaterial);
        };

        const ambientParticles = createAmbientParticles();
        scene.add(ambientParticles);

        // === LIGHTING ===
        const ambientLight = new THREE.AmbientLight(0x1a1a2e, 0.2);
        scene.add(ambientLight);

        const keyLight = new THREE.DirectionalLight(0x00f5ff, 0.5);
        keyLight.position.set(10, 10, 5);
        scene.add(keyLight);

        const fillLight = new THREE.DirectionalLight(0xff006e, 0.3);
        fillLight.position.set(-10, -5, -5);
        scene.add(fillLight);

        // === ANIMATION LOOP ===
        const clock = new THREE.Clock();
        let animationId;

        const animate = () => {
            const elapsedTime = clock.getElapsedTime();

            energyOrbs.forEach((orb) => {
                const userData = orb.userData;
                const time = elapsedTime + userData.phaseOffset;

                orb.material.uniforms.uTime.value = elapsedTime;

                orb.position.x = userData.originalPosition.x +
                    Math.cos(time * userData.orbitSpeed) * userData.orbitRadius +
                    Math.sin(time * userData.floatSpeed) * 1;

                orb.position.y = userData.originalPosition.y +
                    Math.sin(time * userData.floatSpeed) * 3 +
                    Math.cos(time * userData.orbitSpeed * 0.7) * 2;

                orb.position.z = userData.originalPosition.z +
                    Math.sin(time * userData.orbitSpeed) * userData.orbitRadius * 0.5 +
                    Math.cos(time * userData.floatSpeed * 0.8) * 1.5;

                orb.rotation.x += userData.rotateSpeed * 0.01;
                orb.rotation.y += userData.rotateSpeed * 0.015;
            });

            energyTrails.forEach((trail) => {
                const { startOrb, endOrb, material } = trail.userData;
                material.uniforms.uTime.value = elapsedTime;

                const points = [];
                for (let i = 0; i <= 20; i++) {
                    const t = i / 20;
                    const pos = new THREE.Vector3().lerpVectors(startOrb.position, endOrb.position, t);
                    pos.y += Math.sin(t * Math.PI) * 2;
                    points.push(pos);
                }
                trail.geometry.setFromPoints(points);
            });

            ambientParticles.rotation.y += 0.001;

            camera.position.x = Math.sin(elapsedTime * 0.1) * 2;
            camera.position.y = Math.cos(elapsedTime * 0.08) * 1.5;
            camera.lookAt(new THREE.Vector3(0, 0, 0));

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

        // Store instance for persistent WebGL context reuse
        window.healthSceneInstance = {
            scene,
            camera,
            renderer,
            energyOrbs,
            animationId,
            mount: currentMount,
            cleanup: () => {
                if (animationId) cancelAnimationFrame(animationId);
                window.removeEventListener('resize', handleResize);

                scene.traverse((object) => {
                    if (object.geometry) object.geometry.dispose();
                    if (object.material) {
                        if (Array.isArray(object.material)) {
                            object.material.forEach((mat) => mat.dispose());
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

        return () => {
            if (window.healthSceneInstance && window.healthSceneInstance.renderer.domElement.parentNode === currentMount) {
                currentMount.removeChild(window.healthSceneInstance.renderer.domElement);
            }
        };
    }, []);

    return <div ref={mountRef} className="threejs-canvas" style={{ pointerEvents: 'none' }} />;
});

export default Background3D;
