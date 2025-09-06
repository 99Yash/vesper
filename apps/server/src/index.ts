import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { toNodeHandler } from "better-auth/node";
import cors from "cors";
import "dotenv/config";
import express from "express";
import { env } from "./env";
import { auth } from "./lib/auth";
import { createContext } from "./lib/context";
import { appRouter } from "./routers/index";

const app = express();

app.use(
	cors({
		origin: env.CORS_ORIGIN,
		methods: ["GET", "POST", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization"],
		credentials: true,
	}),
);

// Better Auth handler for Express v5
app.all("/api/auth/*splat", toNodeHandler(auth));

// Mount express.json() AFTER Better Auth handler to avoid client API getting stuck
app.use(express.json());

app.use(
	"/trpc",
	createExpressMiddleware({
		router: appRouter,
		createContext,
	}),
);

// app.post("/ai", async (req, res) => {
// 	const { messages = [] } = (req.body || {}) as { messages: UIMessage[] };
// 	const result = streamText({
// 		model: google("gemini-1.5-flash"),
// 		messages: convertToModelMessages(messages),
// 	});
// 	result.pipeUIMessageStreamToResponse(res);
// });

app.get("/", (_req, res) => {
	res.status(200).send("OK");
});

const port = env.API_SERVER_PORT;
app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});
