const path = require("path");
const express = require("express");
const cors = require("cors");
const {
  listCheatsheets,
  getCheatsheet,
  searchCheatsheets
} = require("../db/db");

const app = express();
const PORT = process.env.PORT || 3000;
const frontendDir = path.join(__dirname, "..", "..", "frontend");
const pagesDir = path.join(frontendDir, "pages");

app.use(cors());
app.use(express.json());
app.use("/css", express.static(path.join(frontendDir, "css")));
app.use("/js", express.static(path.join(frontendDir, "js")));
app.use("/data", express.static(path.join(frontendDir, "data")));
app.use("/img", express.static(path.join(frontendDir, "img")));
app.use(express.static(pagesDir));

app.get("/api/health", (req, res) => {
  res.json({ ok: true, service: "cheat-sheet-for-analysts" });
});

app.get("/api/cheatsheets", (req, res) => {
  res.json(listCheatsheets());
});

app.get("/api/search", (req, res) => {
  res.json(searchCheatsheets(req.query.q || ""));
});

app.get("/api/cheatsheets/:slug", (req, res) => {
  const cheatsheet = getCheatsheet(req.params.slug);

  if (!cheatsheet) {
    res.status(404).json({ message: "Cheatsheet not found" });
    return;
  }

  res.json(cheatsheet);
});

app.get("/", (req, res) => {
  res.sendFile(path.join(pagesDir, "index.html"));
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Cheat Sheet for Analysts is running on http://localhost:${PORT}`);
  });
}

module.exports = app;
