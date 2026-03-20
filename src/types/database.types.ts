export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.1';
  };
  public: {
    Tables: {
      accounts: {
        Row: {
          billing_day: number | null;
          created_at: string | null;
          credit_limit: number | null;
          currency: string | null;
          current_balance: number | null;
          id: string;
          name: string;
          type: Database['public']['Enums']['account_type'];
          updated_at: string | null;
        };
        Insert: {
          billing_day?: number | null;
          created_at?: string | null;
          credit_limit?: number | null;
          currency?: string | null;
          current_balance?: number | null;
          id?: string;
          name: string;
          type: Database['public']['Enums']['account_type'];
          updated_at?: string | null;
        };
        Update: {
          billing_day?: number | null;
          created_at?: string | null;
          credit_limit?: number | null;
          currency?: string | null;
          current_balance?: number | null;
          id?: string;
          name?: string;
          type?: Database['public']['Enums']['account_type'];
          updated_at?: string | null;
        };
        Relationships: [];
      };
      assets: {
        Row: {
          attachments: Json | null;
          created_at: string | null;
          estimated_value: number | null;
          id: string;
          metadata: Json | null;
          name: string;
          status: Database['public']['Enums']['asset_status'] | null;
          type: string;
          updated_at: string | null;
        };
        Insert: {
          attachments?: Json | null;
          created_at?: string | null;
          estimated_value?: number | null;
          id?: string;
          metadata?: Json | null;
          name: string;
          status?: Database['public']['Enums']['asset_status'] | null;
          type: string;
          updated_at?: string | null;
        };
        Update: {
          attachments?: Json | null;
          created_at?: string | null;
          estimated_value?: number | null;
          id?: string;
          metadata?: Json | null;
          name?: string;
          status?: Database['public']['Enums']['asset_status'] | null;
          type?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      authorized_users: {
        Row: {
          created_at: string | null;
          email: string;
        };
        Insert: {
          created_at?: string | null;
          email: string;
        };
        Update: {
          created_at?: string | null;
          email?: string;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          created_at: string | null;
          domain: Database['public']['Enums']['category_domain'] | null;
          id: string;
          name_en: string;
          name_he: string;
          parent_id: string | null;
          sort_order: number | null;
          type: Database['public']['Enums']['category_type'];
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          domain?: Database['public']['Enums']['category_domain'] | null;
          id?: string;
          name_en: string;
          name_he: string;
          parent_id?: string | null;
          sort_order?: number | null;
          type: Database['public']['Enums']['category_type'];
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          domain?: Database['public']['Enums']['category_domain'] | null;
          id?: string;
          name_en?: string;
          name_he?: string;
          parent_id?: string | null;
          sort_order?: number | null;
          type?: Database['public']['Enums']['category_type'];
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'categories_parent_id_fkey';
            columns: ['parent_id'];
            isOneToOne: false;
            referencedRelation: 'categories';
            referencedColumns: ['id'];
          },
        ];
      };
      financial_goals: {
        Row: {
          category: Database['public']['Enums']['goal_category'];
          created_at: string | null;
          current_amount: number;
          id: string;
          is_completed: boolean;
          notes: string | null;
          target_amount: number;
          target_date: string | null;
          title: string;
          updated_at: string | null;
        };
        Insert: {
          category?: Database['public']['Enums']['goal_category'];
          created_at?: string | null;
          current_amount?: number;
          id?: string;
          is_completed?: boolean;
          notes?: string | null;
          target_amount: number;
          target_date?: string | null;
          title: string;
          updated_at?: string | null;
        };
        Update: {
          category?: Database['public']['Enums']['goal_category'];
          created_at?: string | null;
          current_amount?: number;
          id?: string;
          is_completed?: boolean;
          notes?: string | null;
          target_amount?: number;
          target_date?: string | null;
          title?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      household_items: {
        Row: {
          attachment_urls: string[] | null;
          category: Database['public']['Enums']['household_item_category'];
          created_at: string | null;
          id: string;
          manual_url: string | null;
          model: string | null;
          name: string;
          purchase_date: string | null;
          purchase_price: number | null;
          serial_number: string | null;
          updated_at: string | null;
          warranty_expiry: string | null;
        };
        Insert: {
          attachment_urls?: string[] | null;
          category: Database['public']['Enums']['household_item_category'];
          created_at?: string | null;
          id?: string;
          manual_url?: string | null;
          model?: string | null;
          name: string;
          purchase_date?: string | null;
          purchase_price?: number | null;
          serial_number?: string | null;
          updated_at?: string | null;
          warranty_expiry?: string | null;
        };
        Update: {
          attachment_urls?: string[] | null;
          category?: Database['public']['Enums']['household_item_category'];
          created_at?: string | null;
          id?: string;
          manual_url?: string | null;
          model?: string | null;
          name?: string;
          purchase_date?: string | null;
          purchase_price?: number | null;
          serial_number?: string | null;
          updated_at?: string | null;
          warranty_expiry?: string | null;
        };
        Relationships: [];
      };
      investment_accounts: {
        Row: {
          account_type: Database['public']['Enums']['investment_account_type'];
          broker: string | null;
          created_at: string | null;
          current_balance: number | null;
          id: string;
          is_active: boolean;
          is_managed: boolean;
          management_fee_percent: number | null;
          monthly_contribution_ils: number | null;
          name: string;
          notes: string | null;
          tax_eligible_date: string | null;
          updated_at: string | null;
        };
        Insert: {
          account_type: Database['public']['Enums']['investment_account_type'];
          broker?: string | null;
          created_at?: string | null;
          current_balance?: number | null;
          id?: string;
          is_active?: boolean;
          is_managed?: boolean;
          management_fee_percent?: number | null;
          monthly_contribution_ils?: number | null;
          name: string;
          notes?: string | null;
          tax_eligible_date?: string | null;
          updated_at?: string | null;
        };
        Update: {
          account_type?: Database['public']['Enums']['investment_account_type'];
          broker?: string | null;
          created_at?: string | null;
          current_balance?: number | null;
          id?: string;
          is_active?: boolean;
          is_managed?: boolean;
          management_fee_percent?: number | null;
          monthly_contribution_ils?: number | null;
          name?: string;
          notes?: string | null;
          tax_eligible_date?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      merchant_mappings: {
        Row: {
          created_at: string | null;
          id: string;
          mapped_category_id: string | null;
          raw_merchant_string: string;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          mapped_category_id?: string | null;
          raw_merchant_string: string;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          mapped_category_id?: string | null;
          raw_merchant_string?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'merchant_mappings_mapped_category_id_fkey';
            columns: ['mapped_category_id'];
            isOneToOne: false;
            referencedRelation: 'categories';
            referencedColumns: ['id'];
          },
        ];
      };
      monthly_one_offs: {
        Row: {
          amount: number;
          created_at: string | null;
          day_of_month: number;
          id: string;
          month_year: string;
          title: string;
          type: Database['public']['Enums']['flow_type'];
          updated_at: string | null;
        };
        Insert: {
          amount: number;
          created_at?: string | null;
          day_of_month: number;
          id?: string;
          month_year: string;
          title: string;
          type: Database['public']['Enums']['flow_type'];
          updated_at?: string | null;
        };
        Update: {
          amount?: number;
          created_at?: string | null;
          day_of_month?: number;
          id?: string;
          month_year?: string;
          title?: string;
          type?: Database['public']['Enums']['flow_type'];
          updated_at?: string | null;
        };
        Relationships: [];
      };
      monthly_overrides: {
        Row: {
          created_at: string | null;
          id: string;
          month_year: string;
          override_amount: number;
          recurring_flow_id: string | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          month_year: string;
          override_amount: number;
          recurring_flow_id?: string | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          month_year?: string;
          override_amount?: number;
          recurring_flow_id?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'monthly_overrides_recurring_flow_id_fkey';
            columns: ['recurring_flow_id'];
            isOneToOne: false;
            referencedRelation: 'recurring_flows';
            referencedColumns: ['id'];
          },
        ];
      };
      policies: {
        Row: {
          asset_id: string | null;
          covered_individuals: string[] | null;
          created_at: string;
          document_url: string | null;
          id: string;
          name: string;
          policy_number: string | null;
          premium_amount: number;
          premium_frequency: Database['public']['Enums']['policy_frequency'];
          provider: string;
          renewal_date: string | null;
          subtype: string | null;
          type: Database['public']['Enums']['policy_type'];
        };
        Insert: {
          asset_id?: string | null;
          covered_individuals?: string[] | null;
          created_at?: string;
          document_url?: string | null;
          id?: string;
          name: string;
          policy_number?: string | null;
          premium_amount: number;
          premium_frequency?: Database['public']['Enums']['policy_frequency'];
          provider: string;
          renewal_date?: string | null;
          subtype?: string | null;
          type: Database['public']['Enums']['policy_type'];
        };
        Update: {
          asset_id?: string | null;
          covered_individuals?: string[] | null;
          created_at?: string;
          document_url?: string | null;
          id?: string;
          name?: string;
          policy_number?: string | null;
          premium_amount?: number;
          premium_frequency?: Database['public']['Enums']['policy_frequency'];
          provider?: string;
          renewal_date?: string | null;
          subtype?: string | null;
          type?: Database['public']['Enums']['policy_type'];
        };
        Relationships: [
          {
            foreignKeyName: 'policies_asset_id_fkey';
            columns: ['asset_id'];
            isOneToOne: false;
            referencedRelation: 'assets';
            referencedColumns: ['id'];
          },
        ];
      };
      portfolio_holdings: {
        Row: {
          asset_class: string;
          created_at: string | null;
          currency: string;
          id: string;
          investment_account_id: string;
          is_active: boolean;
          name: string | null;
          notes: string | null;
          ticker: string;
          updated_at: string | null;
        };
        Insert: {
          asset_class?: string;
          created_at?: string | null;
          currency?: string;
          id?: string;
          investment_account_id: string;
          is_active?: boolean;
          name?: string | null;
          notes?: string | null;
          ticker: string;
          updated_at?: string | null;
        };
        Update: {
          asset_class?: string;
          created_at?: string | null;
          currency?: string;
          id?: string;
          investment_account_id?: string;
          is_active?: boolean;
          name?: string | null;
          notes?: string | null;
          ticker?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'portfolio_holdings_investment_account_id_fkey';
            columns: ['investment_account_id'];
            isOneToOne: false;
            referencedRelation: 'investment_accounts';
            referencedColumns: ['id'];
          },
        ];
      };
      portfolio_lots: {
        Row: {
          created_at: string | null;
          fees: number | null;
          holding_id: string;
          id: string;
          lot_type: Database['public']['Enums']['portfolio_lot_type'];
          notes: string | null;
          price_per_unit: number;
          purchase_date: string;
          quantity: number;
          related_lot_id: string | null;
          total_cost: number | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          fees?: number | null;
          holding_id: string;
          id?: string;
          lot_type?: Database['public']['Enums']['portfolio_lot_type'];
          notes?: string | null;
          price_per_unit: number;
          purchase_date: string;
          quantity: number;
          related_lot_id?: string | null;
          total_cost?: number | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          fees?: number | null;
          holding_id?: string;
          id?: string;
          lot_type?: Database['public']['Enums']['portfolio_lot_type'];
          notes?: string | null;
          price_per_unit?: number;
          purchase_date?: string;
          quantity?: number;
          related_lot_id?: string | null;
          total_cost?: number | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'portfolio_lots_holding_id_fkey';
            columns: ['holding_id'];
            isOneToOne: false;
            referencedRelation: 'portfolio_holdings';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'portfolio_lots_related_lot_id_fkey';
            columns: ['related_lot_id'];
            isOneToOne: false;
            referencedRelation: 'portfolio_lots';
            referencedColumns: ['id'];
          },
        ];
      };
      portfolio_snapshots: {
        Row: {
          created_at: string | null;
          id: string;
          investment_account_id: string;
          snapshot_date: string;
          total_cost_basis_ils: number | null;
          total_value_ils: number;
          unrealized_gain_ils: number | null;
          usd_ils_rate: number | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          investment_account_id: string;
          snapshot_date: string;
          total_cost_basis_ils?: number | null;
          total_value_ils: number;
          unrealized_gain_ils?: number | null;
          usd_ils_rate?: number | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          investment_account_id?: string;
          snapshot_date?: string;
          total_cost_basis_ils?: number | null;
          total_value_ils?: number;
          unrealized_gain_ils?: number | null;
          usd_ils_rate?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'portfolio_snapshots_investment_account_id_fkey';
            columns: ['investment_account_id'];
            isOneToOne: false;
            referencedRelation: 'investment_accounts';
            referencedColumns: ['id'];
          },
        ];
      };
      recurring_flows: {
        Row: {
          account_id: string | null;
          amount: number;
          asset_id: string | null;
          category_id: string | null;
          created_at: string | null;
          end_date: string | null;
          frequency: Database['public']['Enums']['flow_frequency'];
          id: string;
          is_active: boolean | null;
          name: string;
          policy_id: string | null;
          start_date: string | null;
          type: Database['public']['Enums']['flow_type'];
          updated_at: string | null;
        };
        Insert: {
          account_id?: string | null;
          amount: number;
          asset_id?: string | null;
          category_id?: string | null;
          created_at?: string | null;
          end_date?: string | null;
          frequency: Database['public']['Enums']['flow_frequency'];
          id?: string;
          is_active?: boolean | null;
          name: string;
          policy_id?: string | null;
          start_date?: string | null;
          type: Database['public']['Enums']['flow_type'];
          updated_at?: string | null;
        };
        Update: {
          account_id?: string | null;
          amount?: number;
          asset_id?: string | null;
          category_id?: string | null;
          created_at?: string | null;
          end_date?: string | null;
          frequency?: Database['public']['Enums']['flow_frequency'];
          id?: string;
          is_active?: boolean | null;
          name?: string;
          policy_id?: string | null;
          start_date?: string | null;
          type?: Database['public']['Enums']['flow_type'];
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'recurring_flows_account_id_fkey';
            columns: ['account_id'];
            isOneToOne: false;
            referencedRelation: 'accounts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'recurring_flows_asset_id_fkey';
            columns: ['asset_id'];
            isOneToOne: false;
            referencedRelation: 'assets';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'recurring_flows_category_id_fkey';
            columns: ['category_id'];
            isOneToOne: false;
            referencedRelation: 'categories';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'recurring_flows_policy_id_fkey';
            columns: ['policy_id'];
            isOneToOne: false;
            referencedRelation: 'policies';
            referencedColumns: ['id'];
          },
        ];
      };
      reminders: {
        Row: {
          asset_id: string | null;
          created_at: string | null;
          due_date: string;
          frequency: Database['public']['Enums']['flow_frequency'] | null;
          id: string;
          is_completed: boolean | null;
          is_recurring: boolean;
          recurring_flow_id: string | null;
          start_date: string | null;
          target_account_id: string | null;
          title: string;
          type: Database['public']['Enums']['reminder_type'];
          updated_at: string | null;
        };
        Insert: {
          asset_id?: string | null;
          created_at?: string | null;
          due_date: string;
          frequency?: Database['public']['Enums']['flow_frequency'] | null;
          id?: string;
          is_completed?: boolean | null;
          is_recurring?: boolean;
          recurring_flow_id?: string | null;
          start_date?: string | null;
          target_account_id?: string | null;
          title: string;
          type: Database['public']['Enums']['reminder_type'];
          updated_at?: string | null;
        };
        Update: {
          asset_id?: string | null;
          created_at?: string | null;
          due_date?: string;
          frequency?: Database['public']['Enums']['flow_frequency'] | null;
          id?: string;
          is_completed?: boolean | null;
          is_recurring?: boolean;
          recurring_flow_id?: string | null;
          start_date?: string | null;
          target_account_id?: string | null;
          title?: string;
          type?: Database['public']['Enums']['reminder_type'];
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'reminders_asset_id_fkey';
            columns: ['asset_id'];
            isOneToOne: false;
            referencedRelation: 'assets';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'reminders_recurring_flow_id_fkey';
            columns: ['recurring_flow_id'];
            isOneToOne: false;
            referencedRelation: 'recurring_flows';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'reminders_target_account_id_fkey';
            columns: ['target_account_id'];
            isOneToOne: false;
            referencedRelation: 'accounts';
            referencedColumns: ['id'];
          },
        ];
      };
      rsu_grants: {
        Row: {
          cliff_months: number | null;
          cliff_vest_percentage: number | null;
          cliff_vest_shares: number | null;
          created_at: string | null;
          employer: string | null;
          grant_date: string;
          grant_price_usd: number | null;
          id: string;
          investment_account_id: string;
          is_active: boolean;
          notes: string | null;
          shares_per_vest: number | null;
          tax_track: string;
          ticker: string;
          total_shares: number;
          updated_at: string | null;
          vest_frequency_months: number | null;
          vest_percentage: number | null;
        };
        Insert: {
          cliff_months?: number | null;
          cliff_vest_percentage?: number | null;
          cliff_vest_shares?: number | null;
          created_at?: string | null;
          employer?: string | null;
          grant_date: string;
          grant_price_usd?: number | null;
          id?: string;
          investment_account_id: string;
          is_active?: boolean;
          notes?: string | null;
          shares_per_vest?: number | null;
          tax_track?: string;
          ticker: string;
          total_shares: number;
          updated_at?: string | null;
          vest_frequency_months?: number | null;
          vest_percentage?: number | null;
        };
        Update: {
          cliff_months?: number | null;
          cliff_vest_percentage?: number | null;
          cliff_vest_shares?: number | null;
          created_at?: string | null;
          employer?: string | null;
          grant_date?: string;
          grant_price_usd?: number | null;
          id?: string;
          investment_account_id?: string;
          is_active?: boolean;
          notes?: string | null;
          shares_per_vest?: number | null;
          tax_track?: string;
          ticker?: string;
          total_shares?: number;
          updated_at?: string | null;
          vest_frequency_months?: number | null;
          vest_percentage?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'rsu_grants_investment_account_id_fkey';
            columns: ['investment_account_id'];
            isOneToOne: false;
            referencedRelation: 'investment_accounts';
            referencedColumns: ['id'];
          },
        ];
      };
      rsu_vests: {
        Row: {
          created_at: string | null;
          grant_id: string;
          id: string;
          linked_lot_id: string | null;
          notes: string | null;
          shares_vested: number;
          updated_at: string | null;
          vest_date: string;
        };
        Insert: {
          created_at?: string | null;
          grant_id: string;
          id?: string;
          linked_lot_id?: string | null;
          notes?: string | null;
          shares_vested: number;
          updated_at?: string | null;
          vest_date: string;
        };
        Update: {
          created_at?: string | null;
          grant_id?: string;
          id?: string;
          linked_lot_id?: string | null;
          notes?: string | null;
          shares_vested?: number;
          updated_at?: string | null;
          vest_date?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'rsu_vests_grant_id_fkey';
            columns: ['grant_id'];
            isOneToOne: false;
            referencedRelation: 'rsu_grants';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'rsu_vests_linked_lot_id_fkey';
            columns: ['linked_lot_id'];
            isOneToOne: false;
            referencedRelation: 'portfolio_lots';
            referencedColumns: ['id'];
          },
        ];
      };
      transactions: {
        Row: {
          account_id: string | null;
          amount: number;
          asset_id: string | null;
          category_id: string | null;
          created_at: string | null;
          date: string;
          description: string | null;
          id: string;
          installment_number: number | null;
          is_duplicate: boolean | null;
          merchant: string | null;
          original_amount: number | null;
          recurring_flow_id: string | null;
          total_installments: number | null;
          trip_id: string | null;
          updated_at: string | null;
        };
        Insert: {
          account_id?: string | null;
          amount: number;
          asset_id?: string | null;
          category_id?: string | null;
          created_at?: string | null;
          date: string;
          description?: string | null;
          id?: string;
          installment_number?: number | null;
          is_duplicate?: boolean | null;
          merchant?: string | null;
          original_amount?: number | null;
          recurring_flow_id?: string | null;
          total_installments?: number | null;
          trip_id?: string | null;
          updated_at?: string | null;
        };
        Update: {
          account_id?: string | null;
          amount?: number;
          asset_id?: string | null;
          category_id?: string | null;
          created_at?: string | null;
          date?: string;
          description?: string | null;
          id?: string;
          installment_number?: number | null;
          is_duplicate?: boolean | null;
          merchant?: string | null;
          original_amount?: number | null;
          recurring_flow_id?: string | null;
          total_installments?: number | null;
          trip_id?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'transactions_account_id_fkey';
            columns: ['account_id'];
            isOneToOne: false;
            referencedRelation: 'accounts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'transactions_asset_id_fkey';
            columns: ['asset_id'];
            isOneToOne: false;
            referencedRelation: 'assets';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'transactions_category_id_fkey';
            columns: ['category_id'];
            isOneToOne: false;
            referencedRelation: 'categories';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'transactions_trip_id_fkey';
            columns: ['trip_id'];
            isOneToOne: false;
            referencedRelation: 'trips';
            referencedColumns: ['id'];
          },
        ];
      };
      trips: {
        Row: {
          budget: number | null;
          created_at: string | null;
          end_date: string | null;
          id: string;
          name: string;
          start_date: string | null;
          updated_at: string | null;
        };
        Insert: {
          budget?: number | null;
          created_at?: string | null;
          end_date?: string | null;
          id?: string;
          name: string;
          start_date?: string | null;
          updated_at?: string | null;
        };
        Update: {
          budget?: number | null;
          created_at?: string | null;
          end_date?: string | null;
          id?: string;
          name?: string;
          start_date?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      account_type: 'bank' | 'credit_card';
      asset_status: 'active' | 'sold' | 'archived';
      category_domain:
        | 'general'
        | 'housing'
        | 'transportation'
        | 'insurances'
        | 'utilities'
        | 'supermarket'
        | 'hobbies'
        | 'entertainment'
        | 'vacation';
      category_type: 'income' | 'expense' | 'investment';
      flow_frequency: 'monthly' | 'yearly' | 'weekly';
      flow_type: 'income' | 'expense';
      goal_category: 'emergency_fund' | 'down_payment' | 'vacation' | 'education' | 'other';
      household_item_category: 'appliance' | 'furniture' | 'electronics' | 'other';
      investment_account_type: 'brokerage' | 'histalmut' | 'rsu' | 'gemel' | 'pension';
      policy_frequency: 'monthly' | 'yearly';
      policy_type: 'health' | 'life' | 'property' | 'vehicle';
      portfolio_lot_type: 'buy' | 'sell' | 'rsu_vest' | 'dividend_reinvest';
      reminder_type: 'maintenance' | 'car_test' | 'insurance' | 'payment_method_change';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      account_type: ['bank', 'credit_card'],
      asset_status: ['active', 'sold', 'archived'],
      category_domain: [
        'general',
        'housing',
        'transportation',
        'insurances',
        'utilities',
        'supermarket',
        'hobbies',
        'entertainment',
        'vacation',
      ],
      category_type: ['income', 'expense', 'investment'],
      flow_frequency: ['monthly', 'yearly', 'weekly'],
      flow_type: ['income', 'expense'],
      goal_category: ['emergency_fund', 'down_payment', 'vacation', 'education', 'other'],
      household_item_category: ['appliance', 'furniture', 'electronics', 'other'],
      investment_account_type: ['brokerage', 'histalmut', 'rsu', 'gemel', 'pension'],
      policy_frequency: ['monthly', 'yearly'],
      policy_type: ['health', 'life', 'property', 'vehicle'],
      portfolio_lot_type: ['buy', 'sell', 'rsu_vest', 'dividend_reinvest'],
      reminder_type: ['maintenance', 'car_test', 'insurance', 'payment_method_change'],
    },
  },
} as const;
