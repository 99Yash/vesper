import { ably } from "@vesper/lib";
import { protectedProcedure, router } from "../lib/trpc";

export const socketRouter = router({
  getToken: protectedProcedure.query(async ({ ctx }) => {
    const token = await ably.auth.createTokenRequest({
      clientId: ctx.session.user.id,
    });

    return token;
  }),
});