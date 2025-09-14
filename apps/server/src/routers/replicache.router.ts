import { TRPCError } from "@trpc/server";
import { AppError, pullRequestSchema, pushRequestSchema } from "@vesper/models";
import { replicacheController } from "~/controllers/replicache.controller";
import { protectedProcedure, router } from "~/lib/trpc";

export const replicacheRouter = router({
	push: protectedProcedure
		.input(pushRequestSchema)
		.mutation(async ({ input, ctx }) => {
			try {
				const userId = ctx.session.user.id;
				return await replicacheController.push(input.body, userId);
			} catch (error) {
				if (error instanceof AppError) {
					throw new TRPCError({
						code: "INTERNAL_SERVER_ERROR",
						message: error.message,
					});
				}
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to push data to the server, due to an internal error. Please try again later.",
				});
			}
		}),

	pull: protectedProcedure
		.input(pullRequestSchema)
		.query(async ({ input, ctx }) => {
			try {
				const userId = ctx.session.user.id;
				return await replicacheController.pull(input.body, userId);
			} catch (error) {
				if (error instanceof AppError) {
					throw new TRPCError({
						code: "INTERNAL_SERVER_ERROR",
						message: error.message,
					});
				}
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to pull data from the server, due to an internal error. Please try again later.",
				});
			}
		}),
});