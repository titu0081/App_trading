import { Alert } from '@/features/alerts/domain/entities/Alert';

export interface AlertDto {
  id: string;
  user_id: string;
  asset_id: string;
  type: Alert['type'];
  condition: Alert['condition'];
  target_value: number | null;
  is_active: boolean;
}

export function mapAlertDto(value: AlertDto): Alert {
  return {
    id: value.id,
    assetId: value.asset_id,
    type: value.type,
    condition: value.condition,
    targetValue: value.target_value,
    isActive: value.is_active,
  };
}
