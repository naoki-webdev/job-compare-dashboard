import { execSync } from "node:child_process";

export default async function globalTeardown() {
  execSync("docker compose stop e2e_web", { stdio: "inherit" });
}
