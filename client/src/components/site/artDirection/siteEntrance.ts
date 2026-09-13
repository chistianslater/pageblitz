import { gsap } from "gsap";

/** Progressive enhancement: SSR remains readable before download and without JS. */
export function mountSiteEntrance(root: HTMLElement): () => void {
  const media = gsap.matchMedia();
  media.add("(prefers-reduced-motion: no-preference)", () => {
    const context = gsap.context(() => {}, root);
    const animated = new WeakSet<Element>();
    const activeTweens = new Set<gsap.core.Tween>();
    const reveal = (elements: HTMLElement[], hero = false) => {
      const targets = elements.filter(
        el => !animated.has(el) && !el.contains(document.activeElement)
      );
      targets.forEach(el => animated.add(el));
      if (!targets.length) return;
      context.add(() => {
        const tween = gsap.from(targets, {
          opacity: hero ? 0.25 : 0.4,
          y: hero ? 22 : 16,
          duration: hero ? 0.85 : 0.65,
          stagger: {
            each: 0.075,
            amount: Math.min(0.3, targets.length * 0.075),
          },
          ease: "power3.out",
          clearProps: "opacity,transform",
          onComplete: () => {
            activeTweens.delete(tween);
          },
        });
        activeTweens.add(tween);
      });
    };
    const hero = root.querySelector<HTMLElement>(".pb-art-hero");
    if (hero && hero.getBoundingClientRect().bottom > 0) {
      reveal(
        Array.from(
          hero.querySelectorAll<HTMLElement>(
            ".pb-art-copy > *, .pb-art-media, .pb-art-secondary, .pb-art-wordmark"
          )
        ),
        true
      );
    }
    const observer =
      typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver(
            entries => {
              entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                // Animate the content, never the section (sticky elements keep their containing block).
                reveal(
                  Array.from(entry.target.children).filter(
                    (el): el is HTMLElement =>
                      el instanceof HTMLElement &&
                      !["SCRIPT", "STYLE"].includes(el.tagName)
                  )
                );
                observer?.unobserve(entry.target);
              });
            },
            { threshold: 0.08 }
          )
        : null;
    root
      .querySelectorAll("section:not(#start)")
      .forEach(el => observer?.observe(el));
    const finish = () => {
      // context.getTweens() also exposes GSAP's internal from/start-state
      // tweens. Finishing those reapplies the faded start state after completion.
      // Only retain our currently running parent tweens, never completed helpers.
      Array.from(activeTweens).forEach(tween => tween.progress(1));
    };
    root.addEventListener("focusin", finish);
    return () => {
      observer?.disconnect();
      root.removeEventListener("focusin", finish);
      context.revert();
      activeTweens.clear();
    };
  });
  return () => media.revert();
}
