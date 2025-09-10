import { publicProcedure, router } from "../lib/trpc";
import { replicacheRouter } from "./replicache.router";
import { socketRouter } from "./socket.router";

export const appRouter = router({
	healthCheck: publicProcedure.query(() => {
		return "OK";
	}),
	socket: socketRouter,
	replicache: replicacheRouter,
});

export type AppRouter = typeof appRouter;
