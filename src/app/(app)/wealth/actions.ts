'use server';
import { createClient } from '@/lib/supabase/server';
import { PropertyFormData, PensionFormData, InvestmentAccountFormData } from '@/lib/schemas';

// ─── Property ────────────────────────────────────────────────────────────────

export async function upsertPropertyAction(
  data: PropertyFormData,
  id?: string,
): Promise<{ success: true } | { success: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) return { success: false, error: 'לא מאומת' };

  const payload = {
    name: data.name,
    status: data.status,
    address: data.address || null,
    purchase_price: data.purchase_price ?? null,
    purchase_date: data.purchase_date || null,
    estimated_value: data.estimated_value ?? null,
    is_rented: data.is_rented,
    monthly_rent: data.monthly_rent ?? null,
    rent_start_date: data.rent_start_date || null,
    rent_end_date: data.rent_end_date || null,
    mortgage_payment: data.mortgage_payment ?? null,
    mortgage_start_date: data.mortgage_start_date || null,
    mortgage_end_date: data.mortgage_end_date || null,
    notes: data.notes || null,
  };

  let savedPropertyId = id;

  if (id) {
    const { error } = await supabase.from('properties').update(payload).eq('id', id);
    if (error) {
      console.error('Error updating property:', error);
      return { success: false, error: 'שגיאה בעדכון הנכס' };
    }
  } else {
    const { data: newProp, error } = await supabase
      .from('properties')
      .insert(payload)
      .select('id')
      .single();
    if (error || !newProp) {
      console.error('Error inserting property:', error);
      return { success: false, error: 'שגיאה בהוספת הנכס' };
    }
    savedPropertyId = newProp.id;
  }

  if (savedPropertyId) {
    await syncPropertyFlows(supabase, savedPropertyId, data);
  }

  return { success: true };
}

async function syncPropertyFlows(
  supabase: Awaited<ReturnType<typeof import('@/lib/supabase/server').createClient>>,
  propertyId: string,
  data: PropertyFormData,
) {
  const flowsToUpsert: Array<{
    property_id: string;
    name: string;
    amount: number;
    type: 'income' | 'expense';
    frequency: 'monthly' | 'yearly' | 'weekly';
    is_active: boolean;
    start_date: string | null;
    end_date: string | null;
  }> = [];

  if (data.monthly_rent && data.monthly_rent > 0) {
    flowsToUpsert.push({
      property_id: propertyId,
      name: `${data.name} (שכירות)`,
      amount: data.monthly_rent,
      type: 'income',
      frequency: 'monthly',
      is_active: true,
      start_date: data.rent_start_date || null,
      end_date: data.rent_end_date || null,
    });
  }

  if (data.mortgage_payment && data.mortgage_payment > 0) {
    flowsToUpsert.push({
      property_id: propertyId,
      name: `${data.name} (משכנתא)`,
      amount: data.mortgage_payment,
      type: 'expense',
      frequency: 'monthly',
      is_active: true,
      start_date: data.mortgage_start_date || null,
      end_date: data.mortgage_end_date || null,
    });
  }

  for (const flow of flowsToUpsert) {
    const { data: existing } = await supabase
      .from('recurring_flows')
      .select('id')
      .eq('property_id', propertyId)
      .eq('name', flow.name)
      .maybeSingle();

    if (existing) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { property_id: _pid, ...updatePayload } = flow;
      await supabase.from('recurring_flows').update(updatePayload).eq('id', existing.id);
    } else {
      await supabase.from('recurring_flows').insert(flow);
    }
  }

  // Auto-reminder: 3 months before rent contract end date
  if (data.rent_end_date) {
    const endDate = new Date(data.rent_end_date);
    const reminderDate = new Date(endDate);
    reminderDate.setMonth(reminderDate.getMonth() - 3);

    const reminderTitle = `חידוש חוזה שכירות – ${data.name}`;

    const { data: existingReminder } = await supabase
      .from('reminders')
      .select('id')
      .eq('title', reminderTitle)
      .maybeSingle();

    const reminderPayload = {
      title: reminderTitle,
      due_date: reminderDate.toISOString().split('T')[0],
      type: 'maintenance' as const,
      is_completed: false,
      property_id: propertyId,
    };

    if (existingReminder) {
      await supabase.from('reminders').update(reminderPayload).eq('id', existingReminder.id);
    } else {
      await supabase.from('reminders').insert(reminderPayload);
    }
  }
}

// ─── Pension / Gemel ─────────────────────────────────────────────────────────

export async function upsertPensionAction(
  data: PensionFormData,
  id?: string,
): Promise<{ success: true } | { success: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) return { success: false, error: 'לא מאומת' };

  const payload = {
    name: data.name,
    account_type: data.account_type,
    current_balance: data.current_balance ?? null,
    broker: data.broker || null,
    monthly_contribution_ils: data.monthly_contribution_ils ?? null,
    is_managed: true,
    is_active: true,
  };

  const { error } = id
    ? await supabase.from('investment_accounts').update(payload).eq('id', id)
    : await supabase.from('investment_accounts').insert(payload);

  if (error) {
    console.error('Error saving pension account:', error);
    return { success: false, error: 'שגיאה בשמירת הקרן' };
  }
  return { success: true };
}

// ─── Investment Account ───────────────────────────────────────────────────────

export async function upsertInvestmentAccountAction(
  data: InvestmentAccountFormData,
  id?: string,
): Promise<{ success: true } | { success: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) return { success: false, error: 'לא מאומת' };

  const isHistalmut = data.account_type === 'histalmut';
  const isGemel = data.account_type === 'gemel';

  const payload = {
    name: data.name,
    account_type: data.account_type,
    broker: data.broker || null,
    management_fee_percent: data.management_fee_percent ?? null,
    is_managed: data.is_managed,
    current_balance: data.is_managed && data.current_balance ? data.current_balance : null,
    tax_eligible_date: isHistalmut && data.tax_eligible_date ? data.tax_eligible_date : null,
    monthly_contribution_ils:
      (isHistalmut || isGemel) && data.monthly_contribution_ils
        ? data.monthly_contribution_ils
        : null,
    notes: data.notes || null,
    is_active: true,
  };

  const { error } = id
    ? await supabase.from('investment_accounts').update(payload).eq('id', id)
    : await supabase.from('investment_accounts').insert(payload);

  if (error) {
    console.error('Error saving investment account:', error);
    return {
      success: false,
      error: id ? 'שגיאה בעדכון חשבון ההשקעות' : 'שגיאה בהוספת חשבון ההשקעות',
    };
  }
  return { success: true };
}

// ─── Portfolio Holding ────────────────────────────────────────────────────────

export async function upsertHoldingAction(
  investmentAccountId: string,
  ticker: string,
  name: string | null,
  assetClass: string,
  currency: string,
  lotData: {
    purchase_date: string;
    quantity: number;
    price_per_unit: number;
    fees: number;
  },
): Promise<{ success: true } | { success: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) return { success: false, error: 'לא מאומת' };

  // Check if holding already exists
  const { data: existing } = await supabase
    .from('portfolio_holdings')
    .select('id')
    .eq('investment_account_id', investmentAccountId)
    .eq('ticker', ticker)
    .maybeSingle();

  let holdingId: string;

  if (existing) {
    holdingId = existing.id;
  } else {
    const { data: newHolding, error: holdingError } = await supabase
      .from('portfolio_holdings')
      .insert({
        investment_account_id: investmentAccountId,
        ticker,
        name: name || null,
        asset_class: assetClass,
        currency,
        is_active: true,
      })
      .select('id')
      .single();

    if (holdingError || !newHolding) {
      console.error('Error adding holding:', holdingError);
      return { success: false, error: 'שגיאה בהוספת נייר הערך' };
    }
    holdingId = newHolding.id;
  }

  const totalCost = lotData.quantity * lotData.price_per_unit + (lotData.fees ?? 0);

  const { error: lotError } = await supabase.from('portfolio_lots').insert({
    holding_id: holdingId,
    lot_type: 'buy',
    purchase_date: lotData.purchase_date,
    quantity: lotData.quantity,
    price_per_unit: lotData.price_per_unit,
    total_cost: totalCost,
    fees: lotData.fees ?? 0,
  });

  if (lotError) {
    console.error('Error adding lot:', lotError);
    return { success: false, error: 'נייר הערך נוסף אך שגיאה בהוספת הרכישה' };
  }

  return { success: true };
}

// ─── Add Lot ──────────────────────────────────────────────────────────────────

export async function addLotAction(
  holdingId: string,
  data: {
    purchase_date: string;
    quantity: number;
    price_per_unit: number;
    fees: number;
  },
): Promise<{ success: true } | { success: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) return { success: false, error: 'לא מאומת' };

  const totalCost = data.quantity * data.price_per_unit + (data.fees ?? 0);

  const { error } = await supabase.from('portfolio_lots').insert({
    holding_id: holdingId,
    lot_type: 'buy',
    purchase_date: data.purchase_date,
    quantity: data.quantity,
    price_per_unit: data.price_per_unit,
    total_cost: totalCost,
    fees: data.fees ?? 0,
  });

  if (error) {
    console.error('Error adding lot:', error);
    return { success: false, error: 'שגיאה בהוספת הרכישה' };
  }
  return { success: true };
}

// ─── Sell Lot ─────────────────────────────────────────────────────────────────

export async function sellLotAction(
  holdingId: string,
  relatedLotId: string,
  data: {
    sale_date: string;
    quantity: number;
    price_per_unit: number;
    fees: number;
  },
): Promise<{ success: true } | { success: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) return { success: false, error: 'לא מאומת' };

  const proceeds = data.quantity * data.price_per_unit - (data.fees ?? 0);

  const { error } = await supabase.from('portfolio_lots').insert({
    holding_id: holdingId,
    lot_type: 'sell',
    purchase_date: data.sale_date,
    quantity: data.quantity,
    price_per_unit: data.price_per_unit,
    total_cost: proceeds,
    fees: data.fees ?? 0,
    related_lot_id: relatedLotId,
  });

  if (error) {
    console.error('Error recording sale:', error);
    return { success: false, error: 'שגיאה בתיעוד המכירה' };
  }
  return { success: true };
}

// ─── RSU Grant ────────────────────────────────────────────────────────────────

export async function upsertRsuGrantAction(
  data: {
    investment_account_id: string | undefined;
    ticker: string;
    employer: string | null;
    grant_date: string;
    total_shares: number;
    grant_price_usd: number | null;
    cliff_months: number;
    vest_frequency_months: number;
    shares_per_vest: number | null;
    vest_percentage: number | null;
    cliff_vest_shares: number | null;
    cliff_vest_percentage: number | null;
    tax_track: string;
    notes: string | null;
    schedulePreview: Array<{ vest_date: string; shares_vested: number }> | null;
  },
  id?: string,
): Promise<{ success: true } | { success: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) return { success: false, error: 'לא מאומת' };

  let accountId = data.investment_account_id;

  if (!accountId && !id) {
    const { data: newAccount, error: accountError } = await supabase
      .from('investment_accounts')
      .insert({
        name: data.employer ? `RSU - ${data.employer}` : 'RSU',
        account_type: 'rsu',
        is_managed: false,
        is_active: true,
      })
      .select('id')
      .single();

    if (accountError || !newAccount) {
      console.error('Error creating investment account:', accountError);
      return { success: false, error: 'שגיאה ביצירת חשבון השקעות' };
    }
    accountId = newAccount.id;
  }

  const payload = {
    investment_account_id: accountId!,
    ticker: data.ticker,
    employer: data.employer || null,
    grant_date: data.grant_date,
    total_shares: data.total_shares,
    grant_price_usd: data.grant_price_usd,
    cliff_months: data.cliff_months,
    vest_frequency_months: data.vest_frequency_months,
    shares_per_vest: data.shares_per_vest,
    vest_percentage: data.vest_percentage,
    cliff_vest_shares: data.cliff_vest_shares,
    cliff_vest_percentage: data.cliff_vest_percentage,
    tax_track: data.tax_track,
    notes: data.notes || null,
    is_active: true,
  };

  if (id) {
    const { error } = await supabase.from('rsu_grants').update(payload).eq('id', id);
    if (error) {
      console.error('Error updating RSU grant:', error);
      return { success: false, error: 'שגיאה בעדכון המענק' };
    }
    return { success: true };
  }

  const { data: newGrant, error: grantError } = await supabase
    .from('rsu_grants')
    .insert(payload)
    .select('id')
    .single();

  if (grantError || !newGrant) {
    console.error('Error inserting RSU grant:', grantError);
    return { success: false, error: 'שגיאה בהוספת המענק' };
  }

  const grantId = newGrant.id;
  const grantPriceUsd = data.grant_price_usd;

  if (data.schedulePreview && data.schedulePreview.length > 0 && grantPriceUsd != null) {
    // Ensure holding exists
    const { data: existingHolding } = await supabase
      .from('portfolio_holdings')
      .select('id')
      .eq('investment_account_id', accountId!)
      .eq('ticker', data.ticker)
      .maybeSingle();

    let holdingId: string;

    if (existingHolding) {
      holdingId = existingHolding.id;
    } else {
      const { data: newHolding, error: holdingError } = await supabase
        .from('portfolio_holdings')
        .insert({
          investment_account_id: accountId!,
          ticker: data.ticker,
          asset_class: 'stock',
          currency: 'USD',
          is_active: true,
        })
        .select('id')
        .single();

      if (holdingError || !newHolding) {
        console.error('Error creating holding:', holdingError);
        return { success: false, error: 'המענק נוסף אך שגיאה ביצירת הנייר ערך' };
      }
      holdingId = newHolding.id;
    }

    for (const item of data.schedulePreview) {
      const { data: lot, error: lotError } = await supabase
        .from('portfolio_lots')
        .insert({
          holding_id: holdingId,
          lot_type: 'rsu_vest',
          purchase_date: item.vest_date,
          quantity: item.shares_vested,
          price_per_unit: grantPriceUsd,
          total_cost: item.shares_vested * grantPriceUsd,
          fees: 0,
        })
        .select('id')
        .single();

      if (lotError || !lot) {
        console.error('Error creating lot:', lotError);
        continue;
      }

      await supabase.from('rsu_vests').insert({
        grant_id: grantId,
        vest_date: item.vest_date,
        shares_vested: item.shares_vested,
        linked_lot_id: lot.id,
      });
    }
  }

  return { success: true };
}

// ─── RSU Vest ─────────────────────────────────────────────────────────────────

export async function recordRsuVestAction(
  grant: {
    id: string;
    investment_account_id: string;
    ticker: string;
    tax_track: string;
    grant_price_usd: number | null;
  },
  data: {
    vest_date: string;
    shares_vested: number;
    fmv_at_vest: number;
    notes: string | null;
  },
): Promise<{ success: true } | { success: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) return { success: false, error: 'לא מאומת' };

  // Find or create holding
  const { data: holding } = await supabase
    .from('portfolio_holdings')
    .select('id')
    .eq('investment_account_id', grant.investment_account_id)
    .eq('ticker', grant.ticker)
    .maybeSingle();

  let holdingId = holding?.id;

  if (!holdingId) {
    const { data: newHolding, error: holdingError } = await supabase
      .from('portfolio_holdings')
      .insert({
        investment_account_id: grant.investment_account_id,
        ticker: grant.ticker,
        asset_class: 'stock',
        currency: 'USD',
        is_active: true,
      })
      .select('id')
      .single();

    if (holdingError || !newHolding) {
      console.error('Error creating holding:', holdingError);
      return { success: false, error: 'שגיאה ביצירת נייר הערך' };
    }
    holdingId = newHolding.id;
  }

  const costBasisPerShare =
    grant.tax_track === 'capital_gains'
      ? (grant.grant_price_usd ?? data.fmv_at_vest)
      : data.fmv_at_vest;

  const { data: lot, error: lotError } = await supabase
    .from('portfolio_lots')
    .insert({
      holding_id: holdingId,
      lot_type: 'rsu_vest',
      purchase_date: data.vest_date,
      quantity: data.shares_vested,
      price_per_unit: costBasisPerShare,
      total_cost: data.shares_vested * costBasisPerShare,
      fees: 0,
      notes: data.notes || null,
    })
    .select('id')
    .single();

  if (lotError || !lot) {
    console.error('Error creating lot:', lotError);
    return { success: false, error: 'שגיאה ברישום ההתבגרות' };
  }

  const { error: vestError } = await supabase.from('rsu_vests').insert({
    grant_id: grant.id,
    vest_date: data.vest_date,
    shares_vested: data.shares_vested,
    fmv_at_vest: data.fmv_at_vest,
    linked_lot_id: lot.id,
    notes: data.notes || null,
  });

  if (vestError) {
    console.error('Error creating vest record:', vestError);
    return { success: false, error: 'שגיאה ברישום ההתבגרות' };
  }

  return { success: true };
}
