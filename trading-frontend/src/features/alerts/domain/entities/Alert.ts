export type AlertType =
  'price_target' | 'percent_variation' | 'indicator' | 'dividend';
export type AlertCondition = 'above' | 'below' | 'crosses_up' | 'crosses_down';

export interface Alert {
  id: string;
  assetId: string;
  type: AlertType;
  condition: AlertCondition | null;
  targetValue: number | null;
  isActive: boolean;
}

export interface CreateAlertInput {
  assetId: string;
  type: AlertType;
  condition: AlertCondition | null;
  targetValue: number | null;
}

export interface UpdateAlertInput {
  condition?: AlertCondition | null;
  targetValue?: number | null;
  isActive?: boolean;
}
