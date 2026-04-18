"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbConnect = dbConnect;
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("./env");
const MONGODB_URI = env_1.env.MONGODB_URI ?? "";
const cache = globalThis.mongooseCache ?? {
    conn: null,
    promise: null,
};
globalThis.mongooseCache = cache;
async function dbConnect() {
    if (cache.conn) {
        return cache.conn;
    }
    if (!cache.promise) {
        const useTls = MONGODB_URI.startsWith("mongodb+srv://");
        cache.promise = mongoose_1.default.connect(MONGODB_URI, {
            bufferCommands: false,
            tls: useTls,
        }).then((mongooseInstance) => {
            console.log("✅ MongoDB connected");
            return mongooseInstance;
        });
    }
    cache.conn = await cache.promise;
    return cache.conn;
}
