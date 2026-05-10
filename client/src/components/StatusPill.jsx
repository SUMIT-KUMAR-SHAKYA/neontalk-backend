/**
 * StatusPill.jsx — Small animated status badge.
 */
import { motion } from 'framer-motion';

const LABELS = {
  idle:       { text: 'Ready',      cls: 'waiting' },
  waiting:    { text: 'Finding…',   cls: 'waiting' },
  connecting: { text: 'Connecting', cls: 'waiting' },
  connected:  { text: 'Connected',  cls: 'connected' },
  ended:      { text: 'Ended',      cls: 'waiting' },
};

export default function StatusPill({ state }) {
  const { text, cls } = LABELS[state] || LABELS.idle;
  return (
    <motion.span
      key={state}
      className={`status-pill ${cls}`}
      initial={{ scale: 0.85, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.25 }}
    >
      <span className="dot" />
      {text}
    </motion.span>
  );
}
