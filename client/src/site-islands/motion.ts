import { mountSiteEntrance } from "../components/site/artDirection/siteEntrance";
const cleanups = Array.from(
  document.querySelectorAll<HTMLElement>('.pb-site[data-pb-revision="2"]')
).map(mountSiteEntrance);
window.addEventListener(
  "pagehide",
  () => cleanups.forEach(cleanup => cleanup()),
  { once: true }
);
