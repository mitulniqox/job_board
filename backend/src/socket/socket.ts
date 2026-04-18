import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import type { JwtPayload } from "../modules/auth/auth.types";
import { verifyAccessToken } from "../modules/auth/auth.service";

let io: Server | null = null;

const getTokenFromSocket = (socket: Socket): string | null => {
  const authToken = socket.handshake.auth.token;
  if (typeof authToken === "string" && authToken.trim()) {
    return authToken.replace(/^Bearer\s+/i, "").trim();
  }

  const headerToken = socket.handshake.headers.authorization;
  if (typeof headerToken === "string" && headerToken.startsWith("Bearer ")) {
    return headerToken.split(" ")[1];
  }

  return null;
};

const getUserRoom = (userId: string): string => `user:${userId}`;

export const initializeSocket = (server: HttpServer): Server => {
  io = new Server(server, {
    cors: {
      origin: "*",
      credentials: true,
    },
  });

  io.use((socket, next) => {
    try {
      const token = getTokenFromSocket(socket);
      if (!token) {
        return next(new Error("Unauthorized"));
      }

      const user = verifyAccessToken(token);
      socket.data.user = user;
      return next();
    } catch (error) {
      return next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    const user = socket.data.user as JwtPayload;
    const userRoom = getUserRoom(user.sub);
    socket.join(userRoom);
    // eslint-disable-next-line no-console
    console.log("Socket joined room:", userRoom);

    socket.on("join", (roomUserId: string) => {
      if (roomUserId === user.sub) {
        const roomName = getUserRoom(roomUserId);
        socket.join(roomName);
        // eslint-disable-next-line no-console
        console.log("Socket joined room:", roomName);
      }
    });

    socket.on("disconnect", () => {
      socket.leave(getUserRoom(user.sub));
    });
  });

  return io;
};

export const getSocketServer = (): Server => {
  if (!io) {
    throw new Error("Socket.io has not been initialized");
  }
  return io;
};

export const emitToUserRoom = (userId: string, event: string, payload: unknown): void => {
  if (!io) {
    return;
  }

  // eslint-disable-next-line no-console
  console.log("Emitting to:", userId, "event:", event);
  io.to(getUserRoom(userId)).emit(event, payload);
};
