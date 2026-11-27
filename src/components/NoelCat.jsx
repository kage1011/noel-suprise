import React, { useEffect, useRef, useState, useCallback } from 'react';

/*
 * NoelCat — A cute pixel-art Christmas cat that patrols the browser edges.
 *
 * Movement: walks along the four edges of the viewport in a loop
 *   bottom-left → bottom-right → top-right → top-left → bottom-left …
 *
 * On hover it randomly picks one of several reactions:
 *   sit, lick paw, roll over, sleep, jump scare, meow bubble
 *
 * It is rendered entirely with CSS + emoji/SVG so no external assets are needed.
 */

// -------- Sprite frames drawn with simple box-shadow pixel art --------
// Each "frame" is a React node so we can animate with CSS transitions.

const CAT_SIZE = 48; // px  – the logical cat bounding box
const EDGE_MARGIN = 4; // px from viewport edge
const WALK_SPEED = 60; // px per second

// The different reaction animations the cat can do when hovered
const REACTIONS = [
  'sit',       // sits down and wraps tail
  'lick',      // licks paw
  'roll',      // rolls on back
  'sleep',     // curls up with Zzz
  'jump',      // startled jump
  'meow',      // speech bubble "Meow!"
  'love',      // heart eyes
  'santa',     // puts on santa hat
];

export default function NoelCat() {
  // Position & direction state
  const [pos, setPos] = useState({ x: 100, y: 0 }); // relative to edge path
  const [edge, setEdge] = useState('bottom'); // which edge the cat is on
  const [facingRight, setFacingRight] = useState(true);
  const [reaction, setReaction] = useState(null); // null = walking
  const [walkFrame, setWalkFrame] = useState(0);
  const [paused, setPaused] = useState(false);

  const animRef = useRef(null);
  const lastTimeRef = useRef(null);
  const reactionTimeoutRef = useRef(null);
  const pauseTimeoutRef = useRef(null);

  // Convert edge+progress into viewport x,y
  const edgeToViewport = useCallback((edgeName, progress) => {
    const W = window.innerWidth;
    const H = window.innerHeight;
    const s = CAT_SIZE;
    const m = EDGE_MARGIN;

    switch (edgeName) {
      case 'bottom':
        return { x: progress, y: H - s - m, rotation: 0 };
      case 'right':
        return { x: W - s - m, y: H - s - m - progress, rotation: 0 };
      case 'top':
        return { x: W - s - m - progress, y: m, rotation: 0 };
      case 'left':
        return { x: m, y: m + progress, rotation: 0 };
      default:
        return { x: 0, y: 0, rotation: 0 };
    }
  }, []);

  // Max travel distance for each edge
  const edgeLength = useCallback((edgeName) => {
    const W = window.innerWidth;
    const H = window.innerHeight;
    const s = CAT_SIZE;
    const m = EDGE_MARGIN * 2;
    switch (edgeName) {
      case 'bottom':
      case 'top':
        return W - s - m;
      case 'left':
      case 'right':
        return H - s - m;
      default:
        return W;
    }
  }, []);

  const nextEdge = useCallback((edgeName) => {
    const order = ['bottom', 'right', 'top', 'left'];
    const idx = order.indexOf(edgeName);
    return order[(idx + 1) % order.length];
  }, []);

  const edgeFacing = useCallback((edgeName) => {
    return edgeName === 'bottom' || edgeName === 'left';
  }, []);

  // Animation loop
  useEffect(() => {
    if (paused || reaction) return;

    const progressRef = { value: pos.x };
    const currentEdge = { value: edge };

    const animate = (timestamp) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const dt = (timestamp - lastTimeRef.current) / 1000;
      lastTimeRef.current = timestamp;

      progressRef.value += WALK_SPEED * dt;

      const maxLen = edgeLength(currentEdge.value);
      if (progressRef.value >= maxLen) {
        progressRef.value = 0;
        currentEdge.value = nextEdge(currentEdge.value);
        setEdge(currentEdge.value);
        setFacingRight(edgeFacing(currentEdge.value));
      }

      setPos({ x: progressRef.value, y: 0 });
      setWalkFrame((f) => (f + 1) % 4);

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      lastTimeRef.current = null;
    };
  }, [paused, reaction, edge, pos.x, edgeLength, nextEdge, edgeFacing]);

  // Random pause to sit/look around
  useEffect(() => {
    const scheduleRandomPause = () => {
      const delay = 8000 + Math.random() * 15000; // 8-23 seconds
      pauseTimeoutRef.current = setTimeout(() => {
        // Pick a random idle action
        const idleActions = ['sit', 'lick', 'sleep'];
        const action = idleActions[Math.floor(Math.random() * idleActions.length)];
        setReaction(action);
        setPaused(true);

        // Resume after 2-4 seconds
        reactionTimeoutRef.current = setTimeout(() => {
          setReaction(null);
          setPaused(false);
          scheduleRandomPause();
        }, 2000 + Math.random() * 2000);
      }, delay);
    };

    scheduleRandomPause();

    return () => {
      if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
      if (reactionTimeoutRef.current) clearTimeout(reactionTimeoutRef.current);
    };
  }, []);

  // Handle hover → trigger reaction
  const handleMouseEnter = () => {
    // Clear any existing reaction timeout
    if (reactionTimeoutRef.current) clearTimeout(reactionTimeoutRef.current);
    if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);

    const r = REACTIONS[Math.floor(Math.random() * REACTIONS.length)];
    setReaction(r);
    setPaused(true);
  };

  const handleMouseLeave = () => {
    // Resume walking after a short delay
    reactionTimeoutRef.current = setTimeout(() => {
      setReaction(null);
      setPaused(false);
    }, 800);
  };

  // Compute screen position
  const viewPos = edgeToViewport(edge, pos.x);

  // Build the cat visual
  const renderCat = () => {
    const flip = facingRight ? '' : 'scaleX(-1)';

    // Base cat body parts as layered divs
    return (
      <div
        className="relative select-none"
        style={{
          width: CAT_SIZE,
          height: CAT_SIZE,
          transform: flip,
          transition: 'transform 0.3s ease',
        }}
      >
        {/* Body */}
        <div
          className="absolute rounded-[40%] shadow-lg"
          style={{
            width: 30,
            height: 20,
            bottom: reaction === 'roll' ? 18 : 8,
            left: 9,
            background: 'linear-gradient(135deg, #f97316 0%, #ea580c 60%, #c2410c 100%)',
            transform: reaction === 'roll'
              ? 'rotate(180deg)'
              : reaction === 'jump'
              ? 'translateY(-12px)'
              : reaction === 'sleep'
              ? 'scaleY(0.7) translateY(4px)'
              : '',
            transition: 'all 0.4s cubic-bezier(.34,1.56,.64,1)',
          }}
        />

        {/* Tail */}
        <div
          className="absolute"
          style={{
            width: 14,
            height: 14,
            bottom: reaction === 'roll' ? 22 : reaction === 'sit' ? 6 : 10,
            left: reaction === 'sit' ? 2 : -2,
            borderRadius: '0 50% 50% 50%',
            background: '#c2410c',
            transform: reaction === 'sit'
              ? 'rotate(-40deg)'
              : `rotate(${Math.sin(Date.now() / 300) * 20 - 30}deg)`,
            transformOrigin: 'bottom right',
            transition: 'all 0.3s ease',
          }}
        />

        {/* Head */}
        <div
          className="absolute rounded-[45%]"
          style={{
            width: 22,
            height: 20,
            bottom: reaction === 'roll' ? 20 : reaction === 'jump' ? 30 : reaction === 'sleep' ? 10 : 20,
            left: 20,
            background: 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)',
            transition: 'all 0.4s cubic-bezier(.34,1.56,.64,1)',
            zIndex: 2,
          }}
        >
          {/* Ears */}
          <div
            className="absolute"
            style={{
              width: 0, height: 0,
              borderLeft: '5px solid transparent',
              borderRight: '5px solid transparent',
              borderBottom: '8px solid #f97316',
              top: -6, left: 1,
              transform: reaction === 'jump' ? 'rotate(-10deg)' : '',
            }}
          />
          <div
            className="absolute"
            style={{
              width: 0, height: 0,
              borderLeft: '5px solid transparent',
              borderRight: '5px solid transparent',
              borderBottom: '8px solid #f97316',
              top: -6, right: 1,
              transform: reaction === 'jump' ? 'rotate(10deg)' : '',
            }}
          />

          {/* Inner ears */}
          <div className="absolute" style={{ width: 0, height: 0, borderLeft: '3px solid transparent', borderRight: '3px solid transparent', borderBottom: '5px solid #fed7aa', top: -4, left: 3 }} />
          <div className="absolute" style={{ width: 0, height: 0, borderLeft: '3px solid transparent', borderRight: '3px solid transparent', borderBottom: '5px solid #fed7aa', top: -4, right: 3 }} />

          {/* Eyes */}
          {reaction === 'sleep' ? (
            <>
              <div className="absolute text-[6px] font-bold text-slate-800" style={{ top: 5, left: 3 }}>–</div>
              <div className="absolute text-[6px] font-bold text-slate-800" style={{ top: 5, right: 3 }}>–</div>
            </>
          ) : reaction === 'love' ? (
            <>
              <div className="absolute text-[7px]" style={{ top: 4, left: 2 }}>❤️</div>
              <div className="absolute text-[7px]" style={{ top: 4, right: 2 }}>❤️</div>
            </>
          ) : reaction === 'jump' ? (
            <>
              <div className="absolute rounded-full bg-slate-900" style={{ width: 6, height: 6, top: 5, left: 3 }} />
              <div className="absolute rounded-full bg-slate-900" style={{ width: 6, height: 6, top: 5, right: 3 }} />
              <div className="absolute rounded-full bg-white" style={{ width: 2, height: 2, top: 5, left: 4 }} />
              <div className="absolute rounded-full bg-white" style={{ width: 2, height: 2, top: 5, right: 4 }} />
            </>
          ) : (
            <>
              <div className="absolute rounded-full bg-slate-900" style={{ width: 4, height: 5, top: 6, left: 4 }} />
              <div className="absolute rounded-full bg-slate-900" style={{ width: 4, height: 5, top: 6, right: 4 }} />
              <div className="absolute rounded-full bg-white" style={{ width: 1.5, height: 1.5, top: 6, left: 5 }} />
              <div className="absolute rounded-full bg-white" style={{ width: 1.5, height: 1.5, top: 6, right: 5 }} />
            </>
          )}

          {/* Nose */}
          <div
            className="absolute"
            style={{
              width: 4, height: 3,
              background: '#be185d',
              borderRadius: '50%',
              bottom: 4, left: '50%',
              transform: 'translateX(-50%)',
            }}
          />

          {/* Mouth / expression */}
          {reaction === 'meow' && (
            <div
              className="absolute rounded-full bg-pink-400"
              style={{
                width: 6, height: 5,
                bottom: 1, left: '50%',
                transform: 'translateX(-50%)',
              }}
            />
          )}

          {/* Whiskers */}
          <div className="absolute bg-slate-600" style={{ width: 10, height: 0.5, top: 11, left: -6, transform: 'rotate(-8deg)' }} />
          <div className="absolute bg-slate-600" style={{ width: 10, height: 0.5, top: 13, left: -5, transform: 'rotate(5deg)' }} />
          <div className="absolute bg-slate-600" style={{ width: 10, height: 0.5, top: 11, right: -6, transform: 'rotate(8deg)' }} />
          <div className="absolute bg-slate-600" style={{ width: 10, height: 0.5, top: 13, right: -5, transform: 'rotate(-5deg)' }} />
        </div>

        {/* Legs - animate walk */}
        {reaction !== 'roll' && reaction !== 'sleep' && (
          <>
            {/* Front legs */}
            <div
              className="absolute rounded-b-md"
              style={{
                width: 5, height: reaction === 'sit' ? 6 : 9,
                bottom: 0, left: 16,
                background: '#ea580c',
                transform: !reaction
                  ? `rotate(${Math.sin(walkFrame * 1.2) * 15}deg)`
                  : reaction === 'lick' ? 'rotate(30deg) translateY(-4px)' : '',
                transformOrigin: 'top center',
                transition: 'height 0.3s, transform 0.15s',
              }}
            />
            <div
              className="absolute rounded-b-md"
              style={{
                width: 5, height: reaction === 'sit' ? 6 : 9,
                bottom: 0, left: 24,
                background: '#ea580c',
                transform: !reaction
                  ? `rotate(${Math.sin(walkFrame * 1.2 + Math.PI) * 15}deg)`
                  : '',
                transformOrigin: 'top center',
                transition: 'height 0.3s, transform 0.15s',
              }}
            />
            {/* Back legs */}
            <div
              className="absolute rounded-b-md"
              style={{
                width: 6, height: reaction === 'sit' ? 5 : 9,
                bottom: 0, left: 10,
                background: '#c2410c',
                transform: !reaction
                  ? `rotate(${Math.sin(walkFrame * 1.2 + Math.PI) * 12}deg)`
                  : '',
                transformOrigin: 'top center',
                transition: 'height 0.3s, transform 0.15s',
              }}
            />
            <div
              className="absolute rounded-b-md"
              style={{
                width: 6, height: reaction === 'sit' ? 5 : 9,
                bottom: 0, left: 30,
                background: '#c2410c',
                transform: !reaction
                  ? `rotate(${Math.sin(walkFrame * 1.2) * 12}deg)`
                  : '',
                transformOrigin: 'top center',
                transition: 'height 0.3s, transform 0.15s',
              }}
            />
          </>
        )}

        {/* Santa hat accessory when reaction is 'santa' */}
        {reaction === 'santa' && (
          <div className="absolute" style={{ bottom: 36, left: 22, zIndex: 10 }}>
            <div style={{
              width: 0, height: 0,
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderBottom: '14px solid #dc2626',
            }} />
            <div className="rounded-full bg-white" style={{
              width: 6, height: 6,
              position: 'absolute', top: -4, left: 5,
            }} />
            <div className="bg-white rounded-sm" style={{
              width: 20, height: 4,
              position: 'absolute', top: 10, left: -2,
            }} />
          </div>
        )}
      </div>
    );
  };

  // Speech / reaction bubbles
  const renderBubble = () => {
    if (!reaction) return null;

    const bubbleContent = {
      meow: '🔊 Meow~!',
      love: '💕 Yêu Noel!',
      jump: '😱 Hiii!',
      santa: '🎅 Ho Ho Ho!',
      sit: '😺 ...',
      lick: '👅 Liếm liếm~',
      roll: '🤸 Lăn lăn!',
      sleep: '💤 Zzz...',
    };

    const text = bubbleContent[reaction];
    if (!text) return null;

    return (
      <div
        className="absolute whitespace-nowrap px-2.5 py-1 rounded-xl text-[10px] font-bold shadow-lg border pointer-events-none select-none"
        style={{
          bottom: CAT_SIZE + 6,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(255,255,255,0.95)',
          color: '#1e293b',
          borderColor: '#f59e0b',
          animation: 'catBubblePop 0.35s cubic-bezier(.34,1.56,.64,1)',
          zIndex: 10,
        }}
      >
        {text}
        {/* Bubble tail */}
        <div
          className="absolute"
          style={{
            bottom: -5,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 0, height: 0,
            borderLeft: '5px solid transparent',
            borderRight: '5px solid transparent',
            borderTop: '6px solid rgba(255,255,255,0.95)',
          }}
        />
      </div>
    );
  };

  return (
    <>
      {/* Keyframe injection */}
      <style>{`
        @keyframes catBubblePop {
          0% { opacity: 0; transform: translateX(-50%) scale(0.3) translateY(8px); }
          100% { opacity: 1; transform: translateX(-50%) scale(1) translateY(0); }
        }
        @keyframes catPurr {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(0.95); }
        }
      `}</style>

      <div
        className="fixed z-[9999] cursor-pointer"
        style={{
          left: viewPos.x,
          top: viewPos.y,
          width: CAT_SIZE,
          height: CAT_SIZE,
          transition: paused ? 'left 0.3s ease, top 0.3s ease' : 'none',
          pointerEvents: 'auto',
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        title="Mèo Noel 🐱 — rê chuột vào đây nè!"
      >
        {renderBubble()}
        {renderCat()}

        {/* Paw prints trail (decorative) */}
        {!reaction && (
          <div
            className="absolute opacity-30 text-[8px] pointer-events-none"
            style={{ bottom: -2, left: -8, transform: facingRight ? '' : 'scaleX(-1)' }}
          >
            🐾
          </div>
        )}
      </div>
    </>
  );
}
