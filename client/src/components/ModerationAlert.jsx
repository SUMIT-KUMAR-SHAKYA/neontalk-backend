/**
 * ModerationAlert.jsx — Animated popup for NSFW detection warnings.
 */
import { motion, AnimatePresence } from 'framer-motion';

export default function ModerationAlert({ visible, onDismiss }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="alert-popup alert-nsfw"
          role="alert"
          aria-live="assertive"
          initial={{ x: 60, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 60, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>⚠️</span>
          <div style={{ flex: 1 }}>
            <strong style={{ color: 'var(--neon-pink)', display: 'block', marginBottom: 4 }}>
              Inappropriate Content Detected
            </strong>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Our AI flagged potentially explicit content. Please keep it safe for all.
            </span>
          </div>
          <button
            onClick={onDismiss}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: '1.1rem',
              padding: '0 4px',
            }}
            aria-label="Dismiss alert"
          >
            ✕
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
