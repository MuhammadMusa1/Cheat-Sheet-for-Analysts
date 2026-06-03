"use strict";

const Cheatsheet = require("../models/Cheatsheet");

describe("Cheatsheet model", () => {
  describe("constructor + normalisation", () => {
    test("applies defaults for optional fields", () => {
      const c = new Cheatsheet({ slug: "x", title: "X" });
      expect(c.subtitle).toBe("");
      expect(c.level).toBe("");
      expect(c.accent).toBe("#2563eb");
      expect(c.tags).toEqual([]);
      expect(c.sections).toEqual([]);
    });

    test("trims the slug", () => {
      const c = new Cheatsheet({ slug: "  sql  ", title: "SQL" });
      expect(c.slug).toBe("sql");
    });

    test("coerces non-array tags/sections to []", () => {
      const c = new Cheatsheet({ slug: "x", title: "X", tags: "nope", sections: 5 });
      expect(c.tags).toEqual([]);
      expect(c.sections).toEqual([]);
    });
  });

  describe("validate()", () => {
    test("passes for a valid full object", () => {
      const errors = Cheatsheet.validate({
        slug: "valid-slug",
        title: "Valid",
        tags: ["a", "b"],
        accent: "#abc123",
        sections: [{ title: "S", items: ["one", "two"] }]
      });
      expect(errors).toEqual([]);
    });

    test("requires slug and title on create", () => {
      const errors = Cheatsheet.validate({});
      expect(errors).toContain("slug is required and must be a non-empty string");
      expect(errors).toContain("title is required");
    });

    test("rejects bad slug characters", () => {
      const errors = Cheatsheet.validate({ slug: "Bad Slug!", title: "X" });
      expect(errors.some((e) => e.includes("lowercase letters"))).toBe(true);
    });

    test("rejects invalid hex accent", () => {
      const errors = Cheatsheet.validate({ slug: "x", title: "X", accent: "blue" });
      expect(errors.some((e) => e.includes("hex"))).toBe(true);
    });

    test("validates nested section shape", () => {
      const errors = Cheatsheet.validate({
        slug: "x",
        title: "X",
        sections: [{ title: "", items: "no" }]
      });
      expect(errors.some((e) => e.includes("sections[0].title"))).toBe(true);
      expect(errors.some((e) => e.includes("sections[0].items"))).toBe(true);
    });

    test("allows missing slug when requireSlug is false (update)", () => {
      const errors = Cheatsheet.validate({ title: "New title" }, { requireSlug: false });
      expect(errors).toEqual([]);
    });
  });

  describe("matches()", () => {
    const c = new Cheatsheet({
      slug: "sql",
      title: "SQL",
      subtitle: "Запросы и оконные функции",
      tags: ["join", "window"],
      sections: [{ title: "JOIN", items: ["INNER JOIN возвращает совпадения"] }]
    });

    test("empty query matches everything", () => {
      expect(c.matches("")).toBe(true);
      expect(c.matches("   ")).toBe(true);
    });

    test("matches tag, section, and item text case-insensitively", () => {
      expect(c.matches("WINDOW")).toBe(true);
      expect(c.matches("inner join")).toBe(true);
      expect(c.matches("оконные")).toBe(true);
    });

    test("returns false when nothing matches", () => {
      expect(c.matches("kubernetes")).toBe(false);
    });
  });
});
