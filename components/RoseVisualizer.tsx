
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { generateRosePoints, generateRandomPoints } from '../utils/geometry.ts';

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
    
    console.log("Three.js: Initializing Renderer...");

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 12;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: true,
        powerPreference: "high-performance"
      });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x050510, 1);
      mountRef.current.appendChild(renderer.domElement);
    } catch (e) {
      console.error("Three.js: Renderer failed!", e);
      return;
    }

    const renderScene = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      2.0, 
      0.5, 
      0.7 
    );
    const composer = new EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);

    const geometry = new THREE.BufferGeometry();
    const initialPos = generateRandomPoints(pointsCount, 15);
    const targetPos = generateRosePoints(pointsCount);
    
    initialPositionsRef.current = initialPos;
    targetPositionsRef.current = targetPos;

    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(initialPos), 3));

    const canvas = document.createElement('canvas');
    canvas.width = 64; canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 64, 64);
    }
    const texture = new THREE.CanvasTexture(canvas);

    const colors = new Float32Array(pointsCount * 3);
    for (let i = 0; i < pointsCount; i++) {
      const isFlower = i < pointsCount * 0.75;
      if (isFlower) {
        colors[i * 3] = 0.2 + Math.random() * 0.2;
        colors[i * 3 + 1] = 0.4 + Math.random() * 0.4;
        colors[i * 3 + 2] = 0.9;
      } else {
        colors[i * 3] = 0.1;
        colors[i * 3 + 1] = 0.4;
        colors[i * 3 + 2] = 0.4;
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

    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (particlesRef.current && targetPositionsRef.current && initialPositionsRef.current) {
        const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
        const target = assembled ? targetPositionsRef.current : initialPositionsRef.current;

        for (let i = 0; i < pointsCount * 3; i++) {
          positions[i] += (target[i] - positions[i]) * 0.04;
        }
        particlesRef.current.geometry.attributes.position.needsUpdate = true;
        particlesRef.current.rotation.y += 0.002;
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

  return <div ref={mountRef} className="absolute inset-0 z-0 bg-[#050510]" />;
};

export default RoseVisualizer;
