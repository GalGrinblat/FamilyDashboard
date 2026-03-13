export interface RealEstateMetadata {
  address?: string;
  monthly_rent?: string | number;
}

export type AssetMetadata = (RealEstateMetadata & Record<string, unknown>) | null;
