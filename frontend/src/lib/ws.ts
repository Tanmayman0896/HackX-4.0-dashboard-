"use client";

import { authService } from "./auth";

function getWsUrl(): string {
  let baseUrl = process.env.NEXT_PUBLIC_WS_URL;
  if (!baseUrl && typeof window !== "undefined") {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.hostname || "localhost";
    baseUrl = `${protocol}//${host}:9000`;
  }
  baseUrl = baseUrl || "ws://localhost:9000";
  return baseUrl.endsWith("/ws") ? baseUrl : `${baseUrl.replace(/\/$/, "")}/ws`;
}

class WebsocketService {
  ws: WebSocket | null = null;
  private connectingPromise: Promise<WebSocket> | null = null;
  private isExplicitDisconnect = false;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;

  async connect(): Promise<WebSocket> {
    this.isExplicitDisconnect = false;

    // Return existing socket if open
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return this.ws;
    }

    // Return existing promise if already connecting
    if (
      this.connectingPromise &&
      this.ws &&
      this.ws.readyState === WebSocket.CONNECTING
    ) {
      return this.connectingPromise;
    }

    const token = authService.getToken();
    if (!token) {
      return Promise.reject(new Error("Unauthorized: No auth token found"));
    }

    if (typeof window === "undefined") {
      return Promise.reject(
        new Error("WebSocket cannot be initialized on server side"),
      );
    }

    const wsUrl = getWsUrl();

    this.connectingPromise = new Promise<WebSocket>((resolve, reject) => {
      try {
        const socket = new WebSocket(wsUrl);
        this.ws = socket;

        socket.onopen = () => {
          if (this.isExplicitDisconnect) {
            socket.close();
            return;
          }
          console.log("WebSocket connected");
          this.connectingPromise = null;
          resolve(socket);
        };

        socket.onerror = () => {
          // If intentionally disconnected during connection (e.g. React StrictMode), suppress error
          if (this.isExplicitDisconnect) {
            return;
          }
          console.warn("WebSocket connection error:", wsUrl);
          this.connectingPromise = null;
          // Reject with a standard Error object instead of raw browser Event to prevent runtime error overlays
          reject(
            new Error(`Failed to connect to WebSocket server at ${wsUrl}`),
          );
        };

        socket.onclose = (event) => {
          console.log("WebSocket closed:", event.code, event.reason);
          this.connectingPromise = null;

          // Only attempt auto-reconnect if not an intentional disconnect
          if (!this.isExplicitDisconnect && authService.getToken()) {
            if (this.reconnectTimeout) {
              clearTimeout(this.reconnectTimeout);
            }
            this.reconnectTimeout = setTimeout(() => {
              if (!this.isExplicitDisconnect) {
                this.connect().catch((err) => {
                  console.warn(
                    "WebSocket auto-reconnect failed:",
                    err?.message,
                  );
                });
              }
            }, 3000);
          }
        };
      } catch (err: unknown) {
        this.connectingPromise = null;
        const msg =
          err instanceof Error ? err.message : "Failed to initialize WebSocket";
        reject(new Error(msg));
      }
    });

    return this.connectingPromise;
  }

  disconnect() {
    this.isExplicitDisconnect = true;

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    this.connectingPromise = null;

    if (this.ws) {
      // Remove listeners before closing so intentional disconnects don't trigger onerror or onclose
      this.ws.onopen = null;
      this.ws.onerror = null;
      this.ws.onclose = null;
      this.ws.onmessage = null;

      try {
        this.ws.close();
      } catch {
        // Ignore close errors
      }
      this.ws = null;
    }
  }

  async reconnect() {
    this.disconnect();
    return this.connect();
  }
}

export const wsService = new WebsocketService();
