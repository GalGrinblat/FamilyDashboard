import { http, HttpResponse } from 'msw';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://test.supabase.co';

/**
 * Centralized MSW request handlers for Supabase REST API.
 * Import and extend these in individual test files for specific scenarios.
 */
export const handlers = [
  // Auth - Get current user session
  http.get(`${SUPABASE_URL}/auth/v1/user`, () => {
    return HttpResponse.json({
      id: 'user-test-id',
      email: 'test@example.com',
      role: 'authenticated',
      aud: 'authenticated',
      created_at: '2024-01-01T00:00:00Z',
    });
  }),

  // Accounts table
  http.get(`${SUPABASE_URL}/rest/v1/accounts`, () => {
    return HttpResponse.json([
      {
        id: 'acc-1',
        name: 'Checking Account',
        type: 'checking',
        balance: 10000,
        currency: 'ILS',
        owner: 'user-test-id',
        created_at: '2024-01-01T00:00:00Z',
      },
    ]);
  }),

  // Transactions table
  http.get(`${SUPABASE_URL}/rest/v1/transactions`, () => {
    return HttpResponse.json([
      {
        id: 'txn-1',
        account_id: 'acc-1',
        amount: -500,
        type: 'expense',
        category: 'Food',
        description: 'Groceries',
        date: '2024-01-15',
        created_at: '2024-01-15T10:00:00Z',
      },
      {
        id: 'txn-2',
        account_id: 'acc-1',
        amount: 5000,
        type: 'income',
        category: 'Salary',
        description: 'Monthly salary',
        date: '2024-01-01',
        created_at: '2024-01-01T09:00:00Z',
      },
    ]);
  }),

  // Insurance policies table
  http.get(`${SUPABASE_URL}/rest/v1/insurance_policies`, () => {
    return HttpResponse.json([]);
  }),

  // Maintenance records
  http.get(`${SUPABASE_URL}/rest/v1/maintenance_records`, () => {
    return HttpResponse.json([]);
  }),
];
