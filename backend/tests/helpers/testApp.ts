import type { Application } from "express";
import { MongoMemoryServer } from "mongodb-memory-server";
import type mongoose from "mongoose";

let mongoServer: MongoMemoryServer | null = null;
let appInstance: Application | null = null;
let mongooseInstance: typeof mongoose | null = null;

export const setupTestApp = async (): Promise<Application> => {
  if (!mongoServer && process.env.USE_MONGO_MEMORY_SERVER === "true") {
    try {
      mongoServer = await MongoMemoryServer.create();
      process.env.MONGODB_URI = mongoServer.getUri();
    } catch (error) {
      process.env.MONGODB_URI = process.env.TEST_MONGODB_URI ?? process.env.MONGODB_URI;
      // eslint-disable-next-line no-console
      console.warn(
        "Falling back to TEST_MONGODB_URI because mongodb-memory-server could not start.",
        error
      );
    }
  }

  if (!mongoServer && process.env.TEST_MONGODB_URI) {
    process.env.MONGODB_URI = process.env.TEST_MONGODB_URI;
  }

  if (!appInstance) {
    jest.resetModules();
    const { dbConnect } = await import("../../src/config/db");
    const appModule = await import("../../src/app");
    const mongooseModule = await import("mongoose");
    await dbConnect();
    appInstance = appModule.default;
    mongooseInstance = mongooseModule.default;
  }

  return appInstance;
};

export const clearDatabase = async (): Promise<void> => {
  if (!mongooseInstance) {
    return;
  }

  const collections = mongooseInstance.connection.collections;
  await Promise.all(Object.values(collections).map((collection) => collection.deleteMany({})));
};

export const teardownTestApp = async (): Promise<void> => {
  if (mongooseInstance && mongooseInstance.connection.readyState > 0) {
    await mongooseInstance.connection.dropDatabase();
    await mongooseInstance.disconnect();
  }

  if (mongoServer) {
    await mongoServer.stop();
    mongoServer = null;
  }

  appInstance = null;
  mongooseInstance = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).mongooseCache = undefined;
};
