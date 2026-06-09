// One-shot credential rotation. Updates each secret in every place it lives:
//   - GitHub Actions secret (used by the nightly compile)
//   - Vercel production env (used by the reader)
//   - local .env.local (used by local runs)
//
// Usage:
//   node scripts/rotate-secrets.mjs            # interactive, hidden prompts
//   DRY_RUN=1 node scripts/rotate-secrets.mjs  # print actions, change nothing
//   NEW_DATABASE_URL=... node scripts/rotate-secrets.mjs   # non-interactive value
//
// Leave a prompt blank to skip that secret. After Vercel env changes you must
// redeploy; the script offers to run `vercel --prod` for you.
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { createInterface } from "node:readline";

const REPO = process.env.REPO || "profsarthak/news-digest";
const DRY = Boolean(process.env.DRY_RUN);
const ENV_FILE = ".env.local";

// Where each secret needs to be propagated.
const SECRETS = {
  ANTHROPIC_API_KEY: { github: true, vercel: false, local: true },
  DATABASE_URL: { github: true, vercel: true, local: true },
  CRON_SECRET: { github: false, vercel: false, local: true },
};

function run(cmd, args, input) {
  if (DRY) {
    console.log(`  [dry-run] ${cmd} ${args.join(" ")}${input ? "  (value via stdin)" : ""}`);
    return { status: 0 };
  }
  return spawnSync(cmd, args, {
    input,
    stdio: ["pipe", "inherit", "inherit"],
    shell: process.platform === "win32", // resolve gh.cmd / vercel.cmd on Windows
  });
}

function promptHidden(query) {
  // Read a line without echoing it to the terminal.
  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    process.stdout.write(query);
    rl._writeToOutput = () => {};
    rl.question("", (val) => {
      rl.close();
      process.stdout.write("\n");
      resolve(val.trim());
    });
  });
}

function updateEnvFile(name, value) {
  let lines = existsSync(ENV_FILE)
    ? readFileSync(ENV_FILE, "utf8").split(/\r?\n/)
    : [];
  const re = new RegExp(`^${name}=`);
  const idx = lines.findIndex((l) => re.test(l));
  if (idx >= 0) lines[idx] = `${name}=${value}`;
  else {
    if (lines.length && lines[lines.length - 1] === "") lines.pop();
    lines.push(`${name}=${value}`);
  }
  if (DRY) {
    console.log(`  [dry-run] write ${name}=… to ${ENV_FILE}`);
    return;
  }
  writeFileSync(ENV_FILE, lines.join("\n") + "\n", "utf8");
}

async function getValue(name) {
  const fromEnv = process.env[`NEW_${name}`];
  if (fromEnv !== undefined) return fromEnv.trim();
  return promptHidden(`New value for ${name} (blank to skip): `);
}

async function main() {
  console.log(
    `Rotating secrets for ${REPO}${DRY ? "  (DRY RUN — no changes)" : ""}\n`,
  );
  let vercelChanged = false;

  for (const [name, dest] of Object.entries(SECRETS)) {
    const value = await getValue(name);
    if (!value) {
      console.log(`• ${name}: skipped`);
      continue;
    }
    console.log(`• ${name}:`);

    if (dest.github) {
      const r = run("gh", ["secret", "set", name, "--repo", REPO], value);
      console.log(`    github secret  -> ${r.status === 0 ? "ok" : "FAILED"}`);
    }
    if (dest.vercel) {
      // Remove then re-add for the production environment (idempotent).
      run("vercel", ["env", "rm", name, "production", "--yes"]);
      const r = run("vercel", ["env", "add", name, "production"], value + "\n");
      console.log(`    vercel env     -> ${r.status === 0 ? "ok" : "FAILED"}`);
      vercelChanged = true;
    }
    if (dest.local) {
      updateEnvFile(name, value);
      console.log(`    ${ENV_FILE}     -> ok`);
    }
  }

  if (vercelChanged) {
    const ans = await promptHidden(
      "\nVercel env changed. Redeploy now with `vercel --prod`? (y/N): ",
    );
    if (ans.toLowerCase() === "y") {
      run("vercel", ["--prod"]);
    } else {
      console.log("Skipped redeploy. Run `vercel --prod` when ready.");
    }
  }
  console.log("\nDone.");
}

main();
