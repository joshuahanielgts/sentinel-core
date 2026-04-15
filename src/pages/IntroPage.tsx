import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield } from 'lucide-react';
import { SentinelLogo } from '@/components/app/SentinelLogo';

const INTRO_SEEN_KEY = 'sentinel:intro-seen';
const TOTAL_DURATION = 1200;

function markIntroSeen() {
  try {
    window.sessionStorage.setItem(INTRO_SEEN_KEY, '1');
  } catch {
    // Ignore storage edge cases (private mode, blocked storage)
  }
}

function shouldSkipIntro() {
  try {
    const alreadySeen = window.sessionStorage.getItem(INTRO_SEEN_KEY) === '1';
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    return alreadySeen || reducedMotion;
  } catch {
    return false;
  }
}

export default function IntroPage() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState(0); // 0: logo, 1: tagline, 2: particles, 3: exit

  const goHome = () => {
    markIntroSeen();
    navigate('/home', { replace: true });
  };

  useEffect(() => {
    if (shouldSkipIntro()) {
      navigate('/home', { replace: true });
      return;
    }

    const t1 = setTimeout(() => setPhase(1), 180);
    const t2 = setTimeout(() => setPhase(2), 520);
    const t3 = setTimeout(() => setPhase(3), 900);
    const t4 = setTimeout(() => {
      markIntroSeen();
      navigate('/home', { replace: true });
    }, TOTAL_DURATION);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [navigate]);

  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden cursor-pointer" onClick={goHome}>
      {/* Gradient background */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse at 50% 30%, hsl(217 60% 12%) 0%, hsl(215 62% 5%) 50%, hsl(220 70% 2%) 100%)',
      }} />

      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: 'linear-gradient(hsl(217 91% 60%) 1px, transparent 1px), linear-gradient(90deg, hsl(217 91% 60%) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }} />

      {/* Animated glow orbs */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full"
        style={{
          background: 'radial-gradient(circle, hsl(217 91% 60% / 0.15) 0%, transparent 70%)',
          top: '20%', left: '50%', x: '-50%',
        }}
        animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full"
        style={{
          background: 'radial-gradient(circle, hsl(189 95% 43% / 0.1) 0%, transparent 70%)',
          bottom: '10%', right: '20%',
        }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />

      {/* Scanlines */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px)',
      }} />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen">
        {/* Shield icon */}
        <AnimatePresence>
          {phase >= 0 && (
            <motion.div
              initial={{ scale: 0, opacity: 0, rotate: -180 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ type: 'spring', damping: 15, stiffness: 100, duration: 0.8 }}
              className="relative mb-6"
            >
              {/* Glow ring behind icon */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  boxShadow: '0 0 60px 20px hsl(217 91% 60% / 0.3), 0 0 120px 40px hsl(189 95% 43% / 0.1)',
                }}
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
              <div className="relative w-20 h-20 flex items-center justify-center">
                <Shield className="w-16 h-16 text-primary" strokeWidth={1.5} />
                <motion.div
                  className="absolute inset-0 rounded-full border border-primary/30"
                  animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Logo text */}
        <AnimatePresence>
          {phase >= 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-center"
            >
              <SentinelLogo size="lg" linkTo="" showText={true} className="text-4xl" />
              {/* Animated underline */}
              <motion.div
                className="h-[2px] mx-auto mt-3"
                style={{ background: 'linear-gradient(90deg, transparent, hsl(217 91% 60%), hsl(189 95% 43%), transparent)' }}
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ delay: 0.6, duration: 0.8, ease: 'easeOut' }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tagline */}
        <AnimatePresence>
          {phase >= 1 && (
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mt-6 font-mono text-sm md:text-base text-muted-foreground tracking-[0.2em] uppercase"
            >
              Contract Intelligence • Risk Analysis • AI Defense
            </motion.p>
          )}
        </AnimatePresence>

        {/* Loading bar */}
        <AnimatePresence>
          {phase >= 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-10 w-48 md:w-64"
            >
              <div className="h-[2px] w-full rounded-full overflow-hidden" style={{ background: 'hsl(215 54% 23%)' }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, hsl(217 91% 60%), hsl(189 95% 43%))' }}
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 2.5, ease: 'easeInOut' }}
                />
              </div>
              <motion.p
                className="mt-2 text-center font-mono text-[10px] text-muted-foreground tracking-widest uppercase"
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                Initializing System
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Terminal-style text */}
        <AnimatePresence>
          {phase >= 2 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-8 font-mono text-[10px] md:text-xs text-muted-foreground/60 space-y-1 text-center"
            >
              {['> Loading neural defense matrix...', '> Calibrating risk engines...', '> System online.'].map((line, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.4, duration: 0.3 }}
                >
                  {line}
                </motion.p>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Exit flash */}
      <AnimatePresence>
        {phase >= 3 && (
          <motion.div
            className="absolute inset-0 z-50"
            style={{ background: 'hsl(217 91% 60%)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.8, 0] }}
            transition={{ duration: 0.6 }}
          />
        )}
      </AnimatePresence>

      {/* Skip hint */}
      <motion.p
        className="absolute bottom-6 left-1/2 -translate-x-1/2 font-mono text-[10px] text-muted-foreground/40 tracking-widest"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        CLICK ANYWHERE TO SKIP
      </motion.p>
    </div>
  );
}
