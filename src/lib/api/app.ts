import { Elysia, t } from 'elysia';

export const app = new Elysia()
  .get('/', () => 'Hello Elysia')
  .get('/health', () => ({ status: 'ok', timestamp: new Date().toISOString() }))
  .get('/user/:id', ({ params: { id } }) => ({ id, name: `User ${id}` }), {
    params: t.Object({
      id: t.Transform(t.String(), {
        transform: (value) => {
          const num = Number(value);
          if (isNaN(num)) {
            throw new Error('Invalid number');
          }
          return num;
        },
      }),
    }),
  });

export type App = typeof app;

