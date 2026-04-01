'use strict';

// ─── Camera Module ───────────────────────────────────────────────────────────
// Photo capture, compression, and thumbnail generation.
// Uses <input type="file" accept="image/*" capture> for cross-platform camera.
// All images are compressed to JPEG before storage.

const Camera = (() => {
  const MAX_WIDTH    = 1280;
  const JPEG_QUALITY = 0.72;
  const THUMB_SIZE   = 140;

  function _loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload  = () => resolve(img);
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = src;
    });
  }

  function _drawScaled(img, maxDim, quality) {
    const canvas = document.createElement('canvas');
    let w = img.width, h = img.height;
    if (w > maxDim || h > maxDim) {
      const ratio = Math.min(maxDim / w, maxDim / h);
      w = Math.round(w * ratio);
      h = Math.round(h * ratio);
    }
    canvas.width = w;
    canvas.height = h;
    canvas.getContext('2d').drawImage(img, 0, 0, w, h);
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        blob => blob ? resolve(blob) : reject(new Error('Compression failed')),
        'image/jpeg', quality
      );
    });
  }

  async function compressImage(file, maxWidth = MAX_WIDTH, quality = JPEG_QUALITY) {
    const url = URL.createObjectURL(file);
    try {
      const img = await _loadImage(url);
      return await _drawScaled(img, maxWidth, quality);
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  async function createThumbnail(blob, size = THUMB_SIZE) {
    const url = URL.createObjectURL(blob);
    try {
      const img = await _loadImage(url);
      const canvas = document.createElement('canvas');
      let w = img.width, h = img.height;
      const ratio = Math.min(size / w, size / h);
      w = Math.round(w * ratio);
      h = Math.round(h * ratio);
      canvas.width = w;
      canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      return canvas.toDataURL('image/jpeg', 0.55);
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  function blobToDataUrl(blob) {
    return new Promise(resolve => {
      const r = new FileReader();
      r.onloadend = () => resolve(r.result);
      r.readAsDataURL(blob);
    });
  }

  function capturePhoto() {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type    = 'file';
      input.accept  = 'image/*';
      input.capture = 'environment';
      input.style.display = 'none';
      document.body.appendChild(input);

      let settled = false;
      input.onchange = async () => {
        settled = true;
        _cleanup();
        if (input.files && input.files[0]) {
          try { resolve(await compressImage(input.files[0])); }
          catch (e) { reject(e); }
        } else {
          reject(new Error('No file selected'));
        }
      };

      function _cleanup() {
        if (document.body.contains(input)) document.body.removeChild(input);
      }

      // Detect cancel on mobile (focus returns without a file)
      const onFocus = () => {
        setTimeout(() => {
          if (!settled) { _cleanup(); reject(new Error('Cancelled')); }
          window.removeEventListener('focus', onFocus);
        }, 500);
      };
      window.addEventListener('focus', onFocus);

      input.click();
    });
  }

  return { compressImage, createThumbnail, blobToDataUrl, capturePhoto };
})();
