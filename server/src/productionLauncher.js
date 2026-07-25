import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverRoot = path.resolve(__dirname, "..");

const publicPort = String(
  process.env.PORT ||
  process.env.ADMIN_GATEWAY_PORT ||
  5000
);

const requestedUpstream = String(process.env.UPSTREAM_API_PORT || "5001");
const upstreamPort =
  requestedUpstream === publicPort ? "5001" : requestedUpstream;

const existingNodeOptions = String(process.env.NODE_OPTIONS || "").trim();
const ipv4Option = "--dns-result-order=ipv4first";
const nodeOptions = existingNodeOptions.includes(ipv4Option)
  ? existingNodeOptions
  : `${existingNodeOptions} ${ipv4Option}`.trim();

const commonEnv = {
  ...process.env,
  NODE_OPTIONS: nodeOptions,
};

function start(name, args, env) {
  const child = spawn(process.execPath, args, {
    cwd: serverRoot,
    env: {
      ...commonEnv,
      ...env,
    },
    stdio: "inherit",
  });

  child.on("exit", (code, signal) => {
    console.error(
      `[production-launcher] ${name} exited code=${code ?? "null"} signal=${signal ?? "null"}`
    );
    shutdown(code || 1);
  });

  return child;
}

const api = start("API", ["src/server.js"], {
  PORT: upstreamPort,
});

const gateway = start("GATEWAY", ["src/adminApiGateway.js"], {
  ADMIN_GATEWAY_PORT: publicPort,
  UPSTREAM_API_PORT: upstreamPort,
  UPSTREAM_API_HOST: "127.0.0.1",
});

let shuttingDown = false;

function shutdown(exitCode = 0) {
  if (shuttingDown) return;
  shuttingDown = true;

  for (const child of [gateway, api]) {
    if (child && !child.killed) {
      child.kill("SIGTERM");
    }
  }

  setTimeout(() => process.exit(exitCode), 1500).unref();
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));
