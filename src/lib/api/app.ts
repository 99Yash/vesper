import { Elysia, t } from 'elysia';

export const app = new Elysia()
  .get('/', () => 'Hello Elysia')
  .get('/health', () => ({ status: 'ok', timestamp: new Date().toISOString() }))
  .get(
    '/user/:id',
    ({ params: { id } }) => {
      const userId = Number(id);
      if (isNaN(userId)) {
        throw new Error('Invalid user ID');
      }
      return { id: userId, name: `User ${userId}` };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    }
  );

export type App = typeof app;
