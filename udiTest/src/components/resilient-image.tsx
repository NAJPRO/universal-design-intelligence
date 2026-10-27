"use client";

import Image from "next/image";
import { useState } from "react";

type Photograph = { src: string; alt: string; position?: string };
type Props = Photograph & { className: string; sizes: string; label: string; contain?: boolean };

/** Keep the last decoded photograph visible until its replacement is usable. */
export default function ResilientImage({ src, alt, position = "center", className, sizes, label, contain = false }: Props) {
  const [decoded, setDecoded] = useState<Photograph | null>(null);
  const [failed, setFailed] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const ready = decoded?.src === src;
  const error = failed === src;
  const state = error ? "error" : ready ? "ready" : "loading";
  const fit = contain ? "contain" : "cover";

  return <div className={`${className} resilient-image`} data-image-state={state} aria-busy={state === "loading"}>
    {decoded && !ready && <Image className="retained-image" src={decoded.src} alt={decoded.alt} fill sizes={sizes} style={{ objectFit: fit, objectPosition: decoded.position }} />}
    {!error && <Image key={`${src}-${attempt}`} src={src} alt={ready ? alt : ""} aria-hidden={!ready} fill sizes={sizes}
      style={{ objectFit: fit, objectPosition: position, opacity: ready ? 1 : 0 }}
      onLoad={async event => {
        const image = event.currentTarget;
        try {
          await image.decode();
          if (image.isConnected) { setDecoded({ src, alt, position }); setFailed(null); }
        } catch { if (image.isConnected) setFailed(src); }
      }}
      onError={() => setFailed(src)} />}
    {state !== "ready" && <div className="image-feedback" role="status" aria-live="polite">
      <p>{error ? `${label} photograph unavailable.` : `Loading ${label} photograph…`}</p>
      {decoded && <p className="image-feedback-detail">Showing the previous photograph.</p>}
      {error && <><p className="image-feedback-detail">The text and exploration controls remain available.</p><button type="button" onClick={() => { setAttempt(attempt + 1); setFailed(null); }}>Retry photograph <span aria-hidden="true">↻</span></button></>}
    </div>}
  </div>;
}
