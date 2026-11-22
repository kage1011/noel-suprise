import React, { useEffect, useRef } from 'react';

export default function SnowEffect({ count = 80 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Initialize snowflakes
    const flakes = [];
    for (let i = 0; i < count; i++) {
      flakes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 3 + 1, // radius
        d: Math.random() * 1.5 + 0.5, // density / speed
        swaySpeed: Math.random() * 0.02 + 0.005,
        swayOffset: Math.random() * Math.PI * 2,
        opacity: Math.random() * 0.7 + 0.3,
      });
    }

    let angle = 0;
    const render = () => {
      ctx.clearRect(0, 0, width, height);
      angle += 0.01;

      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.beginPath();

      for (let i = 0; i < flakes.length; i++) {
        const f = flakes[i];
        ctx.fillStyle = `rgba(255, 255, 255, ${f.opacity})`;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2, true);
        ctx.fill();

        // Update positions
        f.y += f.d + Math.cos(angle + f.d) * 0.3;
        f.x += Math.sin(angle + f.swayOffset) * 0.8;

        // Reset if offscreen
        if (f.y > height + 5) {
          f.y = -5;
          f.x = Math.random() * width;
        }
        if (f.x > width + 5) {
          f.x = -5;
        } else if (f.x < -5) {
          f.x = width + 5;
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [count]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-20 overflow-hidden"
      style={{ opacity: 0.85 }}
    />
  );
}
