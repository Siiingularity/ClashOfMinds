/**
 * RabbitMQ STOMP over WebSocket
 * Connects to RabbitMQ's STOMP WebSocket plugin (port 15674)
 * Used for real-time game events: score updates, turn changes, powerup activations
 */

import { storage } from '../utils/storage';

const RABBITMQ_WS_URL = 'wss://rabbitmq.clashofminds.net/ws'; // RabbitMQ STOMP WS endpoint
const RECONNECT_DELAY = 3000;
const HEARTBEAT_INTERVAL = 10000;

export type GameEvent =
  | { type: 'SCORE_UPDATE'; gameId: number; team1Score: number; team2Score: number }
  | { type: 'TURN_CHANGE'; gameId: number; currentTurn: 1 | 2 }
  | { type: 'QUESTION_ANSWERED'; gameId: number; questionId: string; correct: boolean; team: 1 | 2 }
  | { type: 'POWERUP_ACTIVATED'; gameId: number; powerupId: string; team: 1 | 2 }
  | { type: 'GAME_ENDED'; gameId: number; winner: string }
  | { type: 'PLAYER_JOINED'; gameId: number; userId: number; username: string };

type EventListener = (event: GameEvent) => void;
type ConnectionListener = (connected: boolean) => void;

class GameSocketService {
  private ws: WebSocket | null = null;
  private gameId: number | null = null;
  private listeners: EventListener[] = [];
  private connectionListeners: ConnectionListener[] = [];
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private sessionToken: string | null = null;
  private isConnecting = false;
  private frameBuffer = '';

  // ─── STOMP Frame Builder ──────────────────────────────────────────
  private buildStompFrame(command: string, headers: Record<string, string>, body = ''): string {
    let frame = `${command}\n`;
    for (const [k, v] of Object.entries(headers)) {
      frame += `${k}:${v}\n`;
    }
    frame += `\n${body}\0`;
    return frame;
  }

  // ─── Connect to RabbitMQ ─────────────────────────────────────────
  async connect(gameId: number): Promise<void> {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) return;

    this.gameId = gameId;
    this.sessionToken = await storage.getItem('token');
    this.isConnecting = true;

    try {
      this.ws = new WebSocket(RABBITMQ_WS_URL, ['v10.stomp', 'v11.stomp', 'v12.stomp']);

      this.ws.onopen = () => {
        // Send STOMP CONNECT frame
        const connectFrame = this.buildStompFrame('CONNECT', {
          'accept-version': '1.2',
          'host': 'clash-of-minds',
          'login': 'guest',
          'passcode': 'guest',
          'heart-beat': `${HEARTBEAT_INTERVAL},${HEARTBEAT_INTERVAL}`,
        });
        this.ws!.send(connectFrame);
      };

      this.ws.onmessage = (event) => {
        this.handleStompFrame(event.data as string);
      };

      this.ws.onclose = () => {
        this.isConnecting = false;
        this.notifyConnection(false);
        this.stopHeartbeat();
        this.scheduleReconnect();
      };

      this.ws.onerror = () => {
        this.isConnecting = false;
        this.ws?.close();
      };
    } catch {
      this.isConnecting = false;
    }
  }

  // ─── Parse STOMP Frame ────────────────────────────────────────────
  private handleStompFrame(raw: string): void {
    this.frameBuffer += raw;
    const frames = this.frameBuffer.split('\0');
    this.frameBuffer = frames.pop() || '';

    for (const frame of frames) {
      if (!frame.trim()) continue;
      const lines = frame.split('\n');
      const command = lines[0].trim();

      if (command === 'CONNECTED') {
        this.isConnecting = false;
        this.notifyConnection(true);
        this.startHeartbeat();
        this.subscribe();
      } else if (command === 'MESSAGE') {
        // Find body (after empty line)
        const bodyStart = frame.indexOf('\n\n');
        if (bodyStart !== -1) {
          const body = frame.substring(bodyStart + 2);
          this.parseGameEvent(body);
        }
      } else if (command === 'ERROR') {
        console.warn('[GameSocket] STOMP ERROR frame received');
      }
    }
  }

  // ─── Subscribe to game channel ────────────────────────────────────
  private subscribe(): void {
    if (!this.ws || !this.gameId) return;

    const subscribeFrame = this.buildStompFrame('SUBSCRIBE', {
      id: `sub-game-${this.gameId}`,
      destination: `/topic/game.${this.gameId}`,
      ack: 'auto',
    });
    this.ws.send(subscribeFrame);

    // Also subscribe to broadcast channel
    const broadcastFrame = this.buildStompFrame('SUBSCRIBE', {
      id: 'sub-broadcast',
      destination: '/topic/broadcast',
      ack: 'auto',
    });
    this.ws.send(broadcastFrame);
  }

  // ─── Publish event ────────────────────────────────────────────────
  publish(event: GameEvent): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN || !this.gameId) return;

    const sendFrame = this.buildStompFrame(
      'SEND',
      {
        destination: `/topic/game.${this.gameId}`,
        'content-type': 'application/json',
        'Authorization': `Bearer ${this.sessionToken ?? ''}`,
      },
      JSON.stringify(event)
    );
    this.ws.send(sendFrame);
  }

  // ─── Parse incoming event ─────────────────────────────────────────
  private parseGameEvent(body: string): void {
    try {
      const event = JSON.parse(body) as GameEvent;
      this.listeners.forEach((l) => l(event));
    } catch {
      // Not a JSON event - ignore
    }
  }

  // ─── Heartbeat ───────────────────────────────────────────────────
  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send('\n'); // STOMP heartbeat
      }
    }, HEARTBEAT_INTERVAL);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  // ─── Reconnect logic ─────────────────────────────────────────────
  private scheduleReconnect(): void {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      if (this.gameId) this.connect(this.gameId);
    }, RECONNECT_DELAY);
  }

  // ─── Disconnect ──────────────────────────────────────────────────
  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.stopHeartbeat();

    if (this.ws) {
      if (this.ws.readyState === WebSocket.OPEN) {
        const disconnectFrame = this.buildStompFrame('DISCONNECT', { receipt: 'disconnect-receipt' });
        this.ws.send(disconnectFrame);
      }
      this.ws.close();
      this.ws = null;
    }

    this.gameId = null;
    this.isConnecting = false;
  }

  // ─── Event listeners ─────────────────────────────────────────────
  onEvent(listener: EventListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  onConnection(listener: ConnectionListener): () => void {
    this.connectionListeners.push(listener);
    return () => {
      this.connectionListeners = this.connectionListeners.filter((l) => l !== listener);
    };
  }

  private notifyConnection(connected: boolean): void {
    this.connectionListeners.forEach((l) => l(connected));
  }

  get isConnected(): boolean {
    return !!(this.ws && this.ws.readyState === WebSocket.OPEN);
  }
}

// Singleton instance
export const gameSocket = new GameSocketService();
