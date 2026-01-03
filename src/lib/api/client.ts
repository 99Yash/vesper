import { treaty } from '@elysiajs/eden';
import { app } from '~/lib/api/app';

export const api =
  typeof window === 'undefined'
    ? treaty(app).api
    : treaty<typeof app>(
        process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
      ).api;

