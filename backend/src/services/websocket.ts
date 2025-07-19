import { Server, WebSocket, WebSocketServer } from 'ws';
import { IncomingMessage } from 'http';
import { NotificationService } from './notification';
import jwt from 'jsonwebtoken';
import { JwtPayload } from './auth';

export class WebSocketService {
  private static instance: WebSocketService;
  private wss: WebSocketServer;
  private clients = new Map<string, WebSocket>();

  private constructor(server: any) {
    this.wss = new WebSocketServer({ noServer: true });
    this.setupEventHandlers();
  }

  public static init(server: any): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService(server);
    }
    return WebSocketService.instance;
  }

  private setupEventHandlers(): void {
    this.wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
      const userId = this.extractUserId(req);
      if (userId) {
        this.clients.set(userId, ws);
        console.log(`✅ Cliente conectado: ${userId}`);

        ws.on('close', () => {
          this.clients.delete(userId);
          console.log(`❌ Cliente desconectado: ${userId}`);
        });
      }
    });
  }

  public handleUpgrade(request: IncomingMessage, socket: any, head: Buffer): void {
    this.wss.handleUpgrade(request, socket, head, (ws: WebSocket) => {
      this.wss.emit('connection', ws, request);
    });
  }

  public broadcastNotification(userId: string, notification: any): void {
    const client = this.clients.get(userId);
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: 'notification',
        data: notification
      }));
    }
  }

  private extractUserId(req: IncomingMessage): string | null {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return null;
    }
    const [scheme, token] = authHeader.split(' ');
    if (scheme !== 'Bearer' || !token) {
      return null;
    }
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
      return payload.userId;
    } catch (err) {
      return null;
    }
  }

  public static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      throw new Error('WebSocketService no inicializado');
    }
    return WebSocketService.instance;
  }
}
