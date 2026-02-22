export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            accounts: {
                Row: {
                    id: string
                    name: string
                    type: string
                    currency: string | null
                    current_balance: number | null
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    name: string
                    type: string
                    currency?: string | null
                    current_balance?: number | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    name?: string
                    type?: string
                    currency?: string | null
                    current_balance?: number | null
                    created_at?: string | null
                    updated_at?: string | null
                }
            }
            assets: {
                Row: {
                    id: string
                    name: string
                    type: string
                    estimated_value: number | null
                    metadata: Json | null
                    attachments: Json | null
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    name: string
                    type: string
                    estimated_value?: number | null
                    metadata?: Json | null
                    attachments?: Json | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    name?: string
                    type?: string
                    estimated_value?: number | null
                    metadata?: Json | null
                    attachments?: Json | null
                    created_at?: string | null
                    updated_at?: string | null
                }
            }
            categories: {
                Row: {
                    id: string
                    name_he: string
                    name_en: string
                    type: string
                    parent_id: string | null
                    sort_order: number | null
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    name_he: string
                    name_en: string
                    type: string
                    parent_id?: string | null
                    sort_order?: number | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    name_he?: string
                    name_en?: string
                    type?: string
                    parent_id?: string | null
                    sort_order?: number | null
                    created_at?: string | null
                    updated_at?: string | null
                }
            }
            household_items: {
                Row: {
                    id: string
                    name: string
                    category: string
                    purchase_date: string | null
                    purchase_price: number | null
                    warranty_expiry: string | null
                    metadata: Json | null
                    attachments: Json | null
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    name: string
                    category: string
                    purchase_date?: string | null
                    purchase_price?: number | null
                    warranty_expiry?: string | null
                    metadata?: Json | null
                    attachments?: Json | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    name?: string
                    category?: string
                    purchase_date?: string | null
                    purchase_price?: number | null
                    warranty_expiry?: string | null
                    metadata?: Json | null
                    attachments?: Json | null
                    created_at?: string | null
                    updated_at?: string | null
                }
            }
            merchant_mappings: {
                Row: {
                    id: string
                    raw_merchant_string: string
                    mapped_category_id: string | null
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    raw_merchant_string: string
                    mapped_category_id?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    raw_merchant_string?: string
                    mapped_category_id?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                }
            }
            recurring_flows: {
                Row: {
                    id: string
                    name: string
                    amount: number
                    type: string
                    category_id: string | null
                    frequency: string
                    next_date: string | null
                    is_active: boolean | null
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    name: string
                    amount: number
                    type: string
                    category_id?: string | null
                    frequency: string
                    next_date?: string | null
                    is_active?: boolean | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    name?: string
                    amount?: number
                    type?: string
                    category_id?: string | null
                    frequency?: string
                    next_date?: string | null
                    is_active?: boolean | null
                    created_at?: string | null
                    updated_at?: string | null
                }
            }
            reminders: {
                Row: {
                    id: string
                    title: string
                    due_date: string
                    type: string
                    is_completed: boolean | null
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    title: string
                    due_date: string
                    type: string
                    is_completed?: boolean | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    title?: string
                    due_date?: string
                    type?: string
                    is_completed?: boolean | null
                    created_at?: string | null
                    updated_at?: string | null
                }
            }
            transactions: {
                Row: {
                    id: string
                    account_id: string | null
                    category_id: string | null
                    trip_id: string | null
                    recurring_flow_id: string | null
                    amount: number
                    date: string
                    description: string | null
                    merchant: string | null
                    is_deduplicated: boolean | null
                    original_amount: number | null
                    installment_number: number | null
                    total_installments: number | null
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    account_id?: string | null
                    category_id?: string | null
                    trip_id?: string | null
                    recurring_flow_id?: string | null
                    amount: number
                    date: string
                    description?: string | null
                    merchant?: string | null
                    is_deduplicated?: boolean | null
                    original_amount?: number | null
                    installment_number?: number | null
                    total_installments?: number | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    account_id?: string | null
                    category_id?: string | null
                    trip_id?: string | null
                    recurring_flow_id?: string | null
                    amount?: number
                    date?: string
                    description?: string | null
                    merchant?: string | null
                    is_deduplicated?: boolean | null
                    original_amount?: number | null
                    installment_number?: number | null
                    total_installments?: number | null
                    created_at?: string | null
                    updated_at?: string | null
                }
            }
            trips: {
                Row: {
                    id: string
                    name: string
                    start_date: string | null
                    end_date: string | null
                    budget: number | null
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    name: string
                    start_date?: string | null
                    end_date?: string | null
                    budget?: number | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    name?: string
                    start_date?: string | null
                    end_date?: string | null
                    budget?: number | null
                    created_at?: string | null
                    updated_at?: string | null
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}
