import Image from "next/image";
import Link from "next/link";
import Navigation from "@/components/navigation";
import VehicleExplorer from "@/components/vehicle-explorer";
import ImageStory from "@/components/image-story";
import HeroPhotograph from "@/components/hero-photograph";
import { Arrow, Wordmark } from "@/components/icons";

export default function Home() {
  return <>
    <a className="skip-link" href="#main">Skip to content</a>
    <Navigation />
    <main id="main">
      <section id="top" className="hero" aria-labelledby="hero-title">
        <HeroPhotograph /><div className="hero-shade" />
        <div className="hero-content"><div className="hero-overline"><span className="accent-line" /><span className="eyebrow">THE NEXT CHAPTER IS ELECTRIC.</span></div><p className="hero-model">LAMBORGHINI REVUELTO</p><h1 id="hero-title">Beyond the<br /><span>expected.</span></h1><p className="hero-description">A new era of performance.<br />An uncompromising expression of emotion.</p><a href="#collection" className="button-primary">Explore the collection <Arrow diagonal /></a></div>
        <div className="hero-rail"><span>DESIGNED TO DEFY. ENGINEERED TO INSPIRE.</span><span className="rail-line" /></div>
        <div className="hero-bottom"><a href="#collection" className="scroll-cue"><span className="scroll-arrow">↓</span><span>SCROLL TO EXPLORE</span></a><div className="hero-specs"><div><strong>1,015<span> CV</span></strong><span>COMBINED POWER</span></div><div><strong>2.5<span> s</span></strong><span>0–100 KM/H</span></div><div><strong>V12<span> HYBRID</span></strong><span>A NEW BREED</span></div></div><span className="hero-edition">EST. 1963<br /><span>REIMAGINED TODAY.</span></span></div>
        <div className="hero-corner" aria-hidden="true" />
      </section>

      <div className="manifesto-strip"><span>SANT’AGATA BOLOGNESE, ITALIA</span><p>Some follow a road. <span>Others redefine it.</span></p><span className="italian-stripe" aria-hidden="true"><i /><i /><i /></span></div>

      <VehicleExplorer />
      <ImageStory />

      <section id="engineering" className="engineering section-pad" aria-labelledby="engineering-title">
        <div className="section-topline"><span className="eyebrow"><span className="accent-dot" /> ENGINEERED FOR EMOTION</span><span className="index-label">BEYOND THE NUMBERS</span></div>
        <div className="engineering-heading"><h2 id="engineering-title">The science.<br /><span className="muted">The sensation.</span></h2><p>Behind every extraordinary moment is an extraordinary idea. Explore the engineering at the heart of the Revuelto.</p></div>
        <div className="engineering-grid"><article><span className="technical-icon">V<span>12</span></span><span className="eyebrow muted">01 / POWERTRAIN</span><h3>Electric meets instinct.</h3><p>A naturally aspirated V12, three electric motors, and an eight-speed dual-clutch transmission. A new architecture for a familiar rush.</p></article><article><span className="technical-icon aero-icon" aria-hidden="true">↗</span><span className="eyebrow muted">02 / AERODYNAMICS</span><h3>Shaped by the air.</h3><p>Air intakes, an active rear wing, and carefully sculpted surfaces work together. Every opening becomes part of a bigger purpose.</p></article><article><span className="technical-icon carbon-icon" aria-hidden="true">◇</span><span className="eyebrow muted">03 / STRUCTURE</span><h3>Strength in every fiber.</h3><p>A carbon-fiber monofuselage brings an aeronautical approach to the structure. Lightweight thinking at the very core of the car.</p></article></div>
        <a className="text-link engineering-source" href="https://www.lamborghini.com/en-en/models/revuelto" target="_blank" rel="noreferrer">Explore the official Revuelto engineering <Arrow diagonal /><span className="sr-only"> (opens in a new tab)</span></a>
      </section>

      <section id="journal" className="journal section-pad" aria-labelledby="journal-title"><div className="journal-image"><Image src="/images/cockpit-detail.webp" alt="A close view of the Revuelto cockpit and its angular Italian design details" fill sizes="max(50vw, 1800px)" /></div><div className="journal-copy"><span className="eyebrow"><span className="accent-dot" /> THE JOURNAL / DESIGN NOTES</span><h2 id="journal-title">A different<br />kind of<br /><em>Italian art.</em></h2><p>There is a tension in Lamborghini design. Between the sculptural and the mechanical. Between a single, unmistakable line and the complexity beneath it.</p><p>From the low silhouette to the geometry of the cockpit, each detail feels part of the same idea: the extraordinary should be something you can feel.</p><details className="editorial-details"><summary>Read the design perspective <span>+</span></summary><div><h3>The line that connects everything.</h3><p>The Revuelto’s sharp surfaces and central silhouette connect a recognizable heritage with hybrid engineering. Inside, hexagonal forms give the controls a visual rhythm, while the driver remains the focus.</p><p>This independent design study looks at the car as a meeting point of sculpture, technology, and emotion.</p><a className="text-link" href="https://www.lamborghini.com/en-en/models/revuelto" target="_blank" rel="noreferrer">Discover the original design <Arrow diagonal /><span className="sr-only"> (opens in a new tab)</span></a></div></details></div></section>

      <section id="explore" className="explore section-pad"><div className="explore-top"><span className="eyebrow">THERE IS NO ORDINARY WAY FORWARD.</span><span className="eyebrow muted">YOUR NEXT CHAPTER</span></div><div className="explore-bottom"><h2>Find your<br /><span>extraordinary.</span></h2><a className="explore-arrow" href="#collection" aria-label="Explore all three Lamborghini models"><Arrow diagonal /></a></div><div className="explore-caption"><span>THREE MODELS. COUNTLESS POSSIBILITIES.</span><a href="#collection" className="text-link">Explore the collection <Arrow /></a></div></section>
    </main>
    <footer className="site-footer section-pad"><div className="footer-top"><a href="#top" aria-label="Back to top"><Wordmark /></a><a className="back-top" href="#top">Back to top <span>↑</span></a></div><div className="footer-bottom"><p>An independent automotive design concept. Not affiliated with, endorsed by, or sponsored by Automobili Lamborghini S.p.A. All trademarks belong to their respective owners.</p><div><Link href="/credits">Image credits & sources <Arrow diagonal /></Link><span>© 2026 INDEPENDENT DESIGN STUDY</span></div></div></footer>
  </>;
}
