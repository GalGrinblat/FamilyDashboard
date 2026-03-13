import { Database } from './database.types';

export type PolicyRow = Database['public']['Tables']['policies']['Row'];
export type AssetRow = Database['public']['Tables']['assets']['Row'];

export type PolicyWithAsset = PolicyRow & {
  assets: AssetRow | null;
};
