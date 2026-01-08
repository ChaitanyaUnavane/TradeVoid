import React, { useEffect, useRef } from 'react';

const MatrixBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Debug: Check if component loads
    console.log("Matrix Background Mounted");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // 1. CHARACTER SETS
    const devanagari = 'अआइईउऊऋएऐओऔकखगघङचछजझञटठडढणतथदधनपफबभमयरलवशषसह'; // Hindi
    const katakana = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン';
    const latin = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const nums = '0123456789';
    const currency = '₹$€£'; 
    const alphabet = devanagari + katakana + latin + nums + currency;

    const fontSize = 14;
    const columns = canvas.width / fontSize;

    // 2. STATE ARRAYS
    // 'drops' tracks the Y position of each column
    // 'dropColors' tracks the color of each column
    const drops = [];
    const dropColors = [];

    const colors = ['#059669', '#ef4444']; // [Emerald Green, Red]

    // Initialize drops
    for (let x = 0; x < columns; x++) {
      drops[x] = 1;
      // Randomly assign Green (80% chance) or Red (20% chance) for the start
      dropColors[x] = Math.random() > 0.2 ? '#059669' : '#ef4444';
    }

    const draw = () => {
      // Trail effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = fontSize + 'px monospace';

      for (let i = 0; i < drops.length; i++) {
        // 3. COLOR LOGIC
        // Set the color for this specific column
        ctx.fillStyle = dropColors[i];

        const text = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        // Reset logic
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
          // When a drop resets, REROLL its color
          // This ensures the rain changes dynamically over time
          dropColors[i] = Math.random() > 0.2 ? '#059669' : '#ef4444'; 
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 33);

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 0, 
        width: '100vw',
        height: '100vh',
        background: 'black',
        pointerEvents: 'none' 
      }}
    />
  );
};

export default MatrixBackground;