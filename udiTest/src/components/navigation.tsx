"use client";

import { useEffect, useRef, useState } from "react";
import { Arrow, Wordmark } from "./icons";

const destinations = [{ href: "#collection", label: "The collection" }, { href: "#vision", label: "The vision" }, { href: "#engineering", label: "Engineering" }, { href: "#journal", label: "The journal" }];

export default function Navigation() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("");
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let frame = 0;
    function update() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const readingLine = Math.min(window.innerHeight * 0.2, 180);
        const current = destinations.find(({ href }) => {
          const rect = document.querySelector(href)?.getBoundingClientRect();
          return rect && rect.top <= readingLine && rect.bottom > readingLine;
        });
        setActive(current?.href ?? "");
      });
    }
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("scroll", update); window.removeEventListener("resize", update); };
  }, []);

  useEffect(() => {
    if (!open) return;
    function dismiss(event: KeyboardEvent) { if (event.key === "Escape") { setOpen(false); trigger.current?.focus(); } }
    function resize() { if (window.innerWidth >= 1000) setOpen(false); }
    document.addEventListener("keydown", dismiss);
    window.addEventListener("resize", resize);
    return () => { document.removeEventListener("keydown", dismiss); window.removeEventListener("resize", resize); };
  }, [open]);

  return <header className="site-header">
    <a className="brand-link" href="#top" aria-label="Lamborghini independent concept, back to top"><Wordmark /></a>
    <button ref={trigger} className="menu-toggle" aria-controls="main-navigation" aria-expanded={open} onClick={() => setOpen(!open)}><span>{open ? "Close" : "Menu"}</span><span className={open ? "menu-lines is-open" : "menu-lines"}><i /><i /></span></button>
    <nav id="main-navigation" aria-label="Main navigation" className={open ? "main-nav is-open" : "main-nav"}>
      {destinations.map(({ href, label }) => <a key={href} href={href} aria-current={active === href ? "location" : undefined} onClick={() => setOpen(false)}>{label}</a>)}
      <a href="#explore" className="nav-explore" onClick={() => setOpen(false)}>Explore the extraordinary <Arrow diagonal /></a>
    </nav>
  </header>;
}
