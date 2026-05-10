/**
 * useModeration.js — Periodic NSFW frame sampling on the remote video feed.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { loadModel, checkFrame } from '../lib/moderation';

const SAMPLE_INTERVAL_MS = 5000; // check every 5 seconds

export function useModeration(remoteVideoRef, enabled = true) {
  const [nsfwDetected, setNsfwDetected] = useState(false);
  const [modelReady, setModelReady] = useState(false);
  const modelRef = useRef(null);
  const timerRef = useRef(null);

  // Load model on mount
  useEffect(() => {
    loadModel().then((m) => {
      modelRef.current = m;
      setModelReady(!!m);
    });
  }, []);

  const startSampling = useCallback(() => {
    if (timerRef.current) return;
    timerRef.current = setInterval(async () => {
      const videoEl = remoteVideoRef.current;
      if (!videoEl || !modelRef.current) return;
      const flagged = await checkFrame(modelRef.current, videoEl);
      if (flagged) {
        setNsfwDetected(true);
        console.warn('[Moderation] NSFW content detected');
      }
    }, SAMPLE_INTERVAL_MS);
  }, [remoteVideoRef]);

  const stopSampling = useCallback(() => {
    clearInterval(timerRef.current);
    timerRef.current = null;
    setNsfwDetected(false);
  }, []);

  const dismissAlert = useCallback(() => setNsfwDetected(false), []);

  // Auto-start / stop based on enabled flag
  useEffect(() => {
    if (enabled && modelReady) {
      startSampling();
    } else {
      stopSampling();
    }
    return stopSampling;
  }, [enabled, modelReady, startSampling, stopSampling]);

  return { nsfwDetected, modelReady, dismissAlert };
}
