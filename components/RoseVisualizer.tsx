
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { generateRosePoints, generateRandomPoints } from '../utils/geometry';

interface RoseVisualizerProps {
  assembled: boolean;
}

const RoseVisualizer: React.FC<RoseVisualizerProps> = ({ assembled }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const pointsCount = 2000;
  const particlesRef = useRef<THREE.Points | null>(null);
  const targetPositionsRef = useRef<Float32Array | null>(null);
  const initialPositionsRef = useRef<Float32Array | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 12;
    camera.position.y = 0;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    // 2. Post-processing (Bloom)
    const renderScene = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      2.0, // strength
      0.5, // radius
      0.7  // threshold
    );
    const composer = new EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);

    // 3. Particle System Geometry
    const geometry = new THREE.BufferGeometry();
    const initialPos = generateRandomPoints(pointsCount, 15);
    const targetPos = generateRosePoints(pointsCount);
    
    initialPositionsRef.current = initialPos;
    targetPositionsRef.current = targetPos;

    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(initialPos), 3));

    // Custom star texture
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
      gradient.addColorStop(0.2, 'rgba(150, 220, 255, 0.8)');
      gradient.addColorStop(0.5, 'rgba(50, 80, 200, 0.3)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 64, 64);
    }
    const texture = new THREE.CanvasTexture(canvas);

    // Color mixing (Vibrant Blues and Lavenders)
    const colors = new Float32Array(pointsCount * 3);
    for (let i = 0; i < pointsCount; i++) {
      const isFlower = i < pointsCount * 0.75;
      if (isFlower) {
        // Petal colors: deep blue to light cyan
        const mix = Math.random();
        colors[i * 3] = 0.2 + mix * 0.2;     // R
        colors[i * 3 + 1] = 0.4 + mix * 0.4; // G
        colors[i * 3 + 2] = 0.9 + mix * 0.1; // B
      } else {
        // Stem/Leaf colors: deep emerald/teal
        colors[i * 3] = 0.05;
        colors[i * 3 + 1] = 0.3 + Math.random() * 0.2;
        colors[i * 3 + 2] = 0.4 + Math.random() * 0.2;
      }
    }
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.18,
      map: texture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
      depthWrite: false,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);
    particlesRef.current = particles;

    // 4. Animation Logic
    let animationFrameId: number;
    const lerpFactor = 0.04;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (particlesRef.current && targetPositionsRef.current && initialPositionsRef.current) {
        const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
        const target = assembled ? targetPositionsRef.current : initialPositionsRef.current;

        for (let i = 0; i < pointsCount * 3; i++) {
          positions[i] += (target[i] - positions[i]) * lerpFactor;
        }
        particlesRef.current.geometry.attributes.position.needsUpdate = true;
        
        // Gentle rotation
        particlesRef.current.rotation.y += 0.002;
        // Subtle swaying
        particlesRef.current.rotation.z = Math.sin(Date.now() * 0.001) * 0.05;
      }

      composer.render();
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      composer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      mountRef.current?.removeChild(renderer.domElement);
      geometry.dispose();
      material.dispose();
      texture.dispose();
    };
  }, [assembled]);

  return <div ref={mountRef} className="absolute inset-0 z-0" />;
};

export default RoseVisualizer;
