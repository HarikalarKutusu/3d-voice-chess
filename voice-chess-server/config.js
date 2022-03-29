const dotenv = require("dotenv");
const path = require("path");

const envFile =
  process.env.NODE_ENV === "production"
    ? `.env.${process.env.NODE_ENV}`
    : `.env.${process.env.NODE_ENV}.local`;
dotenv.config({
  path: path.resolve(__dirname, envFile),
});

module.exports = {
  NODE_ENV: process.env.NODE_ENV || "production",
  HTTPS: process.env.HTTPS || true,
  HOST: process.env.HOST || "0.0.0.0",
  PORT: process.env.PORT || "4000",
  SSL_CRT_FILE: process.env.SSL_CRT_FILE || ".cert/server.crt",
  SSL_KEY_FILE: process.env.SSL_KEY_FILE || ".cert/server.key",
};
