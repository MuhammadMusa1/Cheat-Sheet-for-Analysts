"use strict";

const path = require("path");
const express = require("express");
const cors = require("cors");

const store = require("./db/db");
const cheatsheetsRouter = require("./routes/cheatsheets");

function createApp() {
  const app = express();

  const frontendDir = path.join(__dirname, "..", "frontend");
  const pagesDir = path.join(frontendDir, "pages");

  app.use(cors());
  app.use(express.json());

  // Static frontend assets.
  app.use("/css", express.static(path.join(frontendDir, "css")));
  app.use("/js", express.static(path.join(frontendDir, "js")));
  app.use("/data", express.static(path.join(frontendDir, "data")));
  app.use("/img", express.static(path.join(frontendDir, "img")));
  app.use(express.static(pagesDir));

  // Health check.
  app.get("/api/health", (req, res) => {
    res.json({
      ok: true,
      service: "cheat-sheet-for-analysts",
      count: store.count()
    });
  });

  // Search endpoint (kept separate from the CRUD router).
  app.get("/api/search", (req, res, next) => {
    try {
      res.json(store.searchCheatsheets(req.query.q || ""));
    } catch (err) {
      next(err);
    }
  });

  // CRUD router.
  app.use("/api/cheatsheets", cheatsheetsRouter);

  // SPA-ish root.
  app.get("/", (req, res) => {
    res.sendFile(path.join(pagesDir, "index.html"));
  });

  // 404 for unknown API routes.
  app.use("/api", (req, res) => {
    res.status(404).json({ message: "Not found" });
  });

  // Centralised error handler.
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  });

  return app;
}

module.exports = createApp;
