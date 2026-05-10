/**
 * App.jsx — Root component: manages landing ↔ chat page transition.
 */
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import LandingPage from './pages/LandingPage';
import ChatPage from './pages/ChatPage';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.4, 0, 0.2, 1] } },
  exit:    { opacity: 0, y: -20, transition: { duration: 0.3 } },
};

export default function App() {
  const [page, setPage] = useState('landing'); // 'landing' | 'chat'

  return (
    <>
      {/* Background layers (always present) */}
      <div className="bg-animated" aria-hidden />
      <div className="bg-grid" aria-hidden />

      <AnimatePresence mode="wait">
        {page === 'landing' ? (
          <motion.div key="landing" {...pageVariants}>
            <LandingPage onStart={() => setPage('chat')} />
          </motion.div>
        ) : (
          <motion.div key="chat" {...pageVariants} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <ChatPage onLeave={() => setPage('landing')} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
