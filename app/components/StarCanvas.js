'use client';

import { useEffect, useRef } from 'react';

export default function StarCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width, height;
    let stars = [];
    let shootingStars = [];
    const STAR_COUNT = 180;
    let animId;

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }

    function createStar() {
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.8 + 0.3,
        opacity: Math.random() * 0.6 + 0.2,
        twinkleSpeed: Math.random() * 0.015 + 0.005,
        twinkleDir: Math.random() > 0.5 ? 1 : -1,
        driftX: (Math.random() - 0.5) * 0.08,
        driftY: Math.random() * 0.04 + 0.01,
      };
    }

    function createShootingStar() {
      const fromLeft = Math.random() > 0.5;
      return {
        x: fromLeft ? Math.random() * width * 0.6 : width * 0.4 + Math.random() * width * 0.6,
        y: Math.random() * height * 0.4,
        len: Math.random() * 60 + 40,
        speed: Math.random() * 4 + 3,
        angle: fromLeft ? Math.PI / 6 + Math.random() * 0.3 : Math.PI - Math.PI / 6 - Math.random() * 0.3,
        opacity: 1,
        decay: Math.random() * 0.015 + 0.01,
      };
    }

    function init() {
      resize();
      stars = [];
      for (let i = 0; i < STAR_COUNT; i++) stars.push(createStar());
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);
      for (const s of stars) {
        s.opacity += s.twinkleSpeed * s.twinkleDir;
        if (s.opacity >= 0.85) { s.opacity = 0.85; s.twinkleDir = -1; }
        if (s.opacity <= 0.15) { s.opacity = 0.15; s.twinkleDir = 1; }
        s.x += s.driftX;
        s.y += s.driftY;
        if (s.y > height + 5) { s.y = -5; s.x = Math.random() * width; }
        if (s.x < -5 || s.x > width + 5) { s.x = Math.random() * width; s.y = Math.random() * height; }
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${s.opacity})`;
        ctx.fill();
        if (s.radius > 1.2) {
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.radius * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(96,165,250,${s.opacity * 0.15})`;
          ctx.fill();
        }
      }
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const ss = shootingStars[i];
        const endX = ss.x + Math.cos(ss.angle) * ss.len;
        const endY = ss.y + Math.sin(ss.angle) * ss.len;
        const grad = ctx.createLinearGradient(ss.x, ss.y, endX, endY);
        grad.addColorStop(0, `rgba(250,204,21,${ss.opacity})`);
        grad.addColorStop(1, `rgba(250,204,21,0)`);
        ctx.beginPath();
        ctx.moveTo(ss.x, ss.y);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(ss.x, ss.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${ss.opacity})`;
        ctx.fill();
        ss.x += Math.cos(ss.angle) * ss.speed;
        ss.y += Math.sin(ss.angle) * ss.speed;
        ss.opacity -= ss.decay;
        if (ss.opacity <= 0 || ss.x < -50 || ss.x > width + 50 || ss.y > height + 50) {
          shootingStars.splice(i, 1);
        }
      }
      animId = requestAnimationFrame(draw);
    }

    window.addEventListener('resize', resize);
    init();
    draw();

    const interval = setInterval(() => {
      if (shootingStars.length < 2) shootingStars.push(createShootingStar());
    }, 4000);

    return () => {
      cancelAnimationFrame(animId);
      clearInterval(interval);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} id="starCanvas" />;
}
