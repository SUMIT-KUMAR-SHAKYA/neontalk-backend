/**
 * LandingPage.jsx — Hero screen shown before the user starts chatting.
 */
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { y: 30, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] } },
};

const features = [
  '🎥 Video & Audio',
  '🔀 Random Matching',
  '🤖 AI Moderation',
  '🔒 Consent Recording',
  '⚡ WebRTC P2P',
  '🌐 Free & Open',
];

export default function LandingPage({ onStart }) {
  return (
    <div className="landing-hero">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
      >
        {/* Logo */}
        <motion.div variants={itemVariants}>
          <h1 className="logo-glow">Neontalk</h1>
        </motion.div>

        {/* Tagline */}
        <motion.p className="tagline" variants={itemVariants}>
          Meet someone new, face-to-face — instantly, anonymously, and for free.
          <br />
          <span style={{ color: 'var(--text-dim)', fontSize: '0.9em' }}>
            Powered by WebRTC · AI-moderated · No signup needed.
          </span>
        </motion.p>

        {/* Feature pills */}
        <motion.div className="feature-pills" variants={itemVariants}>
          {features.map((f) => (
            <span key={f} className="feature-pill">{f}</span>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div variants={itemVariants} style={{ marginTop: 44 }}>
          <motion.button
            id="start-chat-btn"
            className="btn btn-cyan btn-lg"
            onClick={onStart}
            whileHover={{ scale: 1.06, boxShadow: '0 0 30px rgba(0,245,255,0.6), 0 0 60px rgba(0,245,255,0.25)' }}
            whileTap={{ scale: 0.96 }}
          >
            ✨ Start Chat
          </motion.button>
        </motion.div>

        {/* Disclaimer */}
        <motion.p
          variants={itemVariants}
          style={{
            marginTop: 32,
            fontSize: '0.75rem',
            color: 'var(--text-dim)',
            maxWidth: 440,
            lineHeight: 1.6,
            textAlign: 'center',
          }}
        >
          By using Neontalk you agree to our terms. You must be 18+. Inappropriate
          content is detected by AI and may result in session termination.
        </motion.p>

        {/* Floating orbs decoration */}
        <motion.div
          aria-hidden
          style={{
            position: 'absolute',
            width: 320, height: 320,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0,245,255,0.06) 0%, transparent 70%)',
            top: '10%', right: '8%',
            filter: 'blur(40px)',
            pointerEvents: 'none',
          }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          aria-hidden
          style={{
            position: 'absolute',
            width: 240, height: 240,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(191,90,242,0.08) 0%, transparent 70%)',
            bottom: '12%', left: '6%',
            filter: 'blur(40px)',
            pointerEvents: 'none',
          }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.9, 0.5] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
      </motion.div>
    </div>
  );
}
