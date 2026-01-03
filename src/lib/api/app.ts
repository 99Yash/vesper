import { Elysia, t } from 'elysia';

export const app = new Elysia()
  .get('/', () => 'Hello Elysia')
  .get('/health', () => ({ status: 'ok', timestamp: new Date().toISOString() }))
  .get('/user/:id', ({ params: { id } }) => ({ id, name: `User ${id}` }), {
    params: t.Object({
      id: t.Number(),
    }),
  });

export type App = typeof app;

