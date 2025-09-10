import { z } from "zod";

const mutationSchema = z.object({
  id: z.number(),
  clientId: z.string(),
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
  instanceId: z.string().min(1),
})
export type PushRequestType = z.infer<typeof pushRequestSchema>;

const cookieSchema = z
  .object({
    order: z.number().int().nonnegative(),
    clientGroupId: z.string().min(1),
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
}).strict();

export type PullRequestType = z.infer<typeof pullRequestSchema>;