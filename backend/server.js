"use strict";

const createApp = require("./app");
const store = require("./db/db");
const { seedIfEmpty } = require("./seed/seed");

const PORT = process.env.PORT || 3000;

function start() {
  store.connect();
  const seeded = seedIfEmpty();
  if (seeded) {
    console.log(`Seeded database with ${seeded} cheatsheets.`);
  }

  const app = createApp();
  app.listen(PORT, () => {
    console.log(`Cheat Sheet for Analysts is running on http://localhost:${PORT}`);
  });
}

if (require.main === module) {
  start();
}

module.exports = { start };
