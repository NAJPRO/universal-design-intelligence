"use client";

import ResilientImage from "./resilient-image";
import { useState } from "react";
import { Arrow } from "./icons";

const chapters = [
  { label: "01 / THE SURFACES", title: "Every line has a purpose.", text: "Low. Sculpted. Unmistakable. The Revuelto’s surfaces bring airflow and expression into the same conversation.", image: "/images/revuelto-detail.webp", alt: "Detail of the orange Revuelto’s sculpted front, wheel, and light signature" },
  { label: "02 / THE COCKPIT", title: "The driver. At the center.", text: "Angular architecture, tactile controls, and a cockpit that wraps around the driver. A space shaped by the act of driving.", image: "/images/cockpit-detail.webp", alt: "Lamborghini Revuelto interior with driver-focused instruments and angular center console" },
];

export default function ImageStory() {
  const [current, setCurrent] = useState(0);
  const chapter = chapters[current];
  return <section id="vision" className="vision" aria-labelledby="vision-title">
    <ResilientImage className="vision-image" src={chapter.image} alt={chapter.alt} label={current === 0 ? "Exterior" : "Cockpit"} sizes="max(100vw, 200vh)" /><div className="vision-shade" />
    <div className="vision-top"><span className="eyebrow">THE DESIGN LANGUAGE</span><span className="eyebrow">FORM. FUNCTION. FEELING.</span></div>
    <div className="vision-content"><span className="eyebrow accent">{chapter.label}</span><h2 id="vision-title">{chapter.title}</h2><p>{chapter.text}</p><div className="story-controls"><span className="story-progress" aria-live="polite">0{current + 1}<span> / 02</span></span><button aria-label="Previous design chapter" onClick={() => setCurrent((current + 1) % chapters.length)}><Arrow className="rotate-180" /></button><button aria-label="Next design chapter" onClick={() => setCurrent((current + 1) % chapters.length)}><Arrow /></button></div></div>
    <span className="vision-caption">A STUDY IN THE EXTRAORDINARY</span>
  </section>;
}
