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

// Handle auth routes with custom redirect after OAuth success
app.all("/api/auth/*route", async (req, res, next) => {
	// Check if this is an OAuth callback
	if (req.path.includes("/callback/") && req.method === "GET") {
		// Let better-auth handle the OAuth callback first
		const handler = toNodeHandler(auth);
		await handler(req, res);
		
		// After successful OAuth, redirect to client app
		if (!res.headersSent) {
			return res.redirect(env.CORS_ORIGIN);
		}
		return;
	}
	
	// For all other auth routes, use the default handler
	return toNodeHandler(auth)(req, res);
});

app.use(
	"/trpc",
	createExpressMiddleware({
		router: appRouter,
		createContext,
	}),
);

// app.use(express.json());

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
