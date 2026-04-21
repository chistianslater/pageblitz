import { processPendingLifecycleEmails, processExpiredReservations } from "./lifecycleScheduler";

const TICK_INTERVAL_MS = 5 * 60 * 1000; // alle 5 Minuten
const INITIAL_DELAY_MS = 60 * 1000; // erste Iteration nach 1 Min (Server warmup)

let workerTimer: NodeJS.Timeout | null = null;
let workerRunning = false;

async function tick(): Promise<void> {
  if (workerRunning) {
    // Doppelläufe vermeiden, falls ein Tick länger als das Intervall dauert
    scheduleNext();
    return;
  }
  workerRunning = true;
  const start = Date.now();
  try {
    const mails = await processPendingLifecycleEmails();
    const expired = await processExpiredReservations();
    console.log(
      `[LifecycleWorker] Tick in ${Date.now() - start}ms: ` +
        `emails processed=${mails.processed} sent=${mails.sent} skipped=${mails.skipped}, ` +
        `expired processed=${expired.processed} deleted=${expired.deleted}`,
    );
  } catch (err) {
    console.error("[LifecycleWorker] Tick error:", err);
  } finally {
    workerRunning = false;
    scheduleNext();
  }
}

function scheduleNext() {
  workerTimer = setTimeout(tick, TICK_INTERVAL_MS);
}

export function startLifecycleWorker(): void {
  if (workerTimer) {
    console.warn("[LifecycleWorker] Already running, skipping start");
    return;
  }
  console.log("[LifecycleWorker] Scheduler starting…");
  workerTimer = setTimeout(tick, INITIAL_DELAY_MS);
}

export function stopLifecycleWorker(): void {
  if (workerTimer) {
    clearTimeout(workerTimer);
    workerTimer = null;
  }
}

// Für Admin-Dashboard / manuelles Triggern
export async function runLifecycleTickNow(): Promise<{ mails: any; expired: any }> {
  const mails = await processPendingLifecycleEmails();
  const expired = await processExpiredReservations();
  return { mails, expired };
}
