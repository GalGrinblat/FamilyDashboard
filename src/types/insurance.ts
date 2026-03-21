import { Database } from './database.types';

export type PolicyRow = Database['public']['Tables']['policies']['Row'];
export type VehicleRow = Database['public']['Tables']['vehicles']['Row'];
export type PropertyRow = Database['public']['Tables']['properties']['Row'];

export type PolicyWithLinked = PolicyRow & {
  vehicles: Pick<VehicleRow, 'id' | 'name' | 'license_plate'> | null;
  properties: Pick<PropertyRow, 'id' | 'name' | 'address'> | null;
};
