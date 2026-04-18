"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("./core/types/express-augment");
require("dotenv/config");
const http_1 = require("http");
const app_1 = __importDefault(require("./app"));
const env_1 = require("./config/env");
const db_1 = require("./config/db");
const socket_1 = require("./socket/socket");
const PORT = env_1.env.SOCKET_PORT ?? env_1.env.PORT;
const server = (0, http_1.createServer)(app_1.default);
(0, socket_1.initializeSocket)(server);
const bootstrap = async () => {
    await (0, db_1.dbConnect)();
    server.listen(PORT, () => {
        // eslint-disable-next-line no-console
        console.log(`Server running on http://localhost:${PORT}`);
    });
};
bootstrap().catch((error) => {
    // eslint-disable-next-line no-console
    console.error("Failed to start server", error);
    process.exit(1);
});
