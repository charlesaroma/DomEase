/* Photo Resizing */

/**
 * Photos are shrunk in the browser before upload, so a 6 MB phone photo is
 * never what a household downloads over mobile data. WebP where the browser
 * can encode it; Safari can't from a canvas (it hands back a PNG), so there
 * it is JPEG.
 */
const encode = (canvas, type, quality) => new Promise((resolve) => canvas.toBlob(resolve, type, quality));

export function resizePhoto(file, maxWidth = 1600) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, maxWidth / img.naturalWidth);
      const width = Math.round(img.naturalWidth * scale);
      const height = Math.round(img.naturalHeight * scale);
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d").drawImage(img, 0, 0, width, height);
      encode(canvas, "image/webp", 0.82)
        .then((webp) => (webp?.type === "image/webp" ? webp : encode(canvas, "image/jpeg", 0.85)))
        .then((blob) => (blob ? resolve({ blob, width, height }) : reject(new Error("Could not read that image."))), reject);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("That file is not an image this browser can open."));
    };
    img.src = url;
  });
}

export const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
export const MAX_PHOTO_MB = 15;
export const MAX_PDF_MB = 20;
