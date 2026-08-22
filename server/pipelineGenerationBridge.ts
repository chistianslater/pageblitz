/**
 * pipelineGenerationBridge.ts
 *
 * Thin bridge that triggers website generation from the outreach pipeline.
 * Ab Cutover (Task 3, Plan B4a) läuft die Generierung immer über v2 —
 * direkt gegen generationV2/runJob statt (wie vorher) über routers.ts, das
 * ursprünglich nur zur Vermeidung eines zirkulären Imports dazwischenlag.
 * Bleibt trotzdem als eigenes Modul bestehen, damit outreachPipeline.ts
 * unverändert bleibt (Aufrufsignatur identisch).
 */

export async function triggerGeneration(
  jobId: number,
  websiteId: number
): Promise<void> {
  const { runWebsiteGenerationV2Job } = await import("./generationV2/runJob");
  await runWebsiteGenerationV2Job(jobId, websiteId);
}
