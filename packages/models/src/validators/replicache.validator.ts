import { z } from "zod";

const mutationSchema = z.object({
  id: z.number(),
  clientID: z.string().optional(),
  name: z.string(),
  args: z.any(),
  timestamp: z.number(),
});

export type MutationType = z.infer<typeof mutationSchema>;

export const pushRequestSchema = z.object({
  body: z.object({
    profileId: z.string(),
    clientGroupId: z.string(),
    mutations: z.array(mutationSchema),
    schemaVersion: z.string(),
  }),
  instanceId: z.string(),
});
export type PushRequestType = z.infer<typeof pushRequestSchema>;

const cookieSchema = z
  .object({
    order: z.number(),
    clientGroupId: z.string(),
  })
  .optional()
  .nullable();

export type PullCookie = z.infer<typeof cookieSchema>;

export const pullRequestSchema = z.object({
  body: z.object({
    profileId: z.string(),
    clientGroupId: z.string(),
    cookie: cookieSchema,
    schemaVersion: z.string(),
  }),
});
export type PullRequestType = z.infer<typeof pullRequestSchema>;