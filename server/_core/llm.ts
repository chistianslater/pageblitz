import { ENV } from "./env";

export type Role = "system" | "user" | "assistant" | "tool" | "function";

export type TextContent = {
  type: "text";
  text: string;
};

export type ImageContent = {
  type: "image_url";
  image_url: {
    url: string;
    detail?: "auto" | "low" | "high";
  };
};

export type FileContent = {
  type: "file_url";
  file_url: {
    url: string;
    mime_type?:
      | "audio/mpeg"
      | "audio/wav"
      | "application/pdf"
      | "audio/mp4"
      | "video/mp4";
  };
};

export type MessageContent = string | TextContent | ImageContent | FileContent;

export type Message = {
  role: Role;
  content: MessageContent | MessageContent[];
  name?: string;
  tool_call_id?: string;
};

export type Tool = {
  type: "function";
  function: {
    name: string;
    description?: string;
    parameters?: Record<string, unknown>;
  };
};

export type ToolChoicePrimitive = "none" | "auto" | "required";
export type ToolChoiceByName = { name: string };
export type ToolChoiceExplicit = {
  type: "function";
  function: {
    name: string;
  };
};

export type ToolChoice =
  | ToolChoicePrimitive
  | ToolChoiceByName
  | ToolChoiceExplicit;

export type InvokeParams = {
  messages: Message[];
  tools?: Tool[];
  toolChoice?: ToolChoice;
  tool_choice?: ToolChoice;
  maxTokens?: number;
  max_tokens?: number;
  outputSchema?: OutputSchema;
  output_schema?: OutputSchema;
  responseFormat?: ResponseFormat;
  response_format?: ResponseFormat;
  /** Harte Obergrenze je HTTP-Aufruf (Default DEFAULT_LLM_TIMEOUT_MS); Timeout zählt als Fallback-Grund. */
  timeoutMs?: number;
  /** Backup-Modell (schnell) zuerst versuchen, Primär nur als Rückfall — für latenzkritische Pfade (v2-Generierung). */
  preferBackup?: boolean;
};

export const DEFAULT_LLM_TIMEOUT_MS = 90_000;
/**
 * Output-Budget, wenn der Aufrufer kein maxTokens/max_tokens setzt. Primär
 * läuft kimi-k2.5, ein Reasoning-Modell: reasoning_tokens zählen mit ins
 * max_tokens-Budget. 4096 reichte dort nicht — die Antwort wurde mitten im
 * JSON abgeschnitten (finish_reason=length, "Unexpected end of JSON input"
 * in aiEdit/suggest). 16384 deckt Reasoning + volles Website-Doc ab
 * (Endpoint-Akzeptanz gegen Moonshot verifiziert 2026-08-24).
 */
export const DEFAULT_LLM_MAX_TOKENS = 16384;
/** Backup-Modell: gemini-2.0-flash ist bei Google abgeschaltet (404 seit 2026-08) — konfigurierbar, Default gemini-3.5-flash (~5 s für 1k Tokens, gemessen 2026-08-23). */
export const BACKUP_LLM_MODEL =
  process.env.BACKUP_LLM_MODEL || "gemini-3.5-flash";

export type ToolCall = {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
};

export type InvokeResult = {
  id: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: Role;
      content: string | Array<TextContent | ImageContent | FileContent>;
      tool_calls?: ToolCall[];
    };
    finish_reason: string | null;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
};

export type JsonSchema = {
  name: string;
  schema: Record<string, unknown>;
  strict?: boolean;
};

export type OutputSchema = JsonSchema;

export type ResponseFormat =
  | { type: "text" }
  | { type: "json_object" }
  | { type: "json_schema"; json_schema: JsonSchema };

const ensureArray = (
  value: MessageContent | MessageContent[]
): MessageContent[] => (Array.isArray(value) ? value : [value]);

const normalizeContentPart = (
  part: MessageContent
): TextContent | ImageContent | FileContent => {
  if (typeof part === "string") {
    return { type: "text", text: part };
  }

  if (part.type === "text") {
    return part;
  }

  if (part.type === "image_url") {
    return part;
  }

  if (part.type === "file_url") {
    return part;
  }

  throw new Error("Unsupported message content part");
};

const normalizeMessage = (message: Message) => {
  const { role, name, tool_call_id } = message;

  if (role === "tool" || role === "function") {
    const content = ensureArray(message.content)
      .map(part => (typeof part === "string" ? part : JSON.stringify(part)))
      .join("\n");

    return {
      role,
      name,
      tool_call_id,
      content,
    };
  }

  const contentParts = ensureArray(message.content).map(normalizeContentPart);

  // If there's only text content, collapse to a single string for compatibility
  if (contentParts.length === 1 && contentParts[0].type === "text") {
    return {
      role,
      name,
      content: contentParts[0].text,
    };
  }

  return {
    role,
    name,
    content: contentParts,
  };
};

const normalizeToolChoice = (
  toolChoice: ToolChoice | undefined,
  tools: Tool[] | undefined
): "none" | "auto" | ToolChoiceExplicit | undefined => {
  if (!toolChoice) return undefined;

  if (toolChoice === "none" || toolChoice === "auto") {
    return toolChoice;
  }

  if (toolChoice === "required") {
    if (!tools || tools.length === 0) {
      throw new Error(
        "tool_choice 'required' was provided but no tools were configured"
      );
    }

    if (tools.length > 1) {
      throw new Error(
        "tool_choice 'required' needs a single tool or specify the tool name explicitly"
      );
    }

    return {
      type: "function",
      function: { name: tools[0].function.name },
    };
  }

  if ("name" in toolChoice) {
    return {
      type: "function",
      function: { name: toolChoice.name },
    };
  }

  return toolChoice;
};

const resolveApiUrl = (useBackup = false) => {
  if (useBackup) {
    const backupUrl = ENV.backupApiUrl?.trim();
    if (backupUrl) {
      const base = backupUrl.replace(/\/$/, "");
      return base.includes("/v1")
        ? `${base}/chat/completions`
        : `${base}/v1/chat/completions`;
    }
  }
  if (ENV.forgeApiUrl && ENV.forgeApiUrl.trim().length > 0) {
    // Handle Kimi/Moonshot API which already has /v1 in URL
    const baseUrl = ENV.forgeApiUrl.replace(/\/$/, "");
    if (baseUrl.includes("moonshot.ai") || baseUrl.includes("moonshot.cn")) {
      return `${baseUrl}/chat/completions`;
    }
    return `${baseUrl}/v1/chat/completions`;
  }
  return "https://forge.manus.im/v1/chat/completions";
};

const assertApiKey = () => {
  if (!ENV.forgeApiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }
};

const normalizeResponseFormat = ({
  responseFormat,
  response_format,
  outputSchema,
  output_schema,
}: {
  responseFormat?: ResponseFormat;
  response_format?: ResponseFormat;
  outputSchema?: OutputSchema;
  output_schema?: OutputSchema;
}):
  | { type: "json_schema"; json_schema: JsonSchema }
  | { type: "text" }
  | { type: "json_object" }
  | undefined => {
  const explicitFormat = responseFormat || response_format;
  if (explicitFormat) {
    if (
      explicitFormat.type === "json_schema" &&
      !explicitFormat.json_schema?.schema
    ) {
      throw new Error(
        "responseFormat json_schema requires a defined schema object"
      );
    }
    return explicitFormat;
  }

  const schema = outputSchema || output_schema;
  if (!schema) return undefined;

  if (!schema.name || !schema.schema) {
    throw new Error("outputSchema requires both name and schema");
  }

  return {
    type: "json_schema",
    json_schema: {
      name: schema.name,
      schema: schema.schema,
      ...(typeof schema.strict === "boolean" ? { strict: schema.strict } : {}),
    },
  };
};

async function callLLM(
  params: InvokeParams,
  useBackup: boolean
): Promise<InvokeResult> {
  const {
    messages,
    tools,
    toolChoice,
    tool_choice,
    outputSchema,
    output_schema,
    responseFormat,
    response_format,
  } = params;

  // Detect Kimi/Moonshot API (primary only)
  const isKimi =
    !useBackup &&
    (ENV.forgeApiUrl?.includes("moonshot.ai") ||
      ENV.forgeApiUrl?.includes("moonshot.cn"));
  // Backup model: BACKUP_LLM_MODEL (gemini-3.5-flash; gemini-2.0-flash existiert nicht mehr)
  // Primary Kimi-Modell: kimi-k2.5 (schneller als k2.6 bei vergleichbarer Qualität)
  const model = useBackup
    ? BACKUP_LLM_MODEL
    : isKimi
      ? "kimi-k2.5"
      : "gemini-2.5-flash";
  const apiKey = useBackup ? ENV.backupApiKey : ENV.forgeApiKey;

  const payload: Record<string, unknown> = {
    model,
    messages: messages.map(normalizeMessage),
  };

  if (tools && tools.length > 0) {
    payload.tools = tools;
  }

  const normalizedToolChoice = normalizeToolChoice(
    toolChoice || tool_choice,
    tools
  );
  if (normalizedToolChoice) {
    payload.tool_choice = normalizedToolChoice;
  }

  payload.max_tokens =
    params.maxTokens ?? params.max_tokens ?? DEFAULT_LLM_MAX_TOKENS;

  const normalizedResponseFormat = normalizeResponseFormat({
    responseFormat,
    response_format,
    outputSchema,
    output_schema,
  });

  if (normalizedResponseFormat) {
    payload.response_format = normalizedResponseFormat;
  }

  const timeoutMs = params.timeoutMs ?? DEFAULT_LLM_TIMEOUT_MS;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  let response: Response;
  try {
    response = await fetch(resolveApiUrl(useBackup), {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
  } catch (err: any) {
    if (err?.name === "AbortError") {
      throw new Error(`LLM timeout after ${timeoutMs}ms (${model})`);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `LLM invoke failed: ${response.status} ${response.statusText} – ${errorText}`
    );
  }

  return (await response.json()) as InvokeResult;
}

export async function invokeLLM(params: InvokeParams): Promise<InvokeResult> {
  assertApiKey();

  const hasBackup = !!(ENV.backupApiUrl && ENV.backupApiKey);
  if (params.preferBackup && hasBackup) {
    // Schneller Pfad zuerst (v2-Generierung); Primär nur als Rückfall.
    try {
      return await callLLM(params, true);
    } catch (err: any) {
      console.warn(
        `[LLM] Backup-Modell (${BACKUP_LLM_MODEL}) fehlgeschlagen, Rückfall auf Primär: ${String(err?.message ?? err).slice(0, 160)}`
      );
      return await callLLM(params, false);
    }
  }

  try {
    return await callLLM(params, false);
  } catch (err: any) {
    const msg = err?.message ?? "";
    const isTimeout = msg.includes("LLM timeout");
    const is429 =
      msg.includes("429") ||
      msg.includes("overloaded") ||
      msg.includes("Too Many") ||
      msg.includes("engine_overloaded");
    const is404 =
      msg.includes("404") ||
      msg.includes("Not found") ||
      msg.includes("not_found") ||
      msg.includes("Model not found");
    const is5xx =
      /\b5\d{2}\b/.test(msg) ||
      msg.includes("Internal Server Error") ||
      msg.includes("Bad Gateway") ||
      msg.includes("Service Unavailable");
    const isAuth =
      msg.includes("Permission denied") ||
      msg.includes("401") ||
      msg.includes("403") ||
      msg.includes("Invalid API key");
    const shouldFallback = is429 || is404 || is5xx || isAuth || isTimeout;
    if (shouldFallback && hasBackup) {
      const reason = isTimeout
        ? "timeout"
        : is429
          ? "rate-limited (429)"
          : is404
            ? "model 404"
            : is5xx
              ? "server error (5xx)"
              : "auth error";
      console.warn(
        `[LLM] Primary API ${reason}, retrying with backup model (${BACKUP_LLM_MODEL})...`
      );
      return await callLLM(params, true);
    }
    throw err;
  }
}
