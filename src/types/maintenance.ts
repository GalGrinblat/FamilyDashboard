export interface MaintenanceLogEntry {
    id: string;
    date: string;
    type: 'garage' | 'test' | 'insurance' | 'repair' | 'other';
    description: string;
    cost: number;
    mileage: number | null;
}

export interface AssetMetadata {
    maintenance_log?: MaintenanceLogEntry[];
    last_service_km?: number | null;
    [key: string]: unknown;
}
