/**
 * MonoCode → Grok Build ACP helpers.
 *
 * Grok's `session/new` requires an absolute cwd. MonoCode's empty-project
 * sentinel is "~", which is not absolute, so Grok answers JSON-RPC -32602
 * "Invalid params" and the UI shows:
 *   Grok Build did not start. Invalid params
 *
 * `grok-build` is the product name, not a live ACP model id. Sending it to
 * `session/set_model` is the same -32602 with data "unknown model id".
 */

export const GROK_PRODUCT_MODEL_IDS = new Set(["grok-build", "grok"]);

export function nativeGrokModelId(model) {
  const trimmed = String(model ?? "").trim();
  if (!trimmed) return "";
  const colon = trimmed.indexOf(":");
  return colon >= 0 ? trimmed.slice(colon + 1) : trimmed;
}

export function isAbsoluteWorkspaceCwd(cwd) {
  const value = String(cwd ?? "").trim();
  return (
    value.startsWith("/") ||
    /^[A-Za-z]:[\\/]/.test(value) ||
    value.startsWith("\\\\")
  );
}

/** Expand MonoCode's "~" / "~/..." sentinel to an absolute home-based path. */
export function resolveGrokWorkspaceCwd(cwd, home) {
  const trimmed = String(cwd ?? "").trim();
  const root = String(home ?? "").replace(/[\\/]+$/, "");
  if (!trimmed || trimmed === "~") return root;
  if (trimmed === "~/" || trimmed.startsWith("~/")) {
    const rest = trimmed.slice(2).replace(/[\\/]+$/, "");
    return rest ? `${root}/${rest}` : root;
  }
  return trimmed;
}

export function assertGrokWorkspaceCwd(cwd, home) {
  const resolved = resolveGrokWorkspaceCwd(cwd, home);
  if (!isAbsoluteWorkspaceCwd(resolved)) {
    throw new Error(grokMissingProjectMessage(cwd));
  }
  return resolved;
}

export function resolveGrokAcpModelId(requested, available = [], current) {
  const native = nativeGrokModelId(requested);
  const catalog = available.filter(Boolean);
  const pickCurrent =
    current && catalog.includes(current) ? current : (catalog[0] ?? current);
  if (!native || GROK_PRODUCT_MODEL_IDS.has(native)) return pickCurrent;
  if (catalog.length === 0 || catalog.includes(native)) return native;
  return pickCurrent;
}

export function grokSessionNewParams(cwd, runtimeMode) {
  const params = { cwd, mcpServers: [] };
  if (runtimeMode === "full-access") {
    params._meta = { yoloMode: true };
  } else if (runtimeMode === "auto") {
    params._meta = { autoMode: true };
  }
  return params;
}

export function grokSessionNewFallbackParams(cwd) {
  return { cwd, mcpServers: [] };
}

export function isInvalidParamsError(error) {
  const detail = error instanceof Error ? error.message : String(error ?? "");
  return /invalid params|unknown model id|-32602/i.test(detail);
}

export function formatRpcError(error) {
  const message = error?.message || `rpc error ${error?.code ?? ""}`;
  if (error?.data == null || error.data === "") return message;
  const data =
    typeof error.data === "string" ? error.data : JSON.stringify(error.data);
  if (!data || message.includes(data)) return message;
  return `${message}: ${data}`;
}

export function grokAuthError(error) {
  const detail = error instanceof Error ? error.message : String(error);
  if (/auth|login|credential|api key|XAI_API_KEY/i.test(detail)) {
    return new Error(
      `${detail.trim()}\n\nGrok Build is not signed in. Run \`grok login\` in a terminal, or set XAI_API_KEY.`,
    );
  }
  if (/timed out/i.test(detail)) {
    return new Error(
      `Grok Build did not start. Grok Build is not signed in. Run \`grok login\` in a terminal, or set XAI_API_KEY.`,
    );
  }
  if (isInvalidParamsError(error)) {
    return new Error(
      `Grok Build did not start. Invalid params.\n\nOpen a project folder first. Grok ACP session/new needs an absolute working directory, not "~". If a project is already open, pick Grok 4.6 (not the product slug grok-build).`,
    );
  }
  return new Error(`Grok Build did not start. ${detail}`);
}

export function grokMissingProjectMessage(cwd) {
  return `Grok Build did not start. Invalid params.\n\nOpen a project folder first. Grok ACP session/new needs an absolute working directory, not "${cwd || "~"}".`;
}

export function shouldRetrySessionNewWithoutMeta(error, params) {
  return isInvalidParamsError(error) && Boolean(params && params._meta);
}
