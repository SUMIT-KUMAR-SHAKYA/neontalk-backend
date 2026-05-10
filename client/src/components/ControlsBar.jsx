/**
 * ControlsBar.jsx — Bottom control bar with all action buttons.
 */
import { motion } from 'framer-motion';

const barVariants = {
  hidden: { y: 30, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } },
};

export default function ControlsBar({
  connectionState,
  isMuted,
  isCamOff,
  isRecording,
  onMute,
  onCamera,
  onNext,
  onRecord,
  onHangUp,
  disabled,
}) {
  const connected = connectionState === 'connected';

  return (
    <motion.div
      className="controls-bar glass"
      variants={barVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Mute */}
      <motion.button
        className={`btn btn-icon ${isMuted ? 'btn-pink' : 'btn-cyan'}`}
        title={isMuted ? 'Unmute' : 'Mute'}
        onClick={onMute}
        disabled={disabled}
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.1 }}
      >
        {isMuted ? '🔇' : '🎤'}
      </motion.button>

      {/* Camera */}
      <motion.button
        className={`btn btn-icon ${isCamOff ? 'btn-pink' : 'btn-cyan'}`}
        title={isCamOff ? 'Turn Camera On' : 'Turn Camera Off'}
        onClick={onCamera}
        disabled={disabled}
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.1 }}
      >
        {isCamOff ? '📵' : '📷'}
      </motion.button>

      {/* Next */}
      <motion.button
        className="btn btn-purple"
        style={{ minWidth: 100 }}
        onClick={onNext}
        disabled={!connected}
        whileTap={{ scale: 0.94 }}
        whileHover={{ scale: 1.04 }}
      >
        ⚡ Next
      </motion.button>

      {/* Record */}
      <motion.button
        className={`btn ${isRecording ? 'btn-pink' : 'btn-cyan'}`}
        style={{ minWidth: 120 }}
        onClick={onRecord}
        disabled={!connected}
        whileTap={{ scale: 0.94 }}
        whileHover={{ scale: 1.04 }}
      >
        {isRecording ? (
          <>
            <span className="rec-dot" /> Stop Rec
          </>
        ) : (
          '⏺ Record'
        )}
      </motion.button>

      {/* Hang Up */}
      <motion.button
        className="btn btn-pink"
        style={{ minWidth: 110 }}
        onClick={onHangUp}
        whileTap={{ scale: 0.94 }}
        whileHover={{ scale: 1.04 }}
      >
        ✕ Leave
      </motion.button>
    </motion.div>
  );
}
