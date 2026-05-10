/**
 * recorder.js — consent-based MediaRecorder utility
 *
 * Records ONLY when both users have consented.
 * Saves to local device — no upload, ever.
 */

let _mediaRecorder = null;
let _chunks = [];

/**
 * Start recording a MediaStream.
 * @param {MediaStream} stream - The combined (or local) stream to record
 * @returns {boolean} whether recording started
 */
export function startRecording(stream) {
  if (_mediaRecorder && _mediaRecorder.state !== 'inactive') return false;

  const mimeType = getSupportedMimeType();
  _chunks = [];

  try {
    _mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : {});
    _mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) _chunks.push(e.data);
    };
    _mediaRecorder.start(1000); // collect chunks every 1s
    console.log('[Recorder] Started — mimeType:', mimeType || 'browser default');
    return true;
  } catch (err) {
    console.error('[Recorder] Failed to start:', err);
    return false;
  }
}

/**
 * Stop recording and trigger a download to the user's device.
 * @returns {Blob|null}
 */
export function stopRecording() {
  if (!_mediaRecorder || _mediaRecorder.state === 'inactive') return null;

  return new Promise((resolve) => {
    _mediaRecorder.onstop = () => {
      const mimeType = _mediaRecorder.mimeType || 'video/webm';
      const blob = new Blob(_chunks, { type: mimeType });
      _chunks = [];
      downloadBlob(blob, `neontalk-recording-${Date.now()}.webm`);
      resolve(blob);
    };
    _mediaRecorder.stop();
  });
}

export function isRecording() {
  return _mediaRecorder?.state === 'recording';
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getSupportedMimeType() {
  const types = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm',
    'video/mp4',
  ];
  return types.find((t) => MediaRecorder.isTypeSupported(t)) || '';
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
