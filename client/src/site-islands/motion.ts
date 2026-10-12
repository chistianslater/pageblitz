import { cleanupOnPageExit, mountSiteMotion } from "./mountMotion";

cleanupOnPageExit(window, mountSiteMotion(document));
