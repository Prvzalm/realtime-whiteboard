"use client";

import type { RealtimeMessage } from "@/lib/types/board";

const RECONNECT_INTERVAL = 2_000;

interface ChannelOptions {
  role?: "editor" | "spectator";
  clientId?: string;
}

export class RealtimeChannel {
  private socket: WebSocket | null = null;
  private readonly boardId: string;
  private readonly listeners = new Set<(payload: RealtimeMessage) => void>();
  private reconnectTimeout?: NodeJS.Timeout;
  private readonly role: "editor" | "spectator";
  private readonly clientId?: string;
  private isReady = false;
  private readonly pending: RealtimeMessage[] = [];

  constructor(boardId: string, options?: ChannelOptions) {
    this.boardId = boardId;
    this.role = options?.role ?? "editor";
    this.clientId = options?.clientId;
    if (typeof window !== "undefined") {
      this.connect();
    }
  }

  private createUrl() {
    if (typeof window === "undefined") {
      return process.env.NEXT_PUBLIC_SOCKET_FALLBACK_URL ?? "";
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ??
      window.location.origin ??
      "http://localhost:3000";

    const protocol = baseUrl.startsWith("https") ? "wss" : "ws";
    const url = new URL(baseUrl);
    url.protocol = protocol;
    url.pathname = "/api/realtime";
    url.searchParams.set("boardId", this.boardId);
    url.searchParams.set("role", this.role);
    if (this.clientId) {
      url.searchParams.set("clientId", this.clientId);
    }
    return url.toString();
  }

  private connect() {
    const url = this.createUrl();
    if (!url) {
      console.warn("[realtime] Missing websocket url");
      return;
    }

    this.socket = new WebSocket(url);

    this.socket.addEventListener("open", () => {
      this.isReady = true;
      this.flushQueue();
    });

    this.socket.addEventListener("message", (event) => {
      try {
        const payload = JSON.parse(event.data) as RealtimeMessage;
        this.listeners.forEach((listener) => listener(payload));
      } catch (error) {
        console.error("[realtime] Failed to parse message", error);
      }
    });

    this.socket.addEventListener("close", () => {
      this.isReady = false;
      this.scheduleReconnect();
    });

    this.socket.addEventListener("error", () => {
      this.isReady = false;
      this.scheduleReconnect();
    });
  }

  private flushQueue() {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      return;
    }
    while (this.pending.length) {
      const message = this.pending.shift();
      if (!message) {
        continue;
      }
      try {
        this.socket.send(JSON.stringify(message));
      } catch (error) {
        console.warn("[realtime] Failed to deliver buffered message", error);
        break;
      }
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimeout) {
      return;
    }

    this.reconnectTimeout = setTimeout(() => {
      this.reconnectTimeout = undefined;
      this.connect();
    }, RECONNECT_INTERVAL);
  }

  send(message: RealtimeMessage) {
    if (
      this.socket &&
      this.socket.readyState === WebSocket.OPEN &&
      this.isReady
    ) {
      this.socket.send(JSON.stringify(message));
      return;
    }

    if (this.pending.length > 100) {
      this.pending.shift();
    }
    this.pending.push(message);
  }

  subscribe(listener: (payload: RealtimeMessage) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  dispose() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = undefined;
    }
    this.socket?.close();
    this.listeners.clear();
  }
}

export function createRealtimeChannel(
  boardId: string,
  options?: ChannelOptions
) {
  return new RealtimeChannel(boardId, options);
}
