import { redis } from "@vesper/lib";
import { AppError, CVR, CVRCache, transact, type PullCookie, type PullRequestType, type PullResponseOKV1, type PushRequestType } from "@vesper/models";
import { logger } from "better-auth";
import { fromNodeHeaders } from "better-auth/node";
import { type NextFunction, type Request, type RequestHandler, type Response } from "express";
import { auth } from "~/lib/auth";
import { sendPoke } from "~/lib/socket";
import { ClientGroupService } from "~/services/client-group.service";
import { ClientService } from "~/services/client.service";
import { NoteService } from "~/services/note.service";
import { ReplicacheService } from "~/services/replicache.service";



const cvrCache = new CVRCache(redis);

class ReplicacheController {
  // Core business logic method for push operations
  async pushLogic(data: PushRequestType["body"], userId: string) {
    const errors: {
      mutationName: string;
      errorMessage: string;
      errorCode: string;
    }[] = [];
    
    try {
      for (const mutation of data.mutations) {
        try {
          await ReplicacheService.processMutation({
            clientGroupID: data.clientGroupId,
            errorMode: false,
            mutation,
            userId,
          });
        } catch (error) {
          await ReplicacheService.processMutation({
            clientGroupID: data.clientGroupId,
            errorMode: true,
            mutation,
            userId,
          });
          if (error instanceof AppError) {
            errors.push({
              mutationName: mutation.name,
              errorMessage: error.message,
              errorCode: error.code,
            });
          }
        }
      }
      
      return {
        success: errors.length === 0,
        errors,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error(String(error));
      throw new AppError({
        code: "INTERNAL_SERVER_ERROR",
        message:
          "Failed to push data to the server, due to an internal error. Please try again later.",
      });
    } finally {
      await sendPoke({ userId });
    }
  }

  push: RequestHandler = async (
    req: Request<object, object, PushRequestType["body"]>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const session = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers),
      });

      if (!session) {
        throw new AppError({
          code: "UNAUTHORIZED",
          message: "Unauthorized",
        });
      }

      const userId = session.user.id;
      const result = await this.pushLogic(req.body, userId);
      
      return res.status(200).json(result);
    } catch (error) {
      if (error instanceof AppError) {
        return next(error);
      }
      logger.error(String(error));
      return next(
        new AppError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            "Failed to push data to the server, due to an internal error. Please try again later.",
        }),
      );
    }
  };

  // Core business logic method for pull operations
  async pullLogic(data: PullRequestType["body"], userId: string): Promise<PullResponseOKV1> {
    try {
      const { cookie, clientGroupId } = data;
      // 1. Get the base CVR and the previous CVR from the cache
      const { baseCVR, previousCVR } = await cvrCache.getBaseCVR(clientGroupId, cookie);

      const trxResponse = await transact(async (tx) => {
        // 2. Init services inside the transaction
        //#region  //*=========== init services ===========
        const clientGroupService = new ClientGroupService(tx);
        const clientService = new ClientService(tx);
        const noteService = new NoteService(tx);
        //#endregion  //*======== init services ===========

        // 3. Get the base client group
        const baseClientGroup = await clientGroupService.getById({
          id: clientGroupId,
          userId,
        });

        // 4. Get the all todos and clients (just id and rowVersion) from the database
        // this needs to be done for all entities that are part of the sync
        const [notesMeta, clientsMeta] = await Promise.all([
          noteService.findMeta({ userId }),
          clientService.findMeta({ clientGroupId: clientGroupId }),
        ]);

        // 5. Generate the next CVR
        const nextCVR = CVR.generateCVR({
          clientsMeta,
          notesMeta,
        });

        // 6. Get the puts and dels for todos
        // this needs to be done for all entities that are part of the sync
        const notePuts = CVR.getPutsSince(nextCVR.notes, baseCVR.notes); // puts refers to ones that are new or updated
        const noteDels = CVR.getDelsSince(nextCVR.notes, baseCVR.notes); // dels refers to ones that are deleted

        // 8. Get the actual todos data from the database for all the puts
        const notes = await noteService.findMany({ ids: notePuts });

        // 9. Get the puts for clients and compute the changes for each client
        const clientPuts = CVR.getPutsSince(nextCVR.clients, baseCVR.clients);
        const clientChanges: Record<string, number> = {}; // {clientid: lastMutationId}
        for (const id of clientPuts) {
          const c = nextCVR.clients.get(id);
          clientChanges[id] = c ? c.rowVersion : 0;
        }

        // 10. Upsert the client group with the new CVR version
        const previousCVRVersion = cookie?.order ?? baseClientGroup.cvrVersion;
        const nextClientGroup = await clientGroupService.upsert({
          id: baseClientGroup.id,
          userId,
          cvrVersion: Math.max(previousCVRVersion, baseClientGroup.cvrVersion) + 1,
        });

        // 11. Generate the new response cookie
        const responseCookie: PullCookie = {
          clientGroupId,
          order: nextClientGroup?.cvrVersion ?? 1,
        };

        // 12. Generate the patch for Replicache to sync the indexDB of the client group
        const patch = ReplicacheService.genPatch({
          previousCVR,
          NOTE: {
            data: notes,
            dels: noteDels,
          },
        });

        return {
          nextCVR,
          responseCookie,
          patch,
          clientChanges,
        };
      });

      if (trxResponse === null) {
        return {
          cookie: cookie || null,
          lastMutationIDChanges: {},
          patch: [],
        };
      }

      const { patch, clientChanges, nextCVR, responseCookie } = trxResponse;
      // 13. Set the new CVR in the cache
      await cvrCache.setCVR(responseCookie.clientGroupId, responseCookie.order, nextCVR);
      // 14. Delete the old CVR from the cache if it existed
      if (cookie) {
        await cvrCache.delCVR(clientGroupId, cookie.order);
      }

      const body: PullResponseOKV1 = {
        cookie: responseCookie,
        lastMutationIDChanges: clientChanges,
        patch,
      };

      return body;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error(String(error));
      throw new AppError({
        code: "INTERNAL_SERVER_ERROR",
        message:
          "Failed to pull data from the server, due to an internal error. Please try again later.",
      });
    }
  }

  pull: RequestHandler = async (
    req: Request<object, object, PullRequestType["body"]>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const session = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers),
      });

      if (!session) {
        throw new AppError({
          code: "UNAUTHORIZED",
          message: "Unauthorized",
        });
      }

      const userId = session.user.id;
      const result = await this.pullLogic(req.body, userId);
      
      return res.status(200).json(result);
    } catch (error) {
      if (error instanceof AppError) {
        return next(error);
      }
      logger.error(String(error));
      return next(
        new AppError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            "Failed to pull data from the server, due to an internal error. Please try again later.",
        }),
      );
    }
  };
}

export const replicacheController = new ReplicacheController();