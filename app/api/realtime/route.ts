export const runtime = "edge";

type SocketRole = "editor" | "spectator";

const channels = new Map<string, Set<WebSocket>>();
const socketRoles = new Map<WebSocket, SocketRole>();

type EdgeResponseInit = ResponseInit & { webSocket?: WebSocket };

function upgradeRequest(request: Request) {
  const deno = (
    globalThis as {
      Deno?: {
        upgradeWebSocket: (req: Request) => {
          socket: WebSocket;
          response: Response;
        };
      };
    }
  ).Deno;

  if (deno?.upgradeWebSocket) {
    return deno.upgradeWebSocket(request);
  }

  const WebSocketPairCtor = (
    globalThis as {
      WebSocketPair?: new () => { 0: WebSocket; 1: WebSocket };
    }
  ).WebSocketPair;

  if (WebSocketPairCtor) {
    const { 0: client, 1: server } = new WebSocketPairCtor();
    const serverSocket = server as WebSocket & { accept?: () => void };
    serverSocket.accept?.();
    return {
      socket: server,
      response: new Response(null, {
        status: 101,
        webSocket: client,
      } as EdgeResponseInit),
    };
  }

  return null;
}

function getChannel(boardId: string) {
  if (!channels.has(boardId)) {
    channels.set(boardId, new Set());
  }
  return channels.get(boardId)!;
}

function parseRole(role: string | null): SocketRole {
  return role === "editor" ? "editor" : "spectator";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const boardId = searchParams.get("boardId");
  const role = parseRole(searchParams.get("role"));

  if (!boardId) {
    return new Response("Missing boardId", { status: 400 });
  }

  if (request.headers.get("upgrade") !== "websocket") {
    return new Response("Expected websocket", { status: 426 });
  }

  const upgraded = upgradeRequest(request);
  if (!upgraded) {
    return new Response("WebSocket upgrade not supported", { status: 500 });
  }

  const { socket, response } = upgraded;
  const channel = getChannel(boardId);
  channel.add(socket);
  socketRoles.set(socket, role);

  socket.addEventListener("message", (event: MessageEvent) => {
    const senderRole = socketRoles.get(socket) ?? "spectator";
    if (senderRole === "spectator") {
      try {
        const payload = JSON.parse(String(event.data));
        const messageType =
          typeof payload?.type === "string" ? payload.type : "";
        if (messageType.startsWith("shape:")) {
          return;
        }
      } catch (error) {
        console.warn("[realtime] Dropping malformed spectator message", error);
        return;
      }
    }
    channel.forEach((peer) => {
      if (peer !== socket && peer.readyState === WebSocket.OPEN) {
        peer.send(event.data);
      }
    });
  });

  socket.addEventListener("close", () => {
    channel.delete(socket);
    socketRoles.delete(socket);
    if (channel.size === 0) {
      channels.delete(boardId);
    }
  });

  socket.addEventListener("error", () => {
    socketRoles.delete(socket);
    socket.close();
  });

  return response;
}
