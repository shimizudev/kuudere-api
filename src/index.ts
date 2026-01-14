import { v1 } from './routes/v1.routes';
import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { Logestic } from 'logestic';
import { createErrorResponse } from './helpers/response';

const api = new Elysia({ prefix: '/api' }).use(v1);

const PORT = Number.parseInt(process.env.PORT ?? '3000');

new Elysia()
  .use(cors())
  .use(Logestic.preset('fancy'))
  .use(api)
  .all('*', ({ set }) => {
    return createErrorResponse(
      'Could not find the route you are looking for.',
      'NOT_FOUND',
      set,
      404
    );
  })
  .listen(PORT);

console.log(`🦊 Elysia server started on ${PORT}`);
