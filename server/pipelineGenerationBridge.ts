/**
 * pipelineGenerationBridge.ts
 *
 * Thin bridge that triggers website generation from the outreach pipeline
 * without creating circular imports. Loaded lazily at runtime.
 */

export async function triggerGeneration(jobId: number, websiteId: number): Promise<void> {
  const { runWebsiteGeneration } = await import("./routers");
  await runWebsiteGeneration(jobId, websiteId);
}
