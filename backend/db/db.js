const Cheatsheet = require("../models/Cheatsheet");
const rawCheatsheets = require("../../frontend/data/cheatsheets.json");

const cheatsheets = rawCheatsheets.map((item) => new Cheatsheet(item));

function listCheatsheets() {
  return cheatsheets;
}

function getCheatsheet(slug) {
  return cheatsheets.find((item) => item.slug === slug) || null;
}

function searchCheatsheets(query = "") {
  return cheatsheets.filter((item) => item.matches(query));
}

module.exports = {
  listCheatsheets,
  getCheatsheet,
  searchCheatsheets
};
