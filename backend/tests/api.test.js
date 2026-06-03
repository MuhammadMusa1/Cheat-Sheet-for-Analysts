"use strict";

const request = require("supertest");
const createApp = require("../app");
const store = require("../db/db");

const app = createApp();

const sample = {
  slug: "test-sheet",
  title: "Test Sheet",
  subtitle: "A sheet for testing",
  level: "TST",
  accent: "#123abc",
  tags: ["alpha", "beta"],
  sections: [{ title: "Section 1", items: ["item a", "item b"] }]
};

beforeEach(() => {
  // Reset to a known empty state before each test.
  store.connect();
  store.replaceAll([]);
});

afterAll(() => {
  store.close();
});

describe("GET /api/health", () => {
  test("returns ok and a count", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(typeof res.body.count).toBe("number");
  });
});

describe("CRUD lifecycle", () => {
  test("POST creates a cheatsheet", async () => {
    const res = await request(app).post("/api/cheatsheets").send(sample);
    expect(res.status).toBe(201);
    expect(res.body.slug).toBe("test-sheet");
    expect(res.body.tags).toEqual(["alpha", "beta"]);
  });

  test("GET list reflects the created item", async () => {
    await request(app).post("/api/cheatsheets").send(sample);
    const res = await request(app).get("/api/cheatsheets");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].title).toBe("Test Sheet");
  });

  test("GET by slug returns the item", async () => {
    await request(app).post("/api/cheatsheets").send(sample);
    const res = await request(app).get("/api/cheatsheets/test-sheet");
    expect(res.status).toBe(200);
    expect(res.body.subtitle).toBe("A sheet for testing");
  });

  test("PUT updates fields and keeps the slug", async () => {
    await request(app).post("/api/cheatsheets").send(sample);
    const res = await request(app)
      .put("/api/cheatsheets/test-sheet")
      .send({ title: "Updated Title" });
    expect(res.status).toBe(200);
    expect(res.body.title).toBe("Updated Title");
    expect(res.body.slug).toBe("test-sheet");
    expect(res.body.subtitle).toBe("A sheet for testing"); // untouched
  });

  test("DELETE removes the item", async () => {
    await request(app).post("/api/cheatsheets").send(sample);
    const del = await request(app).delete("/api/cheatsheets/test-sheet");
    expect(del.status).toBe(204);
    const after = await request(app).get("/api/cheatsheets/test-sheet");
    expect(after.status).toBe(404);
  });
});

describe("Validation and error handling", () => {
  test("POST without slug/title returns 400 with errors", async () => {
    const res = await request(app).post("/api/cheatsheets").send({});
    expect(res.status).toBe(400);
    expect(res.body.errors.length).toBeGreaterThan(0);
  });

  test("POST with duplicate slug returns 409", async () => {
    await request(app).post("/api/cheatsheets").send(sample);
    const dup = await request(app).post("/api/cheatsheets").send(sample);
    expect(dup.status).toBe(409);
  });

  test("POST with bad accent returns 400", async () => {
    const res = await request(app)
      .post("/api/cheatsheets")
      .send({ ...sample, accent: "not-a-color" });
    expect(res.status).toBe(400);
  });

  test("GET missing slug returns 404", async () => {
    const res = await request(app).get("/api/cheatsheets/nope");
    expect(res.status).toBe(404);
  });

  test("PUT missing slug returns 404", async () => {
    const res = await request(app)
      .put("/api/cheatsheets/nope")
      .send({ title: "X" });
    expect(res.status).toBe(404);
  });

  test("DELETE missing slug returns 404", async () => {
    const res = await request(app).delete("/api/cheatsheets/nope");
    expect(res.status).toBe(404);
  });

  test("unknown API route returns 404 JSON", async () => {
    const res = await request(app).get("/api/does-not-exist");
    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Not found");
  });
});

describe("GET /api/search", () => {
  beforeEach(async () => {
    await request(app).post("/api/cheatsheets").send(sample);
    await request(app).post("/api/cheatsheets").send({
      slug: "second",
      title: "Second",
      tags: ["gamma"],
      sections: [{ title: "Other", items: ["unique-keyword here"] }]
    });
  });

  test("empty query returns all", async () => {
    const res = await request(app).get("/api/search");
    expect(res.body).toHaveLength(2);
  });

  test("filters by matching text", async () => {
    const res = await request(app).get("/api/search?q=unique-keyword");
    expect(res.body).toHaveLength(1);
    expect(res.body[0].slug).toBe("second");
  });

  test("returns empty array when nothing matches", async () => {
    const res = await request(app).get("/api/search?q=zzzznothing");
    expect(res.body).toEqual([]);
  });
});
