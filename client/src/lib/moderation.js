/**
 * moderation.js — client-side NSFW detection via nsfwjs + TensorFlow.js
 *
 * Usage:
 *   import { loadModel, checkFrame } from './moderation';
 *   const model = await loadModel();
 *   const isNsfw = await checkFrame(model, videoElement);
 */

let _model = null;

/**
 * Lazy-loads the NSFW.js model (MobileNet v2, ~8 MB via CDN).
 * Call once on mount; reuse the returned model instance.
 */
export async function loadModel() {
  if (_model) return _model;
  try {
    // nsfwjs is loaded via CDN script tag (see index.html) for smaller bundle.
    // If you install it via npm, swap with: import * as nsfwjs from 'nsfwjs';
    if (typeof window.nsfwjs === 'undefined') {
      console.warn('[Moderation] nsfwjs not available on window — skipping');
      return null;
    }
    _model = await window.nsfwjs.load('MobileNetV2');
    console.log('[Moderation] NSFW model loaded');
    return _model;
  } catch (err) {
    console.error('[Moderation] Failed to load model:', err);
    return null;
  }
}

/**
 * Classifies a single frame from a <video> element.
 * Returns true if NSFW content is detected above threshold.
 * @param {object} model - nsfwjs model instance
 * @param {HTMLVideoElement} videoEl
 * @param {number} [threshold=0.7]
 * @returns {Promise<boolean>}
 */
export async function checkFrame(model, videoEl, threshold = 0.7) {
  if (!model || !videoEl || videoEl.readyState < 2) return false;
  try {
    const predictions = await model.classify(videoEl);
    const nsfwCategories = ['Porn', 'Sexy', 'Hentai'];
    const nsfwScore = predictions
      .filter((p) => nsfwCategories.includes(p.className))
      .reduce((sum, p) => sum + p.probability, 0);
    return nsfwScore > threshold;
  } catch {
    return false;
  }
}
