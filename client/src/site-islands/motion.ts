import { mountSiteEntrance } from "../components/site/artDirection/siteEntrance";
import { mountJournalMotion } from "../components/site/systems/journal/motion";
import { mountRasterMotion } from "../components/site/systems/raster/motion";
import { mountWerkstoffMotion } from "../components/site/systems/werkstoff/motion";
const cleanups = [
  ...Array.from(
    document.querySelectorAll<HTMLElement>('.pb-site[data-pb-revision="2"]')
  ).map(mountSiteEntrance),
  ...Array.from(
    document.querySelectorAll<HTMLElement>(".pb-journal")
  ).map(mountJournalMotion),
  ...Array.from(
    document.querySelectorAll<HTMLElement>(".pb-raster")
  ).map(mountRasterMotion),
  ...Array.from(
    document.querySelectorAll<HTMLElement>(".pb-werkstoff")
  ).map(mountWerkstoffMotion),
];
window.addEventListener(
  "pagehide",
  () => cleanups.forEach(cleanup => cleanup()),
  { once: true }
);
