"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emitToUserRoom = exports.getSocketServer = exports.initializeSocket = void 0;
const socket_io_1 = require("socket.io");
const auth_service_1 = require("../modules/auth/auth.service");
let io = null;
const getTokenFromSocket = (socket) => {
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
const getUserRoom = (userId) => `user:${userId}`;
const initializeSocket = (server) => {
    io = new socket_io_1.Server(server, {
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
            const user = (0, auth_service_1.verifyAccessToken)(token);
            socket.data.user = user;
            return next();
        }
        catch (error) {
            return next(new Error("Unauthorized"));
        }
    });
    io.on("connection", (socket) => {
        const user = socket.data.user;
        const userRoom = getUserRoom(user.sub);
        socket.join(userRoom);
        // eslint-disable-next-line no-console
        console.log("Socket joined room:", userRoom);
        socket.on("join", (roomUserId) => {
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
exports.initializeSocket = initializeSocket;
const getSocketServer = () => {
    if (!io) {
        throw new Error("Socket.io has not been initialized");
    }
    return io;
};
exports.getSocketServer = getSocketServer;
const emitToUserRoom = (userId, event, payload) => {
    if (!io) {
        return;
    }
    // eslint-disable-next-line no-console
    console.log("Emitting to:", userId, "event:", event);
    io.to(getUserRoom(userId)).emit(event, payload);
};
exports.emitToUserRoom = emitToUserRoom;
