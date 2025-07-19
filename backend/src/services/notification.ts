import { WebSocketService } from './websocket';

export class NotificationService {
  private static instance: NotificationService;

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  public sendNotification(userId: string, notification: any): void {
    const wsService = WebSocketService.getInstance();
    wsService.broadcastNotification(userId, notification);
  }
}
