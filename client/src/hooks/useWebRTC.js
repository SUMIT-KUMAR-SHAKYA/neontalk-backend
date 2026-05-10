/**
 * useWebRTC.js — Custom React hook that manages the full WebRTC lifecycle.
 *
 * Responsibilities:
 *  - Get user media (camera + mic)
 *  - Listen for socket "matched" events (caller vs callee roles)
 *  - Create RTCPeerConnection, exchange offer/answer/ICE via signaling server
 *  - Expose local stream, remote stream, connection state
 *  - Handle "Next" (cleanly close + re-queue)
 *  - Mute / camera toggle helpers
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { socket } from '../lib/socket';

export function useWebRTC() {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [connectionState, setConnectionState] = useState('idle'); // idle | waiting | connecting | connected | ended
  const [isMuted, setIsMuted] = useState(false);
  const [isCamOff, setIsCamOff] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [iceServers, setIceServers] = useState([]);

  const pcRef = useRef(null);  // RTCPeerConnection
  const localStreamRef = useRef(null);
  const roleRef = useRef(null); // 'caller' | 'callee'

  // ─── Get user media ─────────────────────────────────────────────────────────
  const initLocalStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        audio: { echoCancellation: true, noiseSuppression: true },
      });
      localStreamRef.current = stream;
      setLocalStream(stream);
      return stream;
    } catch (err) {
      console.warn('[WebRTC] getUserMedia failed — proceeding without camera:', err.message);
      // Try audio-only fallback
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        localStreamRef.current = audioStream;
        setLocalStream(audioStream);
        return audioStream;
      } catch {
        console.warn('[WebRTC] Audio also unavailable — continuing without media');
        // Still allow the user into the queue without media
        return null;
      }
    }
  }, []);

  // ─── Create / reset peer connection ─────────────────────────────────────────
  const createPeerConnection = useCallback((servers) => {
    closePeerConnection();

    const pc = new RTCPeerConnection({ iceServers: servers });
    pcRef.current = pc;

    // Add local tracks (only if we have a stream)
    if (localStreamRef.current && localStreamRef.current.getTracks().length > 0) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current);
      });
    }

    // Remote stream
    const remote = new MediaStream();
    setRemoteStream(remote);

    pc.ontrack = (event) => {
      event.streams[0]?.getTracks().forEach((track) => remote.addTrack(track));
    };

    // ICE candidates → relay via socket
    pc.onicecandidate = ({ candidate }) => {
      if (candidate) socket.emit('ice-candidate', { candidate });
    };

    pc.onconnectionstatechange = () => {
      console.log('[WebRTC] Connection state:', pc.connectionState);
      if (pc.connectionState === 'connected') setConnectionState('connected');
      if (['disconnected', 'failed', 'closed'].includes(pc.connectionState)) {
        setConnectionState('ended');
      }
    };

    return pc;
  }, []);

  const closePeerConnection = useCallback(() => {
    if (pcRef.current) {
      pcRef.current.ontrack = null;
      pcRef.current.onicecandidate = null;
      pcRef.current.onconnectionstatechange = null;
      pcRef.current.close();
      pcRef.current = null;
    }
    setRemoteStream(null);
  }, []);

  // ─── Socket event handlers ──────────────────────────────────────────────────
  useEffect(() => {
    const onWaiting = () => setConnectionState('waiting');

    const onMatched = async ({ role, sessionId: sid, iceServers: ice }) => {
      roleRef.current = role;
      setSessionId(sid);
      setIceServers(ice);
      setConnectionState('connecting');

      const pc = createPeerConnection(ice);

      if (role === 'caller') {
        // Caller creates and sends offer
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit('offer', { offer });
      }
      // Callee waits for offer event
    };

    const onOffer = async ({ offer }) => {
      const pc = pcRef.current;
      if (!pc) return;
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit('answer', { answer });
    };

    const onAnswer = async ({ answer }) => {
      const pc = pcRef.current;
      if (!pc) return;
      await pc.setRemoteDescription(new RTCSessionDescription(answer));
    };

    const onIceCandidate = async ({ candidate }) => {
      try {
        await pcRef.current?.addIceCandidate(new RTCIceCandidate(candidate));
      } catch {}
    };

    const onPartnerLeft = () => {
      closePeerConnection();
      setConnectionState('waiting');
      socket.emit('join-queue');
    };

    socket.on('waiting', onWaiting);
    socket.on('matched', onMatched);
    socket.on('offer', onOffer);
    socket.on('answer', onAnswer);
    socket.on('ice-candidate', onIceCandidate);
    socket.on('partner-left', onPartnerLeft);

    return () => {
      socket.off('waiting', onWaiting);
      socket.off('matched', onMatched);
      socket.off('offer', onOffer);
      socket.off('answer', onAnswer);
      socket.off('ice-candidate', onIceCandidate);
      socket.off('partner-left', onPartnerLeft);
    };
  }, [createPeerConnection, closePeerConnection]);

  // ─── Public API ─────────────────────────────────────────────────────────────
  const joinQueue = useCallback(async () => {
    if (!localStreamRef.current) {
      await initLocalStream();
    }
    if (!socket.connected) socket.connect();
    socket.emit('join-queue');
    setConnectionState('waiting');
  }, [initLocalStream]);

  const handleNext = useCallback(() => {
    closePeerConnection();
    socket.emit('next');
    setConnectionState('waiting');
  }, [closePeerConnection]);

  const toggleMute = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;
    stream.getAudioTracks().forEach((t) => (t.enabled = isMuted));
    setIsMuted((m) => !m);
  }, [isMuted]);

  const toggleCamera = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;
    stream.getVideoTracks().forEach((t) => (t.enabled = isCamOff));
    setIsCamOff((c) => !c);
  }, [isCamOff]);

  const hangUp = useCallback(() => {
    closePeerConnection();
    if (socket.connected) {
      socket.emit('next');
      socket.disconnect();
    }
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    setLocalStream(null);
    setConnectionState('idle');
  }, [closePeerConnection]);

  return {
    localStream,
    remoteStream,
    connectionState,
    sessionId,
    isMuted,
    isCamOff,
    joinQueue,
    handleNext,
    toggleMute,
    toggleCamera,
    hangUp,
  };
}
