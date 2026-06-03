"use strict";

const express = require("express");
const cors = require("cors");
const cheatsheetsRouter = require("./routes/cheatsheets");

function createApp() {
	const app = express();

	app.use(cors());
	app.use(express.json());

	app.use("/api/cheatsheets", cheatsheetsRouter);

	app.use((req, res) => {
		res.status(404).json({ message: "Not Found" });
	});

	// eslint-disable-next-line no-unused-vars
	app.use((err, req, res, next) => {
		console.error(err);
		res.status(err && err.status ? err.status : 500).json({ message: err && err.message ? err.message : "Internal Server Error" });
	});

	return app;
}

module.exports = createApp;

