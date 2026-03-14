export interface RealEstateMetadata {
  address?: string;
  monthly_rent?: string | number;
  rent_start_date?: string;
  rent_end_date?: string;
  mortgage_payment?: string | number;
  mortgage_start_date?: string;
  mortgage_end_date?: string;
}

export interface VehicleMetadata {
  license_plate?: string;
  leasing_payment?: string | number;
}

export type AssetMetadata = (RealEstateMetadata & VehicleMetadata & Record<string, unknown>) | null;
