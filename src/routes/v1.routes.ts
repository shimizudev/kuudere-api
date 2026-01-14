import { kuuderSearch } from '../core/search';
import { kuudereEpisodes } from '../core/episodes';
import { kuudereInfo } from '../core/info';
import { kuudereSources } from '../core/sources';
import Elysia, { t } from 'elysia';
import { createErrorResponse, createSuccessResponse } from '../helpers/response';
import { isHTTPError, isTimeoutError, TimeoutError } from 'ky';

const v1 = new Elysia({ prefix: '/v1' });

v1.get(
  '/search',
  async ({ query, set }) => {
    const { query: searchQuery } = query;

    const results = await kuuderSearch(searchQuery);

    return createSuccessResponse(results, set);
  },
  {
    query: t.Object({
      query: t.String(),
    }),
  }
);

v1.get(
  '/info/:id',
  async ({ params, set }) => {
    const { id } = params;

    const result = await kuudereInfo(id);

    return createSuccessResponse(result, set);
  },
  {
    params: t.Object({
      id: t.String(),
    }),
  }
);

v1.get(
  '/episodes/:id',
  async ({ params, set }) => {
    const { id } = params;

    const result = await kuudereEpisodes(id);

    return createSuccessResponse(result, set);
  },
  {
    params: t.Object({
      id: t.String(),
    }),
  }
);

v1.get(
  '/sources',
  async ({ query, set }) => {
    const { id, subType } = query;

    const result = await kuudereSources(id, subType);

    return createSuccessResponse(result, set);
  },
  {
    query: t.Object({
      id: t.String(),
      subType: t.UnionEnum(['sub', 'dub'], { default: 'sub' }),
    }),
  }
);

v1.onError(({ error, set }) => {
  const internalError = (err: Error) =>
    createErrorResponse(
      'Please contact a developer or create an issue with screenshot of this response.',
      'INTERNAL_SERVER_ERROR',
      set,
      500,
      {
        name: err.name,
        message: err.message,
      }
    );

  const timeOutErrr = (err: TimeoutError) =>
    createErrorResponse('Requested timed out. Please try again.', 'REQUEST_TIMEOUT', set, 408, {
      name: err.name,
      message: err.message,
    });

  if (isTimeoutError(error)) {
    return timeOutErrr(error as TimeoutError);
  }

  if (!isHTTPError(error)) {
    console.error(error);
    return internalError(error as Error);
  }

  const status = error.response.status;

  if (status === 404) {
    return createErrorResponse(error.message, 'NOT_FOUND', set, 404);
  }

  if ([400, 401, 403, 500].includes(status)) {
    return internalError(error);
  }
});

export { v1 };
