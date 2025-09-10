import { ably } from "@vesper/lib";
import { protectedProcedure, router } from "../lib/trpc";

export const socketRouter = router({
  getToken: protectedProcedure.query(async ({ ctx }) => {
    try {
      const tokenRes = await ably.auth.createTokenRequest({
        clientId: ctx.session.user.id,
      });

      return tokenRes;
    } catch (error) {
      throw error;
    }
  }),
});