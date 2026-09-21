import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  assertGrokWorkspaceCwd,
  formatRpcError,
  grokAuthError,
  grokSessionNewFallbackParams,
  grokSessionNewParams,
  isAbsoluteWorkspaceCwd,
  isInvalidParamsError,
  resolveGrokAcpModelId,
  resolveGrokWorkspaceCwd,
  shouldRetrySessionNewWithoutMeta,
} from "./resolveGrokSession.js";

describe("resolveGrokWorkspaceCwd", () => {
  it("expands MonoCode's empty-project sentinel to an absolute home", () => {
    assert.equal(resolveGrokWorkspaceCwd("~", "/Users/me"), "/Users/me");
    assert.equal(resolveGrokWorkspaceCwd("", "/Users/me"), "/Users/me");
    assert.equal(resolveGrokWorkspaceCwd("   ", "/home/me"), "/home/me");
    assert.equal(
      resolveGrokWorkspaceCwd("~/", "/Users/me/"),
      "/Users/me",
    );
    assert.equal(
      resolveGrokWorkspaceCwd("~/code/app", "/Users/me"),
      "/Users/me/code/app",
    );
  });

  it("leaves a real project path alone", () => {
    assert.equal(
      resolveGrokWorkspaceCwd("/Users/me/code/app", "/Users/me"),
      "/Users/me/code/app",
    );
    assert.equal(
      resolveGrokWorkspaceCwd("C:/Users/me/code", "C:/Users/me"),
      "C:/Users/me/code",
    );
  });

  it("rejects a cwd that is still not absolute after expansion", () => {
    assert.equal(isAbsoluteWorkspaceCwd("~"), false);
    assert.equal(isAbsoluteWorkspaceCwd("/Users/me"), true);
    assert.equal(isAbsoluteWorkspaceCwd("C:\\repo"), true);
    assert.throws(
      () => assertGrokWorkspaceCwd("~", ""),
      /Open a project folder first/,
    );
    assert.equal(
      assertGrokWorkspaceCwd("~", "/Users/me"),
      "/Users/me",
    );
  });
});

describe("resolveGrokAcpModelId", () => {
  it("maps the product slug grok-build onto a live ACP id", () => {
    assert.equal(
      resolveGrokAcpModelId("grok-build", ["grok-4.6", "grok-4.5"], "grok-4.6"),
      "grok-4.6",
    );
    assert.equal(
      resolveGrokAcpModelId("grok:grok-build", ["grok-4.5"], "grok-4.5"),
      "grok-4.5",
    );
    assert.equal(
      resolveGrokAcpModelId("grok", ["grok-4.6"], "grok-4.6"),
      "grok-4.6",
    );
  });

  it("keeps a versioned id when the catalog accepts it", () => {
    assert.equal(
      resolveGrokAcpModelId("grok:grok-4.6", ["grok-4.6", "grok-4.5"]),
      "grok-4.6",
    );
    assert.equal(resolveGrokAcpModelId("grok-4.5", []), "grok-4.5");
  });

  it("falls back when the requested id is not in the live catalog", () => {
    assert.equal(
      resolveGrokAcpModelId("grok-4.0", ["grok-4.6"], "grok-4.6"),
      "grok-4.6",
    );
  });
});

describe("session/new params and Invalid params recovery", () => {
  it("sets yoloMode only for full access", () => {
    assert.deepEqual(grokSessionNewParams("/repo", "supervised"), {
      cwd: "/repo",
      mcpServers: [],
    });
    assert.deepEqual(grokSessionNewParams("/repo", "full-access"), {
      cwd: "/repo",
      mcpServers: [],
      _meta: { yoloMode: true },
    });
    assert.deepEqual(grokSessionNewFallbackParams("/repo"), {
      cwd: "/repo",
      mcpServers: [],
    });
  });

  it("retries session/new without _meta after Invalid params", () => {
    const params = grokSessionNewParams("/repo", "full-access");
    assert.equal(
      shouldRetrySessionNewWithoutMeta(new Error("Invalid params"), params),
      true,
    );
    assert.equal(
      shouldRetrySessionNewWithoutMeta(
        new Error("Invalid params"),
        grokSessionNewFallbackParams("/repo"),
      ),
      false,
    );
  });

  it("surfaces ACP error data instead of a bare Invalid params", () => {
    assert.equal(
      formatRpcError({
        code: -32602,
        message: "Invalid params",
        data: "cwd must be an absolute path",
      }),
      "Invalid params: cwd must be an absolute path",
    );
    assert.equal(isInvalidParamsError(new Error("Invalid params")), true);
    assert.match(
      grokAuthError(new Error("Invalid params")).message,
      /Open a project folder first/,
    );
  });
});
