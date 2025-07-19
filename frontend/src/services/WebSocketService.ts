import { getAuthToken } from '../utils/auth';

export interface WebSocketMessage {
  type: string;
  data: any;
}

export interface NotificationMessage {
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

type MessageHandler = (message: WebSocketMessage) => void;

class WebSocketService {
  private static instance: WebSocketService | null = null;
  private socket: WebSocket | null = null;
  private reconnectInterval: number = 5000; // ms
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private handlers: MessageHandler[] = [];
  private url: string;
  private isConnecting: boolean = false;

  private constructor() {
    const baseWsUrl = import.meta.env.VITE_API_WS_URL || 'ws://localhost:3001';
    this.url = baseWsUrl;
  }

  public static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
        resolve();
        return;
      }

      if (this.isConnecting) {
        resolve();
        return;
      }

      this.isConnecting = true;

      try {
        const token = getAuthToken();
        
        if (!token) {
          reject(new Error('No authentication token available'));
          this.isConnecting = false;
          return;
        }

        this.socket = new WebSocket(this.url);

        this.socket.onopen = (event) => {
          console.log('✅ WebSocket connection established');
          
          // Send authentication immediately after connection
          if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({
              type: 'authenticate',
              token
            }));
          }
          
          this.reconnectAttempts = 0;
          this.isConnecting = false;
          resolve();
        };

        this.socket.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.notifyHandlers(message);
          } catch (error) {
            console.error('❌ Error parsing WebSocket message:', error);
          }
        };

        this.socket.onerror = (event) => {
          console.error('❌ WebSocket error:', event);
          this.isConnecting = false;
          reject(new Error('WebSocket connection error'));
        };

        this.socket.onclose = (event) => {
          console.log('❌ WebSocket connection closed:', event.code, event.reason);
          this.isConnecting = false;
          
          // Auto-reconnect if not a normal closure
          if (event.code !== 1000) {
            this.attemptReconnect();
          }
        };
      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('❌ Maximum reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    console.log(`🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
    
    setTimeout(() => {
      this.connect().catch(error => {
        console.error('❌ Reconnection attempt failed:', error);
      });
    }, this.reconnectInterval);
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  public addMessageHandler(handler: MessageHandler): void {
    this.handlers.push(handler);
  }

  public removeMessageHandler(handler: MessageHandler): void {
    this.handlers = this.handlers.filter(h => h !== handler);
  }

  private notifyHandlers(message: WebSocketMessage): void {
    this.handlers.forEach(handler => {
      try {
        handler(message);
      } catch (error) {
        console.error('❌ Error in WebSocket message handler:', error);
      }
    });
  }

  public isConnected(): boolean {
    return !!this.socket && this.socket.readyState === WebSocket.OPEN;
  }
}

export default WebSocketService;
