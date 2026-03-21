import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AccountDialog } from './AccountDialog';

// Mock the server action — it lives in a Next.js server context
vi.mock('@/app/(app)/finance/actions', () => ({
  upsertAccountAction: vi.fn().mockResolvedValue({ success: true }),
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('AccountDialog', () => {
  it('renders the default "Add Account" trigger button', () => {
    render(<AccountDialog />);
    expect(screen.getByRole('button', { name: /הוסף חשבון/i })).toBeInTheDocument();
  });

  it('opens the dialog when the trigger button is clicked', async () => {
    const user = userEvent.setup();
    render(<AccountDialog />);
    await user.click(screen.getByRole('button', { name: /הוסף חשבון/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/הוספת חשבון או נכס פיננסי/i)).toBeInTheDocument();
  });

  it('shows all form fields when opened', async () => {
    const user = userEvent.setup();
    render(<AccountDialog />);
    await user.click(screen.getByRole('button', { name: /הוסף חשבון/i }));
    expect(screen.getByLabelText(/שם החשבון/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/יתרה נוכחית/i)).toBeInTheDocument();
  });

  it('shows validation errors when submitting empty form', async () => {
    const user = userEvent.setup();
    render(<AccountDialog />);
    await user.click(screen.getByRole('button', { name: /הוסף חשבון/i }));
    await user.click(screen.getByRole('button', { name: /שמור חשבון/i }));
    await waitFor(() => {
      // AccountFormSchema uses Hebrew validation messages like 'נדרש שם'
      expect(screen.getByText('נדרש שם')).toBeInTheDocument();
    });
  });

  it('shows edit mode UI when accountToEdit is provided', async () => {
    const user = userEvent.setup();
    const mockAccount = {
      id: 'acc-1',
      name: 'Test Checking',
      type: 'bank' as const,
      currency: 'ILS',
      current_balance: 5000,
      billing_day: null,
      credit_limit: null,
      metadata: null,
      user_id: 'user-1',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    } as Parameters<typeof AccountDialog>[0]['accountToEdit'];

    render(<AccountDialog accountToEdit={mockAccount} />);
    // Edit trigger is an icon button (pencil icon)
    await user.click(screen.getByRole('button'));
    expect(screen.getByText(/עריכת חשבון או נכס/i)).toBeInTheDocument();
  });
});
