/**
 * ChatPage.jsx — Main video chat page.
 */
import { useRef, useState, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import { useWebRTC } from '../hooks/useWebRTC';
import { useConsent } from '../hooks/useConsent';
import { useModeration } from '../hooks/useModeration';
import { startRecording, stopRecording } from '../lib/recorder';

import VideoPanel from '../components/VideoPanel';
import ControlsBar from '../components/ControlsBar';
import ConsentBanner from '../components/ConsentBanner';
import ModerationAlert from '../components/ModerationAlert';
import StatusPill from '../components/StatusPill';

export default function ChatPage({ onLeave }) {
  // Ref for the hidden remote video used by the moderation hook
  const moderationVideoRef = useRef(null);
  const [showConsentBanner, setShowConsentBanner] = useState(false);
  const [recording, setRecording] = useState(false);
  const [infoAlert, setInfoAlert] = useState(null);

  const {
    localStream,
    remoteStream,
    connectionState,
    isMuted,
    isCamOff,
    joinQueue,
    handleNext,
    toggleMute,
    toggleCamera,
    hangUp,
  } = useWebRTC();

  const { myConsent, partnerConsent, bothConsented, giveConsent, resetConsent } = useConsent();

  const { nsfwDetected, dismissAlert } = useModeration(
    moderationVideoRef,
    connectionState === 'connected'
  );

  // Attach remote stream to hidden moderation video imperatively
  useEffect(() => {
    if (moderationVideoRef.current && remoteStream) {
      moderationVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // Start chat on mount
  useEffect(() => {
    joinQueue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Recording ──────────────────────────────────────────────────────────────
  const handleRecord = useCallback(async () => {
    if (!bothConsented) {
      setShowConsentBanner(true);
      setInfoAlert('Both users must consent before recording.');
      setTimeout(() => setInfoAlert(null), 4000);
      return;
    }
    if (recording) {
      await stopRecording();
      setRecording(false);
    } else {
      if (localStream) {
        const ok = startRecording(localStream);
        setRecording(ok);
      }
    }
  }, [bothConsented, recording, localStream]);

  // ── Leave ─────────────────────────────────────────────────────────────────
  const handleLeave = useCallback(() => {
    if (recording) stopRecording();
    hangUp();
    resetConsent();
    onLeave();
  }, [recording, hangUp, resetConsent, onLeave]);

  const handleNextClick = useCallback(() => {
    if (recording) { stopRecording(); setRecording(false); }
    resetConsent();
    setShowConsentBanner(false);
    handleNext();
  }, [recording, handleNext, resetConsent]);

  const isConnected = connectionState === 'connected';
  const isWaiting = ['waiting', 'connecting'].includes(connectionState);

  return (
    <div className="chat-layout">

      {/* Hidden video element for AI moderation (not visible) */}
      <video
        ref={moderationVideoRef}
        autoPlay
        playsInline
        muted
        style={{ display: 'none', position: 'absolute' }}
        aria-hidden="true"
      />

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="chat-header glass">
        <span className="logo-glow" style={{ fontSize: '1.6rem' }}>Neontalk</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <StatusPill state={connectionState} />
          {isWaiting && (
            <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
          )}
        </div>
      </div>

      {/* ── Consent Banner ────────────────────────────────────────────────── */}
      <ConsentBanner
        visible={showConsentBanner}
        myConsent={myConsent}
        partnerConsent={partnerConsent}
        onConsent={() => {
          giveConsent();
          if (partnerConsent) setShowConsentBanner(false);
        }}
      />

      {/* ── Video Grid ────────────────────────────────────────────────────── */}
      <div className="videos-grid">

        {/* Remote video panel */}
        <VideoPanel stream={remoteStream} label="Stranger" active={isConnected}>

          {/* NSFW blur overlay */}
          <AnimatePresence>
            {nsfwDetected && (
              <motion.div
                className="nsfw-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <span style={{ fontSize: '2rem' }}>⚠️</span>
                <span>Content Flagged by AI</span>
                <button
                  className="btn btn-pink"
                  style={{ marginTop: 8, padding: '6px 16px', fontSize: '0.8rem' }}
                  onClick={dismissAlert}
                >
                  Dismiss
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Waiting spinner overlay */}
          <AnimatePresence>
            {!remoteStream && isWaiting && (
              <motion.div
                className="video-placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="spinner" />
                <span>Finding a stranger…</span>
              </motion.div>
            )}
          </AnimatePresence>

        </VideoPanel>

        {/* Local video panel */}
        <VideoPanel stream={localStream} label="You" muted={true} />

      </div>

      {/* ── Controls Bar ──────────────────────────────────────────────────── */}
      <ControlsBar
        connectionState={connectionState}
        isMuted={isMuted}
        isCamOff={isCamOff}
        isRecording={recording}
        onMute={toggleMute}
        onCamera={toggleCamera}
        onNext={handleNextClick}
        onRecord={handleRecord}
        onHangUp={handleLeave}
        disabled={false}
      />

      {/* ── Recording Consent Toggle ───────────────────────────────────────── */}
      {isConnected && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center' }}
        >
          <button
            id="consent-toggle-btn"
            className="btn btn-purple"
            style={{ fontSize: '0.8rem', padding: '8px 18px' }}
            onClick={() => setShowConsentBanner((v) => !v)}
          >
            🎙️ {showConsentBanner ? 'Hide' : 'Set Up'} Recording Consent
          </button>
        </motion.div>
      )}

      {/* ── NSFW Alert ────────────────────────────────────────────────────── */}
      <ModerationAlert visible={nsfwDetected} onDismiss={dismissAlert} />

      {/* ── Info Alert ────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {infoAlert && (
          <motion.div
            className="alert-popup alert-info"
            initial={{ x: 60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 60, opacity: 0 }}
          >
            <span>ℹ️</span>
            <span style={{ flex: 1 }}>{infoAlert}</span>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
