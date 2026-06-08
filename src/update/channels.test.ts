import { describe, it } from "node:test";
import { strict as assert } from "node:assert";

import { isCanonicalGitHubSource, resolvePreferredChannel } from "./channels.js";

describe("update channel resolution", () => {
  it("classifies canonical GitHub installs as lab", () => {
    const source = {
      mode: "github" as const,
      repo: "Project-X-Innovation/helix-cli",
      branch: "main",
      commit: "deadbeef1234567",
    };

    assert.equal(isCanonicalGitHubSource(source), true);
    assert.equal(resolvePreferredChannel(source), "lab");
  });

  it("classifies npm installs as lts", () => {
    const source = {
      mode: "npm" as const,
      version: "1.3.4",
    };

    assert.equal(isCanonicalGitHubSource(source), false);
    assert.equal(resolvePreferredChannel(source), "lts");
  });

  it("classifies unknown and non-canonical installs as lts", () => {
    assert.equal(resolvePreferredChannel(undefined), "lts");
    assert.equal(
      resolvePreferredChannel({
        mode: "github",
        repo: "someone-else/helix-cli",
        branch: "main",
      }),
      "lts",
    );
  });
});
