import { z } from "zod";

const mutation = z.object({
  id: z.number(),
  clientId: z.string(),
  name: z.string(),
  args: z.any(),
});

export type MutationType = z.infer<typeof mutation>;

export const pushRequestSchema = z.object({
  body: z.object({
    profileId: z.string(),
    clientGroupId: z.string(),
    mutations: z.array(mutation),
    schemaVersion: z.string(),
  }),
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