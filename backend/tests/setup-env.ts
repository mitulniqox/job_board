process.env.NODE_ENV = "test";
process.env.PORT = process.env.PORT ?? "4100";
process.env.SOCKET_PORT = process.env.SOCKET_PORT ?? "4100";
process.env.MONGODB_URI = process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/ibl-finance-test";
process.env.TEST_MONGODB_URI =
  process.env.TEST_MONGODB_URI ?? "mongodb://127.0.0.1:27017/ibl-finance-test";
process.env.ACCESS_TOKEN_SECRET =
  process.env.ACCESS_TOKEN_SECRET ?? "test_access_secret_key_at_least_32_chars";
process.env.REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET ?? "test_refresh_secret_key_at_least_32_char";
process.env.ACCESS_TOKEN_EXPIRES_IN = process.env.ACCESS_TOKEN_EXPIRES_IN ?? "1h";
process.env.REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN ?? "1d";
process.env.EMAIL_USER = process.env.EMAIL_USER ?? "";
process.env.EMAIL_PASS = process.env.EMAIL_PASS ?? "";
