/**
 * useConsent.js — Manages recording consent state for both peers.
 */

import { useEffect, useState, useCallback } from 'react';
import { socket } from '../lib/socket';

export function useConsent() {
  const [myConsent, setMyConsent] = useState(false);
  const [partnerConsent, setPartnerConsent] = useState(false);
  const bothConsented = myConsent && partnerConsent;

  useEffect(() => {
    const onPartnerConsent = () => setPartnerConsent(true);
    socket.on('partner-consent', onPartnerConsent);
    return () => socket.off('partner-consent', onPartnerConsent);
  }, []);

  const giveConsent = useCallback(() => {
    setMyConsent(true);
    socket.emit('consent-given');
  }, []);

  const revokeConsent = useCallback(() => {
    setMyConsent(false);
    setPartnerConsent(false);
  }, []);

  const resetConsent = useCallback(() => {
    setMyConsent(false);
    setPartnerConsent(false);
  }, []);

  return { myConsent, partnerConsent, bothConsented, giveConsent, revokeConsent, resetConsent };
}
