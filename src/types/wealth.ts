export interface RealEstateMetadata {
  address?: string;
  monthly_rent?: string | number;
  mortgage_payment?: string | number;
}

export interface VehicleMetadata {
  license_plate?: string;
  leasing_payment?: string | number;
}

export type AssetMetadata = (RealEstateMetadata & VehicleMetadata & Record<string, unknown>) | null;
