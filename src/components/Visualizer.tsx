
import React, { useEffect, useRef, useMemo } from 'react';
import { VisualizerTheme } from '../types';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  baseSize: number;
  color: string;
}

interface VisualizerProps {
  analyser: AnalyserNode | null;
  color: string;
  mode: 'bars' | 'circle' | 'wave' | 'particles' | 'grid';
  theme: VisualizerTheme;
  isActive: boolean;
  particleCount: number;
  particleSpeed: number;
}

const Visualizer: React.FC<VisualizerProps> = ({ 
  analyser, 
  color, 
  mode, 
  theme, 
  isActive,
  particleCount,
  particleSpeed
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const particlesRef = useRef<Particle[]>([]);

  const themePalette = useMemo(() => {
    switch (theme) {
      case 'cyberpunk':
        return { primary: '#f43f5e', secondary: '#0ea5e9', accent: '#a855f7' };
      case 'retro':
        return { primary: '#f59e0b', secondary: '#10b981', accent: '#b45309' };
      case 'minimalist':
        return { primary: '#64748b', secondary: '#94a3b8', accent: '#f8fafc' };
      default:
        return { primary: color, secondary: color, accent: color };
    }
  }, [theme, color]);

  useEffect(() => {
    const pCount = particleCount || 200;
    particlesRef.current = Array.from({ length: pCount }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 2 * (particleSpeed || 1),
      vy: (Math.random() - 0.5) * 2 * (particleSpeed || 1),
      baseSize: Math.random() * 4 + 1,
      size: 1,
      color: Math.random() > 0.5 ? themePalette.primary : themePalette.secondary
    }));
  }, [particleCount, particleSpeed, themePalette]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d'); 
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };
    
    window.addEventListener('resize', resize);
    resize();

    const bufferLength = analyser ? analyser.frequencyBinCount : 128;
    dataArrayRef.current = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      const dataArray = dataArrayRef.current;
      if (!dataArray) return;

      if (analyser && isActive) {
        analyser.getByteFrequencyData(dataArray);
      } else {
        for (let i = 0; i < bufferLength; i++) {
          dataArray[i] = 20 + Math.sin(Date.now() * 0.002 + i * 0.1) * 10;
        }
      }

      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      if (mode === 'circle') {
        const cx = w / 2;
        const cy = h / 2;
        const radius = Math.min(w, h) * 0.25;
        
        // Background Glow
        let sum = 0;
        for(let i=0; i<32; i++) sum += dataArray[i];
        const bass = sum / 32;
        const grad = ctx.createRadialGradient(cx, cy, radius * 0.5, cx, cy, radius * 2);
        grad.addColorStop(0, 'transparent');
        grad.addColorStop(1, `${themePalette.primary}${Math.floor((bass/255)*20).toString(16)}`);
        ctx.fillStyle = grad;
        ctx.fillRect(0,0,w,h);

        ctx.beginPath();
        for (let i = 0; i < 360; i += 1) {
          const freqIndex = Math.floor((i / 360) * bufferLength * 0.5);
          const val = (dataArray[freqIndex] || 0) / 255;
          const angle = (i * Math.PI) / 180;
          const r = radius + val * radius * 1.5;
          const x = cx + Math.cos(angle) * r;
          const y = cy + Math.sin(angle) * r;
          
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = themePalette.primary;
        ctx.lineWidth = 4;
        ctx.stroke();
        ctx.fillStyle = `${themePalette.primary}22`;
        ctx.fill();

        // Secondary Outer Ring
        ctx.beginPath();
        for (let i = 0; i < 360; i += 2) {
          const freqIndex = Math.floor(((360-i) / 360) * bufferLength * 0.3);
          const val = (dataArray[freqIndex] || 0) / 255;
          const angle = (i * Math.PI) / 180;
          const r = radius * 1.3 + val * radius * 0.8;
          const x = cx + Math.cos(angle) * r;
          const y = cy + Math.sin(angle) * r;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = themePalette.secondary;
        ctx.setLineDash([5, 15]);
        ctx.stroke();
        ctx.setLineDash([]);
      } else if (mode === 'particles') {
        let sum = 0;
        for(let i=0; i<32; i++) sum += dataArray[i];
        const bass = sum / 32 / 255;

        particlesRef.current.forEach((p, idx) => {
          const freqVal = (dataArray[idx % (bufferLength/2)] || 0) / 255;
          p.x += p.vx * (1 + bass * 8);
          p.y += p.vy * (1 + bass * 8);
          
          if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
          if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
          
          ctx.fillStyle = p.color;
          ctx.globalAlpha = 0.2 + freqVal;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.baseSize * (1 + freqVal * 4), 0, Math.PI * 2);
          ctx.fill();
        });
      } else if (mode === 'grid') {
        const cols = 24;
        const rows = 12;
        const cw = w / cols;
        const ch = h / rows;
        for(let i=0; i<cols; i++) {
          for(let j=0; j<rows; j++) {
            const freqIndex = (i * 2 + j * 3) % Math.floor(bufferLength / 2);
            const intensity = dataArray[freqIndex] / 255;
            ctx.fillStyle = i % 2 === 0 ? themePalette.primary : themePalette.secondary;
            ctx.globalAlpha = intensity * 0.6;
            ctx.fillRect(i * cw + 2, j * ch + 2, cw - 4, ch - 4);
          }
        }
      }
      ctx.globalAlpha = 1.0;
    };

    draw();
    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [analyser, mode, theme, isActive, themePalette]);

  return <canvas ref={canvasRef} className="w-full h-full block" />;
};

export default Visualizer;
