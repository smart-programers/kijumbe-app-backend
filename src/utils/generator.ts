import { ip } from "elysia-ip";
import { Generator } from "elysia-rate-limit";

export const keyGenerator: Generator<{ ip: string }> = async (
  req,
  server,
  { ip },
) => Bun.hash(JSON.stringify(ip)).toString();
