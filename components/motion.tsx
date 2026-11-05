"use client";

import { useEffect } from "react";

/**
 * One controller for the page's light motion: sections fade in as they enter the
 * viewport, and the hero terminal leans a few degrees towards the pointer.
 * Both are opt-in through `data-reveal` / `data-tilt`, and neither runs when the
 * visitor asked for reduced motion.
 */
export function Motion() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const targets = [...document.querySelectorAll<HTMLElement>("[data-reveal]")];

    if (reduced || !("IntersectionObserver" in window)) {
      for (const target of targets) target.classList.add("is-in");
      return;
    }

    const reveal = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-in");
          reveal.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.08 },
    );
    for (const target of targets) reveal.observe(target);

    const tilt = document.querySelector<HTMLElement>("[data-tilt]");
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    let frame = 0;

    function onMove(event: PointerEvent) {
      if (!tilt) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const box = tilt.getBoundingClientRect();
        const x = (event.clientX - box.left) / box.width - 0.5;
        const y = (event.clientY - box.top) / box.height - 0.5;
        tilt.style.setProperty("--ry", `${(x * 6).toFixed(2)}deg`);
        tilt.style.setProperty("--rx", `${(-y * 5).toFixed(2)}deg`);
      });
    }

    function onLeave() {
      if (!tilt) return;
      cancelAnimationFrame(frame);
      tilt.style.removeProperty("--rx");
      tilt.style.removeProperty("--ry");
    }

    if (tilt && fine) {
      tilt.addEventListener("pointermove", onMove);
      tilt.addEventListener("pointerleave", onLeave);
    }

    return () => {
      reveal.disconnect();
      cancelAnimationFrame(frame);
      tilt?.removeEventListener("pointermove", onMove);
      tilt?.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return null;
}
