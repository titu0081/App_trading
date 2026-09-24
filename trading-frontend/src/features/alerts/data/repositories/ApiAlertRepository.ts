import {
  AlertDto,
  mapAlertDto,
} from '@/features/alerts/data/mappers/alertMapper';
import {
  AlertHistoryDto,
  mapAlertHistoryDto,
} from '@/features/alerts/data/mappers/alertHistoryMapper';
import {
  CreateAlertInput,
  UpdateAlertInput,
} from '@/features/alerts/domain/entities/Alert';
import { AlertHistoryFilters } from '@/features/alerts/domain/entities/AlertHistoryEntry';
import { AlertRepository } from '@/features/alerts/domain/repositories/AlertRepository';
import { ApiClient } from '@/infrastructure/api/ApiClient';

export class ApiAlertRepository implements AlertRepository {
  constructor(private readonly client: ApiClient) {}
  async getAll() {
    return (await this.client.get<AlertDto[]>('/alerts')).map(mapAlertDto);
  }
  async getHistory(filters: AlertHistoryFilters = {}) {
    const values = await this.client.get<AlertHistoryDto[]>('/alerts/history', {
      params: {
        asset_id: filters.assetId,
        is_active: filters.isActive,
        date_from: filters.dateFrom,
        date_to: filters.dateTo ? `${filters.dateTo}T23:59:59.999` : undefined,
      },
    });
    return values.map(mapAlertHistoryDto);
  }
  async create(input: CreateAlertInput) {
    const body = {
      asset_id: input.assetId,
      type: input.type,
      condition: input.condition,
      target_value: input.targetValue,
    };
    return mapAlertDto(
      await this.client.post<AlertDto, typeof body>('/alerts', body),
    );
  }
  async update(id: string, input: UpdateAlertInput) {
    const body = {
      condition: input.condition,
      target_value: input.targetValue,
      is_active: input.isActive,
    };
    return mapAlertDto(
      await this.client.patch<AlertDto, typeof body>(`/alerts/${id}`, body),
    );
  }
  delete(id: string) {
    return this.client.delete<void>(`/alerts/${id}`);
  }
}
