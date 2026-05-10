/**
 * VideoPanel.jsx — A single video feed panel (local or remote).
 */
import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export default function VideoPanel({ stream, label, active = false, children, muted = false }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <motion.div
      className={`video-panel ${active ? 'active' : ''}`}
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
    >
      {stream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={muted}
        />
      ) : (
        <div className="video-placeholder">
          <span className="icon">📹</span>
          <span>{label === 'You' ? 'Camera starting…' : 'Waiting for stranger…'}</span>
        </div>
      )}
      <div className="video-label">{label}</div>
      {children}
    </motion.div>
  );
}
