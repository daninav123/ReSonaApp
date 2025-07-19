export interface WebSocketMessage<T = unknown> {
  type: string;
  data: T;
}
