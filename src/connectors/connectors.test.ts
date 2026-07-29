import { describe, it } from "node:test";
import { strict as assert } from "node:assert";

import {
  resolveConnectorAuth,
  MISSING_TOKEN_MESSAGE,
  MISSING_URL_MESSAGE,
} from "./resolve.js";
import {
  connectorGet,
  toConnectorApiError,
  formatConnectorError,
  ConnectorApiError,
} from "./http.js";
import { pickResource } from "./schema.js";
import { collectParams } from "./read.js";

const NO_ENV: NodeJS.ProcessEnv = {};

describe("resolveConnectorAuth", () => {
  it("uses --url and --token flags first", () => {
    const auth = resolveConnectorAuth(
      ["files", "--url", "http://flag.example", "--token", "hct_flag"],
      { HELIX_CONNECT_URL: "http://env.example", HELIX_CONNECTOR_TOKEN: "hct_env" },
      () => "http://config.example",
    );
    assert.strictEqual(auth.baseUrl, "http://flag.example/api/connect/v1");
    assert.strictEqual(auth.token, "hct_flag");
  });

  it("falls back to HELIX_CONNECT_URL and HELIX_CONNECTOR_TOKEN env vars", () => {
    const auth = resolveConnectorAuth(
      ["files"],
      { HELIX_CONNECT_URL: "http://env.example", HELIX_CONNECTOR_TOKEN: "hct_env" },
      () => "http://config.example",
    );
    assert.strictEqual(auth.baseUrl, "http://env.example/api/connect/v1");
    assert.strictEqual(auth.token, "hct_env");
  });

  it("falls back to the current org's config url when no flag or env url", () => {
    const auth = resolveConnectorAuth(
      ["files"],
      { HELIX_CONNECTOR_TOKEN: "hct_env" },
      () => "http://config.example",
    );
    assert.strictEqual(auth.baseUrl, "http://config.example/api/connect/v1");
  });

  it("strips trailing slashes from the url", () => {
    const auth = resolveConnectorAuth(
      ["--url", "http://x.example///", "--token", "hct_t"],
      NO_ENV,
      () => undefined,
    );
    assert.strictEqual(auth.baseUrl, "http://x.example/api/connect/v1");
  });

  it("throws an actionable error when no token is available", () => {
    assert.throws(
      () => resolveConnectorAuth(["--url", "http://x.example"], NO_ENV, () => undefined),
      (error: Error) => error.message === MISSING_TOKEN_MESSAGE,
    );
  });

  it("throws an actionable error when no url is available", () => {
    assert.throws(
      () => resolveConnectorAuth(["--token", "hct_t"], NO_ENV, () => undefined),
      (error: Error) => error.message === MISSING_URL_MESSAGE,
    );
  });
});

describe("collectParams", () => {
  it("collects repeated --param key=value flags", () => {
    const params = collectParams(["files", "docs", "--param", "a=1", "--limit", "5", "--param", "b=x=y"]);
    assert.deepStrictEqual(params, { a: "1", b: "x=y" });
  });

  it("returns empty record when no --param flags", () => {
    assert.deepStrictEqual(collectParams(["files", "docs"]), {});
  });

  it("throws on --param without key=value", () => {
    assert.throws(() => collectParams(["--param", "novalue"]), /key=value/);
  });

  it("throws on --param with empty key", () => {
    assert.throws(() => collectParams(["--param", "=v"]), /key=value/);
  });
});

describe("pickResource", () => {
  it("finds a resource in an object map", () => {
    const schema = { resources: { docs: { fields: ["id"] }, images: {} } };
    const { found, available } = pickResource(schema, "docs");
    assert.deepStrictEqual(found, { fields: ["id"] });
    assert.deepStrictEqual(available, ["docs", "images"]);
  });

  it("finds a resource in an array by name", () => {
    const schema = { resources: [{ name: "docs", fields: [] }, { name: "images" }] };
    const { found } = pickResource(schema, "images");
    assert.deepStrictEqual(found, { name: "images" });
  });

  it("returns undefined with available list when not found", () => {
    const schema = { resources: { docs: {} } };
    const { found, available } = pickResource(schema, "nope");
    assert.strictEqual(found, undefined);
    assert.deepStrictEqual(available, ["docs"]);
  });

  it("handles a schema with no resources", () => {
    const { found, available } = pickResource({}, "docs");
    assert.strictEqual(found, undefined);
    assert.deepStrictEqual(available, []);
  });
});

describe("toConnectorApiError", () => {
  it("parses the wire-protocol error shape", () => {
    const error = toConnectorApiError(404, JSON.stringify({ error: { code: "not_found", message: "Unknown connector" } }));
    assert.strictEqual(error.status, 404);
    assert.strictEqual(error.code, "not_found");
    assert.strictEqual(error.message, "Unknown connector");
  });

  it("falls back to raw text for non-JSON bodies", () => {
    const error = toConnectorApiError(500, "Internal Server Error");
    assert.strictEqual(error.status, 500);
    assert.strictEqual(error.code, undefined);
    assert.strictEqual(error.message, "Internal Server Error");
  });

  it("falls back to HTTP status for empty bodies", () => {
    const error = toConnectorApiError(502, "");
    assert.strictEqual(error.message, "HTTP 502");
  });
});

describe("formatConnectorError", () => {
  it("includes code, message, and status", () => {
    const formatted = formatConnectorError(new ConnectorApiError(404, "Unknown connector", "not_found"));
    assert.strictEqual(formatted, "not_found: Unknown connector (HTTP 404)");
  });

  it("adds a token hint on 401", () => {
    const formatted = formatConnectorError(new ConnectorApiError(401, "Invalid token", "unauthorized"));
    assert.ok(formatted.includes("(HTTP 401)"));
    assert.ok(formatted.includes("HELIX_CONNECTOR_TOKEN"));
  });
});

describe("connectorGet", () => {
  const auth = { baseUrl: "http://test.example/api/connect/v1", token: "hct_test" };

  it("sends Authorization: Bearer and returns parsed JSON", async () => {
    let seenUrl = "";
    let seenAuth: string | null = null;
    const result = await connectorGet(auth, "/files/$schema", {
      fetchImpl: async (url, init) => {
        seenUrl = url;
        seenAuth = new Headers(init.headers).get("authorization");
        return new Response(JSON.stringify({ data: { connector: "files" } }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      },
    });
    assert.strictEqual(seenUrl, "http://test.example/api/connect/v1/files/$schema");
    assert.strictEqual(seenAuth, "Bearer hct_test");
    assert.deepStrictEqual(result, { data: { connector: "files" } });
  });

  it("serializes query params", async () => {
    let seenUrl = "";
    await connectorGet(auth, "/files/docs", {
      queryParams: { limit: "2", cursor: "abc", folder: "x y" },
      fetchImpl: async (url) => {
        seenUrl = url;
        return new Response("{}", { status: 200 });
      },
    });
    const parsed = new URL(seenUrl);
    assert.strictEqual(parsed.pathname, "/api/connect/v1/files/docs");
    assert.strictEqual(parsed.searchParams.get("limit"), "2");
    assert.strictEqual(parsed.searchParams.get("cursor"), "abc");
    assert.strictEqual(parsed.searchParams.get("folder"), "x y");
  });

  it("returns raw text when accept is text", async () => {
    const result = await connectorGet(auth, "/files/$skill", {
      accept: "text",
      fetchImpl: async () =>
        new Response("# Files Connector\n", { status: 200, headers: { "content-type": "text/markdown" } }),
    });
    assert.strictEqual(result, "# Files Connector\n");
  });

  it("throws ConnectorApiError with parsed code/message on non-2xx", async () => {
    await assert.rejects(
      connectorGet(auth, "/files/docs", {
        fetchImpl: async () =>
          new Response(JSON.stringify({ error: { code: "unauthorized", message: "Bad token" } }), { status: 401 }),
      }),
      (error: unknown) => {
        assert.ok(error instanceof ConnectorApiError);
        assert.strictEqual(error.status, 401);
        assert.strictEqual(error.code, "unauthorized");
        assert.strictEqual(error.message, "Bad token");
        return true;
      },
    );
  });
});
