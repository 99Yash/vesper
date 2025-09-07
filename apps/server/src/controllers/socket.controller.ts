import { TRPCError } from "@trpc/server";
import { ably } from "@vesper/lib";
import { fromNodeHeaders } from "better-auth/node";
import { type NextFunction, type Request, type RequestHandler, type Response } from "express";
import { auth } from "~/lib/auth";

class SocketController {
  public getToken: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const session = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers),
      });
      
      if (!session) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Authentication required",
          cause: "No session",
        });
      }
      
      const tokenRes = await ably.auth.createTokenRequest({
        clientId: session.user.id,
      });

      res.status(200).json(tokenRes);
    } catch (error) {
      next(error);
    }
  };
}

export const socketController = new SocketController();