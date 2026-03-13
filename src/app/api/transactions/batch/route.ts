import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { Database } from '@/types/database.types';

type TransactionInsert = Database['public']['Tables']['transactions']['Insert'];
type MerchantMappingInsert = Database['public']['Tables']['merchant_mappings']['Insert'];

interface ParsedPayloadRow {
  date?: string;
  amount: string | number;
  description?: string;
  suggested_category_id?: string | null;
  suggested_new_category?: { name_he: string; name_en: string; type: string } | null;
  suggested_asset_id?: string | null;
  account_id?: string | null;
}

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const supabase = await createClient();

    if (!payload || !Array.isArray(payload) || payload.length === 0) {
      return NextResponse.json({ error: 'Invalid payload format' }, { status: 400 });
    }

    // 0. Intercept and create NEW categories
    // Group identical suggested new categories to avoid creating duplicates in a single batch
    const newCategoryMap = new Map<string, string>(); // Key: stringified category, Value: new category ID

    for (const row of payload as ParsedPayloadRow[]) {
      if (row.suggested_new_category && !row.suggested_category_id) {
        const mapKey = `${row.suggested_new_category.name_he}-${row.suggested_new_category.type}`;

        if (!newCategoryMap.has(mapKey)) {
          // Try to insert
          const { data: newCat, error: catError } = await supabase
            .from('categories')
            .insert({
              name_he: row.suggested_new_category.name_he,
              name_en: row.suggested_new_category.name_en || row.suggested_new_category.name_he,
              type: row.suggested_new_category.type,
            })
            .select('id')
            .single();

          if (catError) {
            console.error('Failed to create suggested new AI category:', catError);
          } else if (newCat) {
            const createdCat = newCat as { id: string };
            newCategoryMap.set(mapKey, createdCat.id);
          }
        }

        // Link the row to the newly created category
        row.suggested_category_id = newCategoryMap.get(mapKey) || null;
      }
    }

    // 1. Prepare transactions for insertion
    const newTransactions: TransactionInsert[] = payload.map((row: ParsedPayloadRow) => ({
      date: row.date || new Date().toISOString().split('T')[0],
      amount: Math.abs(typeof row.amount === 'string' ? parseFloat(row.amount) : row.amount) || 0, // Ensure amount is absolute
      description: row.description || 'Unknown',
      merchant: row.description?.trim() || 'Unknown', // Temporarily same as description
      category_id: row.suggested_category_id || null, // Map the verified string
      asset_id: row.suggested_asset_id || null,
      account_id: row.account_id || null,
    }));

    // Insert new transactions into the ledger
    const { error: txError } = await supabase.from('transactions').insert(newTransactions);

    if (txError) {
      console.error('Transactions Insert Error:', txError);
      return NextResponse.json({ error: 'Failed to save transactions.' }, { status: 500 });
    }

    // 2. Prepare new merchant mappings for AI Cache learning
    // We only want to learn from rows where the user explicitly checked the box (or didn't change the AI)
    // For simplicity right now, if it has a category, we map the merchant string to the category for the future.
    const mappingsToLearn: MerchantMappingInsert[] = payload
      .filter(
        (row: ParsedPayloadRow) =>
          row.suggested_category_id !== null && row.suggested_category_id !== undefined,
      )
      .map((row: ParsedPayloadRow) => ({
        raw_merchant_string: row.description?.trim() || 'Unknown',
        mapped_category_id: row.suggested_category_id,
      }));

    // Upsert unique dictionary definitions silently.
    if (mappingsToLearn.length > 0) {
      await supabase.from('merchant_mappings').insert(mappingsToLearn);
    }

    return NextResponse.json({
      success: true,
      inserted: newTransactions.length,
    });
  } catch (error) {
    console.error('Batch Transaction Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
