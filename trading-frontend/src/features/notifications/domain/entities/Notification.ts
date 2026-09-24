export interface Notification {
  id: string;
  alertId: string | null;
  message: string;
  isRead: boolean;
  createdAt: string;
}
