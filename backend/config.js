"use strict";

const path = require("path");

/**
 * Centralised configuration.
 * All environment-driven settings are read here in one place so the rest
 * of the app never touches process.env directly.
 */
const config = {
  // HTTP port the server listens on.
  port: Number(process.env.PORT) || 3000,

  // Allowed CORS origin. "*" lets any site call the API (fine for local dev);
  // set ALLOWED_ORIGIN in production to lock it down.
  allowedOrigin: process.env.ALLOWED_ORIGIN || "*",

  // Max accepted JSON request body size.
  jsonBodyLimit: process.env.JSON_BODY_LIMIT || "100kb",

  // SQLite database path. ":memory:" is used by the test setup.
  dbPath: process.env.CHEATSHEET_DB || path.join(__dirname, "db", "sqlite.db")
};

module.exports = config;
