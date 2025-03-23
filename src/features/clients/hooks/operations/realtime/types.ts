
export interface RealtimePayload {
  new: Record<string, any> | null;
  old: Record<string, any> | null;
  eventType: string;
  [key: string]: any;
}

export interface RealtimeState {
  isSubscribed: boolean;
  lastEventTime: number;
  reconnectAttempts: number;
  channel: any | null;
}
