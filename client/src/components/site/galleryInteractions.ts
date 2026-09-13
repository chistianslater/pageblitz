/** Client-rendered previews need the same gallery controls as SSR's siteEnhancer. */
export function mountGalleryInteractions(root: HTMLElement): () => void {
  const doc = root.ownerDocument;
  const images = Array.from(
    root.querySelectorAll<HTMLImageElement>("#galerie img")
  );
  if (!images.length) return () => {};
  const abort = new AbortController();
  const grid = root.querySelector<HTMLElement>(
    '#galerie [data-pb-slot="gallery-items"]'
  );
  let albumBar: HTMLElement | undefined;
  const albumItems: HTMLElement[] = [];
  const tag = root.querySelector("script[data-pb-albums]");
  if (grid && tag) {
    try {
      const albums = JSON.parse(tag.textContent || "[]") as Array<{
        title: string;
        urls: string[];
      }>;
      if (Array.isArray(albums) && albums.length) {
        albumBar = doc.createElement("div");
        albumBar.className = "pb-album-chips";
        albumBar.setAttribute("role", "group");
        albumBar.setAttribute("aria-label", "Alben");
        Array.from(grid.children).forEach(child => {
          if (!(child instanceof HTMLElement)) return;
          const img =
            child instanceof HTMLImageElement
              ? child
              : child.querySelector("img");
          if (!img) return;
          const index = albums.findIndex(album =>
            album.urls.includes(img.getAttribute("src") || "")
          );
          child.setAttribute("data-pb-album-item", "");
          if (index >= 0) child.setAttribute("data-pb-album", String(index));
          albumItems.push(child);
        });
        ["Alle", ...albums.map(a => a.title)].forEach((title, i) => {
          const button = doc.createElement("button");
          button.type = "button";
          button.textContent = title;
          const value = i === 0 ? "alle" : String(i - 1);
          button.setAttribute("data-pb-album-chip", value);
          button.setAttribute("aria-pressed", String(i === 0));
          button.addEventListener(
            "click",
            () => {
              grid.setAttribute("data-pb-album-filter", value);
              Array.from(albumBar!.children).forEach(b =>
                b.setAttribute("aria-pressed", String(b === button))
              );
            },
            { signal: abort.signal }
          );
          albumBar!.appendChild(button);
        });
        grid.before(albumBar);
        grid.setAttribute("data-pb-album-filter", "alle");
      }
    } catch {
      /* Invalid optional album data must not disable the gallery. */
    }
  }
  const saved = images.map(
    img =>
      [
        img.getAttribute("tabindex"),
        img.getAttribute("role"),
        img.getAttribute("aria-label"),
      ] as const
  );
  images.forEach(img => {
    img.tabIndex = 0;
    img.setAttribute("role", "button");
    img.setAttribute(
      "aria-label",
      `Bild vergrößern: ${img.alt || "Galeriebild"}`
    );
  });
  root.classList.add("pb-gallery-active");
  const overlay = doc.createElement("div");
  overlay.className = "pb-lb";
  overlay.hidden = true;
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-label", "Bildansicht");
  overlay.innerHTML =
    '<button type="button" class="pb-lb-close" aria-label="Schließen">&times;</button><button type="button" class="pb-lb-prev" aria-label="Vorheriges Bild">&lsaquo;</button><img class="pb-lb-img" alt=""><p class="pb-lb-cap"></p><button type="button" class="pb-lb-next" aria-label="Nächstes Bild">&rsaquo;</button>';
  doc.body.appendChild(overlay);
  const closeButton = overlay.querySelector<HTMLButtonElement>(".pb-lb-close")!;
  const prev = overlay.querySelector<HTMLButtonElement>(".pb-lb-prev")!;
  const next = overlay.querySelector<HTMLButtonElement>(".pb-lb-next")!;
  const photo = overlay.querySelector<HTMLImageElement>(".pb-lb-img")!;
  const caption = overlay.querySelector<HTMLElement>(".pb-lb-cap")!;
  let list = images,
    index = 0,
    lastFocus: HTMLElement | null = null,
    overflow = "",
    touchX = 0;
  const show = (n: number) => {
    index = (n + list.length) % list.length;
    photo.src = list[index].currentSrc || list[index].src;
    photo.alt = list[index].alt;
    caption.textContent = photo.alt;
  };
  const close = () => {
    if (overlay.hidden) return;
    overlay.hidden = true;
    overlay.classList.remove("pb-lb-open");
    doc.body.style.overflow = overflow;
    lastFocus?.focus({ preventScroll: true });
  };
  const open = (img: HTMLImageElement) => {
    list = images.filter(i => i.getClientRects().length > 0);
    if (!list.includes(img)) return;
    lastFocus = img;
    overflow = doc.body.style.overflow;
    show(list.indexOf(img));
    prev.hidden = next.hidden = list.length < 2;
    overlay.hidden = false;
    overlay.classList.add("pb-lb-open");
    doc.body.style.overflow = "hidden";
    closeButton.focus();
  };
  const options = { signal: abort.signal };
  root.addEventListener(
    "click",
    event => {
      const target = event.target;
      if (target instanceof HTMLImageElement && images.includes(target)) {
        event.preventDefault();
        open(target);
      }
    },
    options
  );
  root.addEventListener(
    "keydown",
    event => {
      if (
        (event.key === "Enter" || event.key === " ") &&
        images.includes(event.target as HTMLImageElement)
      ) {
        event.preventDefault();
        open(event.target as HTMLImageElement);
      }
    },
    options
  );
  closeButton.addEventListener("click", close, options);
  prev.addEventListener("click", () => show(index - 1), options);
  next.addEventListener("click", () => show(index + 1), options);
  overlay.addEventListener(
    "click",
    e => {
      if (e.target === overlay) close();
    },
    options
  );
  overlay.addEventListener(
    "touchstart",
    e => {
      touchX = e.changedTouches[0].clientX;
    },
    { ...options, passive: true }
  );
  overlay.addEventListener(
    "touchend",
    e => {
      const dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
    },
    { ...options, passive: true }
  );
  doc.addEventListener(
    "keydown",
    event => {
      if (overlay.hidden) return;
      if (event.key === "Escape") {
        event.preventDefault();
        close();
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        show(index - 1);
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        show(index + 1);
      }
      if (event.key === "Tab") {
        const buttons = [closeButton, prev, next].filter(b => !b.hidden),
          first = buttons[0],
          last = buttons[buttons.length - 1];
        if (event.shiftKey && doc.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && doc.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    },
    options
  );
  return () => {
    close();
    abort.abort();
    overlay.remove();
    albumBar?.remove();
    grid?.removeAttribute("data-pb-album-filter");
    albumItems.forEach(item => {
      item.removeAttribute("data-pb-album-item");
      item.removeAttribute("data-pb-album");
    });
    root.classList.remove("pb-gallery-active");
    images.forEach((img, i) =>
      ["tabindex", "role", "aria-label"].forEach((attr, j) => {
        const value = saved[i][j];
        if (value === null) img.removeAttribute(attr);
        else img.setAttribute(attr, value);
      })
    );
  };
}
