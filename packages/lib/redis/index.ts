import type { Redis as RedisType } from "ioredis";
import Redis from "ioredis";
import { env } from "../env";

declare global {
	var __vesper_redis__: RedisType | undefined;
}

const createRedisClient = () => {
	const client = new Redis(env.REDIS_URL, {
		retryDelayOnFailover: 100,
		maxRetriesPerRequest: 3,
		lazyConnect: true,
		connectTimeout: 10000,
		commandTimeout: 5000,
	});

	client.on("error", (error) => {
		console.error("Redis connection error:", error.message);
	});

	client.on("connect", () => {
		console.log("Redis connected successfully");
	});

	client.on("ready", () => {
		console.log("Redis client ready");
	});

	client.on("close", () => {
		console.log("Redis connection closed");
	});

	return client;
};

const client: RedisType = globalThis.__vesper_redis__ ?? createRedisClient();
if (env.NODE_ENV !== "production") {
	globalThis.__vesper_redis__ = client;
}

export const redis: RedisType = client;

export type { Redis } from "ioredis";
