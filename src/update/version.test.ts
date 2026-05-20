import { afterEach, describe, it } from "node:test";
import { strict as assert } from "node:assert";
import {
  copyFileSync,
  cpSync,
  existsSync,
  mkdtempSync,
  mkdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";

const tempDirs: string[] = [];

function makeTempDir(): string {
  const dir = mkdtempSync(join(tmpdir(), "version-test-"));
  tempDirs.push(dir);
  return dir;
}

afterEach(() => {
  for (const dir of tempDirs) {
    try {
      rmSync(dir, { recursive: true, force: true });
    } catch {
      // Best-effort cleanup
    }
  }
  tempDirs.length = 0;
});

describe("getPackageVersion fresh install behavior", () => {
  it("falls back to build-metadata.json when install config is absent", () => {
    const base = makeTempDir();
    const installRoot = join(base, "install");
    const fakeHome = join(base, "home");

    mkdirSync(installRoot, { recursive: true });
    mkdirSync(fakeHome, { recursive: true });

    cpSync("dist", join(installRoot, "dist"), { recursive: true });
    cpSync("skill-content", join(installRoot, "skill-content"), { recursive: true });
    copyFileSync("package.json", join(installRoot, "package.json"));
    writeFileSync(
      join(installRoot, "build-metadata.json"),
      JSON.stringify({
        commit: "deadbeef1234567",
        builtAt: "2026-05-20T00:00:00Z",
      }) + "\n",
    );

    const result = spawnSync("node", [join(installRoot, "dist", "index.js"), "--version"], {
      encoding: "utf8",
      env: {
        ...process.env,
        USERPROFILE: fakeHome,
        HOME: fakeHome,
        HLX_SKIP_UPDATE_CHECK: "1",
      },
      stdio: ["pipe", "pipe", "pipe"],
    });

    assert.strictEqual(result.status, 0, result.stderr);
    assert.strictEqual(result.stdout.trim(), "1.3.4 (deadbee)");
    assert.ok(
      !existsSync(join(fakeHome, ".hlx", "config.json")),
      "fresh install simulation should not create config metadata",
    );
  });
});
