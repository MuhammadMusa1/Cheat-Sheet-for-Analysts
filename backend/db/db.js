"use strict";

const path = require("path");
const fs = require("fs");
const { DatabaseSync } = require("node:sqlite");

const Cheatsheet = require("../models/Cheatsheet");

/**
 * Resolve the database file path.
 * - In tests we pass ":memory:" so each run is isolated.
 * - In normal use the file lives in backend/db/sqlite.db.
 */
const DEFAULT_DB_PATH = path.join(__dirname, "sqlite.db");

let db = null;

function getDbPath() {
  return process.env.CHEATSHEET_DB || DEFAULT_DB_PATH;
}

/**
 * Open (or create) the database connection and ensure the schema exists.
 * Safe to call multiple times — returns the existing connection if open.
 */
function connect() {
  if (db) {
    return db;
  }

  const dbPath = getDbPath();

  if (dbPath !== ":memory:") {
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  db = new DatabaseSync(dbPath);
  db.exec("PRAGMA journal_mode = WAL;");
  db.exec("PRAGMA foreign_keys = ON;");
  createSchema();
  return db;
}

function createSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS cheatsheets (
      slug      TEXT PRIMARY KEY,
      title     TEXT NOT NULL,
      subtitle  TEXT NOT NULL DEFAULT '',
      level     TEXT NOT NULL DEFAULT '',
      accent    TEXT NOT NULL DEFAULT '#2563eb',
      tags      TEXT NOT NULL DEFAULT '[]',
      sections  TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}

/** Map a raw DB row to a Cheatsheet instance. */
function rowToCheatsheet(row) {
  if (!row) {
    return null;
  }

  return new Cheatsheet({
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle,
    level: row.level,
    accent: row.accent,
    tags: safeParse(row.tags, []),
    sections: safeParse(row.sections, [])
  });
}

function safeParse(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

/* ─── Read ─── */

function listCheatsheets() {
  connect();
  const rows = db.prepare("SELECT * FROM cheatsheets ORDER BY rowid ASC").all();
  return rows.map(rowToCheatsheet);
}

function getCheatsheet(slug) {
  connect();
  const row = db.prepare("SELECT * FROM cheatsheets WHERE slug = ?").get(slug);
  return rowToCheatsheet(row);
}

function searchCheatsheets(query = "") {
  // Search runs in JS via the model so behaviour matches the frontend exactly.
  return listCheatsheets().filter((item) => item.matches(query));
}

/* ─── Write ─── */

function createCheatsheet(data) {
  connect();
  const cheatsheet = new Cheatsheet(data);

  const exists = db
    .prepare("SELECT 1 FROM cheatsheets WHERE slug = ?")
    .get(cheatsheet.slug);

  if (exists) {
    const error = new Error(`Cheatsheet with slug "${cheatsheet.slug}" already exists`);
    error.code = "CONFLICT";
    throw error;
  }

  db.prepare(`
    INSERT INTO cheatsheets (slug, title, subtitle, level, accent, tags, sections)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    cheatsheet.slug,
    cheatsheet.title,
    cheatsheet.subtitle,
    cheatsheet.level,
    cheatsheet.accent,
    JSON.stringify(cheatsheet.tags),
    JSON.stringify(cheatsheet.sections)
  );

  return getCheatsheet(cheatsheet.slug);
}

function updateCheatsheet(slug, data) {
  connect();
  const existing = getCheatsheet(slug);

  if (!existing) {
    return null;
  }

  // Merge incoming fields over the existing record, keeping the original slug.
  const merged = new Cheatsheet({
    slug,
    title: data.title ?? existing.title,
    subtitle: data.subtitle ?? existing.subtitle,
    level: data.level ?? existing.level,
    accent: data.accent ?? existing.accent,
    tags: data.tags ?? existing.tags,
    sections: data.sections ?? existing.sections
  });

  db.prepare(`
    UPDATE cheatsheets
    SET title = ?, subtitle = ?, level = ?, accent = ?, tags = ?, sections = ?,
        updated_at = datetime('now')
    WHERE slug = ?
  `).run(
    merged.title,
    merged.subtitle,
    merged.level,
    merged.accent,
    JSON.stringify(merged.tags),
    JSON.stringify(merged.sections),
    slug
  );

  return getCheatsheet(slug);
}

function deleteCheatsheet(slug) {
  connect();
  const result = db.prepare("DELETE FROM cheatsheets WHERE slug = ?").run(slug);
  return result.changes > 0;
}

/* ─── Maintenance ─── */

/** Replace all rows with the provided list. Used by the seed script. */
function replaceAll(items) {
  connect();
  const insert = db.prepare(`
    INSERT INTO cheatsheets (slug, title, subtitle, level, accent, tags, sections)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  db.exec("BEGIN");
  try {
    db.exec("DELETE FROM cheatsheets");
    for (const raw of items) {
      const c = new Cheatsheet(raw);
      insert.run(
        c.slug,
        c.title,
        c.subtitle,
        c.level,
        c.accent,
        JSON.stringify(c.tags),
        JSON.stringify(c.sections)
      );
    }
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }

  return listCheatsheets().length;
}

function count() {
  connect();
  return db.prepare("SELECT COUNT(*) AS n FROM cheatsheets").get().n;
}

/** Close the connection. Mostly useful for tests. */
function close() {
  if (db) {
    db.close();
    db = null;
  }
}

module.exports = {
  connect,
  close,
  count,
  replaceAll,
  listCheatsheets,
  getCheatsheet,
  searchCheatsheets,
  createCheatsheet,
  updateCheatsheet,
  deleteCheatsheet
};
