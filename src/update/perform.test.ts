import { describe, it, afterEach } from "node:test";
import { strict as assert } from "node:assert";
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { getInstallRoot } from "./perform.js";

// ---------------------------------------------------------------------------
// Temp directory management
// ---------------------------------------------------------------------------

const tempDirs: string[] = [];

function makeTempDir(): string {
  const dir = mkdtempSync(join(tmpdir(), "perform-test-"));
  tempDirs.push(dir);
  return dir;
}

afterEach(() => {
  for (const dir of tempDirs) {
    try {
      rmSync(dir, { recursive: true, force: true });
    } catch {
      // best-effort cleanup
    }
  }
  tempDirs.length = 0;
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("getInstallRoot", () => {
  it("resolves to a directory that exists", () => {
    const root = getInstallRoot();
    assert.ok(typeof root === "string" && root.length > 0, "should return a non-empty string");
    assert.ok(existsSync(root), `resolved root should exist: ${root}`);
  });

  it("returns a path containing package.json", () => {
    const root = getInstallRoot();
    const pkgPath = join(root, "package.json");
    assert.ok(existsSync(pkgPath), `package.json should exist at: ${pkgPath}`);
  });
});

describe("perform.ts module structure", () => {
  it("does not contain execSync or child_process", () => {
    const root = getInstallRoot();
    const sourcePath = join(root, "src", "update", "perform.ts");
    const source = readFileSync(sourcePath, "utf-8");
    assert.ok(
      !source.includes("execSync"),
      "perform.ts should not contain execSync",
    );
    assert.ok(
      !source.includes("child_process"),
      "perform.ts should not import from child_process",
    );
    assert.ok(
      source.includes("cpSync"),
      "perform.ts should use cpSync from node:fs",
    );
  });
});

describe("fs.cpSync-based directory copy", () => {
  it("recursively copies a directory tree with nested files", () => {
    const tmp = makeTempDir();
    const src = join(tmp, "src");
    const dest = join(tmp, "dest");

    // Create a nested directory structure
    mkdirSync(join(src, "dist", "update"), { recursive: true });
    mkdirSync(join(src, "skill-content"), { recursive: true });
    writeFileSync(join(src, "package.json"), '{"name":"test"}');
    writeFileSync(join(src, "build-metadata.json"), '{"sha":"abc123"}');
    writeFileSync(join(src, "dist", "index.js"), "console.log('hello');");
    writeFileSync(join(src, "dist", "update", "perform.js"), "export {};");
    writeFileSync(join(src, "skill-content", "SKILL.md"), "# Skill");

    // Copy using the same API call as copyDirRecursive
    cpSync(src, dest, { recursive: true });

    // Verify all files exist with correct content
    assert.ok(existsSync(join(dest, "package.json")));
    assert.ok(existsSync(join(dest, "build-metadata.json")));
    assert.ok(existsSync(join(dest, "dist", "index.js")));
    assert.ok(existsSync(join(dest, "dist", "update", "perform.js")));
    assert.ok(existsSync(join(dest, "skill-content", "SKILL.md")));

    assert.equal(
      readFileSync(join(dest, "package.json"), "utf-8"),
      '{"name":"test"}',
    );
    assert.equal(
      readFileSync(join(dest, "dist", "index.js"), "utf-8"),
      "console.log('hello');",
    );
    assert.equal(
      readFileSync(join(dest, "skill-content", "SKILL.md"), "utf-8"),
      "# Skill",
    );
  });
});
