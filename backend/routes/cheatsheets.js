"use strict";

const express = require("express");
const Cheatsheet = require("../models/Cheatsheet");
const store = require("../db/db");

const router = express.Router();

/** GET /api/cheatsheets — list all */
router.get("/", (req, res, next) => {
  try {
    res.json(store.listCheatsheets());
  } catch (err) {
    next(err);
  }
});

/** GET /api/cheatsheets/:slug — single item */
router.get("/:slug", (req, res, next) => {
  try {
    const cheatsheet = store.getCheatsheet(req.params.slug);
    if (!cheatsheet) {
      return res.status(404).json({ message: "Cheatsheet not found" });
    }
    res.json(cheatsheet);
  } catch (err) {
    next(err);
  }
});

/** POST /api/cheatsheets — create */
router.post("/", (req, res, next) => {
  try {
    const errors = Cheatsheet.validate(req.body, { requireSlug: true });
    if (errors.length) {
      return res.status(400).json({ message: "Validation failed", errors });
    }

    const created = store.createCheatsheet(req.body);
    res.status(201).json(created);
  } catch (err) {
    if (err.code === "CONFLICT") {
      return res.status(409).json({ message: err.message });
    }
    next(err);
  }
});

/** PUT /api/cheatsheets/:slug — update (partial fields allowed) */
router.put("/:slug", (req, res, next) => {
  try {
    const errors = Cheatsheet.validate(req.body, { requireSlug: false });
    if (errors.length) {
      return res.status(400).json({ message: "Validation failed", errors });
    }

    const updated = store.updateCheatsheet(req.params.slug, req.body);
    if (!updated) {
      return res.status(404).json({ message: "Cheatsheet not found" });
    }
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

/** DELETE /api/cheatsheets/:slug — remove */
router.delete("/:slug", (req, res, next) => {
  try {
    const deleted = store.deleteCheatsheet(req.params.slug);
    if (!deleted) {
      return res.status(404).json({ message: "Cheatsheet not found" });
    }
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
