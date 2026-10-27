import { getImageProps } from "next/image";

// The background is capped at 1100 CSS px high. Budget for its *cover crop*,
// not merely the element width: portrait 1:2 => max 550px; landscape 2:1 => 2200px.
// Next generates DPR-appropriate renditions from native-resolution source crops.
export default function HeroPhotograph() {
  const { props: portrait } = getImageProps({ src: "/images/hero-portrait.webp", alt: "", width: 1920, height: 3840, sizes: "max(100vw, 550px)", quality: 85 });
  const { props: landscape } = getImageProps({ src: "/images/hero-landscape.webp", alt: "Lamborghini Revuelto: sculpted bodywork and its distinctive front lighting", width: 5120, height: 2560, sizes: "max(100vw, 2200px)", quality: 85, loading: "eager", fetchPriority: "high" });
  return <div className="hero-image"><picture>
    <source media="(max-width: 767px)" srcSet={portrait.srcSet} sizes={portrait.sizes} />
    {/* Native picture allows genuine portrait art direction rather than an enlarged landscape. */}
    <img {...landscape} alt={landscape.alt} />
  </picture></div>;
}
