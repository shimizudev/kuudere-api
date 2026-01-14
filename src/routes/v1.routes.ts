import Elysia, { t } from 'elysia';
import { kuuderSearch } from '../core/search';
import { kuudereEpisodes } from '../core/episodes';
import { kuudereInfo } from '../core/info';
import { kuudereSources } from '../core/sources';
import { createErrorResponse, createSuccessResponse } from '../helpers/response';
import { isHTTPError, isTimeoutError, TimeoutError } from 'ky';

// Create a new Elysia instance with prefix `/v1`
const v1 = new Elysia({ prefix: '/v1' });

/**
 * GET /v1/search
 * Search anime by query string
 */
v1.get(
  '/search',
  async ({ query, set }) => {
    const { query: searchQuery } = query;

    // Call the search function and get results
    const results = await kuuderSearch(searchQuery);

    // Return success response
    return createSuccessResponse(results, set);
  },
  {
    query: t.Object({
      query: t.String(),
    }),
    detail: {
      summary: 'Search',
      description: 'Search anime by name or keyword',
    },
  }
);

/**
 * GET /v1/info/:id
 * Get detailed information about an anime by its ID
 */
v1.get(
  '/info/:id',
  async ({ params, set }) => {
    const { id } = params;

    // Fetch anime info
    const result = await kuudereInfo(id);

    // Return success response
    return createSuccessResponse(result, set);
  },
  {
    params: t.Object({
      id: t.String(),
    }),
    detail: {
      summary: 'Info',
      description: 'Get detailed information from an anime ID',
    },
  }
);

/**
 * GET /v1/episodes/:id
 * Get all episodes for a specific anime
 */
v1.get(
  '/episodes/:id',
  async ({ params, set }) => {
    const { id } = params;

    // Fetch episodes
    const result = await kuudereEpisodes(id);

    return createSuccessResponse(result, set);
  },
  {
    params: t.Object({
      id: t.String(),
    }),
    detail: {
      summary: 'Episodes',
      description: 'Get all episodes from a specific anime ID',
    },
  }
);

/**
 * GET /v1/sources
 * Get streaming sources for a specific episode
 */
v1.get(
  '/sources',
  async ({ query, set }) => {
    const { id, subType } = query;

    // Fetch sources based on episode ID and subtitle/dub type
    const result = await kuudereSources(id, subType);

    return createSuccessResponse(result, set);
  },
  {
    query: t.Object({
      id: t.String(),
      subType: t.UnionEnum(['sub', 'dub'], { default: 'sub' }),
    }),
    detail: {
      summary: 'Sources',
      description: 'Get streaming sources for a specific episode by ID and type (sub/dub)',
    },
  }
);

/**
 * Global error handler for the API
 */
v1.onError(({ error, set }) => {
  // Handles internal server errors
  const internalError = (err: Error) =>
    createErrorResponse(
      'Please contact a developer or create an issue with a screenshot of this response.',
      'INTERNAL_SERVER_ERROR',
      set,
      500,
      {
        name: err.name,
        message: err.message,
      }
    );

  // Handles request timeout errors
  const timeOutError = (err: TimeoutError) =>
    createErrorResponse('Request timed out. Please try again.', 'REQUEST_TIMEOUT', set, 408, {
      name: err.name,
      message: err.message,
    });

  // Timeout error
  if (isTimeoutError(error)) {
    return timeOutError(error as TimeoutError);
  }

  // Non-HTTP errors
  if (!isHTTPError(error)) {
    console.error(error);
    return internalError(error as Error);
  }

  // Handle HTTP errors
  const status = error.response.status;

  if (status === 404) {
    return createErrorResponse(error.message, 'NOT_FOUND', set, 404);
  }

  if ([400, 401, 403, 500].includes(status)) {
    return internalError(error);
  }
});

export { v1 };
