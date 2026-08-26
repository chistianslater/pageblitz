import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock("../_core/llm", () => ({ invokeLLM: vi.fn() }));

import { invokeLLM } from "../_core/llm";
import {
  llmComplete,
  resolvePrimaryGenerationTimeout,
} from "./llmClient";

const mockedInvoke = vi.mocked(invokeLLM);

describe("generationV2 llmClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedInvoke.mockResolvedValue({
      id: "x",
      created: 0,
      model: "kimi-k3",
      choices: [
        {
          index: 0,
          message: { role: "assistant", content: '{"ok":true}' },
          finish_reason: "stop",
        },
      ],
    });
  });

  test("Backup erhält 45s, Kimi-Fallback 180s und low reasoning", async () => {
    await expect(llmComplete("Prompt")).resolves.toBe('{"ok":true}');
    expect(mockedInvoke).toHaveBeenCalledWith(
      expect.objectContaining({
        backupTimeoutMs: 45_000,
        primaryTimeoutMs: 180_000,
        reasoningEffort: "low",
      })
    );
  });

  test("alter 45s-ENV-Wert wird für Primär auf mindestens 120s geklemmt", () => {
    expect(resolvePrimaryGenerationTimeout("45000")).toBe(120_000);
    expect(resolvePrimaryGenerationTimeout(undefined)).toBe(180_000);
    expect(resolvePrimaryGenerationTimeout("240000")).toBe(240_000);
  });
});
