import type { Redis as RedisType } from "ioredis";
import Redis from "ioredis";
import { env } from "../env";

declare global {  
  var __vesper_redis__: RedisType | undefined;  
}  
  
const client: RedisType = globalThis.__vesper_redis__ ?? new Redis(env.REDIS_URL);  
if (env.NODE_ENV !== "production") {  
  globalThis.__vesper_redis__ = client;  
}  
  
export const redis: RedisType = client;  

export type { Redis };
