import { setupServer } from 'msw/node';
import { handlers } from './handlers';

/**
 * MSW server instance for Vitest (Node.js environment).
 * Started/stopped via tests/setup.ts.
 */
export const server = setupServer(...handlers);
