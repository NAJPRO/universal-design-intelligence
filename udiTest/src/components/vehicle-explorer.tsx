"use client";

import ResilientImage from "./resilient-image";
import { useRef, useState } from "react";
import { Arrow } from "./icons";

const models = [
  { name: "Revuelto", category: "V12 HIGH PERFORMANCE HYBRID", image: "/images/revuelto-collection.webp", alt: "Orange Lamborghini Revuelto, viewed from the front three-quarter angle", headline: "A new energy. The same untamed soul.", description: "A naturally aspirated V12 meets three electric motors. The Revuelto carries the emotion of Lamborghini into a new era, with an unmistakable silhouette and an entirely new perspective on performance.", power: "1,015", speed: ">350", acceleration: "2.5", engine: "V12", source: "https://www.lamborghini.com/en-en/models/revuelto" },
  { name: "Temerario", category: "V8 TWIN-TURBO HYBRID", image: "/images/temerario-collection.webp", alt: "Lime Lamborghini Temerario viewed from the rear three-quarter angle", headline: "A different heartbeat. An unmistakable instinct.", description: "A twin-turbo V8 and three electric motors give the Temerario its own character. Hexagonal light signatures and sharply resolved surfaces bring a fresh expression to the Lamborghini design language.", power: "920", speed: "343", acceleration: "2.7", engine: "V8", source: "https://www.lamborghini.com/en-en/models/temerario" },
  { name: "Urus SE", category: "PLUG-IN HYBRID SUPER SUV", image: "/images/urus-collection.webp", alt: "Green Lamborghini Urus SE displaying its muscular SUV proportions", headline: "Extraordinary has more than one terrain.", description: "The Urus SE brings plug-in hybrid engineering to a boldly proportioned Super SUV. A different expression of performance, combining everyday versatility with the unmistakable presence of a Lamborghini.", power: "800", speed: "312", acceleration: "3.4", engine: "V8", source: "https://www.lamborghini.com/en-en/models/urus/urus-se" },
];

export default function VehicleExplorer() {
  const [selected, setSelected] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const model = models[selected];
  function change(index: number, focus = false) { setSelected(index); if (focus) tabs.current[index]?.focus(); }
  return <section id="collection" className="collection section-pad" aria-labelledby="collection-title">
    <div className="section-topline"><span className="eyebrow"><span className="accent-dot" /> THE COLLECTION</span><span className="index-label">01 — 03 / A NEW ERA</span></div>
    <div className="collection-heading"><h2 id="collection-title">Three expressions.<br /><span className="muted">One extraordinary DNA.</span></h2><p>Different by design.<br />Unmistakable by nature.</p></div>
    <div className="model-tabs" role="tablist" aria-label="Explore Lamborghini models">
      {models.map((item, index) => <button key={item.name} ref={el => { tabs.current[index] = el; }} id={`model-tab-${index}`} role="tab" aria-selected={selected === index} aria-controls="model-panel" tabIndex={selected === index ? 0 : -1} onClick={() => change(index)} onKeyDown={event => {
        let next: number | undefined;
        if (event.key === "ArrowRight") next = (selected + 1) % models.length;
        if (event.key === "ArrowLeft") next = (selected + models.length - 1) % models.length;
        if (event.key === "Home") next = 0;
        if (event.key === "End") next = models.length - 1;
        if (next !== undefined) { event.preventDefault(); change(next, true); }
      }}><span className="tab-number">0{index + 1}</span><span>{item.name}</span><Arrow diagonal /></button>)}
    </div>
    <div id="model-panel" role="tabpanel" tabIndex={0} aria-labelledby={`model-tab-${selected}`}>
      <div className="model-visual"><span className="model-watermark" aria-hidden="true">{model.name}</span><ResilientImage className="model-photo" src={model.image} alt={model.alt} label={model.name} contain sizes="(min-width: 1800px) 1624px, 90vw" /><div className="model-visual-bottom"><span className="eyebrow">{model.category}</span><span className="image-counter">0{selected + 1} <span>/ 03</span></span></div></div>
      <div className="model-detail"><div><span className="eyebrow muted">{model.name.toUpperCase()} / IN FOCUS</span><h3>{model.headline}</h3><p>{model.description}</p></div><div className="model-specs"><div><span className="spec-number">{model.power}<small> CV</small></span><span className="spec-label">COMBINED POWER</span></div><div><span className="spec-number">{model.acceleration}<small> s</small></span><span className="spec-label">0–100 KM/H</span></div><div><span className="spec-number">{model.speed}<small> km/h</small></span><span className="spec-label">TOP SPEED</span></div><a href={model.source} target="_blank" rel="noreferrer" className="text-link">Official model & specifications <Arrow diagonal /><span className="sr-only"> (opens in a new tab)</span></a></div></div>
    </div>
  </section>;
}
