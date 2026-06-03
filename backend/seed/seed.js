"use strict";

const path = require("path");
const fs = require("fs");
const store = require("../db/db");

const DATA_FILE = path.join(__dirname, "..", "..", "frontend", "data", "cheatsheets.json");

function loadSeedData() {
  const raw = fs.readFileSync(DATA_FILE, "utf-8");
  return JSON.parse(raw);
}

/** Force a full reseed (used by `npm run seed`). */
function reseed() {
  store.connect();
  const data = loadSeedData();
  const n = store.replaceAll(data);
  return n;
}

/** Seed only when the table is empty (used on server boot). */
function seedIfEmpty() {
  store.connect();
  if (store.count() > 0) {
    return 0;
  }
  return reseed();
}

if (require.main === module) {
  const n = reseed();
  console.log(`Reseeded database with ${n} cheatsheets.`);
  store.close();
}

module.exports = { reseed, seedIfEmpty, loadSeedData };
