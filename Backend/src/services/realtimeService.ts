import { Response } from "express";

type Client = {
  id: string;
  res: Response;
  isAdmin: boolean;
};

class RealtimeService {
  private adminClients: Map<string, Client> = new Map();
  private publicClients: Map<string, Client> = new Map();
  private pingInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Keep connections alive and detect dropped clients with a periodic ping
    this.pingInterval = setInterval(() => {
      this.sendPing();
    }, 20000);

    if (this.pingInterval.unref) {
      this.pingInterval.unref();
    }
  }

  private sendPing() {
    const pingPayload = `: ping\n\n`;
    for (const [id, client] of this.adminClients.entries()) {
      try {
        client.res.write(pingPayload);
      } catch {
        this.adminClients.delete(id);
      }
    }
    for (const [id, client] of this.publicClients.entries()) {
      try {
        client.res.write(pingPayload);
      } catch {
        this.publicClients.delete(id);
      }
    }
  }

  addAdminClient(id: string, res: Response) {
    this.adminClients.set(id, { id, res, isAdmin: true });
    res.write(
      `data: ${JSON.stringify({
        type: "CONNECTED",
        id,
        channel: "admin",
        timestamp: new Date().toISOString(),
      })}\n\n`
    );

    res.on("close", () => {
      this.adminClients.delete(id);
    });
  }

  addPublicClient(id: string, res: Response) {
    this.publicClients.set(id, { id, res, isAdmin: false });
    res.write(
      `data: ${JSON.stringify({
        type: "CONNECTED",
        id,
        channel: "public",
        timestamp: new Date().toISOString(),
      })}\n\n`
    );

    res.on("close", () => {
      this.publicClients.delete(id);
    });
  }

  // Admin-only broadcasts (sensitive student data, internal enquiry alerts)
  broadcastAdmin(event: string, data: any) {
    const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    for (const [id, client] of this.adminClients.entries()) {
      try {
        client.res.write(payload);
      } catch (err) {
        console.error(`Failed to send admin event to client ${id}:`, err);
        this.adminClients.delete(id);
      }
    }
  }

  // Public-only broadcasts
  broadcastPublic(event: string, data: any) {
    const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    for (const [id, client] of this.publicClients.entries()) {
      try {
        client.res.write(payload);
      } catch (err) {
        console.error(`Failed to send public event to client ${id}:`, err);
        this.publicClients.delete(id);
      }
    }
  }

  // Content updates safe for public clients and useful for active admin dashboards
  broadcastContentUpdate(event: string, data: any) {
    const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    for (const [id, client] of this.publicClients.entries()) {
      try {
        client.res.write(payload);
      } catch (err) {
        this.publicClients.delete(id);
      }
    }
    for (const [id, client] of this.adminClients.entries()) {
      try {
        client.res.write(payload);
      } catch (err) {
        this.adminClients.delete(id);
      }
    }
  }

  // Backward compatibility router
  broadcast(event: string, data: any) {
    if (event.includes("enquiry")) {
      this.broadcastAdmin(event, data);
    } else {
      this.broadcastContentUpdate(event, data);
    }
  }

  addClient(id: string, res: Response) {
    this.addAdminClient(id, res);
  }

  getAdminClientCount() {
    return this.adminClients.size;
  }

  getPublicClientCount() {
    return this.publicClients.size;
  }

  getClientCount() {
    return this.adminClients.size + this.publicClients.size;
  }
}

export const realtime = new RealtimeService();
