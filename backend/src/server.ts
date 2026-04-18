import "./core/types/express-augment";
import "dotenv/config";
import { createServer } from "http";
import app from "./app";
import { env } from "./config/env";
import { dbConnect } from "./config/db";
import { initializeSocket } from "./socket/socket";

const PORT = env.SOCKET_PORT ?? env.PORT;
const server = createServer(app);
initializeSocket(server);

const bootstrap = async (): Promise<void> => {
  await dbConnect();
  server.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

bootstrap().catch((error: unknown) => {
  // eslint-disable-next-line no-console
  console.error("Failed to start server", error);
  process.exit(1);
});
