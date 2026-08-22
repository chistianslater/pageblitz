/**
 * Prozesslokaler In-Flight-Lock für ensureGeneration (Finding #4): ohne
 * diesen Schutz würden zwei parallele Aufrufe für dieselbe Website zwei
 * Generierungsjobs (und zwei LLM-Läufe) anstoßen. Läuft für eine websiteId
 * bereits ein Aufruf, bekommt der zweite dessen Ergebnis statt selbst einen
 * Job anzulegen. Der Eintrag wird — auch bei einem Fehler — im finally
 * wieder entfernt.
 */
const inFlight = new Map<number, Promise<unknown>>();

export async function withEnsureLock<T>(
  websiteId: number,
  run: () => Promise<T>
): Promise<T> {
  const existing = inFlight.get(websiteId);
  if (existing) return existing as Promise<T>;
  const promise = run();
  inFlight.set(websiteId, promise);
  try {
    return await promise;
  } finally {
    inFlight.delete(websiteId);
  }
}
