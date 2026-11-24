/* Media */
import { useEffect, useState } from "react";

import { getMedia, isDemoMedia } from "@/store/services/demo/media";
import { cn } from "@/utils/cn";

/**
 * The address to put in src for any stored file: a web address as it is, a
 * demo upload (IndexedDB) as an object URL while it is on screen. Returns
 * null while a demo file loads or when it is gone.
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useMediaUrl(src) {
  const [demo, setDemo] = useState({ src: null, url: null });

  useEffect(() => {
    if (!isDemoMedia(src)) return undefined;
    let live = true;
    let made;
    getMedia(src).then((blob) => {
      if (!live) return;
      made = blob ? URL.createObjectURL(blob) : null;
      setDemo({ src, url: made });
    });
    return () => {
      live = false;
      if (made) URL.revokeObjectURL(made);
    };
  }, [src]);

  if (!src) return null;
  if (!isDemoMedia(src)) return src;
  return demo.src === src ? demo.url : null;
}

/**
 * An image from storage. Shows `fallback` when there is no file or it fails
 * to load, so a page never shows a broken-image icon.
 */
export default function Media({ src, alt = "", className, fallback = null, ...props }) {
  const url = useMediaUrl(src);
  const [failed, setFailed] = useState(null);
  if (!url || failed === url) return fallback;
  return <img src={url} alt={alt} loading="lazy" decoding="async" onError={() => setFailed(url)} className={cn("object-cover", className)} {...props} />;
}
