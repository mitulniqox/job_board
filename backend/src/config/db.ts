import mongoose from "mongoose";
import { env } from "./env";

const MONGODB_URI = env.MONGODB_URI ?? "";

type GlobalMongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  var mongooseCache: GlobalMongooseCache | undefined;
}

const cache = globalThis.mongooseCache ?? {
  conn: null,
  promise: null,
};

globalThis.mongooseCache = cache;

export async function dbConnect() {
  if (cache.conn) {
    return cache.conn;
  }

  if (!cache.promise) {
    const useTls = MONGODB_URI.startsWith("mongodb+srv://");
    cache.promise = mongoose.connect(MONGODB_URI as string, {
      bufferCommands: false,
      tls: useTls,
    }).then((mongooseInstance) => {
      console.log("MongoDB connected successfully");
      return mongooseInstance;
    });
  }

  cache.conn = await cache.promise;
  return cache.conn;
}