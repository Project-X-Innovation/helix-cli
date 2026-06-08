import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import type { SpawnSyncReturns } from "node:child_process";

import {
  NPM_PACKAGE_NAME,
  NPM_REGISTRY_URL,
  fetchLatestNpmVersion,
  installNpmVersion,
} from "./npm.js";

function mockResult(
  status: number,
  stdout: string,
  stderr: string = "",
): SpawnSyncReturns<string> {
  return {
    status,
    stdout,
    stderr,
    pid: 1,
    output: [null, stdout, stderr],
    signal: null,
  };
}

describe("npm update helpers", () => {
  it("reads the latest version from npm view", () => {
    let command = "";
    let args: string[] = [];

    const version = fetchLatestNpmVersion((cmd, passedArgs) => {
      command = cmd;
      args = passedArgs;
      return mockResult(0, "1.3.4\n");
    });

    assert.ok(command === "npm" || command === "npm.cmd");
    assert.deepEqual(args, [
      "view",
      NPM_PACKAGE_NAME,
      "version",
      "--registry",
      NPM_REGISTRY_URL,
      "--silent",
    ]);
    assert.equal(version, "1.3.4");
  });

  it("returns null when npm view fails", () => {
    const version = fetchLatestNpmVersion(() => mockResult(1, "", "boom"));
    assert.equal(version, null);
  });

  it("installs the requested version globally", () => {
    let args: string[] = [];

    const result = installNpmVersion("1.3.4", (_cmd, passedArgs) => {
      args = passedArgs;
      return mockResult(0, "");
    });

    assert.equal(result.success, true);
    assert.deepEqual(args, [
      "install",
      "-g",
      `${NPM_PACKAGE_NAME}@1.3.4`,
      "--registry",
      NPM_REGISTRY_URL,
      "--silent",
      "--no-fund",
      "--no-audit",
    ]);
  });
});
