
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { generateRosePoints, generateRandomPoints } from '../utils/geometry';

interface RoseVisualizerProps {
  assembled: boolean;
}

const RoseVisualizer: React.FC<RoseVisualizerProps> = ({ assembled }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const pointsCount = 2000;
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // 1. 初始化場景
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 10;

    // 2. 渲染器設置
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: true,
        powerPreference: "high-performance"
      });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      mountRef.current.appendChild(renderer.domElement);
      rendererRef.current = renderer;
    } catch (e) {
      console.error("Three.js: WebGL Not Supported", e);
      return;
    }

    // 3. 後期處理 (Bloom)
    const renderScene = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      2.5, // Bloom Strength
      0.6, // Radius
      0.8  // Threshold
    );
    const composer = new EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);

    // 4. 粒子幾何體
    const geometry = new THREE.BufferGeometry();
    const initialPos = generateRandomPoints(pointsCount, 15);
    const targetPos = generateRosePoints(pointsCount);
    
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(initialPos), 3));

    // 創建發光粒子貼圖
    const canvas = document.createElement('canvas');
    canvas.width = 64; canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
      gradient.addColorStop(0.2, 'rgba(100, 200, 255, 0.8)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 64, 64);
    }
    const texture = new THREE.CanvasTexture(canvas);

    // 顏色屬性
    const colors = new Float32Array(pointsCount * 3);
    for (let i = 0; i < pointsCount; i++) {
      const isFlower = i < pointsCount * 0.75;
      if (isFlower) {
        colors[i * 3] = 0.1; // R
        colors[i * 3 + 1] = 0.3 + Math.random() * 0.4; // G
        colors[i * 3 + 2] = 0.9; // B (Blue Rose)
      } else {
        colors[i * 3] = 0.05;
        colors[i * 3 + 1] = 0.2;
        colors[i * 3 + 2] = 0.4;
      }
    }
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.15,
      map: texture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
      depthWrite: false,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // 5. 動畫循環
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const positions = geometry.attributes.position.array as Float32Array;
      const target = assembled ? targetPos : initialPos;

      for (let i = 0; i < pointsCount * 3; i++) {
        // 平滑插值
        positions[i] += (target[i] - positions[i]) * 0.05;
      }
      geometry.attributes.position.needsUpdate = true;
      
      particles.rotation.y += 0.002;
      composer.render();
    };

    animate();

    // 6. 響應式調整
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
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      texture.dispose();
      renderer.dispose();
    };
  }, [assembled]);

  return <div ref={mountRef} className="absolute inset-0 z-0 bg-[#050510]" />;
};

export default RoseVisualizer;
