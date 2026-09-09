import { describe, it, expect, afterAll } from "vitest";
import WebSocket from "ws";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "hackx3_super_secret_jwt_key_2026";
const WS_URL = process.env.WS_URL || "ws://localhost:9000/ws";

interface WebSocketTestMessage {
  type: string;
  data?: {
    userId?: string;
    role?: string;
    message?: string;
  };
  channel?: string;
  checkpoint?: Record<string, any>;
}

function createToken(payload: { id: string; username: string; role: string }) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });
}

function connectClient(): Promise<WebSocket> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(WS_URL);
    const timer = setTimeout(() => {
      ws.close();
      reject(new Error("Timeout connecting to " + WS_URL));
    }, 4000);

    ws.on("open", () => {
      clearTimeout(timer);
      resolve(ws);
    });

    ws.on("error", (err) => {
      clearTimeout(timer);
      reject(err);
    });
  });
}

function waitForMessage(
  ws: WebSocket,
  predicate?: (msg: WebSocketTestMessage) => boolean,
  timeoutMs = 4000
): Promise<WebSocketTestMessage> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      ws.off("message", onMsg);
      reject(new Error("Timeout waiting for message"));
    }, timeoutMs);

    function onMsg(data: Buffer) {
      try {
        const parsed = JSON.parse(data.toString());
        if (!predicate || predicate(parsed)) {
          clearTimeout(timer);
          ws.off("message", onMsg);
          resolve(parsed);
        }
      } catch {
        // Ignore unparseable
      }
    }

    ws.on("message", onMsg);
  });
}

describe("HackX 4.0 WebSocket Server Integration Tests", () => {
  const activeSockets: WebSocket[] = [];

  const trackSocket = (ws: WebSocket) => {
    activeSockets.push(ws);
    return ws;
  };

  afterAll(() => {
    for (const ws of activeSockets) {
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
    }
  });

  describe("Connection & Authentication Security", () => {
    it("should establish a WebSocket connection to the server", async () => {
      const ws = trackSocket(await connectClient());
      expect(ws.readyState).toBe(WebSocket.OPEN);
      ws.close();
    });

    it("should reject authentication with an invalid JWT token", async () => {
      const ws = trackSocket(await connectClient());
      const msgPromise = waitForMessage(ws, (m) => m.type === "error");

      ws.send(
        JSON.stringify({
          type: "authenticate",
          token: "invalid.expired.jwt",
        })
      );

      const res = await msgPromise;
      expect(res.type).toBe("error");
      expect(res.data?.message).toBe("Authentication failed");
    });

    it("should reject authentication when token is missing", async () => {
      const ws = trackSocket(await connectClient());
      const msgPromise = waitForMessage(ws, (m) => m.type === "error");

      ws.send(JSON.stringify({ type: "authenticate" }));

      const res = await msgPromise;
      expect(res.type).toBe("error");
      expect(res.data?.message).toBe("Authentication token required");
    });

    it("should successfully authenticate an ADMIN user", async () => {
      const ws = trackSocket(await connectClient());
      const token = createToken({
        id: "admin-test-01",
        username: "ops_admin",
        role: "ADMIN",
      });

      const msgPromise = waitForMessage(ws, (m) => m.type === "authenticated");
      ws.send(JSON.stringify({ type: "authenticate", token }));

      const res = await msgPromise;
      expect(res.type).toBe("authenticated");
      expect(res.data?.userId).toBe("admin-test-01");
      expect(res.data?.role).toBe("ADMIN");
    });

    it("should successfully authenticate a TEAM user", async () => {
      const ws = trackSocket(await connectClient());
      const token = createToken({
        id: "team-test-01",
        username: "hx_cyberknights",
        role: "TEAM",
      });

      const msgPromise = waitForMessage(ws, (m) => m.type === "authenticated");
      ws.send(JSON.stringify({ type: "authenticate", token }));

      const res = await msgPromise;
      expect(res.type).toBe("authenticated");
      expect(res.data?.userId).toBe("team-test-01");
      expect(res.data?.role).toBe("TEAM");
    });
  });

  describe("Subscription & Real-Time Broadcast with Data", () => {
    it("should allow ADMIN to subscribe to checkpoints channel", async () => {
      const ws = trackSocket(await connectClient());
      const token = createToken({
        id: "admin-sub-01",
        username: "admin_subscriber",
        role: "ADMIN",
      });

      const authPromise = waitForMessage(ws, (m) => m.type === "authenticated");
      ws.send(JSON.stringify({ type: "authenticate", token }));
      await authPromise;

      const subPromise = waitForMessage(ws, (m) => m.type === "subscribed");
      ws.send(JSON.stringify({ type: "subscribe_checkpoints" }));

      const subRes = await subPromise;
      expect(subRes.type).toBe("subscribed");
      expect(subRes.channel).toBe("checkpoints");
    });

    it("should broadcast Checkpoint 1 updates to all other subscribed admins", async () => {
      // Setup Admin A (Sender)
      const adminA = trackSocket(await connectClient());
      const tokenA = createToken({ id: "admin-sender", username: "admin_a", role: "ADMIN" });
      const authPromiseA = waitForMessage(adminA, (m) => m.type === "authenticated");
      adminA.send(JSON.stringify({ type: "authenticate", token: tokenA }));
      await authPromiseA;

      const subPromiseA = waitForMessage(adminA, (m) => m.type === "subscribed");
      adminA.send(JSON.stringify({ type: "subscribe_checkpoints" }));
      await subPromiseA;

      // Setup Admin B (Receiver)
      const adminB = trackSocket(await connectClient());
      const tokenB = createToken({ id: "admin-receiver", username: "admin_b", role: "SUPER_ADMIN" });
      const authPromiseB = waitForMessage(adminB, (m) => m.type === "authenticated");
      adminB.send(JSON.stringify({ type: "authenticate", token: tokenB }));
      await authPromiseB;

      const subPromiseB = waitForMessage(adminB, (m) => m.type === "subscribed");
      adminB.send(JSON.stringify({ type: "subscribe_checkpoints" }));
      await subPromiseB;

      // Checkpoint 1 payload with realistic HackX data
      const checkpoint1Data = {
        teamId: "HX-101",
        teamName: "CyberKnights",
        checkpointNumber: 1,
        status: "COMPLETED",
        attendance: {
          present: 4,
          total: 4,
          members: ["Aarav Sharma", "Diya Patel", "Rohan Verma", "Sneha Reddy"],
        },
        tableAssigned: "T-04",
        verifiedAt: new Date().toISOString(),
      };

      const receivePromise = waitForMessage(adminB, (m) => m.type === "checkpoint");

      // Admin A sends checkpoint update
      adminA.send(
        JSON.stringify({
          type: "checkpoint",
          checkpoint: checkpoint1Data,
        })
      );

      const received = await receivePromise;
      expect(received.type).toBe("checkpoint");
      expect(received.checkpoint).toBeDefined();
      expect(received.checkpoint?.teamId).toBe("HX-101");
      expect(received.checkpoint?.teamName).toBe("CyberKnights");
      expect(received.checkpoint?.checkpointNumber).toBe(1);
      expect(received.checkpoint?.attendance?.present).toBe(4);
      expect(received.checkpoint?.tableAssigned).toBe("T-04");
    });

    it("should broadcast Checkpoint 2 (credentials & room) data across admins", async () => {
      // Setup Admin B (Sender)
      const adminB = trackSocket(await connectClient());
      const tokenB = createToken({ id: "admin-room-allocator", username: "admin_rooms", role: "ADMIN" });
      const authPromiseB = waitForMessage(adminB, (m) => m.type === "authenticated");
      adminB.send(JSON.stringify({ type: "authenticate", token: tokenB }));
      await authPromiseB;

      const subPromiseB = waitForMessage(adminB, (m) => m.type === "subscribed");
      adminB.send(JSON.stringify({ type: "subscribe_checkpoints" }));
      await subPromiseB;

      // Setup Admin C (Receiver)
      const adminC = trackSocket(await connectClient());
      const tokenC = createToken({ id: "admin-dashboard-view", username: "admin_dash", role: "ADMIN" });
      const authPromiseC = waitForMessage(adminC, (m) => m.type === "authenticated");
      adminC.send(JSON.stringify({ type: "authenticate", token: tokenC }));
      await authPromiseC;

      const subPromiseC = waitForMessage(adminC, (m) => m.type === "subscribed");
      adminC.send(JSON.stringify({ type: "subscribe_checkpoints" }));
      await subPromiseC;

      // Checkpoint 2 data
      const checkpoint2Data = {
        teamId: "HX-102",
        teamName: "QuantumCore",
        checkpointNumber: 2,
        status: "COMPLETED",
        credentials: {
          username: "hx_quantum",
          generated: true,
        },
        round1Room: "AB1-102",
        domain: "Cybersecurity & Web3",
        updatedAt: new Date().toISOString(),
      };

      const receivePromise = waitForMessage(adminC, (m) => m.type === "checkpoint");

      adminB.send(
        JSON.stringify({
          type: "checkpoint",
          checkpoint: checkpoint2Data,
        })
      );

      const received = await receivePromise;
      expect(received.type).toBe("checkpoint");
      expect(received.checkpoint).toBeDefined();
      expect(received.checkpoint?.teamId).toBe("HX-102");
      expect(received.checkpoint?.round1Room).toBe("AB1-102");
      expect(received.checkpoint?.domain).toBe("Cybersecurity & Web3");
    });
  });
});
