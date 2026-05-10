/**
 * ConsentBanner.jsx — Slide-down banner for recording consent.
 */
import { motion, AnimatePresence } from 'framer-motion';

export default function ConsentBanner({ myConsent, partnerConsent, onConsent, visible }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="consent-banner"
          initial={{ y: -24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -24, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        >
          <span style={{ fontSize: '1.4rem' }}>🎙️</span>
          <div style={{ flex: 1, fontSize: '0.88rem', lineHeight: 1.5 }}>
            <strong style={{ color: 'var(--neon-purple)' }}>Recording Consent Required</strong>
            <br />
            Both users must consent before recording begins. Recordings are saved{' '}
            <strong>only to your device</strong> — never uploaded.
            <br />
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              You: {myConsent ? '✅ Consented' : '⏳ Pending'} &nbsp;|&nbsp;
              Partner: {partnerConsent ? '✅ Consented' : '⏳ Pending'}
            </span>
          </div>
          {!myConsent && (
            <motion.button
              className="btn btn-purple"
              style={{ flexShrink: 0 }}
              onClick={onConsent}
              whileTap={{ scale: 0.93 }}
              whileHover={{ scale: 1.05 }}
            >
              I Consent
            </motion.button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
