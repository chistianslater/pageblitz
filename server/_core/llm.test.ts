import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

vi.mock("./env", () => ({
  ENV: {
    forgeApiUrl: "https://api.moonshot.ai/v1",
    forgeApiKey: "k-primary",
    backupApiUrl: "https://generativelanguage.googleapis.com/v1beta/openai",
    backupApiKey: "k-backup",
  },
}));

import { BACKUP_LLM_MODEL, PRIMARY_KIMI_MODEL, invokeLLM } from "./llm";

const okResponse = (content: string) =>
  new Response(JSON.stringify({ choices: [{ message: { content } }] }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });

describe("invokeLLM — Backup/Timeout", () => {
  const calls: {
    url: string;
    model: string;
    reasoningEffort?: string;
  }[] = [];
  beforeEach(() => {
    calls.length = 0;
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string, init: RequestInit) => {
        const body = JSON.parse(String(init.body));
        calls.push({
          url,
          model: body.model,
          reasoningEffort: body.reasoning_effort,
        });
        if (url.includes("googleapis")) return okResponse("backup-ok");
        if (init.signal) {
          // Primär: simuliert langsamen Aufruf, der auf Abbruch reagiert
          await new Promise<void>((resolve, reject) => {
            const t = setTimeout(resolve, 200);
            init.signal!.addEventListener("abort", () => {
              clearTimeout(t);
              const e = new Error("aborted");
              e.name = "AbortError";
              reject(e);
            });
          });
        }
        return okResponse("primary-ok");
      })
    );
  });
  afterEach(() => vi.unstubAllGlobals());

  test("preferBackup: Backup-Modell zuerst, Primär nicht aufgerufen", async () => {
    const res = await invokeLLM({ messages: [{ role: "user", content: "x" }], preferBackup: true });
    expect(res.choices[0].message.content).toBe("backup-ok");
    expect(calls).toHaveLength(1);
    expect(calls[0].url).toContain("googleapis");
    expect(calls[0].model).toBe(BACKUP_LLM_MODEL);
  });

  test("Timeout am Primärmodell → Rückfall auf Backup", async () => {
    const res = await invokeLLM({ messages: [{ role: "user", content: "x" }], timeoutMs: 20 });
    expect(res.choices[0].message.content).toBe("backup-ok");
    expect(calls.map(c => (c.url.includes("googleapis") ? "backup" : "primary"))).toEqual(["primary", "backup"]);
  });

  test("ohne Timeout: Primärmodell antwortet", async () => {
    const res = await invokeLLM({ messages: [{ role: "user", content: "x" }], timeoutMs: 5_000 });
    expect(res.choices[0].message.content).toBe("primary-ok");
    expect(calls).toHaveLength(1);
  });

  test("Primärmodell ist Kimi K3 und erhält reasoning_effort", async () => {
    await invokeLLM({
      messages: [{ role: "user", content: "x" }],
      primaryTimeoutMs: 5_000,
      reasoningEffort: "low",
    });
    expect(calls[0].model).toBe(PRIMARY_KIMI_MODEL);
    expect(calls[0].model).toBe("kimi-k3");
    expect(calls[0].reasoningEffort).toBe("low");
  });
});
